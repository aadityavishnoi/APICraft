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
        setError('success:Account created! System ready for login.');
      } else {
        login(data.user, data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication sequence failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: 'var(--bg-deep)' }}>
      {/* Left Animated Panel */}
      <div className="auth-left" style={{ flex: 1, borderRight: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', padding: '4rem', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at center, rgba(123, 47, 255, 0.05) 0%, transparent 60%)' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--text-main)', zIndex: 10 }}>
          <span style={{ color: 'var(--accent-primary)' }}>API</span>Craft<span style={{ color: 'var(--accent-secondary)' }}>_</span>
        </h1>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '400px', lineHeight: 1.6, zIndex: 10 }}>
          The brutalist Backend-as-a-Service. Visually design collections and deploy production-ready REST APIs in milliseconds.
        </p>

        {/* Floating Cards */}
        <div style={{ position: 'absolute', top: '40%', left: '10%', animation: 'float 12s infinite ease-in-out', zIndex: 1 }}>
          <div className="glass-card" style={{ padding: '1rem 2rem', borderLeft: '3px solid var(--accent-primary)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>GET /api/products</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{`{ "status": 200, "data": [...] }`}</div>
          </div>
        </div>
        
        <div style={{ position: 'absolute', top: '60%', left: '30%', animation: 'float 15s infinite ease-in-out reverse', zIndex: 1 }}>
          <div className="glass-card" style={{ padding: '1rem 2rem', borderLeft: '3px solid #34d399' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 'bold' }}>POST /api/users</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{`{ "message": "created" }`}</div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right" style={{ flex: '0 0 500px', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{mode === 'login' ? 'System Login' : 'Initialize Account'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          {mode === 'login' ? 'Enter credentials to access the console.' : 'Deploy your first cluster today.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', fontFamily: 'var(--font-mono)' }}>$ SYS.USER_NAME</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', fontFamily: 'var(--font-mono)' }}>$ SYS.USER_EMAIL</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', fontFamily: 'var(--font-mono)' }}>$ SYS.AUTH_TOKEN</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block', fontFamily: 'var(--font-mono)' }}>$ SYS.AUTH_VERIFY</label>
              <input type="password" required value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} />
            </div>
          )}

          {error && (
            <div className="error-shake" style={{ color: error.startsWith('success:') ? '#34d399' : '#ff4d4f' }}>
              &gt; {error.replace('success:', '')}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', width: '100%', justifyContent: 'space-between' }}>
            {loading ? 'Executing...' : (mode === 'login' ? 'Authenticate' : 'Compile User')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', padding: 0 }}>
            {mode === 'login' ? "Don't have an account? Init one." : "Already compiled? Authenticate."}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-30px) rotate(2deg); }
        }
        @media (max-width: 900px) {
          .auth-left { display: none !important; }
          .auth-right { flex: 1 !important; }
        }
      `}</style>
    </div>
  );
};
export default AuthView;
