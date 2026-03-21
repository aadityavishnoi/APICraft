export const SkeletonLoader = ({ style, className = '' }) => (
  <div className={`skeleton ${className}`} style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.02)', ...style }}></div>
);
