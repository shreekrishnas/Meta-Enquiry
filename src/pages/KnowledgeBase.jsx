import React from 'react';

const articles = [
  { id: 1, title: 'Returns & Refund Policy', category: 'Policies', status: 'Published', author: 'Alex M.', updated: '2 days ago', version: 'v2.3' },
  { id: 2, title: 'Shipping Times & Tracking', category: 'Shipping', status: 'Published', author: 'Jamie L.', updated: '1 week ago', version: 'v1.8' },
  { id: 3, title: 'Enterprise Pricing Guide', category: 'Billing', status: 'Draft', author: 'Sam K.', updated: '3 hours ago', version: 'v3.0-draft' },
  { id: 4, title: 'API Integration Troubleshooting', category: 'Technical', status: 'Published', author: 'Alex M.', updated: '5 days ago', version: 'v4.1' },
  { id: 5, title: 'Account Cancellation Process', category: 'Policies', status: 'Archived', author: 'Jamie L.', updated: '1 month ago', version: 'v1.2' },
  { id: 6, title: 'Product Catalog Sync Guide', category: 'Technical', status: 'Draft', author: 'Sam K.', updated: '1 day ago', version: 'v2.0-draft' },
];

const statusStyle = {
  Draft: { background: '#FFFBEB', color: '#92400E' },
  Published: { background: '#ECFDF5', color: '#065F46' },
  Archived: { background: '#F9FAFB', color: '#4B5563' },
};

export default function KnowledgeBase() {
  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Knowledge Base</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{articles.length} articles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="glass-input" placeholder="Search articles..." style={{ borderRadius: 9999, height: 42, paddingLeft: 40, minWidth: 240 }} />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Article
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {articles.map((article) => (
          <div key={article.id} className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ fontSize: '0.62rem' }}>{article.category}</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 9999, ...statusStyle[article.status] }}>{article.status}</span>
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>{article.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{article.author}</span> &middot; <span>{article.updated}</span>
              </div>
              <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{article.version}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
