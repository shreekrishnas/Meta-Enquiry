import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getConversationTrends, getCategoryDistribution, getTeamPerformance, getAIMetrics } from '../services/analytics';

function formatMs(ms) {
  if (ms == null) return '-';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' };
const sectionTitle = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' };
const tooltipStyle = { borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: 12, boxShadow: 'var(--shadow-md)' };

export default function Analytics() {
  const { currentTenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [aiMetrics, setAiMetrics] = useState(null);

  useEffect(() => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboardStats(currentTenant.id),
      getConversationTrends(currentTenant.id, 56),
      getCategoryDistribution(currentTenant.id),
      getTeamPerformance(currentTenant.id),
      getAIMetrics(currentTenant.id),
    ])
      .then(([dashStats, trends, catDist, team, ai]) => {
        setStats(dashStats);
        const weeks = {};
        Object.entries(trends).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, count]) => {
          const d = new Date(date);
          const ws = new Date(d); ws.setDate(d.getDate() - d.getDay());
          const key = ws.toISOString().slice(0, 10);
          weeks[key] = (weeks[key] || 0) + count;
        });
        setTrendData(Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).map(([, count], i) => ({ week: `W${i + 1}`, conversations: count })));
        setCategoryData(Object.entries(catDist).map(([category, count]) => ({ category, count })));
        setPerformers(team || []);
        setAiMetrics(ai);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentTenant]);

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>;
  if (error) return <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>;

  const resolved = stats?.byStatus?.RESOLVED || 0;
  const total = stats?.total || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Cases', value: total.toLocaleString(), sub: 'All time', color: '#3B82F6' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, sub: `${resolved} resolved`, color: '#10B981' },
    { label: 'AI Confidence', value: aiMetrics?.avgConfidence != null ? `${Math.round(aiMetrics.avgConfidence)}%` : '-', sub: `${aiMetrics?.total || 0} runs`, color: '#8B5CF6' },
    { label: 'Acceptance Rate', value: aiMetrics?.acceptanceRate != null ? `${(aiMetrics.acceptanceRate * 100).toFixed(1)}%` : '-', sub: `Avg ${aiMetrics?.avgLatency != null ? Math.round(aiMetrics.avgLatency) + 'ms' : '-'}`, color: '#F59E0B' },
  ];

  const th = { textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' };
  const td = { fontSize: '0.8125rem', color: 'var(--text-primary)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>Performance metrics and trends</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, padding: '1rem 1.125rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: k.color }} />
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0.125rem', lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={card}>
          <div style={sectionTitle}>Weekly Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData.length > 0 ? trendData : [{ week: '-', conversations: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="conversations" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <div style={sectionTitle}>Category Breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData.length > 0 ? categoryData : [{ category: '-', count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>Team Performance</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Agent', 'Resolved', 'Avg Time', 'Total'].map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {performers.length === 0 ? (
                <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>No team data yet.</td></tr>
              ) : performers.map((p) => (
                <tr key={p.user?.id || p.user?.email} className="table-row">
                  <td style={{ ...td, fontWeight: 500 }}>{p.user?.full_name || p.user?.email || 'Unknown'}</td>
                  <td style={td}>{p.resolved}</td>
                  <td style={{ ...td, color: 'var(--text-muted)' }}>{formatMs(p.avgResolveTimeMs)}</td>
                  <td style={td}>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
