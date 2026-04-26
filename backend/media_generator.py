"""
Tạo hình ảnh bằng Pollinations.ai (free, no key)
Tạo giọng đọc tiếng Việt bằng gTTS (free, no key)
"""
import os, time, urllib.parse, requests

def generate_images(scenes: list, job_id: str, assets_dir: str = None) -> list:
    if assets_dir is None:
        assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
    job_dir = os.path.join(assets_dir, job_id)
    os.makedirs(job_dir, exist_ok=True)
    paths = []
    for i, scene in enumerate(scenes):
        prompt   = scene.get('image_prompt', f'colorful illustration scene {i+1}')
        img_path = os.path.join(job_dir, f'scene_{i+1:02d}.png')
        try:
            print(f'[Image] Cảnh {i+1}: {prompt[:50]}…')
            _download_pollinations(prompt, img_path)
            paths.append(img_path)
            time.sleep(1)
        except Exception as e:
            print(f'[Image] Lỗi cảnh {i+1}: {e}, dùng placeholder')
            paths.append(_placeholder(img_path, scene.get('text_overlay', f'Cảnh {i+1}'), i))
    return paths

def _download_pollinations(prompt: str, save_path: str, w=720, h=1280):
    full = f"{prompt}, high quality, vibrant colors, sharp, 4k"
    enc  = urllib.parse.quote(full)
    seed = abs(hash(prompt)) % 9999
    url  = f"https://image.pollinations.ai/prompt/{enc}?width={w}&height={h}&nologo=true&seed={seed}"
    resp = requests.get(url, timeout=60, stream=True,
                        headers={'User-Agent': 'Mozilla/5.0'})
    resp.raise_for_status()
    with open(save_path, 'wb') as f:
        for chunk in resp.iter_content(8192): f.write(chunk)
    print(f'[Image] ✅ {os.path.basename(save_path)} ({os.path.getsize(save_path)//1024}KB)')
    return save_path

def _placeholder(path: str, text: str, idx: int) -> str:
    try:
        from PIL import Image, ImageDraw
        colors = [('#1a1a2e','#e94560'),('#0f3460','#16213e'),('#533483','#e94560'),('#2d132c','#ee4540')]
        bg, accent = colors[idx % len(colors)]
        img  = Image.new('RGB', (720, 1280), bg)
        draw = ImageDraw.Draw(img)
        draw.text((360, 600), text or f'Cảnh {idx+1}', fill=accent, anchor='mm')
        img.save(path, 'PNG')
    except Exception:
        _minimal_png(path)
    return path

def _minimal_png(path: str):
    import struct, zlib
    def chunk(name, data):
        c = struct.pack('>I', len(data)) + name + data
        return c + struct.pack('>I', zlib.crc32(name+data) & 0xffffffff)
    w, h = 720, 1280
    sig  = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    raw  = b'\x00' + b'\x1a\x1a\x2e' * w
    idat = chunk(b'IDAT', zlib.compress(raw * h))
    iend = chunk(b'IEND', b'')
    with open(path, 'wb') as f: f.write(sig + ihdr + idat + iend)

def generate_audio(narration: str, job_id: str, assets_dir: str = None) -> str:
    if assets_dir is None:
        assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
    job_dir    = os.path.join(assets_dir, job_id)
    os.makedirs(job_dir, exist_ok=True)
    audio_path = os.path.join(job_dir, 'narration.mp3')
    try:
        from gtts import gTTS
        gTTS(text=narration, lang='vi', slow=False).save(audio_path)
        print(f'[Audio] ✅ {os.path.getsize(audio_path)//1024}KB')
        return audio_path
    except Exception as e:
        print(f'[Audio] gTTS lỗi: {e}')
        return _silent_audio(audio_path)

def _silent_audio(path: str) -> str:
    try:
        import subprocess
        subprocess.run(['ffmpeg','-y','-f','lavfi','-i','anullsrc=r=44100:cl=stereo',
                        '-t','30','-q:a','9','-acodec','libmp3lame', path],
                       check=True, capture_output=True)
    except Exception:
        with open(path, 'wb') as f: f.write(b'\xff\xe3' + b'\x00' * 418 * 30)
    return path
