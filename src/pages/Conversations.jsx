import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversations } from '../services/conversations';

const tabs = ['All', 'NEW', 'IN_PROGRESS', 'WAITING_FOR_POC', 'RESOLVED'];
const tabLabels = { All: 'All', NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved' };
const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const priorityDot = { HIGH: '#EF4444', CRITICAL: '#DC2626', NORMAL: '#F59E0B', LOW: '#94A3B8', high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };
const channelIcon = {
  INSTAGRAM: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="12" height="12" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>,
  FACEBOOK: <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [currentTenant, activeTab, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeTab, search]);

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Conversations</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{totalCount} total conversations</p>
        </div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="glass-input" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34, width: 220 }} />
        </div>
      </div>

      <div className="tab-group">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-item${activeTab === tab ? ' active' : ''}`}>{tabLabels[tab]}</button>
        ))}
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      <div className="premium-table">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No conversations found.</div>
        ) : (
          <>
            <div className="premium-table-header" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 100px' }}>
              <span>Customer</span>
              <span>Category</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Updated</span>
            </div>
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} className="table-row"
                style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 100px', padding: '0.75rem 1.25rem', cursor: 'pointer', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                <div className="priority-stripe" style={{ background: priorityDot[conv.priority] || '#94A3B8' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, paddingLeft: '0.5rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{getInitials(conv.customers?.display_name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.customers?.display_name || 'Unknown'}</span>
                      {conv.channel && <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{channelIcon[conv.channel] || null}</span>}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{conv.summary ? conv.summary.slice(0, 50) + (conv.summary.length > 50 ? '...' : '') : conv.channel || ''}</div>
                  </div>
                </div>
                <span className="badge" style={{ width: 'fit-content' }}>{conv.category || 'General'}</span>
                <span className="status-pill" style={{ background: `${statusColors[conv.status] || '#94A3B8'}14`, color: statusColors[conv.status] || '#94A3B8' }}>{tabLabels[conv.status] || conv.status}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{timeAgo(conv.updated_at)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }} disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>Page {page} of {totalPages}</span>
          <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
