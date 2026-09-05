import React from 'react';

const kpis = [
  { label: 'Active Tenants', value: '24', meta: '3 new this month', accent: '#0EA5E9' },
  { label: 'Total Conversations', value: '18,492', meta: 'Platform-wide', accent: '#7C3AED' },
  { label: 'Webhook Health', value: '99.7%', meta: 'Last 24h uptime', accent: '#10B981' },
  { label: 'AI Latency p95', value: '340ms', meta: 'Target: <500ms', accent: '#F59E0B' },
];

const tenants = [
  { name: 'Acme Corp', status: 'active', pages: 3, conversations: 1247, lastActive: '2m ago' },
  { name: 'TechStart Inc', status: 'active', pages: 2, conversations: 892, lastActive: '15m ago' },
  { name: 'Global Retail', status: 'active', pages: 5, conversations: 3421, lastActive: '1h ago' },
  { name: 'CloudBase', status: 'trial', pages: 1, conversations: 156, lastActive: '3h ago' },
  { name: 'ShopEasy', status: 'active', pages: 4, conversations: 2103, lastActive: '30m ago' },
  { name: 'DataFlow', status: 'suspended', pages: 0, conversations: 445, lastActive: '2 weeks ago' },
  { name: 'MediaHub', status: 'active', pages: 2, conversations: 678, lastActive: '45m ago' },
];

const statusBadge = {
  active: { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  trial: { background: 'rgba(245,158,11,0.12)', color: '#92400E' },
  suspended: { background: 'rgba(239,68,68,0.12)', color: '#991B1B' },
};

export default function SuperAdmin() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Super Admin</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Platform health & tenant management</p>
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

      <div className="glass-card-static" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Tenants</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tenant', 'Status', 'Pages', 'Conversations', 'Last Active'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.name} style={{ cursor: 'pointer' }}>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.name}</td>
                  <td style={{ padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                    <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...statusBadge[t.status] }}>{t.status}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.pages}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-primary)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.conversations.toLocaleString()}</td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
