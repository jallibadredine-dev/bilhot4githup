const STATUS_STYLES = {
  active:    { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' },
  inactive:  { background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' },
  pending:   { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
  error:     { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
  success:   { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' },
  warning:   { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
  info:      { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' },
  default:   { background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' },
};

export default function StatusBadge({ status = 'default', label, className = '', style = {} }) {
  const resolved = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '20px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...resolved,
        ...style,
      }}
    >
      {label ?? status}
    </span>
  );
}
