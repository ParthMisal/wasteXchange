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
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard/seller"
        element={
          <ProtectedRoute>
            <Layout>
              <SellerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/seller/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <UploadMaterial />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Layout>
              <Marketplace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/match-results"
        element={
          <ProtectedRoute>
            <Layout>
              <MatchResults />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}