import React from 'react';

export default function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: '#0e0e1c',
      border: '1px solid #ffffff0d',
      borderRadius: 18,
      padding: 24,
      boxShadow: glow ? '0 0 40px #7c3aed18' : 'none',
      transition: 'border-color 0.2s',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '1.2px', color: '#3d3860',
      marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: '#ffffff08' }} />
    </div>
  );
}
