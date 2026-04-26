"""
AI Video Tool — Backend (Flask)
Chạy local:  python app.py
Chạy Render: gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120
"""

import os, sys, threading, uuid
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.environ.get('RENDER_DISK_PATH', BASE_DIR)
OUTPUT_DIR = os.path.join(DATA_DIR, 'output')
ASSETS_DIR = os.path.join(DATA_DIR, 'assets')
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

sys.path.insert(0, BASE_DIR)
from trend_analyzer   import get_trending_topics
from script_generator import generate_script
from media_generator  import generate_images, generate_audio
from video_assembler  import assemble_video

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
jobs: dict = {}

@app.route('/api/health')
def health():
    return jsonify({'ok': True, 'version': '1.0.0'})

@app.route('/api/trends')
def get_trends():
    try:
        topics = get_trending_topics(request.args.get('category', 'all'))
        return jsonify({'success': True, 'topics': topics})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_video():
    data     = request.get_json(force=True) or {}
    topic    = data.get('topic', '').strip()
    style    = data.get('style', 'funny')
    duration = int(data.get('duration', 30))
    if not topic:
        return jsonify({'success': False, 'error': 'Thiếu topic'}), 400
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = {
        'id': job_id, 'status': 'pending', 'progress': 0,
        'message': 'Đang khởi động…', 'topic': topic, 'style': style,
        'duration': duration, 'video_url': None, 'script': None, 'error': None,
    }
    threading.Thread(target=_run_pipeline, args=(job_id, topic, style, duration), daemon=True).start()
    return jsonify({'success': True, 'job_id': job_id})

@app.route('/api/status/<job_id>')
def job_status(job_id):
    if job_id not in jobs:
        return jsonify({'success': False, 'error': 'Không tìm thấy job'}), 404
    return jsonify({'success': True, 'job': jobs[job_id]})

@app.route('/api/jobs')
def list_jobs():
    return jsonify({'success': True, 'jobs': jobs})

@app.route('/api/download/<job_id>')
def download_video(job_id):
    if job_id not in jobs or jobs[job_id]['status'] != 'done':
        return jsonify({'error': 'Chưa sẵn sàng'}), 400
    video_path = os.path.join(OUTPUT_DIR, f'{job_id}.mp4')
    if not os.path.exists(video_path):
        return jsonify({'error': 'File không tồn tại'}), 404
    return send_file(video_path, as_attachment=True,
                     download_name=f'video_{job_id}.mp4', mimetype='video/mp4')

def _upd(jid, **kw):
    if jid in jobs: jobs[jid].update(kw)

def _run_pipeline(job_id, topic, style, duration):
    try:
        _upd(job_id, status='running', progress=8,  message='Đang sinh kịch bản AI…')
        script = generate_script(topic, style, duration)

        _upd(job_id, progress=28, message='Đang tạo hình ảnh…')
        image_paths = generate_images(script['scenes'], job_id, assets_dir=ASSETS_DIR)

        _upd(job_id, progress=55, message='Đang tạo giọng đọc tiếng Việt…')
        audio_path  = generate_audio(script['narration'], job_id, assets_dir=ASSETS_DIR)

        _upd(job_id, progress=75, message='Đang ghép video…')
        assemble_video(image_paths, audio_path, script, job_id, OUTPUT_DIR)

        _upd(job_id, status='done', progress=100, message='Video đã sẵn sàng! 🎉',
             video_url=f'/api/download/{job_id}', script=script)
    except Exception as exc:
        import traceback; traceback.print_exc()
        _upd(job_id, status='error', message=f'Lỗi: {exc}', error=str(exc))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'🚀 Backend chạy tại http://localhost:{port}')
    app.run(debug=True, port=port, use_reloader=False)
