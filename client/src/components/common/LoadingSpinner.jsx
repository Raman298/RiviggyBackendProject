
import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const s = sizes[size] || 36;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
      <div style={{ width: s, height: s, border: `3px solid #D9C9AE`, borderTop: `3px solid #84CC16`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text && <p style={{ color: '#6B7280', fontFamily: 'Syne', fontSize: 14 }}>{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180, width: '100%' }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 6, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 6, marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}
