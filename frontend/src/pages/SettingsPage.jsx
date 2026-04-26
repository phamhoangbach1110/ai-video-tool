import React, { useState, useEffect } from 'react';
import Card, { CardTitle } from '../components/Card';

const LIBS = [
  { name: 'Flask + CORS',    ok: true, note: 'Backend server' },
  { name: 'gTTS',            ok: true, note: 'Giọng đọc tiếng Việt' },
  { name: 'MoviePy',         ok: true, note: 'Ghép video' },
  { name: 'Pillow',          ok: true, note: 'Xử lý ảnh' },
  { name: 'Pollinations.ai', ok: true, note: 'Tạo ảnh AI (free, online)' },
  { name: 'Google Trends',   ok: true, note: 'Phân tích xu hướng (RSS, free)' },
];

export default function SettingsPage({ showToast }) {
  const [gemini, setGemini] = useState('');
  const [yt, setYt]         = useState('');
  const [showG, setShowG]   = useState(false);
  const [showY, setShowY]   = useState(false);

  useEffect(() => {
    setGemini(localStorage.getItem('key_gemini') || '');
    setYt(localStorage.getItem('key_youtube') || '');
  }, []);

  const save = (type) => {
    const val = type === 'gemini' ? gemini : yt;
    if (!val.trim()) { showToast('⚠️ Nhập key trước!', 'error'); return; }
    localStorage.setItem(`key_${type}`, val.trim());
    showToast(`✓ Đã lưu ${type === 'gemini' ? 'Gemini' : 'YouTube'} API key`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Cài đặt</h1>
        <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>API keys và thông tin hệ thống</p>
      </div>

      {/* Keys */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>🔑 API Keys (tuỳ chọn)</CardTitle>

        {[
          {
            type: 'gemini', label: 'Gemini 1.5 Flash API Key',
            desc: 'Sinh kịch bản AI thông minh. Không có key vẫn chạy được với script mẫu.',
            link: 'https://aistudio.google.com/app/apikey',
            linkLabel: 'Lấy miễn phí tại Google AI Studio →',
            val: gemini, setter: setGemini, show: showG, toggleShow: () => setShowG(v => !v),
            placeholder: 'AIzaSy...',
          },
          {
            type: 'youtube', label: 'YouTube Data API v3',
            desc: 'Lấy trending YouTube Việt Nam chính xác hơn. Không bắt buộc.',
            link: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
            linkLabel: 'Kích hoạt tại Google Console →',
            val: yt, setter: setYt, show: showY, toggleShow: () => setShowY(v => !v),
            placeholder: 'AIzaSy...',
          },
        ].map((k, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: 24, padding: '18px 0',
            borderBottom: i === 0 ? '1px solid #ffffff08' : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 12, color: '#6b6890', marginBottom: 6, lineHeight: 1.5 }}>{k.desc}</div>
              <a href={k.link} target="_blank" rel="noreferrer" style={{
                fontSize: 12, color: '#06b6d4', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>{k.linkLabel}</a>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={k.show ? 'text' : 'password'}
                  value={k.val}
                  onChange={e => k.setter(e.target.value)}
                  placeholder={k.placeholder}
                  style={{
                    width: 260, background: '#16162a', border: '1px solid #ffffff18',
                    borderRadius: 10, padding: '10px 40px 10px 14px',
                    color: '#f0eeff', fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 12, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ffffff18'}
                />
                <button onClick={k.toggleShow} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3d3860', fontSize: 14,
                }}>{k.show ? '🙈' : '👁️'}</button>
              </div>
              <button onClick={() => save(k.type)} style={{
                background: '#7c3aed', color: '#fff', border: 'none',
                padding: '10px 18px', borderRadius: 10,
                fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#9333ea'}
                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
              >Lưu</button>
            </div>
          </div>
        ))}
      </Card>

      {/* Lib status */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>📦 Thư viện hệ thống</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LIBS.map((l, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 0',
              borderBottom: i < LIBS.length - 1 ? '1px solid #ffffff05' : 'none',
            }}>
              <span style={{ color: l.ok ? '#10b981' : '#ef4444', fontSize: 14 }}>●</span>
              <span style={{ fontSize: 13, fontWeight: 500, minWidth: 140 }}>{l.name}</span>
              <span style={{ fontSize: 12, color: '#3d3860' }}>{l.note}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, padding: '2px 8px',
                borderRadius: 20, background: l.ok ? '#10b98118' : '#ef444418',
                color: l.ok ? '#10b981' : '#ef4444',
                border: `1px solid ${l.ok ? '#10b98130' : '#ef444430'}`,
              }}>{l.ok ? 'Sẵn sàng' : 'Chưa cài'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Info box */}
      <div style={{
        background: '#06b6d408', border: '1px solid #06b6d425',
        borderRadius: 14, padding: 18, fontSize: 13, color: '#6b6890', lineHeight: 1.8,
      }}>
        <strong style={{ color: '#06b6d4' }}>💡 Chi phí = $0 hoàn toàn</strong><br />
        Tool dùng: <strong style={{ color: '#f0eeff' }}>Pollinations.ai</strong> (ảnh) ·{' '}
        <strong style={{ color: '#f0eeff' }}>gTTS</strong> (giọng đọc) ·{' '}
        <strong style={{ color: '#f0eeff' }}>Google Trends RSS</strong> (trend) ·{' '}
        <strong style={{ color: '#f0eeff' }}>MoviePy</strong> (ghép video).
        Thêm Gemini key để nâng cấp chất lượng kịch bản.
      </div>
    </div>
  );
}
