import { NavLink } from 'react-router-dom';
import { Database, Key, Activity, Settings, LayoutDashboard, Book } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside style={{ width: '260px', borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '2.5rem', paddingLeft: '1rem', color: 'var(--text-main)', fontSize: '1.6rem', letterSpacing: '-1px' }}>
        <span style={{ color: 'var(--accent-primary)' }}>API</span>Craft<span style={{ color: 'var(--accent-secondary)' }}>_</span>
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavLink to="/dashboard" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <LayoutDashboard size={18} /> Overview
        </NavLink>
        <NavLink to="/collections" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Database size={18} /> Collections
        </NavLink>
        <NavLink to="/keys" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Key size={18} /> API Keys
        </NavLink>
        <NavLink to="/logs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Activity size={18} /> Monitor Logs
        </NavLink>
        <NavLink to="/docs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Book size={18} /> API Docs
        </NavLink>
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Settings size={18} /> Engine Settings
        </NavLink>
      </div>
    </aside>
  );
};
export default Sidebar;
