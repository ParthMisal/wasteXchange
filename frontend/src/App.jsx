import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import UploadMaterial from './pages/UploadMaterial.jsx'
import Marketplace from './pages/Marketplace.jsx'
import MatchResults from './pages/MatchResults.jsx'
import RequestDetail from './pages/RequestDetail.jsx'
import { useAuth } from './context/AuthContext.jsx'

function Placeholder({ title }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">This page is under construction.</p>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard/seller"
        element={
          isAuthenticated ? <SellerDashboard /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/dashboard/seller/upload"
        element={
          isAuthenticated ? <UploadMaterial /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/marketplace"
        element={
          isAuthenticated ? <Marketplace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/match-results"
        element={
          isAuthenticated ? <MatchResults /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/requests/:id"
        element={
          isAuthenticated ? <RequestDetail /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}