import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPendingApprovals, getApprovalHistory, createApproval } from '../services/approvals';

const tabs = ['Pending', 'Approved', 'Changes Requested', 'All'];
const tabLabels = { Pending: 'Pending', Approved: 'Approved', 'Changes Requested': 'Changes Req.', All: 'All' };

const priorityAccent = { high: '#EF4444', HIGH: '#EF4444', CRITICAL: '#DC2626', medium: '#F59E0B', NORMAL: '#F59E0B', low: '#94A3B8', LOW: '#94A3B8' };
const statusBadge = {
  Pending: { bg: '#FFFBEB', color: '#92400E' },
  APPROVED: { bg: '#ECFDF5', color: '#059669' },
  REJECTED: { bg: '#FEF2F2', color: '#991B1B' },
  CHANGES_REQUESTED: { bg: '#FEF2F2', color: '#991B1B' },
  ESCALATED: { bg: '#FFFBEB', color: '#92400E' },
};

const decisionMap = { Approved: 'APPROVED', 'Changes Requested': 'CHANGES_REQUESTED' };
const card = { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' };

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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>POC Reviews</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>Review and approve AI-generated responses</p>
      </div>

      <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '3px', width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 500,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === tab ? 'var(--surface-card)' : 'transparent',
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === tab ? 'var(--shadow-xs)' : 'none',
          }}>{tabLabels[tab]}</button>
        ))}
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {items.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No reviews found.</div>
          ) : items.map((review) => {
            const conv = review.source === 'history' ? review.conversations : review;
            const customerName = review.source === 'pending' ? (review.customers?.display_name || 'Unknown') : (conv?.subject || 'Unknown');
            const category = conv?.category || 'General';
            const priority = conv?.priority || 'low';
            const latestAiRun = review.source === 'pending' && review.ai_runs?.length > 0 ? review.ai_runs[review.ai_runs.length - 1] : null;
            const draftContent = review.source === 'history' ? (review.final_draft || review.original_draft || '') : (latestAiRun?.draft_content || '');
            const badge = statusBadge[review.displayStatus] || statusBadge.Pending;

            return (
              <div key={`${review.source}-${review.id}`} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: priorityAccent[priority] || '#94A3B8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{customerName}</span>
                  <span className="badge">{category}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.375rem', borderRadius: 9999, background: badge.bg, color: badge.color }}>{review.displayStatus}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                </div>
                {draftContent && (
                  <div style={{ background: '#F5F3FF', border: '1px dashed #C4B5FD', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.75rem', marginBottom: '0.625rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#7C3AED', marginBottom: '0.25rem' }}>AI Draft</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{draftContent}</p>
                  </div>
                )}
                {review.source === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn-primary" disabled={!!actionLoading} onClick={() => handleDecision(review, 'APPROVED')}>Approve</button>
                    <button className="btn-secondary" disabled={!!actionLoading} onClick={() => handleDecision(review, 'CHANGES_REQUESTED')}>Changes</button>
                    <button className="btn-ghost" disabled={!!actionLoading} onClick={() => handleDecision(review, 'ESCALATED')}>Escalate</button>
                    <button className="btn-ghost" style={{ color: '#EF4444' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'REJECTED')}>Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
