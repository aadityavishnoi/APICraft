import { useState, useEffect } from 'react';
import api from '../api';
import { GlassCard } from '../components/GlassCard';
import { CopyButton } from '../components/CopyButton';
import { Book, Server, Terminal, Code } from 'lucide-react';

const DocsView = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocs = async () => {
    try {
      const { data } = await api.get('/api-docs');
      setDocs(data);
    } catch (err) {
      setError('Failed to fetch API documentation. Ensure cluster is active.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: 'var(--accent-primary)' }}>Loading documentation...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Book size={32} color="var(--accent-primary)" /> API Documentation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Available endpoints for your custom data collections.
        </p>
      </header>

      {error ? (
        <GlassCard style={{ borderColor: 'rgba(255, 77, 79, 0.3)', background: 'rgba(255, 77, 79, 0.05)' }}>
          <div style={{ color: '#ff4d4f' }}>Error: {error}</div>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {docs.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '4rem' }}>
              <Terminal size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <h3 style={{ color: 'var(--text-muted)' }}>No collections found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Create your first collection to see the documentation here.</p>
            </GlassCard>
          ) : (
            docs.map((doc, idx) => (
              <GlassCard key={idx} style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Server size={28} color="var(--accent-primary)" /> {doc.collection}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      {doc.fields.map((field, fIdx) => (
                        <span key={fIdx} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(doc.endpoints).map(([action, endpoint], eIdx) => {
                    const [method, path] = endpoint.split(' ');
                    const fullUrl = `${baseUrl}${path}`;

                    return (
                      <div key={eIdx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                          <span style={{
                            minWidth: '70px',
                            textAlign: 'center',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            background: method === 'GET' ? 'rgba(0, 212, 255, 0.1)' : method === 'POST' ? 'rgba(52, 211, 153, 0.1)' : method === 'PUT' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                            color: method === 'GET' ? '#00D4FF' : method === 'POST' ? '#34d399' : method === 'PUT' ? '#fbbf24' : '#ff4d4f',
                            border: `1px solid ${method === 'GET' ? 'rgba(0, 212, 255, 0.2)' : method === 'POST' ? 'rgba(52, 211, 153, 0.2)' : method === 'PUT' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 77, 79, 0.2)'}`
                          }}>
                            {method}
                          </span>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                            {path}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{action}</span>
                          <CopyButton text={fullUrl} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Code size={14} color="var(--accent-secondary)" /> Example CURL Command
                  </div>
                  <pre style={{
                    background: '#000',
                    padding: '1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    overflowX: 'auto',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {`curl -X GET "${baseUrl}/${doc.collection}" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DocsView;
