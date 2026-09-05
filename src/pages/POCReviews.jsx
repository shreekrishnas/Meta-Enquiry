import React, { useState } from 'react';

const tabs = ['Pending', 'Approved', 'Changes Requested', 'All'];

const reviews = [
  { id: 1, customer: 'Sarah Chen', category: 'Returns', priority: 'high', status: 'Pending', sla: '1h 45m', summary: 'Customer requesting replacement for damaged order #4521. Item value $89.99.', draft: 'Hi Sarah! Your replacement has been processed and will ship within 1-2 business days. You\'ll receive tracking via email.' },
  { id: 2, customer: 'Marcus Johnson', category: 'Technical', priority: 'high', status: 'Pending', sla: '2h 30m', summary: 'API integration returning 502 errors during product catalog sync. Affecting production environment.', draft: 'Hi Marcus, we\'ve identified the issue with your API sync. Our engineering team has deployed a fix. Please try syncing again.' },
  { id: 3, customer: 'Emma Wilson', category: 'Billing', priority: 'high', status: 'Pending', sla: '45m', summary: 'Double charge on subscription. Transaction IDs: TXN-8821 and TXN-8834. Total overcharge: $49.99.', draft: 'Hi Emma, I\'ve verified the duplicate charge and initiated a refund for $49.99. It should appear in 3-5 business days.' },
  { id: 4, customer: 'Priya Patel', category: 'Billing', priority: 'medium', status: 'Approved', sla: 'Completed', summary: 'Enterprise pricing inquiry for 50+ users. Requesting custom quote.', draft: 'Hi Priya! For teams of 50+, we offer our Enterprise plan at $12/user/month with volume discounts available.' },
  { id: 5, customer: 'David Kim', category: 'General', priority: 'low', status: 'Changes Requested', sla: '4h 10m', summary: 'Asking about upcoming dashboard feature timeline.', draft: 'Hi David, the new dashboard is scheduled for Q3 release. I\'ll add you to the beta waitlist for early access.' },
  { id: 6, customer: 'Aisha Mohammed', category: 'Shipping', priority: 'medium', status: 'Pending', sla: '3h 00m', summary: 'Warehouse address update for all future orders. New address: 1200 Commerce Blvd.', draft: 'Hi Aisha, I\'ve updated your default shipping address to 1200 Commerce Blvd. All future orders will use this address.' },
];

const priorityAccent = { high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };
const statusBadge = {
  'Pending': { bg: 'rgba(245,158,11,0.12)', color: '#92400E' },
  'Approved': { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  'Changes Requested': { bg: 'rgba(239,68,68,0.12)', color: '#991B1B' },
};

export default function POCReviews() {
  const [activeTab, setActiveTab] = useState('Pending');

  const filtered = activeTab === 'All' ? reviews : reviews.filter(r => r.status === activeTab);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>POC Reviews</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Review and approve AI-generated responses</p>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-card)', borderRadius: 9999, padding: '0.25rem', border: '1px solid var(--border-subtle)', alignSelf: 'flex-start' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#0EA5E9' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{tab}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
        {filtered.map((review) => (
          <div key={review.id} className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: priorityAccent[review.priority] }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{review.customer}</span>
              <span className="badge" style={{ fontSize: '0.62rem' }}>{review.category}</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, background: (statusBadge[review.status] || statusBadge['Pending']).bg, color: (statusBadge[review.status] || statusBadge['Pending']).color }}>{review.status}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{review.summary}</p>
            <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px dashed rgba(124,58,237,0.2)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', marginBottom: '0.35rem' }}>AI Draft</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{review.draft}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: review.sla === 'Completed' ? '#059669' : review.priority === 'high' ? '#EF4444' : 'var(--text-muted)' }}>{review.sla}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button className="btn-primary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }}>Approve</button>
                <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }}>Changes</button>
                <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }}>Escalate</button>
                <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem', color: '#EF4444' }}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
