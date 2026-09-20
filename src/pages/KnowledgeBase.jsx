import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getArticles, createArticle, publishArticle, archiveArticle, searchArticles } from '../services/knowledgeBase';

const statusStyle = {
  DRAFT: { background: 'rgba(245,158,11,0.08)', color: '#D97706', border: '1px solid rgba(245,158,11,0.15)' },
  PUBLISHED: { background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.15)' },
  ARCHIVED: { background: 'rgba(148,163,184,0.08)', color: '#64748B', border: '1px solid rgba(148,163,184,0.15)' },
  Draft: { background: 'rgba(245,158,11,0.08)', color: '#D97706', border: '1px solid rgba(245,158,11,0.15)' },
  Published: { background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.15)' },
  Archived: { background: 'rgba(148,163,184,0.08)', color: '#64748B', border: '1px solid rgba(148,163,184,0.15)' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function KnowledgeBase() {
  const { currentTenant, user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentTenant) return;
    setLoading(true);
    setError(null);
    try {
      if (search.trim()) {
        const results = await searchArticles(currentTenant.id, search.trim());
        setArticles(results || []);
        setTotalCount(results?.length || 0);
      } else {
        const result = await getArticles(currentTenant.id);
        setArticles(result.data || []);
        setTotalCount(result.count || 0);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [currentTenant, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (creating || !currentTenant) return;
    setCreating(true);
    try {
      await createArticle(currentTenant.id, { title: 'Untitled Article', content: '', category: 'General', owner_id: user?.id });
      await fetchData();
    } catch (err) { setError(err.message); }
    finally { setCreating(false); }
  };

  const handlePublish = async (id) => {
    try { await publishArticle(id); await fetchData(); }
    catch (err) { setError(err.message); }
  };

  const handleArchive = async (id) => {
    try { await archiveArticle(id); await fetchData(); }
    catch (err) { setError(err.message); }
  };

  if (!currentTenant) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Select a workspace.</div>;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>Knowledge Base</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{totalCount} articles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 34, width: 200 }} />
          </div>
          <button className="btn-primary" disabled={creating} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {creating ? 'Creating...' : 'New Article'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
      ) : (
        <div className="premium-table">
          <div className="premium-table-header" style={{ gridTemplateColumns: '2.5fr 1fr 1fr 120px' }}>
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>
          {articles.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No articles found.</div>
          ) : articles.map((article) => {
            const st = statusStyle[article.status] || statusStyle.DRAFT;
            return (
              <div key={article.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 120px', padding: '0.75rem 1.25rem', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem', paddingLeft: '1.5rem' }}>{timeAgo(article.updated_at)} · v{article.version || 1}</div>
                </div>
                <span className="badge" style={{ width: 'fit-content' }}>{article.category || 'General'}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '0.1875rem 0.5rem', borderRadius: 9999, width: 'fit-content', ...st }}>{article.status}</span>
                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                  {article.status !== 'PUBLISHED' && <button className="btn-ghost" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }} onClick={() => handlePublish(article.id)}>Publish</button>}
                  {article.status !== 'ARCHIVED' && <button className="btn-ghost" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }} onClick={() => handleArchive(article.id)}>Archive</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
