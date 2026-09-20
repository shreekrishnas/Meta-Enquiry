import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversation, getConversationMessages, subscribeToMessages, updateConversationStatus } from '../services/conversations';
import { createApproval } from '../services/approvals';
import { sendMetaMessage, triggerAIPipeline } from '../services/edgeFunctions';

const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const statusLabels = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Req.' };

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' };
const label = { fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-input)', background: 'var(--surface-input)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' };

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
        const aiDraft = messages.find((m) => m.message_type === 'AI_DRAFT');
        await createApproval(currentTenant.id, { conversation_id: conversation.id, ai_run_id: aiDraft?.ai_run_id || null, reviewer_id: user?.id, decision: 'APPROVED', original_draft: aiDraft?.content || '', final_draft: aiDraft?.content || '' });
        setConversation((prev) => ({ ...prev, status: 'POC_APPROVED' }));
      } else if (action === 'poc_review') {
        await updateConversationStatus(conversation.id, 'WAITING_FOR_POC');
        setConversation((prev) => ({ ...prev, status: 'WAITING_FOR_POC' }));
      } else if (action === 'reject') {
        const aiDraft = messages.find((m) => m.message_type === 'AI_DRAFT');
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
  const aiDraft = [...messages].reverse().find((m) => m.message_type === 'AI_DRAFT');
  const visibleMessages = messages.filter((m) => m.message_type !== 'AI_DRAFT');
  const sc = statusColors[conversation.status] || '#94A3B8';

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{customer.display_name || 'Unknown'}</h1>
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.5rem', borderRadius: 9999, background: channel === 'INSTAGRAM' ? '#E1306C' : '#1877F2', color: '#fff' }}>{channel}</span>
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.375rem', borderRadius: 9999, background: `${sc}14`, color: sc }}>{statusLabels[conversation.status] || conversation.status}</span>
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{id?.slice(0, 8)}</div>
        </div>

        {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

        <div style={{ ...card, padding: '1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visibleMessages.map((msg) => {
            const isCustomer = msg.direction === 'INBOUND';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-start' : 'flex-end', maxWidth: '75%', alignSelf: isCustomer ? 'flex-start' : 'flex-end' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {msg.sender_name || (isCustomer ? customer.display_name : 'Agent')} &middot; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{
                  padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--text-primary)',
                  background: isCustomer ? 'var(--surface-hover)' : '#EEF2FF', border: '1px solid var(--border-subtle)',
                }}>{msg.content}</div>
              </div>
            );
          })}

          {aiDraft && (
            <div style={{ marginTop: '0.5rem', border: '2px dashed #C4B5FD', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', background: '#F5F3FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z" /></svg>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED' }}>AI Suggested Reply</span>
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{aiDraft.content}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" disabled={actionLoading === 'approve'} onClick={() => handleAction('approve')}>{actionLoading === 'approve' ? 'Approving...' : 'Approve'}</button>
                <button className="btn-ghost" disabled={actionLoading === 'poc_review'} onClick={() => handleAction('poc_review')}>Request Review</button>
                <button className="btn-ghost" style={{ color: '#EF4444' }} disabled={actionLoading === 'reject'} onClick={() => handleAction('reject')}>Reject</button>
                <button className="btn-secondary" disabled={actionLoading === 'regenerate'} onClick={() => handleAction('regenerate')}>{actionLoading === 'regenerate' ? 'Regenerating...' : 'Regenerate'}</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
            <button className="btn-primary" disabled={sending || !replyText.trim()} onClick={handleSend}>{sending ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ ...card, padding: '1rem' }}>
          <div style={{ ...label, marginBottom: '0.75rem' }}>Customer Info</div>
          {[['Channel', customer.channel || '-'], ['ID', customer.external_customer_id || '-'], ['Name', customer.display_name || '-']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '1rem' }}>
          <div style={{ ...label, marginBottom: '0.75rem' }}>Metadata</div>
          {[['Category', conversation.category || '-'], ['Priority', conversation.priority || '-'], ['Status', statusLabels[conversation.status] || conversation.status], ['Channel', conversation.channel || '-']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: '1rem' }}>
          <div style={{ ...label, marginBottom: '0.75rem' }}>Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={actionLoading === 'escalate'} onClick={() => handleAction('escalate')}>Escalate</button>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#10B981' }} disabled={actionLoading === 'resolve'} onClick={() => handleAction('resolve')}>Resolve</button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Internal Note</div>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
