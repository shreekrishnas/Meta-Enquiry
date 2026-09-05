import React, { useState } from 'react';

const tabs = ['All', 'New', 'In Progress', 'Waiting for POC', 'Resolved'];

const conversations = [
  { id: 1, name: 'Sarah Chen', initials: 'SC', gradient: 'linear-gradient(135deg, #0EA5E9, #7C3AED)', message: 'Hi, I need help with my recent order #4521. The package arrived damaged and I would like to request a replacement...', category: 'Returns', priority: 'high', status: 'New', time: '5m ago', assignedTo: 'Alex M.' },
  { id: 2, name: 'Marcus Johnson', initials: 'MJ', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', message: 'The integration API keeps returning 502 errors when I try to sync my product catalog. Can you check the logs?', category: 'Technical', priority: 'high', status: 'In Progress', time: '12m ago', assignedTo: 'Jamie L.' },
  { id: 3, name: 'Priya Patel', initials: 'PP', gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)', message: 'Could you provide more details about the enterprise pricing plan? We are looking to onboard 50+ users.', category: 'Billing', priority: 'medium', status: 'Waiting for POC', time: '24m ago', assignedTo: 'Sam K.' },
  { id: 4, name: 'David Kim', initials: 'DK', gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)', message: 'When will the new dashboard feature be available? We saw the preview at the conference last week.', category: 'General', priority: 'low', status: 'New', time: '1h ago', assignedTo: 'Alex M.' },
  { id: 5, name: 'Emma Wilson', initials: 'EW', gradient: 'linear-gradient(135deg, #EF4444, #F59E0B)', message: 'My subscription was charged twice this month. Transaction IDs: TXN-8821 and TXN-8834. Please refund.', category: 'Billing', priority: 'high', status: 'In Progress', time: '2h ago', assignedTo: 'Jamie L.' },
  { id: 6, name: 'Carlos Rivera', initials: 'CR', gradient: 'linear-gradient(135deg, #14B8A6, #22D3EE)', message: 'Thank you for the quick resolution! The issue with the checkout flow is now fixed on our end.', category: 'Technical', priority: 'low', status: 'Resolved', time: '3h ago', assignedTo: 'Sam K.' },
  { id: 7, name: 'Aisha Mohammed', initials: 'AM', gradient: 'linear-gradient(135deg, #A855F7, #6366F1)', message: 'We need to update our shipping address for all future orders. The new warehouse is at 1200 Commerce...', category: 'Shipping', priority: 'medium', status: 'New', time: '4h ago', assignedTo: 'Alex M.' },
  { id: 8, name: 'Liam O\'Brien', initials: 'LO', gradient: 'linear-gradient(135deg, #F97316, #EAB308)', message: 'Is there a way to export conversation analytics as CSV? We need it for our quarterly board report.', category: 'General', priority: 'low', status: 'In Progress', time: '5h ago', assignedTo: 'Jamie L.' },
];

const priorityBorder = { high: '#EF4444', medium: '#F59E0B', low: '#D1D5DB' };
const statusBadgeStyle = {
  'New': { background: 'rgba(148,163,184,0.12)', color: '#64748B' },
  'In Progress': { background: 'rgba(14,165,233,0.12)', color: '#0284C7' },
  'Waiting for POC': { background: 'rgba(139,92,246,0.12)', color: '#7C3AED' },
  'Resolved': { background: 'rgba(16,185,129,0.12)', color: '#059669' },
};

export default function Conversations() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? conversations : conversations.filter(c => c.status === activeTab);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Conversations</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', maxWidth: 340, flex: 1 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search conversations..." style={{ width: '100%', borderRadius: 9999, height: 46, paddingLeft: 40, boxShadow: '0 6px 18px rgba(15,23,42,0.07)' }} />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Conversation
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-card)', borderRadius: 9999, padding: '0.25rem', border: '1px solid var(--border-subtle)' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#0EA5E9' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{tab}</button>
        ))}
      </div>

      <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.map((conv) => (
          <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.1rem', borderBottom: '1px solid rgba(15,23,42,0.04)', cursor: 'pointer', borderLeft: `3px solid ${priorityBorder[conv.priority]}`, transition: 'background 0.15s' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: conv.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{conv.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)' }}>{conv.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{conv.message}</div>
            </div>
            <span className="badge" style={{ fontSize: '0.66rem' }}>{conv.category}</span>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...statusBadgeStyle[conv.status] }}>{conv.status}</span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 55, textAlign: 'right' }}>{conv.time}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 55 }}>{conv.assignedTo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
