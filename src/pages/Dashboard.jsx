import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getConversationTrends } from '../services/analytics';
import { getConversations } from '../services/conversations';

const priorityDot = { HIGH: '#EF4444', CRITICAL: '#DC2626', NORMAL: '#F59E0B', LOW: '#94A3B8', high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };
const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const statusNames = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Req.' };

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
      getConversations(currentTenant.id, { limit: 6 }),
    ])
      .then(([dashStats, trends, convResult]) => {
        setStats(dashStats);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        setTrendData(
          Object.entries(trends)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ day: days[new Date(date).getDay()], conversations: count }))
        );
        setRecentConversations(convResult.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentTenant]);

  if (!currentTenant) return <EmptyState text="Select a workspace to view the dashboard." />;
  if (loading) return <EmptyState text="Loading..." />;
  if (error) return <ErrorState text={error} />;

  const resolved = stats?.byStatus?.RESOLVED || 0;
  const total = stats?.total || 0;
  const rate = total > 0 ? ((resolved / total) * 100).toFixed(0) : '0';

  const kpis = [
    { label: 'Total Conversations', value: total.toLocaleString(), sub: `${stats?.createdThisWeek || 0} this week`, color: '#3B82F6' },
    { label: 'Pending Reviews', value: String(stats?.byStatus?.WAITING_FOR_POC || 0), sub: `${stats?.byPriority?.HIGH || stats?.byPriority?.high || 0} high priority`, color: '#F59E0B' },
    { label: 'New Today', value: String(stats?.createdToday || 0), sub: 'Created today', color: '#8B5CF6' },
    { label: 'Resolution Rate', value: `${rate}%`, sub: `${resolved} resolved`, color: '#10B981' },
  ];

  const statusData = Object.entries(stats?.byStatus || {}).map(([name, value]) => ({
    name: statusNames[name] || name, value, color: statusColors[name] || '#94A3B8',
  }));
  const pieData = statusData.length > 0 ? statusData : [{ name: 'No data', value: 1, color: '#E2E8F0' }];

  const timeAgo = (d) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>{currentTenant.name} overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.125rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: k.color }} />
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0.125rem', lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Daily Conversations</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData.length > 0 ? trendData : [{ day: '-', conversations: 0 }]}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 12, boxShadow: 'var(--shadow-md)' }} />
              <Area type="monotone" dataKey="conversations" stroke="#6366F1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Status Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2} strokeWidth={0}>
                {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {statusData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Conversations</div>
          <button className="btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/conversations')}>View All</button>
        </div>
        {recentConversations.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No conversations yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentConversations.map((conv) => (
              <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} className="table-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.5rem', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityDot[conv.priority] || '#94A3B8', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.customers?.display_name || conv.subject || 'Unknown'}</div>
                <span className="badge">{conv.category || 'General'}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.375rem', borderRadius: 9999, background: statusColors[conv.status] ? `${statusColors[conv.status]}18` : '#94A3B818', color: statusColors[conv.status] || '#94A3B8' }}>{statusNames[conv.status] || conv.status}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 28, textAlign: 'right' }}>{timeAgo(conv.updated_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{text}</div>;
}

function ErrorState({ text }) {
  return <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{text}</div>;
}
