import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authGetSession, authLogout, authUpdateProfile } from '../utils/authStore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = authGetSession()
    if (session) setUser(session)
    setLoading(false)
  }, [])

  const login = useCallback((userData) => { setUser(userData) }, [])

  const logout = useCallback(() => { authLogout(); setUser(null) }, [])

  const updateUser = useCallback((updates) => {
    if (!user) return
    const result = authUpdateProfile(user.id, updates)
    if (result.user) setUser(result.user)
    return result
  }, [user])

  const refreshUser = useCallback(() => {
    const session = authGetSession()
    if (session) setUser(session)
  }, [])

  return (
    <AppContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
