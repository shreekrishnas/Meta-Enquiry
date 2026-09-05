import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversations } from '../services/conversations';

const tabs = ['All', 'NEW', 'IN_PROGRESS', 'WAITING_FOR_POC', 'RESOLVED'];
const tabLabels = { All: 'All', NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Waiting for POC', RESOLVED: 'Resolved' };

const priorityBorder = { high: '#EF4444', medium: '#F59E0B', low: '#D1D5DB' };
const statusBadgeStyle = {
  'NEW': { background: 'rgba(148,163,184,0.12)', color: '#64748B' },
  'IN_PROGRESS': { background: 'rgba(14,165,233,0.12)', color: '#0284C7' },
  'WAITING_FOR_POC': { background: 'rgba(139,92,246,0.12)', color: '#7C3AED' },
  'RESOLVED': { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  'POC_APPROVED': { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  'ESCALATED': { background: 'rgba(239,68,68,0.12)', color: '#991B1B' },
  'CHANGES_REQUESTED': { background: 'rgba(245,158,11,0.12)', color: '#92400E' },
};

const gradients = [
  'linear-gradient(135deg, #0EA5E9, #7C3AED)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #10B981, #0EA5E9)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #EF4444, #F59E0B)',
  'linear-gradient(135deg, #14B8A6, #22D3EE)',
  'linear-gradient(135deg, #A855F7, #6366F1)',
  'linear-gradient(135deg, #F97316, #EAB308)',
];

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Conversations() {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const fetchData = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      const filters = { page, limit };
      if (activeTab !== 'All') filters.status = activeTab;
      if (search.trim()) filters.search = search.trim();
      const result = await getConversations(currentTenant.id, filters);
      setConversations(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, activeTab, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view conversations.</div>;
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Conversations</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', maxWidth: 340, flex: 1 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', borderRadius: 9999, height: 46, paddingLeft: 40, boxShadow: '0 6px 18px rgba(15,23,42,0.07)' }} />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Conversation
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-card)', borderRadius: 9999, padding: '0.25rem', border: '1px solid var(--border-subtle)' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#0EA5E9' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{tabLabels[tab]}</button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
      ) : (
        <div className="glass-card-static" style={{ padding: 0, overflow: 'hidden' }}>
          {conversations.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No conversations found.</div>
          )}
          {conversations.map((conv, idx) => (
            <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.1rem', borderBottom: '1px solid rgba(15,23,42,0.04)', cursor: 'pointer', borderLeft: `3px solid ${priorityBorder[conv.priority] || '#D1D5DB'}`, transition: 'background 0.15s' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: gradients[idx % gradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{getInitials(conv.customers?.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-primary)' }}>{conv.customers?.name || 'Unknown'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>{conv.subject || ''}</div>
              </div>
              <span className="badge" style={{ fontSize: '0.66rem' }}>{conv.category || 'General'}</span>
              <span style={{ fontSize: '0.66rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...(statusBadgeStyle[conv.status] || statusBadgeStyle['NEW']) }}>{tabLabels[conv.status] || conv.status}</span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 55, textAlign: 'right' }}>{timeAgo(conv.updated_at)}</div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ fontSize: '0.78rem' }}>Previous</button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ fontSize: '0.78rem' }}>Next</button>
        </div>
      )}
    </div>
  );
}
