import { useState, useEffect } from 'react';
import api from '../api';
import { GlassCard } from '../components/GlassCard';
import { StatusBadge } from '../components/StatusBadge';
import { Database, Key, Activity, AlertTriangle, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon, color }) => (
  <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
    <div style={{ padding: '1rem', background: `rgba(${color}, 0.1)`, borderRadius: '12px', color: `rgb(${color})`, border: `1px solid rgba(${color}, 0.2)` }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{value !== null ? value : '-'}</div>
    </div>
  </GlassCard>
);

const DashboardView = () => {
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

  const showQuickStart = stats.totalCollections === 0 || stats.activeKeys === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Console Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time metrics and system health.</p>
      </header>

      {/* Top Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="TOTAL COL." value={stats.totalCollections} icon={<Database size={24} />} color="0, 212, 255" />
        <StatCard title="CALLS (30D)" value={stats.totalCalls30d} icon={<Activity size={24} />} color="123, 47, 255" />
        <StatCard title="ACTIVE KEYS" value={stats.activeKeys} icon={<Key size={24} />} color="52, 211, 153" />
        <StatCard title="FAILED (24H)" value={stats.failedCalls24h} icon={<AlertTriangle size={24} />} color="255, 77, 79" />
      </div>

      {/* Quick Start Panel */}
      {showQuickStart && (
        <GlassCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
          <div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} /> Quick Start Guide
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Complete these steps to fully initialize your BaaS instance.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/collections" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ opacity: stats.totalCollections > 0 ? 0.3 : 1 }}>
                1. Create Collection {stats.totalCollections > 0 && '✓'}
              </button>
            </Link>
            <ArrowRight size={16} color="var(--text-muted)" />
            <Link to="/keys" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ opacity: stats.activeKeys > 0 ? 0.3 : 1 }}>
                2. Generate Key {stats.activeKeys > 0 && '✓'}
              </button>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Recent Activity Feed */}
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}>Live Activity Stream</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Analyze your API ecosystem and tracking metrics.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(52, 211, 153, 0.05)', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <div className="pulse" style={{ width: '8px', height: '8px', background: '#34d399', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold' }}>LIVE UPDATES</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {logs.map(log => (
            <div key={log._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <StatusBadge method={log.method} />
                <div style={{ fontFamily: 'var(--font-mono)' }}>/{log.collectionName}</div>
                <StatusBadge status={log.status} />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))}
          {logs.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)' }}>$ No recent logs found.</p>}
        </div>
      </GlassCard>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; box-shadow: 0 0 10px var(--accent-secondary); }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
export default DashboardView;
