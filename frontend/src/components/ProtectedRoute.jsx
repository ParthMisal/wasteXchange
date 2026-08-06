import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: activeRole, roles } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && !roles.includes(role)) {
    const fallback = roles.includes('seller') ? '/dashboard/seller' : '/dashboard/buyer'
    return <Navigate to={activeRole === 'seller' ? '/dashboard/seller' : fallback} replace />
  }

  return children
}
