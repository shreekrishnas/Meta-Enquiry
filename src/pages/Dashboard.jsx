import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getConversationTrends } from '../services/analytics';
import { getConversations } from '../services/conversations';

const priorityStyles = {
  high: { background: '#FEF2F2', color: '#991B1B' },
  medium: { background: '#FFFBEB', color: '#92400E' },
  low: { background: '#F9FAFB', color: '#4B5563' },
};

const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#0EA5E9', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };

const statusDisplayNames = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Requested' };

export default function Dashboard() {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getDashboardStats(currentTenant.id),
      getConversationTrends(currentTenant.id, 7),
      getConversations(currentTenant.id, { limit: 5 }),
    ])
      .then(([dashStats, trends, convResult]) => {
        setStats(dashStats);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const areaData = Object.entries(trends)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({
            day: days[new Date(date).getDay()],
            conversations: count,
          }));
        setTrendData(areaData);
        setRecentConversations(convResult.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentTenant]);

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view the dashboard.</div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>;
  }

  const kpis = [
    { label: 'Total Conversations', value: (stats?.total || 0).toLocaleString(), meta: `${stats?.createdThisWeek || 0} this week`, accent: '#0EA5E9' },
    { label: 'Pending Reviews', value: String(stats?.byStatus?.WAITING_FOR_POC || 0), meta: `${stats?.byPriority?.high || 0} high priority`, accent: '#F59E0B' },
    { label: 'New Today', value: String(stats?.createdToday || 0), meta: 'Created today', accent: '#7C3AED' },
    { label: 'Resolved', value: String(stats?.byStatus?.RESOLVED || 0), meta: 'Total resolved', accent: '#10B981' },
  ];

  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({
    name: statusDisplayNames[name] || name,
    value,
    color: statusColors[name] || '#94A3B8',
  }));

  const pieData = statusData.length > 0 ? statusData : [{ name: 'No data', value: 1, color: '#E2E8F0' }];

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{currentTenant.name} workspace overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: '1rem', padding: '1rem 1.1rem', position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '4px 0 0 4px', background: kpi.accent }} />
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Fraunces', ui-serif, Georgia, serif", margin: '0.25rem 0' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.meta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="glass-card-static" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Daily Conversations</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData.length > 0 ? trendData : [{ day: 'No data', conversations: 0 }]}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="conversations" stroke="#0EA5E9" strokeWidth={2} fill="url(#convGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-static" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Status Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {statusData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card-static" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Conversations</div>
          <button className="btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => navigate('/conversations')}>View All</button>
        </div>
        <div>
          {recentConversations.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No conversations yet.</div>
          )}
          {recentConversations.map((conv) => (
            <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 0', borderBottom: '1px solid rgba(15,23,42,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[conv.status] || '#94A3B8', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{conv.customers?.name || conv.subject || 'Unknown'}</div>
              <span className="badge" style={{ fontSize: '0.68rem' }}>{conv.category || 'General'}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', ...(priorityStyles[conv.priority] || priorityStyles.low) }}>{conv.priority || 'low'}</span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 50, textAlign: 'right' }}>{timeAgo(conv.updated_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
