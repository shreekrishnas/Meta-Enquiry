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

const tooltipStyle = { borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 12, boxShadow: 'var(--shadow-md)', background: 'var(--surface-card-elevated)' };

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
    { label: 'Total Cases', value: total.toLocaleString(), sub: 'All time', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, sub: `${resolved} resolved`, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)' },
    { label: 'AI Confidence', value: aiMetrics?.avgConfidence != null ? `${Math.round(aiMetrics.avgConfidence)}%` : '-', sub: `${aiMetrics?.total || 0} runs`, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
    { label: 'Acceptance Rate', value: aiMetrics?.acceptanceRate != null ? `${(aiMetrics.acceptanceRate * 100).toFixed(1)}%` : '-', sub: `Avg ${aiMetrics?.avgLatency != null ? Math.round(aiMetrics.avgLatency) + 'ms' : '-'}`, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Analytics</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Performance metrics and operational insights</p>
      </div>

      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem' }}>
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-color': k.gradient }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0 0.25rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Weekly Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData.length > 0 ? trendData : [{ week: '-', conversations: 0 }]}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="conversations" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 3.5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Category Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData.length > 0 ? categoryData : [{ category: '-', count: 0 }]}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card-static" style={{ padding: '1.5rem' }}>
        <div className="section-header">
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Performance</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Agent', 'Resolved', 'Avg Time', 'Total'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performers.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No team data yet.</td></tr>
              ) : performers.map((p) => (
                <tr key={p.user?.id || p.user?.email} className="table-row">
                  <td style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
                        {(p.user?.full_name || p.user?.email || '?')[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.user?.full_name || p.user?.email || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{p.resolved}</td>
                  <td style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{formatMs(p.avgResolveTimeMs)}</td>
                  <td style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
