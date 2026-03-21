import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Terminal } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TopBar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const getPathName = () => {
    const p = location.pathname.substring(1);
    return p ? p : 'dashboard';
  };

  return (
    <header style={{ height: '64px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span>Home</span>
        <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'capitalize' }}>{getPathName()}</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={logout} className="btn-ghost" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} title="Sign out">
          <LogOut size={18} />
          <span style={{ fontSize: '0.85rem' }}>Sign out</span>
        </button>
      </div>
    </header>
  );
};
export default TopBar;
