import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const conversation = {
  id: 1,
  customer: { name: 'Sarah Chen', email: 'sarah.chen@example.com', phone: '+1 555-0142', location: 'San Francisco, CA', totalConversations: 12, customerSince: 'Jan 2024' },
  channel: 'Instagram',
  status: 'In Progress',
  category: 'Returns',
  priority: 'high',
  assignedTo: 'Alex M.',
  slaDeadline: '2h 15m remaining',
  messages: [
    { id: 1, sender: 'Sarah Chen', type: 'customer', time: '10:23 AM', content: 'Hi, I need help with my recent order #4521. The package arrived damaged and I would like to request a replacement or refund.' },
    { id: 2, sender: 'AI Assistant', type: 'agent', time: '10:23 AM', content: 'I\'m sorry to hear about the damaged package, Sarah. I can see your order #4521 in our system. Let me look into the replacement options for you right away.' },
    { id: 3, sender: 'Sarah Chen', type: 'customer', time: '10:25 AM', content: 'Thank you. I also want to know if I need to return the damaged item or if you can just send a new one.' },
    { id: 4, sender: 'Alex M.', type: 'agent', time: '10:28 AM', content: 'Great question! For items under $50, we typically don\'t require a return of the damaged product. Your order qualifies for a free replacement. I\'ve initiated the process.' },
    { id: 5, sender: 'Sarah Chen', type: 'customer', time: '10:30 AM', content: 'That\'s wonderful! How long will the replacement take to arrive?' },
  ],
  aiDraft: {
    content: 'Hi Sarah! Your replacement for order #4521 has been processed and will ship within 1-2 business days. You\'ll receive a tracking number via email once it ships. The estimated delivery is 3-5 business days after shipment. Is there anything else I can help you with?',
    confidence: 92,
    sources: ['Returns Policy v2.3', 'Shipping SLA Guidelines', 'Customer History'],
  },
};

const channelColors = { Instagram: { bg: 'linear-gradient(135deg, #E1306C, #F77737)', color: '#fff' }, Facebook: { bg: '#1877F2', color: '#fff' } };

export default function ConversationDetail() {
  const { id } = useParams();
  const [noteText, setNoteText] = useState('');

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card-static" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{conversation.customer.name}</h1>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 9999, background: channelColors[conversation.channel].bg, color: channelColors[conversation.channel].color }}>{conversation.channel}</span>
          <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 9999, background: 'rgba(14,165,233,0.12)', color: '#0284C7' }}>{conversation.status}</span>
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversation #{id}</div>
        </div>

        <div className="glass-card-static" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {conversation.messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'customer' ? 'flex-start' : 'flex-end', maxWidth: '75%', alignSelf: msg.type === 'customer' ? 'flex-start' : 'flex-end' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{msg.sender} &middot; {msg.time}</div>
              <div style={{ padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)', background: msg.type === 'customer' ? 'var(--surface-card)' : 'rgba(14,165,233,0.08)', border: '1px solid var(--border-subtle)' }}>{msg.content}</div>
            </div>
          ))}

          <div style={{ marginTop: '0.5rem', border: '2px dashed rgba(124,58,237,0.25)', borderRadius: '1rem', padding: '1rem 1.25rem', background: 'rgba(124,58,237,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/></svg>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C3AED' }}>AI Suggested Reply</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.66rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 9999, background: 'rgba(16,185,129,0.12)', color: '#059669' }}>{conversation.aiDraft.confidence}% confidence</span>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{conversation.aiDraft.content}</p>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {conversation.aiDraft.sources.map((s) => (
                <span key={s} style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', borderRadius: 9999, background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>{s}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>Approve</button>
              <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>Edit</button>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}>Request POC Review</button>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', color: '#EF4444' }}>Reject</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card-static" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Customer Info</div>
          {[
            ['Email', conversation.customer.email],
            ['Phone', conversation.customer.phone],
            ['Location', conversation.customer.location],
            ['Conversations', conversation.customer.totalConversations],
            ['Since', conversation.customer.customerSince],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="glass-card-static" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Metadata</div>
          {[
            ['Category', conversation.category],
            ['Priority', conversation.priority],
            ['SLA', conversation.slaDeadline],
            ['Assigned', conversation.assignedTo],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{val}</span>
            </div>
          ))}
        </div>

        <div className="glass-card-static" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
              Escalate
            </button>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.75rem', background: '#10B981' }}>Resolve</button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Add Note</div>
            <textarea className="glass-input" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Internal note..." rows={3} style={{ width: '100%', resize: 'vertical', fontSize: '0.75rem' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
