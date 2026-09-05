import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()

const TENANTS = [
  { id: 't1', name: 'HOYA Vision Care', slug: 'hoya' },
  { id: 't2', name: 'Acme Corp', slug: 'acme' },
]

const MOCK_USER = {
  id: 'u1',
  name: 'Shree Krishna',
  email: 'shree@hoya.com',
  role: 'TENANT_ADMIN',
  tenantId: 't1',
  tenantName: 'HOYA Vision Care',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER)
  const [tenant, setTenant] = useState(TENANTS[0])
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const switchTenant = useCallback((tenantId) => {
    const next = TENANTS.find(t => t.id === tenantId)
    if (next) {
      setTenant(next)
      setUser(prev => ({ ...prev, tenantId: next.id, tenantName: next.name }))
    }
  }, [])

  const login = useCallback(() => {
    setUser(MOCK_USER)
    setTenant(TENANTS[0])
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTenant(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, tenant, tenants: TENANTS, isAuthenticated, switchTenant, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
