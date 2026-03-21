import { useState, useEffect } from 'react';
import api from '../api';
import { Key, Plus, Trash2, PowerOff, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';
import { formatDistanceToNow } from 'date-fns';

const ApiKeysView = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});

  const fetchKeys = async () => {
    try {
      const { data } = await api.get('/keys');
      setKeys(data);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };
  
  useEffect(() => { fetchKeys(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/keys', { name: newKeyName });
      setGeneratedKey({ name: newKeyName || 'Default', apiKey: data.apiKey });
      setNewKeyName('');
      fetchKeys();
    } catch(err) { alert(err.response?.data?.message || 'Failed to generate key'); }
  };

  const closeGenModal = () => {
    setModalOpen(false);
    setGeneratedKey(null);
  };

  const handleToggleRevoke = async (id, currentStatus) => {
    try {
      await api.put(`/keys/${id}`, { revoked: !currentStatus });
      fetchKeys();
    } catch(err) { alert('Operation failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/keys/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchKeys();
    } catch(err) { alert('Deletion failed'); }
  };

  const maskKey = (keyString) => {
    if (!keyString) return 'sk_live_••••••••••••';
    return `sk_live_••••••••••••${keyString.slice(-4)}`;
  };

  if (!loading && keys.length === 0 && !modalOpen) {
    return (
      <EmptyState 
        title="No API Keys Active" 
        description="Generate an encrypted key to authenticate your cross-origin REST requests against your Data Collections."
        action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={18} /> Initialize Key</button>}
      />
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>Access Cryptography</h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>$ monitor /keys --all</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={18} /> Generate Kernel Key</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {keys.map(k => (
          <GlassCard key={k.id} style={{ display: 'flex', flexDirection: 'column', opacity: k.revoked ? 0.6 : 1, position: 'relative', overflow: 'hidden' }}>
            {k.revoked && <div style={{ position: 'absolute', top: 18, right: -35, background: '#ff4d4f', color: '#000', fontSize: '0.7rem', padding: '0.2rem 3rem', transform: 'rotate(45deg)', fontWeight: 'bold', zIndex: 10, fontFamily: 'var(--font-mono)' }}>REVOKED</div>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--font-sans)', fontSize: '1.4rem' }}>
                  <Key size={20} color={k.revoked ? 'var(--text-muted)' : 'var(--accent-primary)'}/> {k.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  INIT: {new Date(k.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: k.revoked ? 'var(--text-muted)' : 'var(--accent-secondary)', textDecoration: k.revoked ? 'line-through' : 'none', letterSpacing: '1px' }}>
                {visibleKeys[k.id] ? k.id : maskKey(k.id)}
              </span>
              <button className="btn-icon" onClick={() => setVisibleKeys({...visibleKeys, [k.id]: !visibleKeys[k.id]})} title="Toggle Visibility ID" style={{ color: 'var(--text-muted)' }}>
                {visibleKeys[k.id] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', fontFamily: 'var(--font-mono)' }}>
              <div><strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{k.requestCount}</strong> hits</div>
              <div>Last ping {k.lastUsed ? formatDistanceToNow(new Date(k.lastUsed), { addSuffix: true }) : 'NEVER'}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => handleToggleRevoke(k.id, k.revoked)} className="btn-secondary" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>
                <PowerOff size={16} /> {k.revoked ? 'Restore_Access' : 'Revoke_Access'}
              </button>
              <button onClick={() => setDeleteTarget(k)} className="btn-secondary" style={{ color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.3)', background: 'rgba(255,77,79,0.05)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card" style={{ width: '500px', background: 'var(--bg-deep)', border: '1px solid var(--accent-primary)', boxShadow: '0 0 50px rgba(0, 212, 255, 0.15)' }}>
            {!generatedKey ? (
              <>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-sans)', fontSize: '1.5rem' }}>Initialize Crypto Token</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>Provide an identifier metadata tag to monitor this specific token track inside the logs.</p>
                <form onSubmit={handleGenerate}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>$ SYS.TOKEN_ID</label>
                  <input type="text" placeholder="e.g. Server A" autoFocus required value={newKeyName} onChange={e => setNewKeyName(e.target.value)} style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }} />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn-outline" onClick={closeGenModal} style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }}>Abort</button>
                    <button type="submit" className="btn-primary">Compile Token</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: '0.5rem', color: '#34d399', fontSize: '1.5rem' }}>Token Deployed Successfully</h3>
                <p style={{ color: '#ff4d4f', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 'bold' }}>CRITICAL_WARN: This token will NEVER be retrievable again. Clone it to local env immediately.</p>
                <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px dashed #34d399', padding: '1.5rem', borderRadius: '8px', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ color: '#34d399', wordBreak: 'break-all', fontSize: '1.2rem', fontWeight: 'bold' }}>{generatedKey.apiKey}</code>
                  <CopyButton text={generatedKey.apiKey} style={{ background: '#34d399', color: '#000', padding: '0.6rem', border: 'none' }} className="" />
                </div>
                <button className="btn-secondary" onClick={closeGenModal} style={{ width: '100%', padding: '1rem', fontFamily: 'var(--font-mono)' }}>Confirm Internal Storage Secured</button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title={`DELETE /keys/${deleteTarget?.name}`}
        text="This key will be permanently purged from the cryptographic store. Any external applications relying on it will instantly throw 403 Forbidden exceptions."
        confirmText="Confirm Purge"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default ApiKeysView;
