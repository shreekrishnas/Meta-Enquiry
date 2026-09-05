import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [tenants, setTenants] = useState([])
  const [currentTenant, setCurrentTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async (authUser) => {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (!userData) return

    setUser(userData)

    const { data: memberships } = await supabase
      .from('tenant_memberships')
      .select('*, tenants(*)')
      .eq('user_id', userData.id)

    const tenantList = (memberships || []).map(m => ({
      ...m.tenants,
      role: m.role,
      membershipId: m.id,
    }))
    setTenants(tenantList)

    const savedTenantId = localStorage.getItem('currentTenantId')
    const saved = tenantList.find(t => t.id === savedTenantId)
    setCurrentTenant(saved || tenantList[0] || null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        fetchUserData(s.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        fetchUserData(s.user).finally(() => setLoading(false))
      } else {
        setUser(null)
        setTenants([])
        setCurrentTenant(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    const { error: insertError } = await supabase
      .from('users')
      .insert({ auth_id: data.user.id, email, full_name: fullName })

    if (insertError) throw insertError
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('currentTenantId')
  }, [])

  const switchTenant = useCallback((tenantId) => {
    const next = tenants.find(t => t.id === tenantId)
    if (next) {
      setCurrentTenant(next)
      localStorage.setItem('currentTenantId', tenantId)
    }
  }, [tenants])

  return (
    <AuthContext.Provider value={{ user, session, tenants, currentTenant, loading, signUp, signIn, signOut, switchTenant }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
