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
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-input)',
    background: 'var(--surface-input)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F8FAFC 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
              <path d="M12 2l1.09 3.41L16.5 4.5l-1.41 3.41L18.5 9l-3.41 1.09L16.5 13.5l-3.41-1.41L12 15.5l-1.09-3.41L7.5 13.5l1.41-3.41L5.5 9l3.41-1.09L7.5 4.5l3.41 1.41z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Trilliant</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '-2px' }}>Operations Hub</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px', marginBottom: '1.25rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
          {['signin', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none',
                background: tab === t ? 'var(--surface-card)' : 'transparent',
                color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
                boxShadow: tab === t ? 'var(--shadow-xs)' : 'none',
              }}
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
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={inputStyle} />
            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.625rem', marginTop: '0.25rem' }}>
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Demo: demo@trilliant.app / Trilliant@2024
        </div>
      </div>
    </div>
  )
}
