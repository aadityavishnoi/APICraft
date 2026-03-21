import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { ArrowRight, Globe } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const AuthView = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const { login } = useContext(AuthContext);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { idToken: credentialResponse.credential });
      
      if (data.new_user) {
        // User doesn't exist, prompt for name and password
        setMode('signup');
        setFormData({ ...formData, email: data.email, name: data.name || '' });
        setGoogleData({ googleId: data.googleId });
        setError('success:Google account verified. Please set a name and password to complete your registration.');
      } else {
        // Existing user, log in
        login(data.user, data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && formData.password !== formData.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const payload = mode === 'signup' 
        ? { name: formData.name, email: formData.email, password: formData.password, googleId: googleData?.googleId } 
        : { email: formData.email, password: formData.password };
      
      const { data } = await api.post(endpoint, payload);
      
      if (mode === 'signup') {
        setMode('login');
        setGoogleData(null);
        setError('success:Account created! You can now sign in.');
      } else {
        login(data.user, data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: '100vw', 
      height: '100vh', 
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem',
        background: 'var(--bg-card)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            APICraft
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Google Sign In */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-in failed')}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text={mode === 'login' ? 'signin_with' : 'signup_with'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
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
              readOnly={!!googleData}
              placeholder="name@company.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              style={googleData ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              {mode === 'login' && (
                <button type="button" className="btn-ghost" style={{ fontSize: '0.75rem', padding: 0 }}>
                  Forgot password?
                </button>
              )}
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
              textAlign: 'center',
              padding: '0.5rem',
              background: error.startsWith('success:') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-sm)'
            }}>
              {error.replace('success:', '')}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.8rem' }}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            type="button" 
            className="btn-ghost"
            onClick={() => { 
              setMode(mode === 'login' ? 'signup' : 'login'); 
              setError(''); 
              if (mode === 'signup') setGoogleData(null);
            }} 
            style={{ fontSize: '0.85rem' }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
