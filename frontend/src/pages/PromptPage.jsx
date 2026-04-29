import React, { useState, useEffect } from 'react';
import Card, { CardTitle } from '../components/Card';

const STYLES = [
  { id: 'cinematic',  icon: '🎬', label: 'Cinematic'  },
  { id: 'anime',      icon: '✨', label: 'Anime'       },
  { id: 'cartoon',    icon: '🎨', label: 'Cartoon'     },
  { id: 'realistic',  icon: '📷', label: 'Realistic'   },
  { id: 'lofi',       icon: '🌙', label: 'Lo-fi'       },
  { id: 'epic',       icon: '⚡', label: 'Epic'        },
  { id: 'funny',      icon: '😂', label: 'Hài hước'    },
  { id: 'dramatic',   icon: '🎭', label: 'Kịch tính'   },
];

const DURATIONS = ['5s', '8s', '15s', '30s'];
const GOOGLE_FLOW_URL = 'https://labs.google/fx/tools/video-fx';

export default function PromptPage({ selectedTopic, showToast }) {
  const [topic, setTopic]       = useState('');
  const [style, setStyle]       = useState('cinematic');
  const [duration, setDuration] = useState('8s');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    if (selectedTopic) setTopic(selectedTopic);
  }, [selectedTopic]);

  const generate = async () => {
    if (!topic.trim()) { showToast('⚠️ Nhập chủ đề trước!', 'error'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch(`${API_URL}/api/video-prompt`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ topic, style, duration }),
      });
      const data = await res.json();
      if (data.success) setResult(data);
      else throw new Error(data.error || 'Lỗi sinh prompt');
    } catch (e) {
      showToast('❌ ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, label = 'prompt') => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`✅ Đã copy ${label}!`, 'success');
    });
  };

  const copyAll = () => {
    if (!result) return;

    // Tính thời gian mỗi cảnh
    const totalSec = parseInt(duration);
    const sceneCount = result.scene_prompts?.length || 1;
    const secPerScene = Math.floor(totalSec / sceneCount);

    const toTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `0:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };

    let text = '';

    // Prompt chính
    text += `VIDEO PROMPT:\n${result.video_prompt}\n\n`;

    // Từng cảnh
    result.scene_prompts?.forEach((scene, i) => {
      const start = i * secPerScene;
      const end   = i === sceneCount - 1 ? totalSec : (i + 1) * secPerScene;
      text += `Scene ${i + 1} (${toTime(start)} - ${toTime(end)}):\n${scene}\n\n`;
    });

    // Negative prompt
    if (result.negative_prompt) {
      text += `Negative Prompt:\n${result.negative_prompt}`;
    }

    navigator.clipboard.writeText(text.trim()).then(() => {
      showToast('✅ Đã copy toàn bộ prompt!', 'success');
    });
  };

  const copyAndOpen = (text) => {
    window.open(GOOGLE_FLOW_URL, '_blank');
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Tạo Prompt</h1>
        <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>
          AI sinh prompt chuẩn → copy → dán vào{' '}
          <a href={GOOGLE_FLOW_URL} target="_blank" rel="noreferrer"
            style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>
            Google Flow ↗
          </a>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20 }}>

        {/* Form bên trái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardTitle>📝 Nội dung</CardTitle>

            {selectedTopic && (
              <div style={{
                background: '#7c3aed12', border: '1px solid #7c3aed50',
                borderRadius: 10, padding: '8px 14px', fontSize: 13,
                color: '#a78bfa', marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ✓ Từ trend: <strong>{selectedTopic.slice(0, 45)}</strong>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Chủ đề</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="VD: Hoàng hôn trên biển Đà Nẵng..."
                style={inp}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#ffffff18'}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Phong cách</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)} style={{
                    padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Outfit,sans-serif', fontSize: 11, fontWeight: 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.2s',
                    border: style === s.id ? '1px solid #7c3aed' : '1px solid #ffffff12',
                    background: style === s.id ? '#7c3aed18' : '#16162a',
                    color: style === s.id ? '#a78bfa' : '#6b6890',
                    boxShadow: style === s.id ? '0 0 12px #7c3aed30' : 'none',
                  }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
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
                    flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s', border: 'none',
                    background: duration === d
                      ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : '#16162a',
                    color: duration === d ? '#fff' : '#6b6890',
                    boxShadow: duration === d ? '0 0 12px #7c3aed40' : 'none',
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
              {loading ? '⏳ Đang sinh prompt...' : '✨ Sinh Prompt AI'}
            </button>
          </Card>

          <Card>
            <CardTitle>📖 Cách dùng</CardTitle>
            {[
              ['1️⃣', 'Chọn xu hướng từ tab Xu hướng hoặc tự nhập chủ đề'],
              ['2️⃣', 'Chọn phong cách và thời lượng mong muốn'],
              ['3️⃣', 'Nhấn "Sinh Prompt AI"'],
              ['4️⃣', 'Nhấn "Copy & Mở Google Flow"'],
              ['5️⃣', 'Dán (Ctrl+V) vào Google Flow → tạo video!'],
            ].map(([num, text], i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '7px 0',
                borderBottom: i < 4 ? '1px solid #ffffff05' : 'none',
                fontSize: 13, color: '#6b6890',
              }}>
                <span style={{ flexShrink: 0 }}>{num}</span>
                <span style={{ lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Kết quả bên phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {result ? (
            <>
              <Card glow>
                <CardTitle>🎬 Video Prompt chính</CardTitle>

                {/* Nút copy toàn bộ */}
                <button onClick={copyAll} style={{
                  width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#fff', fontFamily: 'Outfit,sans-serif',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px #f59e0b40', marginBottom: 14,
                  transition: 'all 0.2s',
                }}>
                  📄 Copy toàn bộ (Scene 1, 2, 3... + Negative Prompt)
                </button>

                <div style={{
                  background: '#16162a', borderRadius: 10, padding: 16,
                  border: '1px solid #7c3aed40', marginBottom: 14,
                  fontSize: 14, lineHeight: 1.9, color: '#c4b5fd',
                  fontFamily: 'JetBrains Mono,monospace', wordBreak: 'break-word',
                }}>
                  {result.video_prompt}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => copy(result.video_prompt)} style={btnOutline}>
                    📋 Copy
                  </button>
                  <button onClick={() => copyAndOpen(result.video_prompt)} style={btnGreen}>
                    🚀 Mở Google Flow
                  </button>
                </div>
              </Card>

              {result.scene_prompts?.length > 0 && (
                <Card>
                  <CardTitle>🎞️ Prompt từng cảnh</CardTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.scene_prompts.map((scene, i) => (
                      <div key={i} style={{
                        background: '#16162a', borderRadius: 10, padding: 14,
                        border: '1px solid #ffffff08',
                      }}>
                        <div style={{
                          fontSize: 10, color: '#7c3aed', fontWeight: 700,
                          marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2,
                        }}>Cảnh {i + 1}</div>
                        <div style={{
                          fontSize: 13, color: '#9490b5', lineHeight: 1.7,
                          fontFamily: 'JetBrains Mono,monospace', marginBottom: 10,
                        }}>{scene}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => copy(scene, `cảnh ${i+1}`)} style={btnOutline}>
                            📋 Copy
                          </button>
                          <button onClick={() => copyAndOpen(scene)} style={{...btnOutline, borderColor:'#10b98140', color:'#10b981'}}>
                            🚀 Mở Flow
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {result.negative_prompt && (
                <Card>
                  <CardTitle>🚫 Negative Prompt</CardTitle>
                  <div style={{
                    background: '#16162a', borderRadius: 10, padding: 14,
                    border: '1px solid #ef444420', fontSize: 13,
                    color: '#9490b5', lineHeight: 1.7,
                    fontFamily: 'JetBrains Mono,monospace', marginBottom: 10,
                  }}>{result.negative_prompt}</div>
                  <button onClick={() => copy(result.negative_prompt, 'negative prompt')} style={btnOutline}>
                    📋 Copy Negative Prompt
                  </button>
                </Card>
              )}
            </>
          ) : (
            <Card style={{ minHeight: 400 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 380,
                color: '#3d3860', textAlign: 'center', gap: 14,
              }}>
                <div style={{ fontSize: 64 }}>✨</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#5e5a80' }}>
                  Prompt sẽ hiện ở đây
                </div>
                <div style={{ fontSize: 13, color: '#2d2a50', lineHeight: 1.7 }}>
                  Nhập chủ đề → nhấn{' '}
                  <strong style={{ color: '#a78bfa' }}>Sinh Prompt AI</strong>
                  <br />→ copy → dán vào Google Flow
                </div>
                <a href={GOOGLE_FLOW_URL} target="_blank" rel="noreferrer" style={{
                  padding: '11px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
                  color: '#fff', textDecoration: 'none',
                  fontSize: 13, fontWeight: 700,
                  boxShadow: '0 4px 20px #7c3aed50',
                }}>🚀 Mở Google Flow ngay</a>
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
const btnOutline = {
  padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
  background: 'transparent', border: '1px solid #ffffff18', color: '#6b6890',
  fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all 0.2s',
};
const btnGreen = {
  flex: 1, padding: '10px 18px', borderRadius: 8, border: 'none',
  background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
  fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 4px 16px #10b98140',
};