import React, { useState, useEffect } from 'react';
import api from '../api';
import { RefreshCw, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filters, setFilters] = useState({ collection: 'ALL', method: 'ALL', status: 'ALL', limit: 50 });
  const [collections, setCollections] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filters).toString();
      const [logsRes, colRes] = await Promise.all([
        api.get(`/api-logs?${q}`),
        api.get('/collections')
      ]);
      setLogs(logsRes.data);
      setCollections(colRes.data.map(c => c.collectionName));
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>Activity Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Monitor and debug API requests in real-time.
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </header>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
          <Filter size={16} />
          <span>Filters</span>
        </div>
        
        <select 
          value={filters.collection} 
          onChange={e => setFilters({...filters, collection: e.target.value})} 
          style={{ width: '160px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
        >
          <option value="ALL">All Collections</option>
          {collections.map(c => <option key={c} value={c}>/{c}</option>)}
        </select>

        <select 
          value={filters.method} 
          onChange={e => setFilters({...filters, method: e.target.value})} 
          style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
        >
          <option value="ALL">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select 
          value={filters.status} 
          onChange={e => setFilters({...filters, status: e.target.value})} 
          style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="2xx">2xx Success</option>
          <option value="4xx">4xx Client Error</option>
          <option value="5xx">5xx Server Error</option>
        </select>

        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Showing last {logs.length} requests
        </div>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Timestamp</th>
              <th style={{ width: '100px' }}>Method</th>
              <th>Endpoint</th>
              <th style={{ width: '120px' }}>Status</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const date = new Date(log.createdAt);
              const isExpanded = expandedRow === log._id;
              return (
                <React.Fragment key={log._id}>
                  <tr 
                    onClick={() => toggleRow(log._id)} 
                    style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-secondary)' : 'transparent' }}
                  >
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {format(date, 'MMM dd, HH:mm:ss')}
                    </td>
                    <td>
                      <span className={`badge ${
                        log.method === 'GET' ? 'badge-blue' : 
                        log.method === 'POST' ? 'badge-green' : 
                        log.method === 'PUT' ? 'badge-amber' : 
                        'badge-red'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="mono" style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      /{log.collectionName}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: log.status < 400 ? 'var(--success)' : log.status < 500 ? '#f59e0b' : 'var(--error)' 
                        }}></div>
                        <span>{log.status}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: 'var(--bg-primary)' }}>
                      <td colSpan="5" style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderLeft: '2px solid var(--accent)', margin: '1rem' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>Request Details</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Request ID:</span> {log._id}</div>
                              <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>User Agent:</span> {log.userAgent || 'Unknown'}</div>
                              <div><span style={{ color: 'var(--text-muted)' }}>Client IP:</span> {log.ip || '127.0.0.1'}</div>
                            </div>
                            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Timestamp:</span> {date.toISOString()}</div>
                              <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>API Key Ref:</span> {log.apiKeyId || 'None'}</div>
                              <div><span style={{ color: 'var(--text-muted)' }}>Response:</span> {log.status < 400 ? 'Success' : 'Error'}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  No logs found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LogsView;
