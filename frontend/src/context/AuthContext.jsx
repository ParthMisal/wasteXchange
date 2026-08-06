import React, { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ecosync_token'
const ROLE_KEY = 'ecosync_role'
const USER_KEY = 'ecosync_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)

  const value = useMemo(() => {
    const login = (nextUser, nextToken, nextRole) => {
      setUser(nextUser)
      setToken(nextToken)
      setRole(nextRole)
      localStorage.setItem(TOKEN_KEY, nextToken)
      localStorage.setItem(ROLE_KEY, nextRole)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    }

    const logout = () => {
      setUser(null)
      setToken(null)
      setRole(null)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(USER_KEY)
    }

    return {
      user,
      role,
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }
  }, [user, role, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}