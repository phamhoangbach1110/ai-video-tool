"""
Sinh kịch bản video bằng Groq API (free tier, cực nhanh).
Đăng ký tại: https://console.groq.com
Model: llama-3.3-70b-versatile (free)
"""

import requests
import json
import os
import re

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def generate_script(topic: str, style: str = 'funny', duration: int = 30) -> dict:
    if not GROQ_API_KEY:
        print("[Script] Không có Groq API key, dùng script mẫu")
        return _fallback_script(topic, style)

    num_scenes = max(3, duration // 10)

    style_guide = {
        'funny':       'hài hước, vui vẻ, có tình huống bất ngờ gây cười',
        'informative': 'thông tin, giáo dục, giải thích dễ hiểu',
        'dramatic':    'kịch tính, cảm xúc, có cao trào',
        'story':       'kể chuyện có nhân vật, có mở đầu, diễn biến và kết thúc',
    }
    style_desc = style_guide.get(style, style_guide['funny'])

    prompt = f"""Tạo kịch bản video ngắn {duration} giây về chủ đề: "{topic}"
Phong cách: {style_desc}
Số cảnh: {num_scenes} cảnh

Trả về JSON với cấu trúc sau (chỉ JSON thuần, không markdown, không giải thích):
{{
  "title": "Tiêu đề video hấp dẫn (dưới 60 ký tự)",
  "narration": "Toàn bộ lời thoại/lời kể liền mạch bằng tiếng Việt ({duration} giây đọc)",
  "scenes": [
    {{
      "id": 1,
      "duration": 10,
      "image_prompt": "Mô tả ảnh bằng tiếng Anh cho AI tạo ảnh, chi tiết và rõ ràng",
      "text_overlay": "Chữ hiển thị trên màn hình (ngắn, dưới 20 ký tự, có thể trống)"
    }}
  ],
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "description": "Mô tả video đầy đủ cho phần caption (100-150 ký tự)"
}}"""

    try:
        resp = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "Bạn là chuyên gia tạo nội dung video viral cho thị trường Việt Nam. Chỉ trả về JSON thuần, không có markdown hay giải thích thêm."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.8,
                "max_tokens": 1500,
            },
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        text = data['choices'][0]['message']['content']

        # Clean JSON
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()

        script = json.loads(text)
        print(f"[Script] ✅ Groq sinh kịch bản: {script.get('title', '')}")
        return script

    except Exception as e:
        print(f"[Script] Groq lỗi: {e}, dùng fallback")
        return _fallback_script(topic, style)


def _fallback_script(topic: str, style: str) -> dict:
    return {
        "title": f"🔥 {topic[:40]} | Viral 2025",
        "narration": (
            f"Bạn có biết về {topic} không? "
            f"Đây là một trong những chủ đề đang HOT nhất hiện nay! "
            f"Hãy cùng khám phá những điều thú vị mà ít ai biết đến. "
            f"Đừng quên like và follow để không bỏ lỡ những video hấp dẫn tiếp theo nhé!"
        ),
        "scenes": [
            {
                "id": 1,
                "duration": 10,
                "image_prompt": f"Vibrant colorful illustration about {topic}, cartoon style, bright colors, Vietnamese aesthetic",
                "text_overlay": "🔥 TRENDING"
            },
            {
                "id": 2,
                "duration": 10,
                "image_prompt": f"Funny surprised character reacting to {topic}, anime style, expressive face, colorful background",
                "text_overlay": "Bạn có biết?"
            },
            {
                "id": 3,
                "duration": 10,
                "image_prompt": f"Exciting conclusion scene about {topic}, fireworks celebration, happy characters, vibrant",
                "text_overlay": "Follow ngay!"
            }
        ],
        "hashtags": [f"#{topic.replace(' ', '')}", "#viral", "#trending", "#viet", "#xuhuong"],
        "description": f"Video về {topic} - Nội dung trending HOT nhất hôm nay! 🔥 #viral #trending"
    }

def generate_video_prompt(topic: str, style: str, duration: str) -> dict:
    """Sinh prompt chuẩn cho Google Flow / VideoFX"""

    style_map = {
        'cinematic':  'cinematic shot, 4K, dramatic lighting, film grain, anamorphic lens',
        'anime':      'anime style, vibrant colors, Studio Ghibli aesthetic, hand-drawn',
        'cartoon':    'cartoon style, bright colors, clean lines, Pixar inspired',
        'realistic':  'photorealistic, hyperdetailed, natural lighting, DSLR quality',
        'lofi':       'lo-fi aesthetic, soft colors, cozy atmosphere, nostalgic, pastel',
        'epic':       'epic scale, dramatic atmosphere, volumetric lighting, awe-inspiring',
    }
    style_desc = style_map.get(style, style_map['cinematic'])

    if not GROQ_API_KEY:
        return _fallback_prompt(topic, style_desc, duration)

    prompt = f"""Tạo video prompt chuyên nghiệp cho AI video generator (Google Flow) về chủ đề: "{topic}"
Style: {style_desc}
Duration: {duration}

Trả về JSON (chỉ JSON thuần, không markdown):
{{
  "video_prompt": "Prompt chính bằng tiếng Anh, chi tiết, 50-80 từ, mô tả cảnh quay, ánh sáng, góc máy, chuyển động camera",
  "scene_prompts": [
    "Prompt cảnh 1 bằng tiếng Anh (15-25 từ)",
    "Prompt cảnh 2 bằng tiếng Anh (15-25 từ)",
    "Prompt cảnh 3 bằng tiếng Anh (15-25 từ)"
  ],
  "negative_prompt": "Những thứ KHÔNG muốn xuất hiện trong video, bằng tiếng Anh"
}}"""

    try:
        resp = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert AI video prompt engineer. Return only valid JSON, no markdown."
                    },
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 800,
            },
            timeout=20
        )
        resp.raise_for_status()
        text = resp.json()['choices'][0]['message']['content']
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text).strip()
        return json.loads(text)
    except Exception as e:
        print(f"[VideoPrompt] Groq lỗi: {e}")
        return _fallback_prompt(topic, style_desc, duration)


def _fallback_prompt(topic: str, style_desc: str, duration: str) -> dict:
    return {
        "video_prompt": f"A beautiful {duration} video about {topic}, {style_desc}, smooth camera movement, professional quality, ultra detailed",
        "scene_prompts": [
            f"Opening wide shot of {topic}, {style_desc}, establishing scene",
            f"Close-up detail shot of {topic}, {style_desc}, dramatic lighting",
            f"Cinematic ending shot of {topic}, {style_desc}, fade out",
        ],
        "negative_prompt": "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, logo, pixelated, noisy"
    }