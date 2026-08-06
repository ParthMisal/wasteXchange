import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import LocationInput from '../components/LocationInput.jsx'
import * as authApi from '../api/auth.js'

const ROLE_OPTIONS = [
  { value: 'seller', label: 'Seller', hint: 'List surplus materials' },
  { value: 'buyer', label: 'Buyer', hint: 'Source recycled materials' },
  { value: 'both', label: 'Buyer & Seller', hint: 'One account, both dashboards' },
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
  const [coords, setCoords] = useState(null)
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
      const payload = {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
        city: form.city,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      }
      if (form.role === 'both') {
        payload.roles = ['buyer', 'seller']
      } else {
        payload.role = form.role
      }
      await authApi.signup(payload)
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
          waste<span className="text-accent">Xchange</span>
        </Link>
        <Card>
          <h1 className="font-heading text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Join the marketplace for industrial surplus. One account can buy and sell.
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
              placeholder="At least 8 characters"
            />
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">I want to</span>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const active = form.role === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary-50 ring-1 ring-primary'
                          : 'border-stone-300 hover:border-primary'
                      }`}
                    >
                      <span>
                        <span className={`block text-sm font-medium ${active ? 'text-primary' : 'text-ink'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-ink-faint">{opt.hint}</span>
                      </span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          active ? 'border-primary bg-primary' : 'border-stone-300'
                        }`}
                      >
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <LocationInput
              value={form.city}
              onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
              onLocationChange={(loc) => setCoords(loc)}
              required
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
