import { Terminal } from 'lucide-react';

export const EmptyState = ({ title, description, action }) => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ 
      width: '80px', height: '80px', borderRadius: '50%', 
      background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.5rem', border: '1px solid var(--glass-border)', color: 'var(--accent-secondary)'
    }}>
      <Terminal size={32} />
    </div>
    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.5 }}>{description}</p>
    {action}
  </div>
);
