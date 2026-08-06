import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LogOut, Menu, X, User, Package, ShoppingBag } from 'lucide-react'
import Button from './ui/Button.jsx'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  const isSeller = user?.role === 'seller'

  return (
    <nav className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading text-xl font-bold text-primary">
              waste<span className="text-accent">Xchange</span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {isSeller ? (
                <>
                  <Link
                    to="/dashboard/seller"
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
                    Browse Marketplace
                  </Link>
                </>
              ) : (
                <Link
                  to="/marketplace"
                  className="flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Marketplace
                </Link>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-1.5 border border-stone-100">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-ink">
                {user?.company_name || user?.name || 'My Company'}
              </span>
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 capitalize">
                {user?.role}
              </span>
            </div>

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
            {isSeller ? (
              <>
                <Link
                  to="/dashboard/seller"
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
                  Browse Marketplace
                </Link>
              </>
            ) : (
              <Link
                to="/marketplace"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-ink-muted hover:text-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </Link>
            )}

            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="text-xs font-semibold text-ink-muted mb-2">Logged in as:</p>
              <p className="text-sm font-bold text-ink">{user?.company_name || user?.name || 'Company'}</p>
              <p className="text-xs text-ink-muted capitalize">{user?.role}</p>

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
