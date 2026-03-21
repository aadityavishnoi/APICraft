export const GlassCard = ({ children, style, className = '' }) => (
  <div className={`glass-card ${className}`} style={{ padding: '1.5rem', ...style }}>
    {children}
  </div>
);
