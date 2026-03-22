import { useState, useContext, useEffect } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { CopyButton } from '../components/CopyButton';
import { User, ShieldAlert, Activity, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

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
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (profileData.name !== user.name) {
          await updateProfile(currentUser, { displayName: profileData.name });
        }
        if (profileData.email !== user.email) {
          await updateEmail(currentUser, profileData.email);
        }
        if (profileData.password) {
          await updatePassword(currentUser, profileData.password);
        }
      }

      const payload = {};
      if (profileData.name !== user.name) payload.name = profileData.name;
      if (profileData.email !== user.email) payload.email = profileData.email;
      
      if (Object.keys(payload).length > 0) {
        const { data } = await api.put('/auth/profile', payload);
        setMsg(data.message);
      } else if (profileData.password) {
        setMsg("Password updated successfully");
      } else {
        setLoading(false);
        return setMsg("No changes detected.");
      }
      
      login({ ...user, name: profileData.name, email: profileData.email }, localStorage.getItem('token'));
      setProfileData({ ...profileData, password: '' });
    } catch(err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setMsg('For security, please log out and log back in to update settings.');
      } else {
        setMsg(err.message?.replace('Firebase: ', '') || err.response?.data?.message || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
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
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your account preferences and API environment.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Profile Settings */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--blue)' }}><User size={20} /></div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Profile Information</h2>
          </div>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label>Full Name</label>
                <input required type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div>
                <label>Email Address</label>
                <input required type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label>New Password</label>
              <input type="password" placeholder="Leave blank to keep current" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
            </div>
            
            {msg && (
              <div style={{ 
                padding: '0.8rem', 
                borderRadius: '6px', 
                fontSize: '0.9rem',
                background: msg.includes('failed') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                color: msg.includes('failed') ? 'var(--error)' : 'var(--success)',
                border: `1px solid ${msg.includes('failed') ? 'var(--error)' : 'var(--success)'}22`
              }}>
                {msg}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Usage & Limits */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--success)' }}><Activity size={20} /></div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Usage & Limits</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.2rem', background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Monthly Requests</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{user?.usageCount?.toLocaleString() || '0'}</div>
            </div>
            <div className="card" style={{ padding: '1.2rem', background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Quota Limit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{user?.usageLimit?.toLocaleString() || '0'}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Utilization</span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.usageCount !== undefined && user?.usageLimit !== undefined ? Math.round((user.usageCount / user.usageLimit) * 100) : '0'}%
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                background: 'var(--accent)', 
                width: `${user?.usageCount !== undefined && user?.usageLimit !== undefined ? Math.min(100, Math.round((user.usageCount / user.usageLimit) * 100)) : 0}%`,
                transition: 'width 0.6s ease-out'
              }}></div>
            </div>
          </div>
        </div>

        {/* Webhook & Connection */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
            <div style={{ color: 'var(--text-secondary)' }}><Globe size={20} /></div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Environment</h2>
          </div>
          <div>
            <label>API Base URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <code className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{baseUrl}</code>
              <CopyButton text={baseUrl} />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--error)' }}><ShieldAlert size={20} /></div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--error)' }}>Danger Zone</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Deleting your account will permanently remove all your collections, API keys, and logs. This action cannot be undone.
          </p>
          <button className="btn-danger" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </button>
        </div>

      </div>

      <ConfirmModal 
        isOpen={deleteOpen}
        title="Delete Account"
        text="Are you sure you want to delete your account? All your data will be permanently erased. This action is irreversible."
        confirmText="Yes, delete my account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default SettingsView;
