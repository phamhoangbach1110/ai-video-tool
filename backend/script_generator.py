"""
Sinh kịch bản video bằng Gemini 1.5 Flash (free tier, không cần trả phí).
Đăng ký tại: https://aistudio.google.com/app/apikey
"""

import requests
import json
import os
import re

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


def generate_script(topic: str, style: str = 'funny', duration: int = 30) -> dict:
    """
    Sinh kịch bản video ngắn tiếng Việt.
    
    Returns dict gồm:
    - title: tiêu đề video
    - narration: lời thoại đầy đủ
    - scenes: list các cảnh (mô tả hình ảnh)
    - hashtags: list hashtag
    - description: mô tả video
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == '':
        print("[Script] Không có API key, dùng script mẫu")
        return _fallback_script(topic, style)

    num_scenes = max(3, duration // 10)

    style_guide = {
        'funny': 'hài hước, vui vẻ, có tình huống bất ngờ gây cười',
        'informative': 'thông tin, giáo dục, giải thích dễ hiểu',
        'dramatic': 'kịch tính, cảm xúc, có cao trào',
        'story': 'kể chuyện có nhân vật, có mở đầu, diễn biến và kết thúc',
    }
    style_desc = style_guide.get(style, style_guide['funny'])

    prompt = f"""Tạo kịch bản video ngắn {duration} giây về chủ đề: "{topic}"
Phong cách: {style_desc}
Số cảnh: {num_scenes} cảnh

Trả về JSON với cấu trúc sau (chỉ JSON, không giải thích thêm):
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
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.8, "maxOutputTokens": 1500}
            },
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()
        text = data['candidates'][0]['content']['parts'][0]['text']

        # Clean JSON từ response
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()

        script = json.loads(text)
        print(f"[Script] ✅ Sinh kịch bản thành công: {script.get('title', '')}")
        return script

    except Exception as e:
        print(f"[Script] Gemini lỗi: {e}, dùng fallback")
        return _fallback_script(topic, style)


def _fallback_script(topic: str, style: str) -> dict:
    """Script mẫu khi không có API key"""
    return {
        "title": f"🔥 {topic[:40]} | Viral 2024",
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
