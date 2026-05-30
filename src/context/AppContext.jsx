import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { getProfile, updateProfile, logout as authLogout, onAuthStateChange } from '../utils/authService'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restaure la session Supabase au démarrage
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    // Écoute les changements de session (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfile(session.user.id)
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Silently refresh profile data
        const profile = await getProfile(session.user.id)
        setUser(profile)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback((profile) => {
    setUser(profile)
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
  }, [])

  const updateUser = useCallback(async (updates) => {
    if (!user) return
    const result = await updateProfile(user.id, updates)
    if (result.user) setUser(result.user)
    return result
  }, [user])

  const refreshUser = useCallback(async () => {
    if (!user) return
    const profile = await getProfile(user.id)
    if (profile) setUser(profile)
  }, [user])

  return (
    <AppContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
