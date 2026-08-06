import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import * as authApi from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const signupSuccess = Boolean(location.state?.signupSuccess)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const roles = res.user?.roles?.length ? res.user.roles : [res.user?.role].filter(Boolean)
      const role = roles.includes('seller') ? 'seller' : roles[0] || 'buyer'
      login(res.user, res.access_token, role)
      const from = location.state?.from?.pathname
      const defaultPath =
        role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'
      navigate(from || defaultPath, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 block text-center font-heading text-2xl font-bold text-primary"
        >
          waste<span className="text-accent">Xchange</span>
        </Link>
        <Card>
          <h1 className="font-heading text-2xl font-bold text-ink">Log in</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Access your account to trade industrial surplus.
          </p>
          {signupSuccess && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Account created successfully! Please log in.
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-800">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}