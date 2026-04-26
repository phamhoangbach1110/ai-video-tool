import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { api } from '../utils/api';

const CAT_COLORS = {
  'Hài hước': '#f59e0b',
  'Tin tức':  '#3b82f6',
  'Gaming':   '#8b5cf6',
  'Ẩm thực':  '#10b981',
  'Giải trí': '#ec4899',
  'Tài chính':'#06b6d4',
  'Khác':     '#6b7280',
};

export default function TrendsPage({ onSelectTrend, showToast }) {
  const [topics, setTopics]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getTrends();
      if (data.success) setTopics(data.topics);
      else throw new Error();
    } catch {
      showToast('⚠️ Backend chưa chạy hoặc mất kết nối', 'error');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cats = ['all', ...new Set(topics.map(t => t.category))];
  const filtered = filter === 'all' ? topics : topics.filter(t => t.category === filter);

  const pick = (topic) => {
    setSelected(topic.title);
    onSelectTrend(topic.title);
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Xu hướng hôm nay</h1>
          <p style={{ fontSize: 14, color: '#6b6890', marginTop: 4 }}>
            {loading ? 'Đang kéo dữ liệu…' : `${topics.length} chủ đề từ Google Trends & YouTube VN`}
          </p>
        </div>
        <button onClick={load} style={refreshBtn}>↻ Làm mới</button>
      </div>

      {/* Category filter */}
      {topics.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit,sans-serif',
              border: filter === c ? `1px solid #7c3aed` : '1px solid #ffffff12',
              background: filter === c ? '#7c3aed20' : '#0e0e1c',
              color: filter === c ? '#a78bfa' : '#6b6890',
            }}>
              {c === 'all' ? '✦ Tất cả' : c}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              background: '#0e0e1c', borderRadius: 14, height: 100,
              border: '1px solid #ffffff08', animation: 'pulse 1.5s infinite',
              opacity: 0.6 - i * 0.05
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#3d3860' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 15 }}>Không kết nối được backend</div>
          <div style={{ fontSize: 12, marginTop: 8, fontFamily: 'JetBrains Mono,monospace', color: '#5e5a80' }}>
            Khởi động: python backend/app.py
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {filtered.map((t, i) => {
            const isSelected = selected === t.title;
            const catColor = CAT_COLORS[t.category] || '#6b7280';
            return (
              <div key={i} onClick={() => pick(t)} style={{
                background: isSelected ? '#7c3aed18' : '#0e0e1c',
                border: isSelected ? '1px solid #7c3aed' : '1px solid #ffffff0d',
                borderRadius: 14, padding: '14px 16px',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 20px #7c3aed30' : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#7c3aed60'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#ffffff0d'; e.currentTarget.style.transform = 'none'; }}}
              >
                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 10, color: '#f0eeff' }}>
                  {t.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: '#3d3860', fontFamily: 'JetBrains Mono,monospace' }}>
                    {t.source}
                  </span>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 20,
                    background: catColor + '18', color: catColor,
                    border: `1px solid ${catColor}40`,
                  }}>
                    {t.category}
                  </span>
                </div>
                {t.traffic && t.traffic !== 'YouTube' && t.traffic !== 'N/A' && (
                  <div style={{ fontSize: 11, color: '#06b6d4', marginTop: 6, fontFamily: 'JetBrains Mono,monospace' }}>
                    🔥 {t.traffic}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        marginTop: 20, padding: '12px 16px',
        background: '#0e0e1c', borderRadius: 10,
        border: '1px solid #ffffff08', fontSize: 13, color: '#6b6890'
      }}>
        💡 Nhấn vào một xu hướng để chọn làm chủ đề → chuyển sang tab{' '}
        <strong style={{ color: '#a78bfa' }}>Tạo video</strong>
      </div>
    </div>
  );
}

const refreshBtn = {
  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Outfit,sans-serif',
  background: '#0e0e1c', border: '1px solid #ffffff12', color: '#6b6890',
};
