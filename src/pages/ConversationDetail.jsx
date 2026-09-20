import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversation, getConversationMessages, subscribeToMessages, updateConversationStatus } from '../services/conversations';
import { createApproval } from '../services/approvals';
import { sendMetaMessage, triggerAIPipeline } from '../services/edgeFunctions';

const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const statusLabels = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Req.' };
const priorityAccent = { HIGH: '#EF4444', CRITICAL: '#DC2626', NORMAL: '#F59E0B', LOW: '#94A3B8' };

const fieldLabel = { fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', padding: '0.5625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };

export default function ConversationDetail() {
  const { id } = useParams();
  const { currentTenant, user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([getConversation(id), getConversationMessages(id)])
      .then(([conv, msgs]) => { setConversation(conv); setMessages(msgs || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = subscribeToMessages(id, (payload) => {
      if (payload.new) setMessages((prev) => [...prev, payload.new]);
    });
    return () => { channel.unsubscribe(); };
  }, [id]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try { await sendMetaMessage(id, replyText.trim(), user?.id); setReplyText(''); }
    catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const handleAction = async (action) => {
    if (!conversation || actionLoading) return;
    setActionLoading(action);
    try {
      if (action === 'approve') {
        const aiDraft = messages.find((m) => m.sender_type === 'AI_DRAFT' || m.message_type === 'AI_DRAFT');
        await createApproval(currentTenant.id, { conversation_id: conversation.id, ai_run_id: aiDraft?.ai_run_id || null, reviewer_id: user?.id, decision: 'APPROVED', original_draft: aiDraft?.content || '', final_draft: aiDraft?.content || '' });
        setConversation((prev) => ({ ...prev, status: 'POC_APPROVED' }));
      } else if (action === 'poc_review') {
        await updateConversationStatus(conversation.id, 'WAITING_FOR_POC');
        setConversation((prev) => ({ ...prev, status: 'WAITING_FOR_POC' }));
      } else if (action === 'reject') {
        const aiDraft = messages.find((m) => m.sender_type === 'AI_DRAFT' || m.message_type === 'AI_DRAFT');
        await createApproval(currentTenant.id, { conversation_id: conversation.id, ai_run_id: aiDraft?.ai_run_id || null, reviewer_id: user?.id, decision: 'REJECTED', original_draft: aiDraft?.content || '', final_draft: '' });
        setConversation((prev) => ({ ...prev, status: 'UNDER_REVIEW' }));
      } else if (action === 'escalate') {
        await updateConversationStatus(conversation.id, 'ESCALATED');
        setConversation((prev) => ({ ...prev, status: 'ESCALATED' }));
      } else if (action === 'resolve') {
        await updateConversationStatus(conversation.id, 'RESOLVED');
        setConversation((prev) => ({ ...prev, status: 'RESOLVED' }));
      } else if (action === 'regenerate') {
        await triggerAIPipeline(conversation.id, currentTenant.id);
      }
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>;
  if (error && !conversation) return <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>;
  if (!conversation) return null;

  const customer = conversation.customers || {};
  const channel = conversation.channel || 'Facebook';
  const aiDraft = [...messages].reverse().find((m) => m.sender_type === 'AI_DRAFT' || m.message_type === 'AI_DRAFT');
  const visibleMessages = messages.filter((m) => m.sender_type !== 'AI_DRAFT' && m.message_type !== 'AI_DRAFT');
  const sc = statusColors[conversation.status] || '#94A3B8';
  const pc = priorityAccent[conversation.priority] || '#94A3B8';

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="glass-card-static" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div className="priority-stripe" style={{ background: pc }} />
          <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
            {(customer.display_name || '?')[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{customer.display_name || 'Unknown'}</h1>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{conversation.summary ? conversation.summary.slice(0, 80) : `${channel} conversation`}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: 9999, background: channel === 'INSTAGRAM' ? '#E1306C' : '#1877F2', color: '#fff' }}>{channel}</span>
            <span className="status-pill" style={{ background: `${sc}14`, color: sc }}>{statusLabels[conversation.status] || conversation.status}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>#{id?.slice(0, 8)}</span>
          </div>
        </div>

        {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

        <div className="glass-card-static" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visibleMessages.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No messages yet.</div>
          )}
          {visibleMessages.map((msg) => {
            const isCustomer = msg.direction === 'INBOUND';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-start' : 'flex-end', maxWidth: '75%', alignSelf: isCustomer ? 'flex-start' : 'flex-end' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontVariantNumeric: 'tabular-nums' }}>
                  {msg.sender_name || (isCustomer ? customer.display_name : 'Agent')} &middot; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{
                  padding: '0.625rem 0.875rem', fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--text-primary)',
                  borderRadius: isCustomer ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  background: isCustomer ? 'var(--surface-hover)' : 'var(--accent-primary-soft)',
                  border: `1px solid ${isCustomer ? 'var(--border-subtle)' : 'rgba(99,102,241,0.15)'}`,
                }}>{msg.content}</div>
              </div>
            );
          })}

          {aiDraft && (
            <div className="ai-draft-box" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={1.5} width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z" /></svg>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Suggested Reply</span>
                {conversation.ai_confidence != null && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 600, color: '#7C3AED', fontVariantNumeric: 'tabular-nums' }}>{Math.round(conversation.ai_confidence)}% confidence</span>
                )}
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{aiDraft.content}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ fontSize: '0.75rem' }} disabled={actionLoading === 'approve'} onClick={() => handleAction('approve')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                </button>
                <button className="btn-secondary" style={{ fontSize: '0.75rem' }} disabled={actionLoading === 'poc_review'} onClick={() => handleAction('poc_review')}>Request Review</button>
                <button className="btn-secondary" style={{ fontSize: '0.75rem' }} disabled={actionLoading === 'regenerate'} onClick={() => handleAction('regenerate')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  {actionLoading === 'regenerate' ? 'Regenerating...' : 'Regenerate'}
                </button>
                <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#EF4444' }} disabled={actionLoading === 'reject'} onClick={() => handleAction('reject')}>Reject</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface-card-header)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." style={{ ...inputStyle, flex: 1, border: 'none', background: 'transparent' }} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
            <button className="btn-primary" style={{ fontSize: '0.75rem' }} disabled={sending || !replyText.trim()} onClick={handleSend}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="glass-card-static" style={{ padding: '1rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Customer Info</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
              {(customer.display_name || '?')[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{customer.display_name || 'Unknown'}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{customer.external_customer_id || customer.channel || '-'}</div>
            </div>
          </div>
          {[['Channel', customer.channel || '-'], ['Platform ID', customer.external_customer_id || '-']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="glass-card-static" style={{ padding: '1rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Conversation Details</span>
          </div>
          {[
            ['Category', conversation.category || '-'],
            ['Priority', conversation.priority || '-'],
            ['Status', statusLabels[conversation.status] || conversation.status],
            ['Channel', conversation.channel || '-'],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ ...fieldLabel, margin: 0, textTransform: 'none', letterSpacing: 'normal', fontSize: '0.75rem' }}>{l}</span>
              {l === 'Priority' ? (
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: 9999, background: `${priorityAccent[v] || '#94A3B8'}14`, color: priorityAccent[v] || '#94A3B8' }}>{v}</span>
              ) : l === 'Status' ? (
                <span className="status-pill" style={{ background: `${sc}14`, color: sc, fontSize: '0.6875rem' }}>{v}</span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{v}</span>
              )}
            </div>
          ))}
        </div>

        <div className="glass-card-static" style={{ padding: '1rem' }}>
          <div className="section-header">
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }} disabled={actionLoading === 'escalate'} onClick={() => handleAction('escalate')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              Escalate
            </button>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10B981, #059669)' }} disabled={actionLoading === 'resolve'} onClick={() => handleAction('resolve')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Resolve
            </button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ ...fieldLabel, marginBottom: '0.375rem' }}>Internal Note</div>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
