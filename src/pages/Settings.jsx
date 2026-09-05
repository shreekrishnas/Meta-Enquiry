import React, { useState } from 'react';

const settingsTabs = ['General', 'Meta Connection', 'Categories', 'SLA & Hours', 'Team'];

const connectedPages = [
  { name: 'Acme Corp Official', platform: 'Facebook', status: 'connected' },
  { name: 'Acme Support', platform: 'Instagram', status: 'connected' },
  { name: 'Acme Store', platform: 'Facebook', status: 'disconnected' },
];

const categories = [
  { id: 1, name: 'Billing', color: '#0EA5E9', autoAssign: true },
  { id: 2, name: 'Technical', color: '#7C3AED', autoAssign: true },
  { id: 3, name: 'Returns', color: '#EF4444', autoAssign: false },
  { id: 4, name: 'Shipping', color: '#F59E0B', autoAssign: true },
  { id: 5, name: 'General', color: '#94A3B8', autoAssign: false },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Settings</h1>

      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-card)', borderRadius: 9999, padding: '0.25rem', border: '1px solid var(--border-subtle)', alignSelf: 'flex-start' }}>
        {settingsTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#0EA5E9' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'General' && (
        <div className="glass-card-static" style={{ padding: '1.5rem', maxWidth: 560 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>General Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Tenant Name</label>
              <input className="glass-input" defaultValue="Acme Corp" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Slug</label>
              <input className="glass-input" defaultValue="acme-corp" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Language</label>
              <input className="glass-input" defaultValue="English" style={{ width: '100%' }} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Save Changes</button>
          </div>
        </div>
      )}

      {activeTab === 'Meta Connection' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Connected Pages</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {connectedPages.map((page) => (
              <div key={page.name} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: page.status === 'connected' ? '#10B981' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{page.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{page.platform}</div>
                </div>
                <button className={page.status === 'connected' ? 'btn-ghost' : 'btn-primary'} style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>
                  {page.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Categories' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Conversation Categories</div>
            <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }}>Add Category</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{cat.name}</span>
                <span style={{ fontSize: '0.68rem', color: cat.autoAssign ? '#059669' : 'var(--text-muted)' }}>{cat.autoAssign ? 'Auto-assign' : 'Manual'}</span>
                <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>Edit</button>
                <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', color: '#EF4444' }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SLA & Hours' && (
        <div className="glass-card-static" style={{ padding: '1.5rem', maxWidth: 560 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>SLA Configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>First Response SLA (minutes)</label>
              <input className="glass-input" type="number" defaultValue="30" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Resolution SLA (hours)</label>
              <input className="glass-input" type="number" defaultValue="24" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Business Hours</label>
              <input className="glass-input" defaultValue="9:00 AM - 6:00 PM EST" style={{ width: '100%' }} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Save Changes</button>
          </div>
        </div>
      )}

      {activeTab === 'Team' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Team Members</div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Team management settings will be configured here.</p>
        </div>
      )}
    </div>
  );
}
