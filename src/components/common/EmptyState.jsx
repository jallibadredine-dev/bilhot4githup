export default function EmptyState({
  icon = '📭',
  title = 'Aucun résultat',
  description = '',
  action = null,
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px',
        ...style,
      }}
    >
      <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{icon}</span>
      <p style={{
        fontWeight: 600,
        fontSize: '0.95rem',
        color: 'var(--text-primary, #111)',
        margin: 0,
      }}>
        {title}
      </p>
      {description && (
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted, #888)',
          margin: 0,
          maxWidth: '320px',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent, #2563EB)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.83rem',
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
