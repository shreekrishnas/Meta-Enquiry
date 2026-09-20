import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTenant, updateTenantSettings, getTenantMembers, inviteMember, updateMemberRole, removeMember } from '../services/tenants';
import { getIntegrations, connectPage, disconnectPage } from '../services/metaIntegration';

const settingsTabs = ['General', 'Meta Connection', 'Categories', 'SLA & Hours', 'Team'];

const inputStyle = { width: '100%', padding: '0.5625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };

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
  const [inviteRole, setInviteRole] = useState('MARKETING');
  const [inviting, setInviting] = useState(false);
  const [slaFirstResponse, setSlaFirstResponse] = useState(30);
  const [slaResolution, setSlaResolution] = useState(24);
  const [businessHours, setBusinessHours] = useState('9:00 AM - 6:00 PM EST');

  const fetchData = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      const [t, integs, mems] = await Promise.all([getTenant(currentTenant.id), getIntegrations(currentTenant.id), getTenantMembers(currentTenant.id)]);
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [currentTenant]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveGeneral = async () => {
    setSaving(true); setError(null);
    try { await updateTenantSettings(currentTenant.id, { ...(tenant?.settings_json || {}), language: tenantLanguage }); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveSLA = async () => {
    setSaving(true); setError(null);
    try { await updateTenantSettings(currentTenant.id, { ...(tenant?.settings_json || {}), sla_first_response: slaFirstResponse, sla_resolution: slaResolution, business_hours: businessHours }); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDisconnect = async (integrationId) => {
    try { await disconnectPage(integrationId); await fetchData(); }
    catch (err) { setError(err.message); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true); setError(null);
    try { await inviteMember(currentTenant.id, inviteEmail.trim(), inviteRole); setInviteEmail(''); await fetchData(); }
    catch (err) { setError(err.message); }
    finally { setInviting(false); }
  };

  const handleRoleChange = async (membershipId, role) => {
    try { await updateMemberRole(membershipId, role); await fetchData(); }
    catch (err) { setError(err.message); }
  };

  const handleRemoveMember = async (membershipId) => {
    try { await removeMember(membershipId); await fetchData(); }
    catch (err) { setError(err.message); }
  };

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>;

  const categories = tenant?.settings_json?.categories || ['Billing', 'Technical', 'Returns', 'Shipping', 'General'];
  const fieldLabel = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Settings</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Manage workspace configuration</p>
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      <div className="tab-group">
        {settingsTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-item${activeTab === tab ? ' active' : ''}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'General' && (
        <div className="glass-card-static" style={{ padding: '1.5rem', maxWidth: 560 }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>General Settings</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={fieldLabel}>Tenant Name</label><input value={tenantName} onChange={(e) => setTenantName(e.target.value)} style={inputStyle} /></div>
            <div><label style={fieldLabel}>Slug</label><input value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} style={inputStyle} /></div>
            <div><label style={fieldLabel}>Language</label><input value={tenantLanguage} onChange={(e) => setTenantLanguage(e.target.value)} style={inputStyle} /></div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }} disabled={saving} onClick={handleSaveGeneral}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {activeTab === 'Meta Connection' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Connected Pages</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {integrations.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No connected pages.</div>}
            {integrations.map((page) => (
              <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card-header)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: page.status !== 'DISCONNECTED' ? '#10B981' : '#94A3B8', boxShadow: page.status !== 'DISCONNECTED' ? '0 0 8px rgba(16,185,129,0.3)' : 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{page.meta_page_name || page.meta_page_id}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{page.channel}</div>
                </div>
                <button className={page.status !== 'DISCONNECTED' ? 'btn-danger' : 'btn-ghost'} style={{ fontSize: '0.75rem', padding: '0.3125rem 0.625rem' }} onClick={() => page.status !== 'DISCONNECTED' ? handleDisconnect(page.id) : null}>
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
            <div className="section-header" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Conversation Categories</span>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.75rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Category
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {(Array.isArray(categories) ? categories : []).map((cat, idx) => {
              const catName = typeof cat === 'string' ? cat : cat.name;
              const catColor = typeof cat === 'object' && cat.color ? cat.color : ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#94A3B8'][idx % 5];
              return (
                <div key={catName} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: catColor, boxShadow: `0 0 6px ${catColor}40` }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{catName}</span>
                  <button className="btn-ghost" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>Edit</button>
                  <button className="btn-ghost" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', color: '#EF4444' }}>Delete</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'SLA & Hours' && (
        <div className="glass-card-static" style={{ padding: '1.5rem', maxWidth: 560 }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>SLA Configuration</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={fieldLabel}>First Response SLA (minutes)</label><input type="number" value={slaFirstResponse} onChange={(e) => setSlaFirstResponse(Number(e.target.value))} style={inputStyle} /></div>
            <div><label style={fieldLabel}>Resolution SLA (hours)</label><input type="number" value={slaResolution} onChange={(e) => setSlaResolution(Number(e.target.value))} style={inputStyle} /></div>
            <div><label style={fieldLabel}>Business Hours</label><input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} style={inputStyle} /></div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }} disabled={saving} onClick={handleSaveSLA}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      )}

      {activeTab === 'Team' && (
        <div className="glass-card-static" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Team Members</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ ...inputStyle, width: 110 }}>
              <option value="TENANT_ADMIN">Admin</option>
              <option value="BRAND_POC">POC</option>
              <option value="MARKETING">Marketing</option>
              <option value="KB_ADMIN">KB Admin</option>
            </select>
            <button className="btn-primary" disabled={inviting} onClick={handleInvite}>{inviting ? 'Inviting...' : 'Invite'}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {members.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No team members.</div>}
            {members.map((m) => {
              const roleLabels = { SUPER_ADMIN: 'Super Admin', TENANT_ADMIN: 'Admin', MARKETING: 'Marketing', BRAND_POC: 'POC', KB_ADMIN: 'KB Admin', SYSTEM_ADMIN: 'System Admin' };
              return (
              <div key={m.id} className="table-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
                  {(m.users?.full_name || m.users?.email || '?')[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.users?.full_name || m.users?.email || 'Unknown'}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{m.users?.email}</div>
                </div>
                <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)} style={{ ...inputStyle, width: 110, padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  <option value="TENANT_ADMIN">Admin</option>
                  <option value="BRAND_POC">POC</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="KB_ADMIN">KB Admin</option>
                </select>
                <button className="btn-ghost" style={{ color: '#EF4444', fontSize: '0.75rem' }} onClick={() => handleRemoveMember(m.id)}>Remove</button>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
