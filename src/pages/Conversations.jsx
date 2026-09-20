import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getConversations } from '../services/conversations';

const tabs = ['All', 'NEW', 'IN_PROGRESS', 'WAITING_FOR_POC', 'RESOLVED'];
const tabLabels = { All: 'All', NEW: 'New', IN_PROGRESS: 'In Progress', WAITING_FOR_POC: 'Under Review', RESOLVED: 'Resolved' };
const statusColors = { NEW: '#94A3B8', IN_PROGRESS: '#3B82F6', WAITING_FOR_POC: '#8B5CF6', RESOLVED: '#10B981', POC_APPROVED: '#10B981', ESCALATED: '#EF4444', CHANGES_REQUESTED: '#F59E0B' };
const priorityDot = { HIGH: '#EF4444', CRITICAL: '#DC2626', NORMAL: '#F59E0B', LOW: '#94A3B8', high: '#EF4444', medium: '#F59E0B', low: '#94A3B8' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
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

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeTab, search]);

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Conversations</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>{totalCount} total</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200 }} />
          </div>
        </div>
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

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No conversations found.</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', padding: '0.625rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card-header)' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Updated</span>
            </div>
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => navigate(`/conversations/${conv.id}`)} className="table-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px', padding: '0.625rem 1rem', cursor: 'pointer', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityDot[conv.priority] || '#94A3B8', flexShrink: 0 }} />
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-primary-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 600, flexShrink: 0 }}>{getInitials(conv.customers?.display_name)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.customers?.display_name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.channel || ''}</div>
                  </div>
                </div>
                <span className="badge" style={{ width: 'fit-content' }}>{conv.category || 'General'}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.375rem', borderRadius: 9999, width: 'fit-content', background: `${statusColors[conv.status] || '#94A3B8'}14`, color: statusColors[conv.status] || '#94A3B8' }}>{tabLabels[conv.status] || conv.status}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{timeAgo(conv.updated_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
