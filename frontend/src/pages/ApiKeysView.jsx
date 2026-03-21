import { useState, useEffect } from 'react';
import api from '../api';
import { Key, Plus, Trash2, PowerOff, ShieldCheck, ShieldAlert } from 'lucide-react';
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
      setGeneratedKey({ name: newKeyName || 'Default Key', apiKey: data.apiKey });
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
    if (!keyString) return 'sk_••••••••••••';
    // If it's the full key showing in the modal, we show it all. 
    // If it's the ID/Masked version in the list:
    return `sk_••••••••${keyString.slice(-4)}`;
  };

  if (!loading && keys.length === 0 && !modalOpen) {
    return (
      <EmptyState 
        title="No API keys" 
        description="Create an API key to start making authenticated requests to your collections."
        action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Create API key</button>}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>API Keys</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage secret keys to authenticate your API requests.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Create API key
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {keys.map(k => (
          <div key={k.id} className="card" style={{ padding: '1.5rem', opacity: k.revoked ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ padding: '0.5rem', background: k.revoked ? 'var(--bg-secondary)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: k.revoked ? 'var(--text-muted)' : 'var(--blue)' }}>
                  <Key size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{k.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {new Date(k.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {k.revoked ? (
                  <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Revoked</span>
                ) : (
                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Active</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <code className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {maskKey(k.id)}
              </code>
              <CopyButton text={k.id} className="btn-ghost" style={{ padding: '0.4rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', padding: '0.5rem 0' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Usage</label>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{k.requestCount.toLocaleString()} <span style={{ fontWeight: '400', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>calls</span></div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Last used</label>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {k.lastUsed ? formatDistanceToNow(new Date(k.lastUsed), { addSuffix: true }) : 'Never used'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => handleToggleRevoke(k.id, k.revoked)} 
                className="btn-secondary" 
                style={{ flex: 1, fontSize: '0.85rem' }}
              >
                {k.revoked ? 'Restore' : 'Revoke'}
              </button>
              <button 
                onClick={() => setDeleteTarget(k)} 
                className="btn-ghost" 
                style={{ color: 'var(--error)', padding: '0.5rem' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '440px', padding: '2rem' }}>
            {!generatedKey ? (
              <>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Create API Key</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Enter a name for your key to help you identify it later.
                </p>
                <form onSubmit={handleGenerate}>
                  <label>Key Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Production App" 
                    autoFocus 
                    required 
                    value={newKeyName} 
                    onChange={e => setNewKeyName(e.target.value)} 
                    style={{ marginBottom: '2rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                    <button type="button" className="btn-secondary" onClick={closeGenModal}>Cancel</button>
                    <button type="submit" className="btn-primary">Generate Key</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--success)', marginBottom: '1rem' }}>
                  <ShieldCheck size={24} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Key Generated</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Copy this key and save it somewhere safe. For security reasons, <strong>you won't be able to see it again.</strong>
                </p>
                <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--success)', padding: '1.2rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontSize: '1.1rem', fontWeight: '600' }}>
                    {generatedKey.apiKey}
                  </code>
                  <CopyButton text={generatedKey.apiKey} className="btn-primary" style={{ padding: '0.5rem' }} />
                </div>
                <button className="btn-primary" onClick={closeGenModal} style={{ width: '100%' }}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title="Delete API Key"
        text={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and will immediately break any application using this key.`}
        confirmText="Delete Key"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ApiKeysView;
