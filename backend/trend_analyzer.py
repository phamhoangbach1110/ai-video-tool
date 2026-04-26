"""
Phân tích xu hướng từ Google Trends và YouTube — hoàn toàn miễn phí.
"""

import requests
import json
from datetime import datetime

def get_trending_topics(category='all'):
    """
    Lấy danh sách topic đang trending.
    Dùng Google Trends daily search trends RSS (không cần API key).
    """
    topics = []

    # --- 1. Google Trends Vietnam (RSS, miễn phí 100%) ---
    try:
        google_topics = _get_google_trends_vn()
        topics.extend(google_topics)
    except Exception as e:
        print(f"[Trend] Google Trends lỗi: {e}")

    # --- 2. YouTube Trending Vietnam (RSS, miễn phí) ---
    try:
        yt_topics = _get_youtube_trending_vn()
        topics.extend(yt_topics)
    except Exception as e:
        print(f"[Trend] YouTube lỗi: {e}")

    # --- 3. Fallback: trending cứng nếu không có internet ---
    if not topics:
        topics = _get_fallback_topics()

    # Lọc theo category nếu cần
    if category != 'all':
        topics = [t for t in topics if t.get('category', '').lower() == category.lower()]

    # Loại trùng, giới hạn 20
    seen = set()
    unique = []
    for t in topics:
        key = t['title'].lower()[:30]
        if key not in seen:
            seen.add(key)
            unique.append(t)

    return unique[:20]


def _get_google_trends_vn():
    """Lấy Google Daily Search Trends Vietnam qua RSS (không cần key)"""
    url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=VN"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    resp = requests.get(url, headers=headers, timeout=8)
    resp.raise_for_status()

    import xml.etree.ElementTree as ET
    root = ET.fromstring(resp.text)

    topics = []
    for item in root.findall('.//item'):
        title_el = item.find('title')
        traffic_el = item.find('{https://trends.google.com/trends/trendingsearches/daily}approx_traffic')
        if title_el is not None:
            traffic = traffic_el.text if traffic_el is not None else '?'
            topics.append({
                'title': title_el.text,
                'source': 'Google Trends',
                'traffic': traffic,
                'category': _guess_category(title_el.text),
                'score': _parse_traffic(traffic)
            })
    return topics


def _get_youtube_trending_vn():
    """
    Lấy YouTube Trending VN qua YouTube Data API v3.
    Không cần key nhưng có thể dùng key miễn phí từ Google Console.
    Fallback: scrape tiêu đề từ trang trending (không cần key).
    """
    # Dùng YouTube RSS trending (không cần API key)
    url = "https://www.youtube.com/feeds/videos.xml?chart=trending&gl=VN&hl=vi"
    headers = {'User-Agent': 'Mozilla/5.0'}
    resp = requests.get(url, headers=headers, timeout=8)
    resp.raise_for_status()

    import xml.etree.ElementTree as ET
    ns = {'yt': 'http://www.youtube.com/xml/schemas/2015',
          'media': 'http://search.yahoo.com/mrss/',
          'atom': 'http://www.w3.org/2005/Atom'}

    root = ET.fromstring(resp.text)
    topics = []
    for entry in root.findall('atom:entry', ns)[:10]:
        title_el = entry.find('atom:title', ns)
        if title_el is not None:
            topics.append({
                'title': title_el.text,
                'source': 'YouTube Trending VN',
                'traffic': 'YouTube',
                'category': _guess_category(title_el.text),
                'score': 50
            })
    return topics


def _guess_category(title):
    """Đoán category từ tiêu đề"""
    title_lower = title.lower()
    if any(k in title_lower for k in ['hài', 'cười', 'vui', 'funny', 'meme']):
        return 'Hài hước'
    if any(k in title_lower for k in ['tin', 'news', 'sự kiện', 'mới nhất', 'hot']):
        return 'Tin tức'
    if any(k in title_lower for k in ['game', 'gaming', 'liên quân', 'valorant', 'pubg']):
        return 'Gaming'
    if any(k in title_lower for k in ['ăn', 'món', 'nấu', 'food', 'quán']):
        return 'Ẩm thực'
    if any(k in title_lower for k in ['phim', 'anime', 'review', 'tập']):
        return 'Giải trí'
    if any(k in title_lower for k in ['crypto', 'bitcoin', 'chứng khoán', 'tiền']):
        return 'Tài chính'
    return 'Khác'


def _parse_traffic(traffic_str):
    """Convert '100K+' -> 100000"""
    try:
        s = traffic_str.replace('+', '').replace(',', '').strip()
        if 'K' in s:
            return int(float(s.replace('K', '')) * 1000)
        if 'M' in s:
            return int(float(s.replace('M', '')) * 1000000)
        return int(s)
    except:
        return 0


def _get_fallback_topics():
    """Topic mặc định nếu không có internet"""
    return [
        {'title': 'Meme hài hước tuần này', 'source': 'Fallback', 'traffic': 'N/A', 'category': 'Hài hước', 'score': 80},
        {'title': 'Review phim hoạt hình mới nhất', 'source': 'Fallback', 'traffic': 'N/A', 'category': 'Giải trí', 'score': 75},
        {'title': 'Top xu hướng giới trẻ Việt Nam', 'source': 'Fallback', 'traffic': 'N/A', 'category': 'Khác', 'score': 70},
        {'title': 'Ẩm thực đường phố Hà Nội', 'source': 'Fallback', 'traffic': 'N/A', 'category': 'Ẩm thực', 'score': 65},
        {'title': 'Tin tức công nghệ nổi bật', 'source': 'Fallback', 'traffic': 'N/A', 'category': 'Tin tức', 'score': 60},
    ]
