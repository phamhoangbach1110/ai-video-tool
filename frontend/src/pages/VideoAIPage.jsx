import React, { useState } from 'react';
import Card, { CardTitle } from '../components/Card';

const STYLES = [
  { id: 'cinematic',  icon: '🎬', label: 'Cinematic' },
  { id: 'anime',      icon: '✨', label: 'Anime' },
  { id: 'cartoon',    icon: '🎨', label: 'Cartoon' },
  { id: 'realistic',  icon: '📷', label: 'Realistic' },
  { id: 'lofi',       icon: '🌙', label: 'Lo-fi' },
  { id: 'epic',       icon: '⚡', label: 'Epic' },
];

const DURATIONS = ['5s', '8s', '15s'];

const STYLE_PROMPTS = {
  cinematic:  'cinematic shot, 4K, dramatic lighting, film grain, anamorphic lens, Hollywood style',
  anime:      'anime style, vibrant colors, Studio Ghibli aesthetic, hand-drawn, detailed',
  cartoon:    'cartoon style, bright colors, clean lines, fun and playful, Pixar inspired',
  realistic:  'photorealistic, hyperdetailed, natural lighting, DSLR quality, sharp focus',
  lofi:       'lo-fi aesthetic, soft colors, cozy atmosphere, nostalgic, dreamy, pastel tones',
  epic:       'epic scale, dramatic atmosphere, volumetric lighting, cinematic composition, awe-inspiring',
};

const GOOGLE_FLOW_URL = 'https://labs.google/fx/tools/video-fx';

