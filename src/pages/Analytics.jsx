import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpis = [
  { label: 'Total Cases', value: '3,842', meta: 'All time', accent: '#0EA5E9' },
  { label: 'Resolution Rate', value: '94.2%', meta: '+2.1% this month', accent: '#10B981' },
  { label: 'Avg AI Confidence', value: '87%', meta: 'Last 30 days', accent: '#7C3AED' },
  { label: 'SLA Compliance', value: '96.8%', meta: 'Target: 95%', accent: '#F59E0B' },
];

const lineData = [
  { week: 'W1', conversations: 210 },
  { week: 'W2', conversations: 245 },
  { week: 'W3', conversations: 198 },
  { week: 'W4', conversations: 276 },
  { week: 'W5', conversations: 312 },
  { week: 'W6', conversations: 289 },
  { week: 'W7', conversations: 334 },
  { week: 'W8', conversations: 301 },
];

const categoryData = [
  { category: 'Billing', count: 142 },
  { category: 'Technical', count: 98 },
  { category: 'Returns', count: 87 },
  { category: 'Shipping', count: 64 },
  { category: 'General', count: 53 },
];

const performers = [
  { name: 'Alex M.', resolved: 89, avgTime: '8m', satisfaction: '4.8' },
  { name: 'Jamie L.', resolved: 76, avgTime: '11m', satisfaction: '4.7' },
  { name: 'Sam K.', resolved: 64, avgTime: '14m', satisfaction: '4.5' },
  { name: 'Taylor R.', resolved: 52, avgTime: '10m', satisfaction: '4.6' },
  { name: 'Jordan P.', resolved: 41, avgTime: '16m', satisfaction: '4.3' },
];

export default function Analytics() {
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
            <LineChart data={lineData}>
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
            <BarChart data={categoryData}>
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
                {['Agent', 'Resolved', 'Avg Time', 'Satisfaction'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {performers.map((p) => (
                <tr key={p.name}>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.name}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.resolved}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.avgTime}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{p.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
