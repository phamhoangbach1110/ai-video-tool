"""
Ghép ảnh + audio + chữ thành video mp4 dùng MoviePy (miễn phí, open source).
"""

import os
import subprocess
import json


def assemble_video(image_paths: list, audio_path: str, script: dict,
                   job_id: str, output_dir: str) -> str:
    """
    Ghép video từ ảnh + audio + text overlay.
    Ưu tiên dùng MoviePy, fallback sang ffmpeg thuần.
    """
    output_path = os.path.join(output_dir, f'{job_id}.mp4')
    scenes = script.get('scenes', [])

    # Đảm bảo số ảnh khớp số cảnh
    pairs = list(zip(image_paths, scenes))
    if not pairs:
        raise ValueError("Không có ảnh để ghép video")

    try:
        return _assemble_moviepy(pairs, audio_path, script, output_path)
    except ImportError:
        print("[Video] MoviePy chưa cài, thử ffmpeg...")
        return _assemble_ffmpeg(pairs, audio_path, script, output_path)


def _assemble_moviepy(pairs, audio_path, script, output_path):
    """Ghép video bằng MoviePy"""
    from moviepy.editor import (
        ImageClip, AudioFileClip, CompositeVideoClip,
        concatenate_videoclips, TextClip, ColorClip
    )

    clips = []
    for img_path, scene in pairs:
        duration = scene.get('duration', 10)
        overlay_text = scene.get('text_overlay', '')

        # Clip ảnh
        img_clip = ImageClip(img_path).set_duration(duration)
        img_clip = img_clip.resize((720, 1280))

        # Hiệu ứng zoom nhẹ (Ken Burns)
        img_clip = img_clip.resize(lambda t: 1 + 0.03 * t / duration)
        img_clip = img_clip.set_position('center')

        layers = [img_clip]

        # Text overlay
        if overlay_text:
            try:
                txt_clip = (TextClip(
                    overlay_text,
                    fontsize=52,
                    color='white',
                    font='Arial-Bold',
                    stroke_color='black',
                    stroke_width=2,
                    method='caption',
                    size=(700, None)
                )
                .set_duration(duration)
                .set_position(('center', 0.75), relative=True))
                layers.append(txt_clip)
            except Exception as e:
                print(f"[Video] TextClip lỗi: {e}, bỏ qua text overlay")

        clip = CompositeVideoClip(layers, size=(720, 1280))
        clips.append(clip)

    # Ghép các cảnh
    final = concatenate_videoclips(clips, method='compose')

    # Thêm audio
    if os.path.exists(audio_path):
        try:
            audio = AudioFileClip(audio_path)
            # Cắt audio bằng video hoặc loop
            if audio.duration < final.duration:
                # Loop audio nếu ngắn hơn
                loops = int(final.duration / audio.duration) + 1
                from moviepy.editor import concatenate_audioclips
                audio = concatenate_audioclips([audio] * loops)
            audio = audio.subclip(0, final.duration)
            final = final.set_audio(audio)
        except Exception as e:
            print(f"[Video] Audio lỗi: {e}, xuất video không có âm thanh")

    # Xuất video
    print(f"[Video] Đang xuất: {output_path}")
    final.write_videofile(
        output_path,
        fps=24,
        codec='libx264',
        audio_codec='aac',
        preset='ultrafast',
        logger=None
    )

    size = os.path.getsize(output_path) // (1024 * 1024)
    print(f"[Video] ✅ Hoàn thành! ({size}MB): {output_path}")
    return output_path


def _assemble_ffmpeg(pairs, audio_path, script, output_path):
    """
    Ghép video thuần bằng ffmpeg (fallback khi không có MoviePy).
    Tạo slideshow từ ảnh + audio.
    """
    tmp_dir = os.path.dirname(output_path)
    filelist_path = os.path.join(tmp_dir, f'{os.path.basename(output_path)}_list.txt')

    # Ghi danh sách ảnh + thời lượng
    with open(filelist_path, 'w', encoding='utf-8') as f:
        for img_path, scene in pairs:
            duration = scene.get('duration', 10)
            f.write(f"file '{img_path.replace(chr(92), '/')}'\n")
            f.write(f"duration {duration}\n")
        # Thêm ảnh cuối lần nữa (ffmpeg yêu cầu)
        if pairs:
            f.write(f"file '{pairs[-1][0].replace(chr(92), '/')}'\n")

    # Tính tổng thời lượng
    total_dur = sum(s.get('duration', 10) for _, s in pairs)

    # Build ffmpeg command
    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0', '-i', filelist_path,
    ]

    has_audio = os.path.exists(audio_path)
    if has_audio:
        cmd += ['-stream_loop', '-1', '-i', audio_path]

    cmd += [
        '-vf', 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2',
        '-r', '24',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
    ]

    if has_audio:
        cmd += ['-c:a', 'aac', '-shortest', '-t', str(total_dur)]
    else:
        cmd += ['-an', '-t', str(total_dur)]

    cmd.append(output_path)

    print(f"[Video] ffmpeg command: {' '.join(cmd[:8])}...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    # Cleanup
    try:
        os.remove(filelist_path)
    except:
        pass

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg lỗi:\n{result.stderr[-500:]}")

    size = os.path.getsize(output_path) // (1024 * 1024)
    print(f"[Video] ✅ ffmpeg hoàn thành! ({size}MB)")
    return output_path
