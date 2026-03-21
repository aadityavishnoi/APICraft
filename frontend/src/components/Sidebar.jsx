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
    <aside style={{ width: '240px', borderRight: '1px solid var(--border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
      <h2 style={{ marginBottom: '2.5rem', paddingLeft: '0.8rem', color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '700' }}>
        APICraft
      </h2>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            end={item.path === '/'}
            className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} 
          >
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} /> Settings
        </NavLink>
      </div>
    </aside>
  );
};
export default Sidebar;
