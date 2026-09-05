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
        const entries = Object.entries(trends).sort(([a], [b]) => a.localeCompare(b));
        entries.forEach(([date, count]) => {
          const d = new Date(date);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          const key = weekStart.toISOString().slice(0, 10);
          weeks[key] = (weeks[key] || 0) + count;
        });
        const weekEntries = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b));
        setTrendData(weekEntries.map(([, count], i) => ({ week: `W${i + 1}`, conversations: count })));

        setCategoryData(Object.entries(catDist).map(([category, count]) => ({ category, count })));
        setPerformers(team || []);
        setAiMetrics(ai);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentTenant]);

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view analytics.</div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>;
  }

  const resolved = stats?.byStatus?.RESOLVED || 0;
  const total = stats?.total || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Cases', value: (total).toLocaleString(), meta: 'All time', accent: '#0EA5E9' },
    { label: 'Resolution Rate', value: `${resolutionRate}%`, meta: `${resolved} resolved`, accent: '#10B981' },
    { label: 'Avg AI Confidence', value: aiMetrics?.avgConfidence != null ? `${Math.round(aiMetrics.avgConfidence)}%` : '-', meta: `${aiMetrics?.total || 0} AI runs`, accent: '#7C3AED' },
    { label: 'AI Acceptance Rate', value: aiMetrics?.acceptanceRate != null ? `${(aiMetrics.acceptanceRate * 100).toFixed(1)}%` : '-', meta: `Avg latency: ${aiMetrics?.avgLatency != null ? Math.round(aiMetrics.avgLatency) + 'ms' : '-'}`, accent: '#F59E0B' },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Analytics</h1>

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
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Conversations Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData.length > 0 ? trendData : [{ week: '-', conversations: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="conversations" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-static" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Categories Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData.length > 0 ? categoryData : [{ category: '-', count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card-static" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Top Performers</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Agent', 'Resolved', 'Avg Time', 'Total'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performers.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No team data yet.</td></tr>
              )}
              {performers.map((p) => (
                <tr key={p.user?.id || p.user?.email}>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.user?.name || p.user?.email || 'Unknown'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.resolved}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{formatMs(p.avgResolveTimeMs)}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
