import React, { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ecosync_token'
const ROLE_KEY = 'ecosync_role'
const ACTIVE_ROLE_KEY = 'ecosync_active_role'
const USER_KEY = 'ecosync_user'

const sortRoles = (roles) => {
  const list = Array.isArray(roles) ? [...roles] : []
  return list.sort((a, b) => {
    if (a === b) return 0
    if (a === 'seller') return -1
    if (b === 'seller') return 1
    return 0
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(
    () => localStorage.getItem(ACTIVE_ROLE_KEY) || localStorage.getItem(ROLE_KEY) || null,
  )
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)

  const value = useMemo(() => {
    const roles = sortRoles(user?.roles?.length ? user.roles : [user?.role].filter(Boolean))
    const canSell = roles.includes('seller')
    const canBuy = roles.includes('buyer')
    const isDual = canSell && canBuy

    const effectiveRole =
      role && roles.includes(role) ? role : roles[0] || user?.role || null

    const login = (nextUser, nextToken, nextRole) => {
      const nextRoles = sortRoles(
        nextUser?.roles?.length ? nextUser.roles : [nextRole].filter(Boolean),
      )
      const defaultRole = nextRoles[0] || nextRole || 'buyer'
      setUser(nextUser)
      setToken(nextToken)
      setRole(defaultRole)
      localStorage.setItem(TOKEN_KEY, nextToken)
      localStorage.setItem(ROLE_KEY, defaultRole)
      localStorage.setItem(ACTIVE_ROLE_KEY, defaultRole)
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    }

    const setActiveRole = (nextRole) => {
      if (!roles.includes(nextRole)) return
      setRole(nextRole)
      localStorage.setItem(ACTIVE_ROLE_KEY, nextRole)
    }

    const logout = () => {
      setUser(null)
      setToken(null)
      setRole(null)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
      localStorage.removeItem(ACTIVE_ROLE_KEY)
      localStorage.removeItem(USER_KEY)
    }

    return {
      user,
      role: effectiveRole,
      roles,
      token,
      login,
      logout,
      setActiveRole,
      isDual,
      canSell,
      canBuy,
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
