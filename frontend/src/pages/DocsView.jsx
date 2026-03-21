import { useState, useEffect } from 'react';
import api from '../api';
import { CopyButton } from '../components/CopyButton';
import { Book, Server, Terminal, Code, ChevronRight } from 'lucide-react';

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
      <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div className="spin"><Server size={18} /></div>
        <span>Indexing documentation...</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Reference and integration guides for your API collections.
        </p>
      </header>

      {error ? (
        <div className="card" style={{ border: '1px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem' }}>
          <div style={{ color: 'var(--error)' }}>{error}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {docs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <Terminal size={40} style={{ margin: '0 auto 1.5rem', color: 'var(--border)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No collections found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create a collection to automatically generate documentation.</p>
            </div>
          ) : (
            docs.map((doc, idx) => (
              <div key={idx} className="card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
                      <div style={{ color: 'var(--accent)' }}><Server size={22} /></div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>/{doc.collection}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {doc.fields.map((field, fIdx) => (
                        <span key={fIdx} className="mono" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Endpoints <ChevronRight size={14} />
                  </h3>
                  {Object.entries(doc.endpoints).map(([action, endpoint], eIdx) => {
                    const [method, path] = endpoint.split(' ');
                    const fullUrl = `${baseUrl}${path}`;

                    return (
                      <div key={eIdx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1 }}>
                          <span className={`badge ${
                            method === 'GET' ? 'badge-blue' : 
                            method === 'POST' ? 'badge-green' : 
                            method === 'PUT' ? 'badge-amber' : 
                            'badge-red'
                          }`} style={{ minWidth: '60px', textAlign: 'center' }}>
                            {method}
                          </span>
                          <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {path}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{action}</span>
                          <CopyButton text={fullUrl} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Code size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Example Request</span>
                  </div>
                  <div style={{ padding: '1.25rem', position: 'relative' }}>
                    <pre className="mono" style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      color: 'var(--text-primary)',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {`curl -X GET "${baseUrl}/${doc.collection}" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DocsView;
