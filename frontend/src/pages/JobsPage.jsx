import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_MAP = {
  done:    { label: '✓ Xong',       color: '#10b981' },
  running: { label: '⚡ Đang chạy', color: '#a78bfa' },
  error:   { label: '✕ Lỗi',       color: '#ef4444' },
  pending: { label: '⏳ Chờ',       color: '#f59e0b' },
};

export default function JobsPage({ showToast }) {
  const [jobs, setJobs]     = useState({});
  const [loading, setLoad]  = useState(true);

  const load = async () => {
    setLoad(true);
    try {
      const data = await api.getJobs();
      if (data.success) setJobs(data.jobs || {});
    } catch {
      showToast('⚠️ Không kết nối được backend', 'error');
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { load(); }, []);

  const entries = Object.entries(jobs).reverse();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Lịch sử video</h1>
          <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>
            {loading ? 'Đang tải…' : `${entries.length} video trong phiên này`}
          </p>
        </div>
        <button onClick={load} style={refreshBtn}>↻ Làm mới</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 72, borderRadius: 14, background: '#0e0e1c', border: '1px solid #ffffff08' }} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#3d3860' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎬</div>
          <div style={{ fontSize: 15 }}>Chưa có video nào. Hãy tạo video đầu tiên!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(([id, job]) => {
            const st = STATUS_MAP[job.status] || STATUS_MAP.pending;
            return (
              <div key={id} style={{
                background: '#0e0e1c', border: '1px solid #ffffff0d',
                borderRadius: 14, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#ffffff1a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ffffff0d'}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.topic}
                  </div>
                  <div style={{ fontSize: 12, color: '#3d3860', fontFamily: 'JetBrains Mono,monospace', marginTop: 3 }}>
                    ID: {id} · {job.style}
                  </div>
                </div>

                {/* Mini progress */}
                <div style={{ width: 80 }}>
                  <div style={{ height: 4, background: '#16162a', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, transition: 'width 0.5s',
                      background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
                      width: `${job.progress}%`
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#3d3860', fontFamily: 'JetBrains Mono,monospace', marginTop: 3, textAlign: 'right' }}>
                    {job.progress}%
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 12px',
                  borderRadius: 20, whiteSpace: 'nowrap',
                  background: st.color + '18',
                  color: st.color,
                  border: `1px solid ${st.color}40`,
                }}>
                  {st.label}
                </div>

                {/* Download */}
                {job.status === 'done' && (
                  <a href={api.downloadUrl(id)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'transparent', border: '1px solid #ffffff18',
                    color: '#6b6890', textDecoration: 'none', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ffffff18'; e.currentTarget.style.color = '#6b6890'; }}
                  >⬇</a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const refreshBtn = {
  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit,sans-serif',
  background: '#0e0e1c', border: '1px solid #ffffff12', color: '#6b6890',
};
