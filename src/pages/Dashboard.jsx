import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const kpis = [
  { label: 'Total Conversations', value: '1,247', meta: '+12% from last week', accent: '#0EA5E9' },
  { label: 'Pending Reviews', value: '23', meta: '5 urgent', accent: '#F59E0B' },
  { label: 'AI Draft Rate', value: '78%', meta: 'Target: 85%', accent: '#7C3AED' },
  { label: 'Avg Response Time', value: '12m', meta: '-3m from last week', accent: '#10B981' },
];

const areaData = [
  { day: 'Mon', conversations: 142 },
  { day: 'Tue', conversations: 187 },
  { day: 'Wed', conversations: 164 },
  { day: 'Thu', conversations: 209 },
  { day: 'Fri', conversations: 195 },
  { day: 'Sat', conversations: 112 },
  { day: 'Sun', conversations: 98 },
];

const statusData = [
  { name: 'New', value: 34, color: '#94A3B8' },
  { name: 'In Progress', value: 45, color: '#0EA5E9' },
  { name: 'Under Review', value: 12, color: '#8B5CF6' },
  { name: 'Resolved', value: 67, color: '#10B981' },
];

const recentConversations = [
  { id: 1, customer: 'Sarah Chen', category: 'Billing', priority: 'high', status: 'new', assignedTo: 'Alex M.', time: '5m ago' },
  { id: 2, customer: 'Marcus Johnson', category: 'Technical', priority: 'medium', status: 'in_progress', assignedTo: 'Jamie L.', time: '12m ago' },
  { id: 3, customer: 'Priya Patel', category: 'General', priority: 'low', status: 'resolved', assignedTo: 'Sam K.', time: '24m ago' },
  { id: 4, customer: 'David Kim', category: 'Returns', priority: 'high', status: 'under_review', assignedTo: 'Alex M.', time: '1h ago' },
  { id: 5, customer: 'Emma Wilson', category: 'Shipping', priority: 'medium', status: 'in_progress', assignedTo: 'Jamie L.', time: '2h ago' },
];

const priorityStyles = {
  high: { background: '#FEF2F2', color: '#991B1B' },
  medium: { background: '#FFFBEB', color: '#92400E' },
  low: { background: '#F9FAFB', color: '#4B5563' },
};

const statusColors = { new: '#94A3B8', in_progress: '#0EA5E9', under_review: '#8B5CF6', resolved: '#10B981' };

export default function Dashboard() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Acme Corp workspace overview</p>
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
            <AreaChart data={areaData}>
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
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {statusData.map((entry) => (
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
          <button className="btn-ghost" style={{ fontSize: '0.78rem' }}>View All</button>
        </div>
        <div>
          {recentConversations.map((conv) => (
            <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem 0', borderBottom: '1px solid rgba(15,23,42,0.04)', cursor: 'pointer' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[conv.status], flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{conv.customer}</div>
              <span className="badge" style={{ fontSize: '0.68rem' }}>{conv.category}</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px', ...priorityStyles[conv.priority] }}>{conv.priority}</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 60 }}>{conv.assignedTo}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 50, textAlign: 'right' }}>{conv.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
