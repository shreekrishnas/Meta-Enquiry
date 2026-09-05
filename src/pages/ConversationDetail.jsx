import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversation, getConversationMessages, subscribeToMessages, updateConversationStatus } from '../services/conversations';
import { createApproval } from '../services/approvals';
import { sendMetaMessage, triggerAIPipeline } from '../services/edgeFunctions';

const channelColors = {
  Instagram: { bg: 'linear-gradient(135deg, #E1306C, #F77737)', color: '#fff' },
  Facebook: { bg: '#1877F2', color: '#fff' },
  INSTAGRAM: { bg: 'linear-gradient(135deg, #E1306C, #F77737)', color: '#fff' },
  FACEBOOK: { bg: '#1877F2', color: '#fff' },
};

const statusLabels = { NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Waiting for POC', RESOLVED: 'Resolved', POC_APPROVED: 'Approved', ESCALATED: 'Escalated', CHANGES_REQUESTED: 'Changes Requested' };

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
      .then(([conv, msgs]) => {
        setConversation(conv);
        setMessages(msgs || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const channel = subscribeToMessages(id, (payload) => {
      if (payload.new) {
        setMessages((prev) => [...prev, payload.new]);
      }
    });
    return () => { channel.unsubscribe(); };
  }, [id]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await sendMetaMessage(id, replyText.trim(), user?.id);
      setReplyText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (action) => {
    if (!conversation || actionLoading) return;
    setActionLoading(action);
    try {
      if (action === 'approve') {
        const aiDraft = messages.find((m) => m.message_type === 'AI_DRAFT');
        await createApproval(currentTenant.id, {
          conversation_id: conversation.id,
          ai_run_id: aiDraft?.ai_run_id || null,
          reviewer_id: user?.id,
          decision: 'APPROVED',
          original_draft: aiDraft?.content || '',
          final_draft: aiDraft?.content || '',
        });
        setConversation((prev) => ({ ...prev, status: 'POC_APPROVED' }));
      } else if (action === 'poc_review') {
        await updateConversationStatus(conversation.id, 'WAITING_FOR_POC');
        setConversation((prev) => ({ ...prev, status: 'WAITING_FOR_POC' }));
      } else if (action === 'reject') {
        const aiDraft = messages.find((m) => m.message_type === 'AI_DRAFT');
        await createApproval(currentTenant.id, {
          conversation_id: conversation.id,
          ai_run_id: aiDraft?.ai_run_id || null,
          reviewer_id: user?.id,
          decision: 'REJECTED',
          original_draft: aiDraft?.content || '',
          final_draft: '',
        });
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
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>;
  }

  if (error && !conversation) {
    return <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>;
  }

  if (!conversation) return null;

  const customer = conversation.customers || {};
  const channel = conversation.channel || 'Facebook';
  const channelStyle = channelColors[channel] || channelColors.Facebook;
  const aiDraft = [...messages].reverse().find((m) => m.message_type === 'AI_DRAFT');
  const visibleMessages = messages.filter((m) => m.message_type !== 'AI_DRAFT');

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card-static" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{customer.name || 'Unknown'}</h1>
          <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 9999, background: channelStyle.bg, color: channelStyle.color }}>{channel}</span>
          <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 9999, background: 'rgba(14,165,233,0.12)', color: '#0284C7' }}>{statusLabels[conversation.status] || conversation.status}</span>
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversation #{id}</div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.78rem' }}>{error}</div>
        )}

        <div className="glass-card-static" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {visibleMessages.map((msg) => {
            const isCustomer = msg.direction === 'INBOUND';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-start' : 'flex-end', maxWidth: '75%', alignSelf: isCustomer ? 'flex-start' : 'flex-end' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{msg.sender_name || (isCustomer ? customer.name : 'Agent')} &middot; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-primary)', background: isCustomer ? 'var(--surface-card)' : 'rgba(14,165,233,0.08)', border: '1px solid var(--border-subtle)' }}>{msg.content}</div>
              </div>
            );
          })}

          {aiDraft && (
            <div style={{ marginTop: '0.5rem', border: '2px dashed rgba(124,58,237,0.25)', borderRadius: '1rem', padding: '1rem 1.25rem', background: 'rgba(124,58,237,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/></svg>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C3AED' }}>AI Suggested Reply</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{aiDraft.content}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }} disabled={actionLoading === 'approve'} onClick={() => handleAction('approve')}>{actionLoading === 'approve' ? 'Approving...' : 'Approve'}</button>
                <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }} disabled={actionLoading === 'poc_review'} onClick={() => handleAction('poc_review')}>Request POC Review</button>
                <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', color: '#EF4444' }} disabled={actionLoading === 'reject'} onClick={() => handleAction('reject')}>Reject</button>
                <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }} disabled={actionLoading === 'regenerate'} onClick={() => handleAction('regenerate')}>{actionLoading === 'regenerate' ? 'Regenerating...' : 'Regenerate AI Draft'}</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input className="glass-input" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type a reply..." style={{ flex: 1, fontSize: '0.82rem' }} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} />
            <button className="btn-primary" style={{ fontSize: '0.78rem' }} disabled={sending || !replyText.trim()} onClick={handleSend}>{sending ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-card-static" style={{ padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Customer Info</div>
          {[
            ['Email', customer.email || '-'],
            ['Phone', customer.phone || '-'],
            ['Platform', customer.platform || '-'],
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
            ['Category', conversation.category || '-'],
            ['Priority', conversation.priority || '-'],
            ['Status', statusLabels[conversation.status] || conversation.status],
            ['Channel', conversation.channel || '-'],
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
            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }} disabled={actionLoading === 'escalate'} onClick={() => handleAction('escalate')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
              Escalate
            </button>
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.75rem', background: '#10B981' }} disabled={actionLoading === 'resolve'} onClick={() => handleAction('resolve')}>Resolve</button>
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
