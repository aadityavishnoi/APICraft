import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const AuthView = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleFirebaseSuccess = async (userCredential) => {
    const token = await userCredential.user.getIdToken();
    const { data } = await api.post('/auth/firebase', {
      token,
      name: formData.name || userCredential.user.displayName
    });
    login(data.user, data.token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && formData.password !== formData.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        try {
           await handleFirebaseSuccess(userCredential);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to authenticate with backend.');
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        try {
           await handleFirebaseSuccess(userCredential);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to authenticate with backend.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleFirebaseSuccess(userCredential);
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minWidth: '1200px', 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '430px', 
        padding: '2.5rem',
        background: 'var(--bg-card)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            APICraft
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        <button 
          onClick={handleGoogleAuth} 
          disabled={loading}
          type="button"
          style={{
            width: '100%',
            padding: '0.8rem',
            background: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {mode === 'signup' && (
            <div>
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          )}
          <div>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@company.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
            </div>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label>Confirm Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={formData.confirm} 
                onChange={e => setFormData({...formData, confirm: e.target.value})} 
              />
            </div>
          )}

          {error && (
            <div style={{ 
              color: error.startsWith('success:') ? 'var(--success)' : 'var(--error)', 
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              textAlign: 'center'
            }}>
              {error.replace('success:', '')}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.8rem' }}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
