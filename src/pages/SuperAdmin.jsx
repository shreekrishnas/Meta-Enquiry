import React, { useState, useEffect } from 'react';
import { getTenants, createTenant } from '../services/tenants';

const statusBadge = {
  active: { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  ACTIVE: { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  trial: { background: 'rgba(245,158,11,0.12)', color: '#92400E' },
  TRIAL: { background: 'rgba(245,158,11,0.12)', color: '#92400E' },
  suspended: { background: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  SUSPENDED: { background: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  DELETED: { background: 'rgba(148,163,184,0.12)', color: '#64748B' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SuperAdmin() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTenants();
      setTenants(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      await createTenant({ name: newName.trim(), slug: newSlug.trim() || newName.trim().toLowerCase().replace(/\s+/g, '-'), settings_json: {} });
      setNewName('');
      setNewSlug('');
      setShowCreate(false);
      await fetchTenants();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const activeTenants = tenants.filter((t) => t.status !== 'DELETED');

  const kpis = [
    { label: 'Active Tenants', value: String(activeTenants.length), meta: `${tenants.length} total`, accent: '#0EA5E9' },
    { label: 'Total Tenants', value: String(tenants.length), meta: 'Platform-wide', accent: '#7C3AED' },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Super Admin</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Platform health & tenant management</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>Create Tenant</button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
      )}

      {showCreate && (
        <div className="glass-card-static" style={{ padding: '1.25rem', maxWidth: 480 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>New Tenant</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input className="glass-input" placeholder="Tenant Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: '100%' }} />
            <input className="glass-input" placeholder="Slug (optional)" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} style={{ width: '100%' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" disabled={creating || !newName.trim()} onClick={handleCreate}>{creating ? 'Creating...' : 'Create'}</button>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
      ) : (
        <div className="glass-card-static" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Tenants</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tenant', 'Status', 'Slug', 'Created'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No tenants found.</td></tr>
                )}
                {tenants.map((t) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }}>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.name}</td>
                    <td style={{ padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...(statusBadge[t.status] || statusBadge.active) }}>{t.status || 'active'}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{t.slug || '-'}</td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.7rem 0.75rem', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>{timeAgo(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
