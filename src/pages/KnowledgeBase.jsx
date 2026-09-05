import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getArticles, createArticle, publishArticle, archiveArticle, searchArticles } from '../services/knowledgeBase';

const statusStyle = {
  DRAFT: { background: '#FFFBEB', color: '#92400E' },
  PUBLISHED: { background: '#ECFDF5', color: '#065F46' },
  ARCHIVED: { background: '#F9FAFB', color: '#4B5563' },
  Draft: { background: '#FFFBEB', color: '#92400E' },
  Published: { background: '#ECFDF5', color: '#065F46' },
  Archived: { background: '#F9FAFB', color: '#4B5563' },
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTenant, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (creating || !currentTenant) return;
    setCreating(true);
    try {
      await createArticle(currentTenant.id, {
        title: 'Untitled Article',
        content: '',
        category: 'General',
        owner_id: user?.id,
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishArticle(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveArticle(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentTenant) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a workspace to view the knowledge base.</div>;
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Knowledge Base</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{totalCount} articles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ borderRadius: 9999, height: 42, paddingLeft: 40, minWidth: 240 }} />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }} disabled={creating} onClick={handleCreate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {creating ? 'Creating...' : 'New Article'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {articles.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', gridColumn: '1 / -1' }}>No articles found.</div>
          )}
          {articles.map((article) => (
            <div key={article.id} className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge" style={{ fontSize: '0.62rem' }}>{article.category || 'General'}</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...(statusStyle[article.status] || statusStyle.DRAFT) }}>{article.status}</span>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{article.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{timeAgo(article.updated_at)}</span>
                </div>
                <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'monospace' }}>v{article.version || 1}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {article.status !== 'PUBLISHED' && (
                  <button className="btn-primary" style={{ fontSize: '0.66rem', padding: '0.2rem 0.5rem' }} onClick={(e) => { e.stopPropagation(); handlePublish(article.id); }}>Publish</button>
                )}
                {article.status !== 'ARCHIVED' && (
                  <button className="btn-ghost" style={{ fontSize: '0.66rem', padding: '0.2rem 0.5rem' }} onClick={(e) => { e.stopPropagation(); handleArchive(article.id); }}>Archive</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
