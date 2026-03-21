import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Terminal } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TopBar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getPathName = () => {
    const p = location.pathname.substring(1);
    return p ? p : 'dashboard';
  };

  return (
    <header style={{ height: '70px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Terminal size={14} color="var(--accent-secondary)" /> ~ / root / <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{getPathName()}</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>sys.user:</span> <span>{user?.name}</span>
        </div>
        <button onClick={logout} style={{ color: 'var(--text-muted)', padding: '0.5rem' }} title="Terminate Session">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
export default TopBar;
