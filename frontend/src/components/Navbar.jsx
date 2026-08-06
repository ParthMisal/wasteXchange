import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LogOut, Menu, X, User, Package, ShoppingBag, Repeat, ChevronDown } from 'lucide-react'
import Button from './ui/Button.jsx'

export default function Navbar() {
  const { user, roles, role, setActiveRole, logout, isAuthenticated, isDual } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  const isSeller = role === 'seller'
  const dashboardPath = isSeller ? '/dashboard/seller' : '/dashboard/buyer'

  const switchRole = (nextRole) => {
    setActiveRole(nextRole)
    setRoleMenuOpen(false)
    setIsOpen(false)
    navigate(nextRole === 'seller' ? '/dashboard/seller' : '/dashboard/buyer')
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading text-xl font-bold text-primary">
              waste<span className="text-accent">Xchange</span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                className="flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </Link>
              {!isSeller && (
                <Link
                  to="/match-results"
                  className="flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
                >
                  <Repeat className="h-4 w-4" />
                  AI Matches
                </Link>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-1.5 border border-stone-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="max-w-[140px] truncate text-xs font-semibold text-ink">
                {user?.company_name || user?.name || 'My Company'}
              </span>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 capitalize">
                {role}
              </span>
            </div>

            {isDual && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  <Repeat className="h-3.5 w-3.5 text-accent" />
                  Switch role
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {roleMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                    {roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => switchRole(r)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-stone-50 ${
                          r === role ? 'bg-primary-50 text-primary' : 'text-ink'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {r === 'seller' ? 'Seller view' : 'Buyer view'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-ink-muted hover:text-danger">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-ink-muted hover:bg-stone-50 hover:text-ink focus:outline-none"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="border-t border-stone-100 bg-white px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-3">
            <Link
              to={dashboardPath}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-ink-muted hover:text-primary"
            >
              <Package className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-ink-muted hover:text-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              Marketplace
            </Link>
            {!isSeller && (
              <Link
                to="/match-results"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-ink-muted hover:text-primary"
              >
                <Repeat className="h-4 w-4" />
                AI Matches
              </Link>
            )}

            {isDual && (
              <div className="mt-2 flex gap-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchRole(r)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      r === role
                        ? 'border-primary bg-primary text-white'
                        : 'border-stone-200 text-ink-muted'
                    }`}
                  >
                    {r === 'seller' ? 'Seller view' : 'Buyer view'}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="text-xs font-semibold text-ink-muted mb-2">Logged in as:</p>
              <p className="text-sm font-bold text-ink">{user?.company_name || user?.name || 'Company'}</p>
              <p className="text-xs text-ink-muted capitalize">
                {role} {isDual ? '· dual account' : ''}
              </p>

              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
