import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPendingApprovals, getApprovalHistory, createApproval } from '../services/approvals';

const tabs = ['Pending', 'Approved', 'Changes Requested', 'All'];
const tabLabels = { Pending: 'Pending', Approved: 'Approved', 'Changes Requested': 'Changes Req.', All: 'All' };

const priorityAccent = { high: '#EF4444', HIGH: '#EF4444', CRITICAL: '#DC2626', medium: '#F59E0B', NORMAL: '#F59E0B', low: '#94A3B8', LOW: '#94A3B8' };
const statusBadge = {
  Pending: { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.15)' },
  APPROVED: { bg: 'rgba(16,185,129,0.08)', color: '#059669', border: 'rgba(16,185,129,0.15)' },
  REJECTED: { bg: 'rgba(239,68,68,0.08)', color: '#DC2626', border: 'rgba(239,68,68,0.15)' },
  CHANGES_REQUESTED: { bg: 'rgba(239,68,68,0.08)', color: '#DC2626', border: 'rgba(239,68,68,0.15)' },
  ESCALATED: { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.15)' },
};

const decisionMap = { Approved: 'APPROVED', 'Changes Requested': 'CHANGES_REQUESTED' };

export default function POCReviews() {
  const { currentTenant, user } = useAuth();
  const [activeTab, setActiveTab] = useState('Pending');
  const [pendingItems, setPendingItems] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      const [pending, history] = await Promise.all([getPendingApprovals(currentTenant.id), getApprovalHistory(currentTenant.id)]);
      setPendingItems(pending || []);
      setHistoryItems(history.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [currentTenant]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDecision = async (item, decision) => {
    if (actionLoading) return;
    setActionLoading(`${item.id}-${decision}`);
    try {
      const latestAiRun = item.ai_runs?.length > 0 ? item.ai_runs[item.ai_runs.length - 1] : null;
      await createApproval(currentTenant.id, { conversation_id: item.id, ai_run_id: latestAiRun?.id || null, reviewer_id: user?.id, decision, original_draft: latestAiRun?.draft_content || '', final_draft: latestAiRun?.draft_content || '' });
      await fetchData();
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;

  const getDisplayItems = () => {
    if (activeTab === 'Pending') return pendingItems.map((item) => ({ ...item, displayStatus: 'Pending', source: 'pending' }));
    if (activeTab === 'All') return [...pendingItems.map((item) => ({ ...item, displayStatus: 'Pending', source: 'pending' })), ...historyItems.map((item) => ({ ...item, displayStatus: item.decision, source: 'history' }))];
    const decision = decisionMap[activeTab];
    return historyItems.filter((item) => item.decision === decision).map((item) => ({ ...item, displayStatus: item.decision, source: 'history' }));
  };

  const items = getDisplayItems();

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>POC Reviews</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>Review and approve AI-generated responses</p>
        </div>
        {pendingItems.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: '9999px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', animation: 'fadeIn 1s ease infinite alternate' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706' }}>{pendingItems.length} pending</span>
          </div>
        )}
      </div>

      <div className="tab-group">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-item${activeTab === tab ? ' active' : ''}`}>{tabLabels[tab]}</button>
        ))}
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="glass-card-static" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No reviews found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {items.map((review) => {
            const conv = review.source === 'history' ? review.conversations : review;
            const customerName = review.source === 'pending' ? (review.customers?.display_name || 'Unknown') : (conv?.subject || 'Unknown');
            const category = conv?.category || 'General';
            const priority = conv?.priority || 'low';
            const latestAiRun = review.source === 'pending' && review.ai_runs?.length > 0 ? review.ai_runs[review.ai_runs.length - 1] : null;
            const draftContent = review.source === 'history' ? (review.final_draft || review.original_draft || '') : (latestAiRun?.draft_content || '');
            const badge = statusBadge[review.displayStatus] || statusBadge.Pending;

            return (
              <div key={`${review.source}-${review.id}`} className="glass-card-static" style={{ padding: '1.25rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div className="priority-stripe" style={{ background: priorityAccent[priority] || '#94A3B8' }} />
                <div style={{ paddingLeft: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{customerName}</span>
                    <span className="badge">{category}</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: 9999, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{review.displayStatus}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  {draftContent && (
                    <div className="ai-draft-box" style={{ marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={1.5} width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z"/></svg>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Draft</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>{draftContent}</p>
                    </div>
                  )}
                  {review.source === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" style={{ fontSize: '0.75rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'APPROVED')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Approve
                      </button>
                      <button className="btn-secondary" style={{ fontSize: '0.75rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'CHANGES_REQUESTED')}>Request Changes</button>
                      <button className="btn-ghost" style={{ fontSize: '0.75rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'ESCALATED')}>Escalate</button>
                      <button className="btn-ghost" style={{ fontSize: '0.75rem', color: '#EF4444' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'REJECTED')}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
