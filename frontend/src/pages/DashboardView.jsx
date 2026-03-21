import { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Database, Key, Activity, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>{title}</div>
      <div style={{ color: color }}>{icon}</div>
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
      {value !== null ? value.toLocaleString() : '0'}
    </div>
  </div>
);

const DashboardView = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalCollections: null, totalCalls30d: null, activeKeys: null, failedCalls24h: null });
  const [logs, setLogs] = useState([]);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/logs/stats'),
        api.get('/api-logs?limit=10')
      ]);
      setStats(statsRes.data.stats);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here's what's happening with your API ecosystem today.
          </p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard title="Total Collections" value={stats.totalCollections} icon={<Database size={20} />} color="var(--blue)" />
        <StatCard title="API Calls (30d)" value={stats.totalCalls30d} icon={<Activity size={20} />} color="var(--success)" />
        <StatCard title="Active Keys" value={stats.activeKeys} icon={<Key size={20} />} color="var(--accent)" />
        <StatCard title="Failed Requests" value={stats.failedCalls24h} icon={<AlertTriangle size={20} />} color="var(--error)" />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Recent Activity</h3>
            <Link to="/logs" className="btn-ghost" style={{ fontSize: '0.85rem' }}>
              View all
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <span className={`badge ${
                        log.method === 'GET' ? 'badge-blue' : 
                        log.method === 'POST' ? 'badge-green' : 
                        log.method === 'PUT' ? 'badge-red' : 
                        'badge-red'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--text-secondary)' }}>
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
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
