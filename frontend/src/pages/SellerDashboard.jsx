import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Inbox, Leaf, Pencil, Trash2, Plus } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { getMyListings, getMyListingsSummary, deleteMaterial } from '../api/materials.js'

const navItems = [
  { key: 'listings', label: 'My Listings', icon: Package },
  { key: 'requests', label: 'Requests Received', icon: Inbox },
  { key: 'carbon', label: 'Carbon Impact', icon: Leaf },
]

const statusVariant = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'sold') return 'sold'
  if (s === 'reserved') return 'reserved'
  return 'available'
}

const toListings = (data) => {
  if (Array.isArray(data)) return data
  return data?.listings || data?.materials || []
}

const toSummary = (data = {}) => ({
  totalListings: data.totalListings ?? data.total_listings ?? data.total ?? 0,
  pendingRequests:
    data.pendingRequests ?? data.pending_requests ?? data.pending ?? 0,
  totalTonnes: data.totalTonnes ?? data.total_tonnes ?? data.tonnes ?? 0,
})

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString()
}

const firstImage = (m) =>
  m?.imageUrl ||
  m?.image ||
  (Array.isArray(m?.images) && m.images.length ? m.images[0] : null)

export default function SellerDashboard() {
  const [activeNav, setActiveNav] = useState('listings')
  const [listings, setListings] = useState([])
  const [summary, setSummary] = useState({
    totalListings: 0,
    pendingRequests: 0,
    totalTonnes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [data, summaryData] = await Promise.all([
        getMyListings(),
        getMyListingsSummary(),
      ])
      setListings(toListings(data))
      setSummary(toSummary(summaryData))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load your listings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    setDeletingId(id)
    try {
      await deleteMaterial(id)
      setListings((prev) => prev.filter((m) => m.id !== id))
      setSummary((s) => ({ ...s, totalListings: Math.max(0, s.totalListings - 1) }))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete listing.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-stone-200 bg-white p-6">
        <Link to="/dashboard/seller" className="font-heading text-xl font-bold text-primary">
          Eco-Sync
        </Link>

        <Link to="/dashboard/seller/upload" className="mt-6">
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Upload New Material
          </Button>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const active = activeNav === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveNav(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary'
                    : 'text-ink-muted hover:bg-stone-50 hover:text-ink'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <h1 className="font-heading text-2xl font-bold text-ink">Seller Dashboard</h1>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Total Listings', value: summary.totalListings },
            { label: 'Pending Requests', value: summary.pendingRequests },
            { label: 'Total Tonnes Listed', value: summary.totalTonnes },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <p className="text-sm text-ink-muted">{stat.label}</p>
              <div
                className={`mt-1 font-heading text-3xl font-bold text-ink ${
                  loading ? 'animate-pulse text-transparent' : ''
                }`}
              >
                {loading ? '0' : stat.value}
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold text-ink">My Listings</h2>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4">
                  <div className="h-40 animate-pulse rounded-lg bg-stone-100" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-stone-100" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-stone-100" />
                    <div className="h-4 w-16 animate-pulse rounded bg-stone-100" />
                  </div>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card className="mt-6 flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-ink-faint" />
              <p className="mt-4 font-medium text-ink">
                No listings yet - upload your first material
              </p>
              <Link to="/dashboard/seller/upload" className="mt-5">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((m) => {
                const image = firstImage(m)
                const status = String(m?.status || 'available').toLowerCase()
                return (
                  <Card key={m.id} className="p-4 shadow-card">
                    <div className="relative">
                      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                        {image ? (
                          <img
                            src={image}
                            alt={m.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-10 w-10 text-ink-faint" />
                        )}
                      </div>
                      <div className="absolute right-2 top-2 flex gap-1.5">
                        <Link
                          to={`/dashboard/seller/upload?edit=${m.id}`}
                          title="Edit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-muted shadow-sm transition-colors hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          title="Delete"
                          disabled={deletingId === m.id}
                          onClick={() => handleDelete(m.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-muted shadow-sm transition-colors hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 truncate font-heading font-semibold text-ink">
                      {m.name || 'Untitled material'}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="neutral">{m.category || 'Other'}</Badge>
                      <Badge variant={statusVariant(status)}>{status}</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
                      <span>
                        {m.quantity != null ? m.quantity : 0}
                        {m.unit ? ` ${m.unit}` : ''}
                      </span>
                      {formatDate(m.datePosted || m.createdAt) && (
                        <span>{formatDate(m.datePosted || m.createdAt)}</span>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}