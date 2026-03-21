import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { ArrowRight } from 'lucide-react';

const AuthView = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

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
        ? { name: formData.name, email: formData.email, password: formData.password } 
        : { email: formData.email, password: formData.password };
      
      const { data } = await api.post(endpoint, payload);
      
      if (mode === 'signup') {
        setMode('login');
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
      minWidth: '1200px', 
      minHeight: '100vh', 
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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            APICraft
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
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
              textAlign: 'center'
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
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} 
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
