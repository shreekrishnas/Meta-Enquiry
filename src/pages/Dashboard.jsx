import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getConversationTrends } from '../services/analytics';
import { getConversations } from '../services/conversations';

const priorityDot = { HIGH: '#EF4444', CRITICAL: '#DC2626', NORMAL: '#F59E0B', LOW: '#94A3B8', high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };
const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const statusNames = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Req.' };

const kpiIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="20" height="20"><circle cx="12" cy="12" r="10" strokeLinecap="round"/><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="20" height="20"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round"/><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
];

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
    { label: 'Total Conversations', value: total.toLocaleString(), sub: `${stats?.createdThisWeek || 0} this week`, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
    { label: 'Pending Reviews', value: String(stats?.byStatus?.WAITING_FOR_POC || 0), sub: `${stats?.byPriority?.HIGH || stats?.byPriority?.high || 0} high priority`, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { label: 'New Today', value: String(stats?.createdToday || 0), sub: 'Created today', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
    { label: 'Resolution Rate', value: `${rate}%`, sub: `${resolved} resolved`, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Dashboard</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{currentTenant.name} — real-time overview</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/conversations')} style={{ fontSize: '0.75rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          View All Conversations
        </button>
      </div>

      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
        {kpis.map((k, i) => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.gradient }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${k.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color }}>
                {kpiIcons[i]}
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.875rem' }}>
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Conversation Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData.length > 0 ? trendData : [{ day: '-', conversations: 0 }]}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 12, boxShadow: 'var(--shadow-md)', background: 'var(--surface-card-elevated)' }} />
              <Area type="monotone" dataKey="conversations" stroke="#6366F1" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#6366F1', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-static" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Status Breakdown</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 12, background: 'var(--surface-card-elevated)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {statusData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}40` }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card-static" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Conversations</span>
          </div>
          <button className="btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/conversations')}>View All →</button>
        </div>
        {recentConversations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No conversations yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {recentConversations.map((conv) => (
              <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} className="table-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.625rem', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: priorityDot[conv.priority] || '#94A3B8', flexShrink: 0, boxShadow: `0 0 6px ${(priorityDot[conv.priority] || '#94A3B8')}40` }} />
                <div style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.customers?.display_name || conv.subject || 'Unknown'}</div>
                <span className="badge">{conv.category || 'General'}</span>
                <span className="status-pill" style={{ background: `${statusColors[conv.status] || '#94A3B8'}14`, color: statusColors[conv.status] || '#94A3B8' }}>{statusNames[conv.status] || conv.status}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{timeAgo(conv.updated_at)}</div>
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
