import React, { useState, useEffect, useRef } from 'react';
import Card, { CardTitle } from '../components/Card';
import { api } from '../utils/api';

const STYLES = [
  { id: 'funny',       icon: '😂', label: 'Hài hước' },
  { id: 'story',       icon: '📖', label: 'Kể chuyện' },
  { id: 'informative', icon: '💡', label: 'Thông tin' },
  { id: 'dramatic',    icon: '🎭', label: 'Kịch tính' },
];

export default function GeneratePage({ selectedTopic, showToast }) {
  const [topic, setTopic]     = useState('');
  const [style, setStyle]     = useState('funny');
  const [duration, setDur]    = useState(30);
  const [loading, setLoading] = useState(false);
  const [job, setJob]         = useState(null);
  const pollRef               = useRef(null);

  useEffect(() => {
    if (selectedTopic) setTopic(selectedTopic);
  }, [selectedTopic]);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const start = async () => {
    if (!topic.trim()) { showToast('⚠️ Nhập chủ đề trước!', 'error'); return; }
    setLoading(true);
    setJob({ status: 'pending', progress: 0, message: 'Đang gửi…' });
    try {
      const data = await api.generate({ topic, style, duration });
      if (!data.success) throw new Error(data.error);
      const jobId = data.job_id;
      setJob({ status: 'running', progress: 5, message: 'Đang khởi động pipeline…', id: jobId });
      pollRef.current = setInterval(async () => {
        try {
          const s = await api.getStatus(jobId);
          if (!s.success) return;
          setJob({ ...s.job, id: jobId });
          if (s.job.status === 'done' || s.job.status === 'error') {
            clearInterval(pollRef.current);
            setLoading(false);
            if (s.job.status === 'done') showToast('🎉 Video đã sẵn sàng!', 'success');
            else showToast('❌ ' + s.job.error, 'error');
          }
        } catch { /* ignore */ }
      }, 2000);
    } catch (e) {
      setLoading(false);
      showToast('❌ ' + e.message, 'error');
      setJob(null);
    }
  };

  const statusColor = { running: '#a78bfa', done: '#10b981', error: '#ef4444', pending: '#f59e0b' };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Tạo video mới</h1>
        <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>AI tự sinh kịch bản, tạo ảnh và ghép video</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* LEFT — form */}
        <Card>
          <CardTitle>📝 Nội dung</CardTitle>

          {/* Selected from trend */}
          {selectedTopic && (
            <div style={{
              background: '#7c3aed12', border: '1px solid #7c3aed50',
              borderRadius: 10, padding: '8px 14px', fontSize: 13,
              color: '#a78bfa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
            }}>
              ✓ Từ trend: <strong>{selectedTopic.slice(0, 45)}</strong>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Chủ đề / Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="VD: Meme hài hước tuần này…"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#ffffff18'}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phong cách</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} style={{
                  padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Outfit,sans-serif', fontSize: 12, fontWeight: 500,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s',
                  border: style === s.id ? '1px solid #7c3aed' : '1px solid #ffffff12',
                  background: style === s.id ? '#7c3aed18' : '#16162a',
                  color: style === s.id ? '#a78bfa' : '#6b6890',
                  boxShadow: style === s.id ? '0 0 14px #7c3aed30' : 'none',
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Thời lượng: <span style={{ color: '#a78bfa' }}>{duration}s</span></label>
            <input
              type="range" min={15} max={60} value={duration}
              onChange={e => setDur(+e.target.value)}
              style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#3d3860', marginTop: 4 }}>
              <span>15s</span><span>60s</span>
            </div>
          </div>

          <button onClick={start} disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: loading ? '#2a1f5a' : 'linear-gradient(135deg,#7c3aed,#9333ea)',
            color: loading ? '#5e5a80' : '#fff', fontFamily: 'Outfit,sans-serif',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 24px #7c3aed50',
            transition: 'all 0.2s',
          }}>
            {loading ? '⏳ Đang xử lý…' : '⚡ Tạo video ngay'}
          </button>
        </Card>

        {/* RIGHT — progress / result / tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Progress card */}
          {job && (
            <Card glow={job.status === 'running'}>
              <CardTitle>⚙️ Tiến trình</CardTitle>

              {/* Status header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: statusColor[job.status] || '#6b7280',
                    animation: job.status === 'running' ? 'pulse 1.5s infinite' : 'none',
                  }} />
                  {job.message}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, color: '#a78bfa' }}>
                  {job.progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: '#16162a', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{
                  height: '100%', borderRadius: 10,
                  background: `linear-gradient(90deg, #7c3aed, #06b6d4)`,
                  width: `${job.progress}%`, transition: 'width 0.6s ease',
                }} />
              </div>

              {/* Steps */}
              {[
                { label: 'Sinh kịch bản', pct: 10 },
                { label: 'Tạo hình ảnh AI', pct: 30 },
                { label: 'Tạo giọng đọc', pct: 55 },
                { label: 'Ghép video', pct: 75 },
                { label: 'Hoàn tất', pct: 100 },
              ].map((step, i) => {
                const done = job.progress >= step.pct;
                const active = job.progress >= (i === 0 ? 0 : [10,30,55,75][i-1]) && job.progress < step.pct;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '5px 0', fontSize: 13,
                    color: done ? '#f0eeff' : active ? '#a78bfa' : '#3d3860',
                  }}>
                    <span style={{ fontSize: 14 }}>
                      {done ? '✓' : active ? '◉' : '○'}
                    </span>
                    {step.label}
                  </div>
                );
              })}
            </Card>
          )}

          {/* Result card */}
          {job?.status === 'done' && (
            <Card style={{ border: '1px solid #10b98130', background: '#10b98108' }}>
              <CardTitle>✅ Video sẵn sàng</CardTitle>
              {job.script && (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#f0eeff' }}>
                    {job.script.title}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#6b6890', lineHeight: 1.7,
                    marginBottom: 12, background: '#16162a',
                    borderRadius: 10, padding: 12, border: '1px solid #ffffff08'
                  }}>
                    {(job.script.narration || '').slice(0, 180)}…
                  </div>
                  {job.script.hashtags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {job.script.hashtags.map((h, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20,
                          background: '#7c3aed15', border: '1px solid #7c3aed40', color: '#a78bfa',
                          fontFamily: 'JetBrains Mono,monospace'
                        }}>{h}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
              <a href={api.downloadUrl(job.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 10,
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff', textDecoration: 'none',
                fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 20px #10b98140',
              }}>
                ⬇ Tải video xuống
              </a>
            </Card>
          )}

          {/* Tips (khi chưa có job) */}
          {!job && (
            <Card>
              <CardTitle>💡 Mẹo</CardTitle>
              {[
                ['🔥', 'Chọn topic từ tab Xu hướng để tăng tỷ lệ viral'],
                ['🎨', 'Thêm Gemini API key trong Cài đặt để kịch bản thông minh hơn'],
                ['🖼️', 'Ảnh từ Pollinations.ai — miễn phí không giới hạn'],
                ['🎙️', 'gTTS đọc tiếng Việt chuẩn, không cần API key'],
                ['⏱️', 'Mỗi video mất khoảng 1–3 phút'],
              ].map(([icon, text], i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '6px 0',
                  fontSize: 13, color: '#6b6890', lineHeight: 1.5,
                  borderBottom: i < 4 ? '1px solid #ffffff05' : 'none'
                }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
      `}</style>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6890', marginBottom: 8 };
const inputStyle = {
  width: '100%', background: '#16162a', border: '1px solid #ffffff18',
  borderRadius: 10, padding: '11px 14px', color: '#f0eeff',
  fontFamily: 'Outfit,sans-serif', fontSize: 14, outline: 'none',
  transition: 'border-color 0.2s',
};
