import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setSubmitting(true)
    try {
      await signUp(email, password, fullName)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.6875rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-input)',
    background: 'var(--surface-input)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F1F5F9 0%, #EEF2FF 30%, #F5F3FF 60%, #F1F5F9 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-5%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="page-enter" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(226,232,240,0.6)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 0 40px rgba(99,102,241,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Trilliant</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '-1px', letterSpacing: '0.02em' }}>Operations Hub</div>
          </div>
        </div>

        <div className="tab-group" style={{ width: '100%', marginBottom: '1.5rem' }}>
          {['signin', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`tab-item${tab === t ? ' active' : ''}`}
              style={{ flex: 1 }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-md)', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Email</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6875rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Full Name</label>
              <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Email</label>
              <input type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Confirm Password</label>
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)' }} onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6875rem', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.04)', border: '1px dashed rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.125rem' }}>Demo Credentials</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>demo@trilliant.app / Trilliant@2024</div>
        </div>
      </div>
    </div>
  )
}
