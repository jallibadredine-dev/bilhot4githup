export default function LoadingSpinner({ size = 28, color = 'var(--accent, #2563EB)', label = 'Chargement…', style = {} }) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '24px',
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: 'hova-spin 0.75s linear infinite' }}
        aria-hidden="true"
      >
        <style>{`@keyframes hova-spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #888)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
}
