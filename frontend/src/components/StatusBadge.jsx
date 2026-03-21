export const StatusBadge = ({ method, status }) => {
  if (method) {
    const colors = { GET: '#00D4FF', POST: '#34d399', PUT: '#fbbf24', DELETE: '#ff4d4f' };
    const color = colors[method] || '#fff';
    return (
      <span style={{ 
        color, 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.75rem', 
        fontWeight: '600',
        padding: '0.2rem 0.5rem',
        background: `rgba(255,255,255,0.05)`, 
        borderRadius: '4px',
        border: `1px solid ${color}40`
      }}>
        {method}
      </span>
    );
  }
  if (status) {
    const color = status < 300 ? '#34d399' : status < 500 ? '#fbbf24' : '#ff4d4f';
    return (
      <span style={{ color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 'bold' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
        {status}
      </span>
    );
  }
  return null;
};
