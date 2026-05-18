import { useState, useEffect } from 'react';
import { toast } from '../../lib/toast';

const CONFIG = {
  success: { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: '✓' },
  error:   { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: '✕' },
  warning: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: '⚠' },
  info:    { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', icon: 'ℹ' },
};

export default function ToastContainer() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return toast.subscribe(item => {
      setItems(prev => [...prev.slice(-4), item]);
      setTimeout(() => {
        setItems(prev => prev.filter(t => t.id !== item.id));
      }, item.duration);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      <style>{`@keyframes hova-toast-in { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: none; } }`}</style>
      {items.map(t => {
        const c = CONFIG[t.type] || CONFIG.info;
        return (
          <div key={t.id} style={{
            background: c.bg,
            color: c.color,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.83rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
            maxWidth: 360,
            minWidth: 200,
            animation: 'hova-toast-in 0.2s ease',
            pointerEvents: 'all',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>{c.icon}</span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <button
              onClick={() => setItems(prev => prev.filter(x => x.id !== t.id))}
              style={{
                background: 'none', border: 'none', color: c.color,
                cursor: 'pointer', opacity: 0.55, fontSize: '1.1rem',
                padding: '0 2px', lineHeight: 1, flexShrink: 0,
              }}
              aria-label="Fermer"
            >×</button>
          </div>
        );
      })}
    </div>
  );
}
