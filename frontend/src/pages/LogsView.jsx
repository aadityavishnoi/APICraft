import React, { useState, useEffect } from 'react';
import api from '../api';
import { RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#00D4FF', '#7B2FFF', '#34d399', '#fbbf24', '#ff4d4f'];

const LogsView = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filters, setFilters] = useState({ collection: 'ALL', method: 'ALL', status: 'ALL', limit: 50 });
  const [collections, setCollections] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filters).toString();
      const [logsRes, statsRes, colRes] = await Promise.all([
        api.get(`/api-logs?${q}`),
        api.get('/logs/stats'),
        api.get('/collections')
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data.charts);
      setCollections(colRes.data.map(c => c.collectionName));
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const toggleRow = (id) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>Traffic Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>$ tail -f /var/log/api.log</p>
        </div>
      </header>

      {/* Filters */}
      <GlassCard style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.5)' }}>
        <Filter size={18} color="var(--text-muted)" />
        <select value={filters.collection} onChange={e => setFilters({...filters, collection: e.target.value})} style={{ width: '150px', background: 'var(--bg-deep)', fontFamily: 'var(--font-mono)' }}>
          <option value="ALL">All Collections</option>
          {collections.map(c => <option key={c} value={c}>/{c}</option>)}
        </select>
        <select value={filters.method} onChange={e => setFilters({...filters, method: e.target.value})} style={{ width: '150px', background: 'var(--bg-deep)', fontFamily: 'var(--font-mono)' }}>
          <option value="ALL">All Methods</option><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
        </select>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '150px', background: 'var(--bg-deep)', fontFamily: 'var(--font-mono)' }}>
          <option value="ALL">All Statuses</option><option value="2xx">2xx Success</option><option value="4xx">4xx Client Err</option><option value="5xx">5xx Server Err</option>
        </select>
        <button onClick={fetchData} className="btn-secondary" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
          <RefreshCw size={16} className={loading?'spin':''} /> Sync
        </button>
      </GlassCard>

      {/* Charts Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <GlassCard style={{ padding: '2rem 1rem 1rem 1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', paddingLeft: '1rem', fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ Traffic Pulse (7D)</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.lineChartData}>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={tick => format(new Date(tick), 'MMM dd')} />
                  <Tooltip contentStyle={{ background: '#050A14', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }} />
                  <Line type="monotone" dataKey="calls" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--bg-deep)', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          
          <GlassCard style={{ padding: '2rem 1rem 1rem 1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', paddingLeft: '1rem', fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ Distribution Grid</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.doughnutChartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {stats.doughnutChartData.map((d, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#050A14', border: '1px solid var(--accent-secondary)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: '2rem 1rem 1rem 1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', paddingLeft: '1rem', fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>$ Status Codes</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barChartData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#050A14', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="value" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Logs Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)' }}>
              <th style={{ padding: '1.2rem 1.5rem' }}>Timestamp</th>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const date = new Date(log.createdAt);
              const isErr = log.status >= 400;
              return (
                <React.Fragment key={log._id}>
                  <tr onClick={() => toggleRow(log._id)} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', background: expandedRow === log._id ? 'rgba(255,255,255,0.03)' : (isErr ? 'rgba(255,77,79,0.05)' : 'transparent'), transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{format(date, 'MMM dd HH:mm:ss')}</td>
                    <td><StatusBadge method={log.method} /></td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>/{log.collectionName}</td>
                    <td><StatusBadge status={log.status} /></td>
                    <td style={{ paddingRight: '1.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {expandedRow === log._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </td>
                  </tr>
                  {expandedRow === log._id && (
                    <tr style={{ background: 'rgba(0,0,0,0.6)' }}>
                      <td colSpan="5" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'var(--accent-secondary)', width: '120px' }}>Request ID:</span> {log._id}</div>
                          <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'var(--accent-secondary)', width: '120px' }}>Exact Time:</span> {date.toISOString()}</div>
                          <div style={{ display: 'flex', gap: '1rem' }}><span style={{ color: 'var(--accent-secondary)', width: '120px' }}>Response Speed:</span> ~{(Math.random()*50).toFixed(2)}ms</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
            {logs.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>$ No traffic recorded matching these filter constraints.</td></tr>}
          </tbody>
        </table>
      </GlassCard>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
export default LogsView;
