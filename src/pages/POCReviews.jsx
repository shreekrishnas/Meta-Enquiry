import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPendingApprovals, getApprovalHistory, createApproval } from '../services/approvals';

const tabs = ['Pending', 'Approved', 'Changes Requested', 'All'];

const priorityAccent = { high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };
const statusBadge = {
  'Pending': { bg: 'rgba(245,158,11,0.12)', color: '#92400E' },
  'Approved': { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  'Changes Requested': { bg: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  'APPROVED': { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  'REJECTED': { bg: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  'CHANGES_REQUESTED': { bg: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  'ESCALATED': { bg: 'rgba(245,158,11,0.12)', color: '#92400E' },
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
      const [pending, history] = await Promise.all([
        getPendingApprovals(currentTenant.id),
        getApprovalHistory(currentTenant.id),
      ]);
      setPendingItems(pending || []);
      setHistoryItems(history.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTenant]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDecision = async (item, decision) => {
    if (actionLoading) return;
    setActionLoading(`${item.id}-${decision}`);
    try {
      const latestAiRun = item.ai_runs?.length > 0 ? item.ai_runs[item.ai_runs.length - 1] : null;
      await createApproval(currentTenant.id, {
        conversation_id: item.id,
        ai_run_id: latestAiRun?.id || null,
        reviewer_id: user?.id,
        decision,
        original_draft: latestAiRun?.draft_content || '',
        final_draft: latestAiRun?.draft_content || '',
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view reviews.</div>;
  }

  const getDisplayItems = () => {
    if (activeTab === 'Pending') return pendingItems.map((item) => ({ ...item, displayStatus: 'Pending', source: 'pending' }));
    if (activeTab === 'All') {
      const all = [
        ...pendingItems.map((item) => ({ ...item, displayStatus: 'Pending', source: 'pending' })),
        ...historyItems.map((item) => ({ ...item, displayStatus: item.decision, source: 'history' })),
      ];
      return all;
    }
    const decision = decisionMap[activeTab];
    return historyItems.filter((item) => item.decision === decision).map((item) => ({ ...item, displayStatus: item.decision, source: 'history' }));
  };

  const items = getDisplayItems();

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

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', gridColumn: '1 / -1' }}>No reviews found.</div>
          )}
          {items.map((review) => {
            const conv = review.source === 'history' ? review.conversations : review;
            const customerName = review.source === 'pending' ? (review.customers?.name || 'Unknown') : (conv?.subject || 'Unknown');
            const category = conv?.category || 'General';
            const priority = conv?.priority || 'low';
            const latestAiRun = review.source === 'pending' && review.ai_runs?.length > 0 ? review.ai_runs[review.ai_runs.length - 1] : null;
            const draftContent = review.source === 'history' ? (review.final_draft || review.original_draft || '') : (latestAiRun?.draft_content || '');
            const badgeStyle = statusBadge[review.displayStatus] || statusBadge['Pending'];

            return (
              <div key={`${review.source}-${review.id}`} className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: priorityAccent[priority] || '#94A3B8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{customerName}</span>
                  <span className="badge" style={{ fontSize: '0.62rem' }}>{category}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, background: badgeStyle.bg, color: badgeStyle.color }}>{review.displayStatus}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{conv?.subject || ''}</p>
                {draftContent && (
                  <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px dashed rgba(124,58,237,0.2)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', marginBottom: '0.35rem' }}>AI Draft</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{draftContent}</p>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  {review.source === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="btn-primary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'APPROVED')}>Approve</button>
                      <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'CHANGES_REQUESTED')}>Changes</button>
                      <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'ESCALATED')}>Escalate</button>
                      <button className="btn-ghost" style={{ fontSize: '0.68rem', padding: '0.3rem 0.65rem', color: '#EF4444' }} disabled={!!actionLoading} onClick={() => handleDecision(review, 'REJECTED')}>Reject</button>
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
