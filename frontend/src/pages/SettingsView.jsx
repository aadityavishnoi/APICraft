import { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { CopyButton } from '../components/CopyButton';
import { User, AlertTriangle, Moon, Monitor, Activity } from 'lucide-react';

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

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile data...');
      const { data } = await api.get('/auth/profile');
      console.log('Profile data received:', data);
      setProfileData({ name: data.name, email: data.email, password: '' });
      login(data, localStorage.getItem('token'));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
    } catch(err) {
      alert('Failed to delete account');
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');

  return (
    <div style={{ maxWidth: '800px', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Manage your profile and track your API usage.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Settings */}
        <GlassCard>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
            <User size={20} /> Personal Information
          </h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input required type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input required type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>New Password (leave blank to keep current)</label>
              <input type="password" placeholder="••••••••" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
            </div>
            
            {msg && <div style={{ color: msg.includes('failed') ? '#ff4d4f' : '#34d399', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>&gt; {msg}</div>}
            
            <button type="submit" disabled={loading} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
          </form>
        </GlassCard>

        {/* Usage & Limits */}
        <GlassCard>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>
            <Activity size={20} /> Usage & Limits
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Requests</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{user?.usageCount || 0}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Limit</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{user?.usageLimit || 1000}</div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Utilization</span>
              <span>{Math.round(((user?.usageCount || 0) / (user?.usageLimit || 1000)) * 100)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', 
                width: `${Math.min(100, Math.round(((user?.usageCount || 0) / (user?.usageLimit || 1000)) * 100))}%`,
                transition: 'width 1s ease-out'
              }}></div>
            </div>
          </div>
        </GlassCard>

        {/* System & Connection */}
        <GlassCard>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>
            <Monitor size={20} /> Connection Details
          </h2>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>API Base URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <code style={{ color: 'var(--accent-secondary)', fontSize: '0.9rem' }}>{baseUrl}</code>
              <CopyButton text={baseUrl} />
            </div>
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
