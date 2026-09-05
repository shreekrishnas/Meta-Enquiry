import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Atmosphere from '../components/Atmosphere'

export default function TenantSetup() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({ name, slug })
        .select()
        .single()

      if (tenantError) throw tenantError

      const { error: memberError } = await supabase
        .from('tenant_memberships')
        .insert({ user_id: user.id, tenant_id: tenant.id, role: 'TENANT_ADMIN' })

      if (memberError) throw memberError

      localStorage.setItem('currentTenantId', tenant.id)
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Atmosphere />
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        borderRadius: '1.5rem',
        background: 'var(--surface-card)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '0.875rem',
            background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z" />
            </svg>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Set Up Your Workspace
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Create a new workspace to get started.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            color: '#DC2626',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <input
            type="text"
            placeholder="Workspace Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="glass-input"
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Slug (e.g. my-workspace)"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            required
            className="glass-input"
            style={inputStyle}
          />
          <button type="submit" disabled={submitting} className="btn-primary" style={btnStyle}>
            {submitting ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--border-input)',
  background: 'var(--surface-input)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  boxSizing: 'border-box',
}

const btnStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.75rem',
  border: 'none',
  background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  marginTop: '0.25rem',
}
