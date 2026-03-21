import { NavLink } from 'react-router-dom';
import { Database, Key, Activity, Settings, LayoutDashboard, Book } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'collections', label: 'Collections', path: '/collections', icon: Database },
  { id: 'keys', label: 'API Keys', path: '/keys', icon: Key },
  { id: 'logs', label: 'Activity Logs', path: '/logs', icon: Activity },
  { id: 'docs', label: 'API Docs', path: '/docs', icon: Book },
];

const Sidebar = () => {
  return (
    <aside style={{ width: '260px', borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '2.5rem', paddingLeft: '1rem', color: 'var(--text-main)', fontSize: '1.6rem', letterSpacing: '-1px' }}>
        <span style={{ color: 'var(--accent-primary)' }}>API</span>Craft<span style={{ color: 'var(--accent-secondary)' }}>_</span>
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            end={item.path === '/'}
            className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} 
            style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
          >
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Settings size={18} /> Settings
        </NavLink>
      </div>
    </aside>
  );
};
export default Sidebar;