export default function VideoAIPage({ showToast }) {
  const [topic, setTopic]       = useState('');
  const [style, setStyle]       = useState('cinematic');
  const [duration, setDuration] = useState('8s');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || '';

  const generate = async () => {
    if (!topic.trim()) { showToast('⚠️ Nhập chủ đề trước!', 'error'); return; }
    setLoading(true);
    setResult(null);

    try {
      // Gọi backend để sinh prompt bằng Groq
      const res = await fetch(`${API_URL}/api/video-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, style, duration }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.error || 'Lỗi sinh prompt');
      }
    } catch (e) {
      showToast('❌ ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyAndOpen = (prompt) => {
    navigator.clipboard.writeText(prompt).then(() => {
      showToast('✅ Đã copy prompt! Đang mở Google Flow...', 'success');
      setTimeout(() => window.open(GOOGLE_FLOW_URL, '_blank'), 800);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
          Video AI — Google Flow
        </h1>
        <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>
          Sinh prompt chuẩn → copy → dán vào Google Flow để tạo video chất lượng cao
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT — Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardTitle>📝 Nội dung</CardTitle>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Chủ đề video</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="VD: Cảnh hoàng hôn trên biển Đà Nẵng..."
                style={inp}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#ffffff18'}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Phong cách</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
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
              <label style={lbl}>Thời lượng</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{
                    flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s', border: 'none',
                    background: duration === d
                      ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : '#16162a',
                    color: duration === d ? '#fff' : '#6b6890',
                    boxShadow: duration === d ? '0 0 14px #7c3aed40' : 'none',
                  }}>{d}</button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={loading} style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: loading ? '#2a1f5a' : 'linear-gradient(135deg,#7c3aed,#9333ea)',
              color: loading ? '#5e5a80' : '#fff',
              fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 24px #7c3aed50',
              transition: 'all 0.2s',
            }}>
              {loading ? '⏳ Đang sinh prompt...' : '✨ Sinh prompt AI'}
            </button>
          </Card>

          {/* Hướng dẫn */}
          <Card>
            <CardTitle>📖 Cách dùng</CardTitle>
            {[
              ['1️⃣', 'Nhập chủ đề và chọn phong cách'],
              ['2️⃣', 'Nhấn "Sinh prompt AI" — Groq tạo prompt chuẩn'],
              ['3️⃣', 'Nhấn "Copy & Mở Google Flow"'],
              ['4️⃣', 'Dán prompt vào ô tìm kiếm của Google Flow'],
              ['5️⃣', 'Chờ Google Flow tạo video chất lượng cao!'],
            ].map(([num, text], i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '8px 0',
                borderBottom: i < 4 ? '1px solid #ffffff05' : 'none',
                fontSize: 13, color: '#6b6890', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{num}</span>
                <span style={{ lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* RIGHT — Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <>
              {/* Main prompt */}
              <Card glow>
                <CardTitle>🎬 Video Prompt</CardTitle>
                <div style={{
                  background: '#16162a', borderRadius: 10, padding: 14,
                  border: '1px solid #7c3aed30', marginBottom: 12,
                  fontSize: 13, lineHeight: 1.8, color: '#c4b5fd',
                  fontFamily: 'JetBrains Mono,monospace',
                  wordBreak: 'break-word',
                }}>
                  {result.video_prompt}
                </div>
                <button onClick={() => copyAndOpen(result.video_prompt)} style={{
                  width: '100%', padding: 13, borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff', fontFamily: 'Outfit,sans-serif',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 20px #10b98140', transition: 'all 0.2s',
                }}>
                  📋 Copy & Mở Google Flow
                </button>
              </Card>

              {/* Scene prompts */}
              {result.scene_prompts && result.scene_prompts.length > 0 && (
                <Card>
                  <CardTitle>🎞️ Prompt từng cảnh</CardTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.scene_prompts.map((scene, i) => (
                      <div key={i} style={{
                        background: '#16162a', borderRadius: 10, padding: 12,
                        border: '1px solid #ffffff08',
                      }}>
                        <div style={{
                          fontSize: 11, color: '#7c3aed', fontWeight: 600,
                          marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1,
                        }}>
                          Cảnh {i + 1}
                        </div>
                        <div style={{
                          fontSize: 12, color: '#9490b5', lineHeight: 1.6,
                          fontFamily: 'JetBrains Mono,monospace', marginBottom: 8,
                        }}>
                          {scene}
                        </div>
                        <button onClick={() => copyAndOpen(scene)} style={{
                          padding: '6px 14px', borderRadius: 8, border: '1px solid #7c3aed40',
                          background: '#7c3aed15', color: '#a78bfa',
                          fontFamily: 'Outfit,sans-serif', fontSize: 12,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                          📋 Copy cảnh này
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Negative prompt */}
              {result.negative_prompt && (
                <Card>
                  <CardTitle>🚫 Negative Prompt</CardTitle>
                  <div style={{
                    background: '#16162a', borderRadius: 10, padding: 12,
                    border: '1px solid #ef444420', fontSize: 12,
                    color: '#9490b5', lineHeight: 1.6,
                    fontFamily: 'JetBrains Mono,monospace', marginBottom: 10,
                  }}>
                    {result.negative_prompt}
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(result.negative_prompt);
                    showToast('✅ Đã copy negative prompt!', 'success');
                  }} style={{
                    padding: '7px 16px', borderRadius: 8, border: '1px solid #ef444430',
                    background: '#ef444415', color: '#fca5a5',
                    fontFamily: 'Outfit,sans-serif', fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    📋 Copy Negative Prompt
                  </button>
                </Card>
              )}
            </>
          ) : (
            /* Empty state */
            <Card style={{ height: '100%', minHeight: 300 }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', minHeight: 280,
                color: '#3d3860', textAlign: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 56 }}>🎬</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  Prompt sẽ hiện ở đây
                </div>
                <div style={{ fontSize: 13, color: '#2d2a50', lineHeight: 1.6 }}>
                  Nhập chủ đề → nhấn Sinh prompt AI<br/>
                  → Copy → dán vào Google Flow
                </div>
                <a href={GOOGLE_FLOW_URL} target="_blank" rel="noreferrer" style={{
                  marginTop: 8, padding: '10px 20px', borderRadius: 10,
                  background: '#7c3aed15', border: '1px solid #7c3aed40',
                  color: '#a78bfa', textDecoration: 'none',
                  fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                }}>
                  🚀 Mở Google Flow ngay
                </a>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 500, color: '#6b6890', marginBottom: 8 };
const inp = {
  width: '100%', background: '#16162a', border: '1px solid #ffffff18',
  borderRadius: 10, padding: '11px 14px', color: '#f0eeff',
  fontFamily: 'Outfit,sans-serif', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
};