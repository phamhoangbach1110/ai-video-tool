import React from 'react';

export default function Toast({ toast }) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#7c3aed',
  };
  const color = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#0e0e1c', border: `1px solid ${color}60`,
      borderRadius: 14, padding: '14px 20px',
      fontSize: 13, fontFamily: 'Outfit,sans-serif',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 340, color: '#f0eeff',
      boxShadow: `0 8px 32px ${color}20`,
      transform: toast.visible ? 'translateY(0)' : 'translateY(90px)',
      opacity: toast.visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: toast.visible ? 'auto' : 'none',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {toast.msg}
    </div>
  );
}
