import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateTenantSettings } from '../services/tenants';
import { createArticle } from '../services/knowledgeBase';

const steps = [
  { num: 1, label: 'Connect Meta Account' },
  { num: 2, label: 'Select Pages' },
  { num: 3, label: 'Configure POC' },
  { num: 4, label: 'Set Categories & SLA' },
  { num: 5, label: 'Seed Knowledge Base' },
  { num: 6, label: 'Go Live' },
];

export default function TenantOnboarding() {
  const { currentTenant, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [autoApprove, setAutoApprove] = useState(true);
  const [slaMinutes, setSlaMinutes] = useState(30);
  const [selectedCategories] = useState(['Billing', 'Technical', 'Returns', 'Shipping', 'General']);

  const handleSavePOCConfig = async () => {
    if (!currentTenant) return;
    setSaving(true);
    setError(null);
    try {
      await updateTenantSettings(currentTenant.id, {
        ...(currentTenant.settings_json || {}),
        ai_confidence_threshold: confidenceThreshold,
        auto_approve_above_threshold: autoApprove,
      });
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategoriesSLA = async () => {
    if (!currentTenant) return;
    setSaving(true);
    setError(null);
    try {
      await updateTenantSettings(currentTenant.id, {
        ...(currentTenant.settings_json || {}),
        categories: selectedCategories,
        sla_first_response: slaMinutes,
      });
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSeedKB = async () => {
    if (!currentTenant) return;
    setSaving(true);
    setError(null);
    try {
      await createArticle(currentTenant.id, {
        title: 'Getting Started',
        content: 'Welcome to the knowledge base. Add your FAQ and policy documents here.',
        category: 'General',
        owner_id: user?.id,
      });
      setCurrentStep(6);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!currentTenant) return;
    setSaving(true);
    setError(null);
    try {
      await updateTenantSettings(currentTenant.id, {
        ...(currentTenant.settings_json || {}),
        status: 'ACTIVE',
        onboarding_complete: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectMeta = () => {
    window.open('https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT&scope=pages_messaging,pages_read_engagement', '_blank');
  };

  const goNext = () => {
    if (currentStep === 3) { handleSavePOCConfig(); return; }
    if (currentStep === 4) { handleSaveCategoriesSLA(); return; }
    if (currentStep === 5) { handleSeedKB(); return; }
    setCurrentStep(Math.min(6, currentStep + 1));
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Tenant Onboarding</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Step {currentStep} of {steps.length}</p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.82rem' }}>{error}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700, transition: 'all 0.3s',
                background: step.num < currentStep ? '#10B981' : step.num === currentStep ? '#0EA5E9' : 'var(--surface-card)',
                color: step.num <= currentStep ? '#fff' : 'var(--text-muted)',
                border: step.num > currentStep ? '2px solid var(--border-subtle)' : 'none',
                boxShadow: step.num === currentStep ? '0 0 0 4px rgba(14,165,233,0.2)' : 'none',
              }}>
                {step.num < currentStep ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : step.num}
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: step.num === currentStep ? '#0EA5E9' : 'var(--text-muted)', textAlign: 'center', maxWidth: 80 }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 2, background: step.num < currentStep ? '#10B981' : 'var(--border-subtle)', marginBottom: 20, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="glass-card-static" style={{ padding: '2rem' }}>
        {currentStep === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '1rem', background: 'linear-gradient(135deg, #1877F2, #42B72A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Connect Your Meta Account</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>Link your Meta Business account to start receiving messages from Facebook and Instagram pages.</p>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }} onClick={handleConnectMeta}>Connect with Meta</button>
          </div>
        )}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>Select Pages to Monitor</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Pages will appear here after connecting your Meta account.</p>
            {['Page 1 (Facebook)', 'Page 2 (Instagram)'].map((page) => (
              <label key={page} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#0EA5E9' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{page}</span>
              </label>
            ))}
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>Configure POC Review</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>AI Confidence Threshold (%)</label>
                <input className="glass-input" type="number" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Auto-approve above threshold</label>
                <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} style={{ accentColor: '#0EA5E9' }} />
              </div>
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>Set Categories & SLA</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Default Categories</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedCategories.map((c) => (
                    <span key={c} className="badge">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>First Response SLA (minutes)</label>
                <input className="glass-input" type="number" value={slaMinutes} onChange={(e) => setSlaMinutes(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}
        {currentStep === 5 && (
          <div style={{ textAlign: 'center' }}>
            <svg style={{ margin: '0 auto 1rem' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Seed Knowledge Base</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>Upload your existing FAQ documents, policy guides, and support articles to train the AI assistant.</p>
            <button className="btn-secondary" style={{ fontSize: '0.82rem' }}>Upload Documents</button>
          </div>
        )}
        {currentStep === 6 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Ready to Go Live!</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>Your tenant is fully configured. Activate to start receiving and processing conversations.</p>
            <button className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 2rem', background: '#10B981' }} disabled={saving} onClick={handleActivate}>{saving ? 'Activating...' : 'Activate Tenant'}</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-ghost" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        {currentStep < 6 && (
          <button className="btn-primary" onClick={goNext} disabled={saving}>
            {saving ? 'Saving...' : 'Next'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
