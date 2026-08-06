import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import * as authApi from '../api/auth.js'

const ROLE_OPTIONS = [
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
]

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    role: 'seller',
    city: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const setRole = (role) => {
    setForm((prev) => ({ ...prev, role }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.signup(form)
      navigate('/login', { state: { signupSuccess: true } })
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Signup failed. Please try again.',
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
          Eco-Sync
        </Link>
        <Card>
          <h1 className="font-heading text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Join the marketplace for industrial surplus.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="companyName"
              name="companyName"
              label="Company name"
              required
              value={form.companyName}
              onChange={handleChange}
              placeholder="Acme Industries"
            />
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
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">I am a</span>
              <div className="flex gap-4">
                {ROLE_OPTIONS.map((opt) => {
                  const active = form.role === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-white'
                          : 'border border-stone-300 text-ink-muted hover:border-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <Input
              id="city"
              name="city"
              label="City / Location"
              required
              value={form.city}
              onChange={handleChange}
              placeholder="Mumbai"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}