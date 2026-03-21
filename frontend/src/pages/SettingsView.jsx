import { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { CopyButton } from '../components/CopyButton';
import { User, AlertTriangle, Moon, Monitor } from 'lucide-react';

const SettingsView = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const payload = {};
      if (profileData.name !== user.name) payload.name = profileData.name;
      if (profileData.email !== user.email) payload.email = profileData.email;
      if (profileData.password) payload.password = profileData.password;
      
      if (Object.keys(payload).length === 0) {
        setLoading(false);
        return setMsg("No changes detected.");
      }
      
      const { data } = await api.put('/auth/profile', payload);
      setMsg(data.message);
      login({ ...user, name: profileData.name, email: profileData.email }, localStorage.getItem('token'));
      setProfileData({ ...profileData, password: '' });
    } catch(err) {
      setMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
    } catch(err) {
      alert('Failed to delete account');
    }
  };

  const baseUrl = `http://localhost:5500/api`;

  return (
    <div style={{ maxWidth: '800px', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>Engine Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>$ config --global user.core</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Settings */}
        <GlassCard>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            <User size={20} /> Identity Config
          </h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ SYS.NAME</label>
                <input required type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ SYS.EMAIL</label>
                <input required type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ NEW_KEY (Leave blank to keep active)</label>
              <input type="password" placeholder="••••••••" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
            </div>
            
            {msg && <div style={{ color: msg.includes('failed') ? '#ff4d4f' : '#34d399', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>&gt; {msg}</div>}
            
            <button type="submit" disabled={loading} className="btn-secondary" style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-mono)' }}>Compile Changes</button>
          </form>
        </GlassCard>

        {/* System Settings */}
        <GlassCard>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
            <Monitor size={20} /> Environment Variables
          </h2>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ROOT_API_URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <code style={{ color: 'var(--accent-secondary)', fontSize: '1rem' }}>{baseUrl}</code>
              <CopyButton text={baseUrl} />
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ENV_THEME (LOCKED)</label>
            <button className="btn-secondary" disabled style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'var(--glass-border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <Moon size={16} /> Dark Brutalism Core
            </button>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard style={{ border: '1px solid rgba(255, 77, 79, 0.3)', background: 'rgba(255, 77, 79, 0.02)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: '#ff4d4f' }}>
            <AlertTriangle size={20} /> Core Destruct
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Shutting down your core will permanently purge all schemas, keys, logs, and account identity.
          </p>
          <button className="btn-danger" onClick={() => setDeleteOpen(true)} style={{ background: 'rgba(255,77,79,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.3)', padding: '0.8rem 1.5rem', fontFamily: 'var(--font-mono)' }}>
            Initiate Overload Sequence
          </button>
        </GlassCard>

      </div>

      <ConfirmModal 
        isOpen={deleteOpen}
        title="SYSTEM PURGE PROTOCOL"
        text="CRITICAL WARNING: You are about to format your entire APICraft instance. All dynamic collections, stored logs, API tokens, and credentials will be irretrievably destroyed. Execute purge?"
        confirmText="Confirm Destruct()"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};
export default SettingsView;
