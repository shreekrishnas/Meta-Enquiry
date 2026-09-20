import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getArticles, createArticle, publishArticle, archiveArticle, searchArticles } from '../services/knowledgeBase';

const statusStyle = {
  DRAFT: { background: '#FFFBEB', color: '#92400E' },
  PUBLISHED: { background: '#ECFDF5', color: '#065F46' },
  ARCHIVED: { background: '#F1F5F9', color: '#475569' },
  Draft: { background: '#FFFBEB', color: '#92400E' },
  Published: { background: '#ECFDF5', color: '#065F46' },
  Archived: { background: '#F1F5F9', color: '#475569' },
};

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' };

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
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Knowledge Base</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0' }}>{totalCount} articles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200 }} />
          </div>
          <button className="btn-primary" disabled={creating} onClick={handleCreate}>
            {creating ? 'Creating...' : 'New Article'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.8125rem' }}>{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Loading...</div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', padding: '0.625rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card-header)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Title</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</span>
          </div>
          {articles.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No articles found.</div>
          ) : articles.map((article) => {
            const st = statusStyle[article.status] || statusStyle.DRAFT;
            return (
              <div key={article.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', padding: '0.625rem 1rem', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(article.updated_at)} &middot; v{article.version || 1}</div>
                </div>
                <span className="badge" style={{ width: 'fit-content' }}>{article.category || 'General'}</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.375rem', borderRadius: 9999, width: 'fit-content', ...st }}>{article.status}</span>
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                  {article.status !== 'PUBLISHED' && <button className="btn-ghost" style={{ fontSize: '0.6875rem' }} onClick={() => handlePublish(article.id)}>Publish</button>}
                  {article.status !== 'ARCHIVED' && <button className="btn-ghost" style={{ fontSize: '0.6875rem' }} onClick={() => handleArchive(article.id)}>Archive</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
