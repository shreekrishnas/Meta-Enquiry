import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTenant, updateTenantSettings, getTenantMembers, inviteMember, updateMemberRole, removeMember } from '../services/tenants';
import { getIntegrations, connectPage, disconnectPage } from '../services/metaIntegration';

const settingsTabs = ['General', 'Meta Connection', 'Categories', 'SLA & Hours', 'Team'];

export default function Settings() {
  const { currentTenant, user } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [tenant, setTenant] = useState(null);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantLanguage, setTenantLanguage] = useState('English');

  const [integrations, setIntegrations] = useState([]);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [inviting, setInviting] = useState(false);

  const [slaFirstResponse, setSlaFirstResponse] = useState(30);
  const [slaResolution, setSlaResolution] = useState(24);
  const [businessHours, setBusinessHours] = useState('9:00 AM - 6:00 PM EST');

  const fetchData = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      const [t, integs, mems] = await Promise.all([
        getTenant(currentTenant.id),
        getIntegrations(currentTenant.id),
        getTenantMembers(currentTenant.id),
      ]);
      setTenant(t);
      setTenantName(t.name || '');
      setTenantSlug(t.slug || '');
      const settings = t.settings_json || {};
      setTenantLanguage(settings.language || 'English');
      setSlaFirstResponse(settings.sla_first_response || 30);
      setSlaResolution(settings.sla_resolution || 24);
      setBusinessHours(settings.business_hours || '9:00 AM - 6:00 PM EST');
      setIntegrations(integs || []);
      setMembers(mems || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateTenantSettings(currentTenant.id, {
        ...(tenant?.settings_json || {}),
        language: tenantLanguage,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSLA = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateTenantSettings(currentTenant.id, {
        ...(tenant?.settings_json || {}),
        sla_first_response: slaFirstResponse,
        sla_resolution: slaResolution,
        business_hours: businessHours,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async (integrationId) => {
    try {
      await disconnectPage(integrationId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    setError(null);
    try {
      await inviteMember(currentTenant.id, inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (membershipId, role) => {
    try {
      await updateMemberRole(membershipId, role);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (membershipId) => {
    try {
      await removeMember(membershipId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view settings.</div>;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>;
  }

  const categories = tenant?.settings_json?.categories || ['Billing', 'Technical', 'Returns', 'Shipping', 'General'];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Settings</h1>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
      )}

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
              <input className="glass-input" value={tenantName} onChange={(e) => setTenantName(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Slug</label>
              <input className="glass-input" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Language</label>
              <input className="glass-input" value={tenantLanguage} onChange={(e) => setTenantLanguage(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} disabled={saving} onClick={handleSaveGeneral}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {activeTab === 'Meta Connection' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Connected Pages</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {integrations.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No connected pages.</div>
            )}
            {integrations.map((page) => (
              <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: page.status !== 'DISCONNECTED' ? '#10B981' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{page.meta_page_name || page.meta_page_id}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{page.channel}</div>
                </div>
                <button className={page.status !== 'DISCONNECTED' ? 'btn-ghost' : 'btn-primary'} style={{ fontSize: '0.72rem', padding: '0.35rem 0.75rem' }} onClick={() => page.status !== 'DISCONNECTED' ? handleDisconnect(page.id) : null}>
                  {page.status !== 'DISCONNECTED' ? 'Disconnect' : 'Disconnected'}
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
            {(Array.isArray(categories) ? categories : []).map((cat, idx) => {
              const catName = typeof cat === 'string' ? cat : cat.name;
              const catColor = typeof cat === 'object' && cat.color ? cat.color : ['#0EA5E9', '#7C3AED', '#EF4444', '#F59E0B', '#94A3B8'][idx % 5];
              return (
                <div key={catName} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: catColor }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{catName}</span>
                  <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem' }}>Edit</button>
                  <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', color: '#EF4444' }}>Delete</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'SLA & Hours' && (
        <div className="glass-card-static" style={{ padding: '1.5rem', maxWidth: 560 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>SLA Configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>First Response SLA (minutes)</label>
              <input className="glass-input" type="number" value={slaFirstResponse} onChange={(e) => setSlaFirstResponse(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Resolution SLA (hours)</label>
              <input className="glass-input" type="number" value={slaResolution} onChange={(e) => setSlaResolution(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Business Hours</label>
              <input className="glass-input" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }} disabled={saving} onClick={handleSaveSLA}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {activeTab === 'Team' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Team Members</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input className="glass-input" placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ flex: 1 }} />
            <select className="glass-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ width: 120 }}>
              <option value="admin">Admin</option>
              <option value="poc">POC</option>
              <option value="agent">Agent</option>
            </select>
            <button className="btn-primary" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }} disabled={inviting} onClick={handleInvite}>{inviting ? 'Inviting...' : 'Invite'}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {members.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No team members.</div>
            )}
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.85rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.users?.name || m.users?.email || 'Unknown'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.users?.email}</div>
                </div>
                <select className="glass-input" value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)} style={{ width: 100, fontSize: '0.72rem', padding: '0.25rem' }}>
                  <option value="admin">Admin</option>
                  <option value="poc">POC</option>
                  <option value="agent">Agent</option>
                </select>
                <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.25rem 0.5rem', color: '#EF4444' }} onClick={() => handleRemoveMember(m.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
