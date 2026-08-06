import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Inbox, Eye, Leaf, Sparkles, FileText, MapPin, Repeat, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import MatchScoreBadge from '../components/ui/MatchScoreBadge.jsx'
import { getBuyerDashboard } from '../api/dashboard.js'
import { unsaveMaterial } from '../api/materials.js'

const navItems = [
  { key: 'requests', label: 'My Requests', icon: Inbox },
  { key: 'saved', label: 'Saved Materials', icon: Eye },
  { key: 'matches', label: 'AI Recommendations', icon: Sparkles },
  { key: 'impact', label: 'Environmental Impact', icon: Leaf },
]

const statusVariant = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'completed') return 'sold'
  if (s === 'pending') return 'available'
  if (s === 'accepted') return 'accepted'
  if (s === 'in_transit') return 'warning'
  if (s === 'rejected') return 'neutral'
  return 'neutral'
}

const firstImage = (m) =>
  m?.imageUrl ||
  m?.image ||
  (Array.isArray(m?.images) && m.images.length ? m.images[0] : null)

export default function BuyerDashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('requests')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unsavingId, setUnsavingId] = useState(null)

  const [matchForm, setMatchForm] = useState({
    category: '',
    quantity: '',
    unit: 'kg',
    location: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getBuyerDashboard()
      setData(res)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const summary = data?.summary || {
    activeRequests: 0,
    savedItems: 0,
    tonnesProcured: 0,
    totalRequests: 0,
  }
  const requests = data?.requests || []
  const saved = data?.savedMaterials || []
  const recommendations = data?.recommendations || []
  const impact = data?.impact || {}

  const handleUnsave = async (id) => {
    setUnsavingId(id)
    try {
      await unsaveMaterial(id)
      fetchData()
    } catch {
      // ignore
    } finally {
      setUnsavingId(null)
    }
  }

  const handleMatchSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (matchForm.category) params.set('category', matchForm.category)
    if (matchForm.quantity) params.set('quantity', matchForm.quantity)
    if (matchForm.unit) params.set('unit', matchForm.unit)
    if (matchForm.location) params.set('location', matchForm.location)
    navigate(`/match-results?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-surface">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-200 bg-white p-6 shrink-0">
        <Link to="/marketplace" className="block">
          <Button className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Find Materials
          </Button>
        </Link>

        <nav className="mt-6 flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0 md:space-y-1">
          {navItems.map((item) => {
            const active = activeNav === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveNav(item.key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap md:w-full ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-ink-muted hover:bg-stone-50 hover:text-ink'
                }`}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-ink">Buyer Dashboard</h1>
            <p className="text-sm text-ink-muted">Track your material requests and procurement impact.</p>
          </div>
          <Link
            to="/match-results"
            className="shrink-0 rounded-xl border border-accent/30 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-600 transition-colors hover:bg-accent-50"
          >
            <Sparkles className="mr-1.5 inline h-4 w-4" />
            Find AI Matches
          </Link>
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: 'Active Requests', value: summary.activeRequests ?? 0 },
            { label: 'Saved Materials', value: summary.savedItems ?? 0 },
            { label: 'Tonnes Procured', value: summary.tonnesProcured ?? 0 },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{stat.label}</p>
              <div
                className={`mt-2 font-heading text-3xl font-extrabold text-ink ${
                  loading ? 'animate-pulse text-transparent' : ''
                }`}
              >
                {loading ? '0' : stat.value}
              </div>
            </Card>
          ))}
        </div>

        {data?.insight && !loading && (
          <Card className="mt-6 flex items-center gap-3 border-accent/20 bg-accent-50/60 p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm text-ink">
              <span className="font-semibold text-accent-600">AI Insight: </span>
              {data.insight}
            </p>
          </Card>
        )}

        <section className="mt-10">
          {activeNav === 'requests' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">My Requests</h2>
              {loading ? (
                <div className="mt-6 h-40 animate-pulse rounded-xl bg-stone-100" />
              ) : requests.length === 0 ? (
                <Card className="mt-6 flex flex-col items-center justify-center py-16 text-center">
                  <Inbox className="h-12 w-12 text-ink-faint" />
                  <p className="mt-4 font-medium text-ink">No requests yet</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Browse the marketplace and request surplus materials.
                  </p>
                  <Link to="/marketplace" className="mt-5">
                    <Button size="sm">Browse Marketplace</Button>
                  </Link>
                </Card>
              ) : (
                <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm text-ink">
                    <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      <tr>
                        <th className="px-6 py-3.5">Material</th>
                        <th className="px-6 py-3.5">Seller</th>
                        <th className="px-6 py-3.5">Qty Requested</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Date</th>
                        <th className="px-6 py-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-stone-50">
                          <td className="px-6 py-4 font-semibold">{req.material_name}</td>
                          <td className="px-6 py-4">{req.seller}</td>
                          <td className="px-6 py-4">
                            {req.quantity} {req.unit}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={statusVariant(req.status)}>{req.status_label || req.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-ink-muted">
                            {new Date(req.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link to={`/requests/${req.id}`}>
                              <Button size="sm" variant="secondary">View</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeNav === 'saved' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">Saved Materials</h2>
              {loading ? (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-56 animate-pulse rounded-xl bg-stone-100" />
                  ))}
                </div>
              ) : saved.length === 0 ? (
                <Card className="mt-6 flex flex-col items-center justify-center py-16 text-center">
                  <Eye className="h-12 w-12 text-ink-faint" />
                  <p className="mt-4 font-medium text-ink">No saved materials</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Bookmark materials you're interested in from the marketplace.
                  </p>
                  <Link to="/marketplace" className="mt-5">
                    <Button size="sm" variant="secondary">Explore</Button>
                  </Link>
                </Card>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {saved.map((m) => {
                    const image = firstImage(m)
                    return (
                      <Card key={m.id} className="p-4 shadow-card">
                        <div className="relative">
                          <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                            {image ? (
                              <img src={image} alt={m.name} className="h-full w-full object-cover" />
                            ) : (
                              <FileText className="h-10 w-10 text-ink-faint" />
                            )}
                          </div>
                          <button
                            type="button"
                            title="Remove from saved"
                            disabled={unsavingId === m.id}
                            onClick={() => handleUnsave(m.id)}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-muted shadow-sm transition-colors hover:text-danger disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <h3 className="mt-3 truncate font-heading font-semibold text-ink">{m.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="neutral">{m.category}</Badge>
                          <Badge variant={statusVariant(m.status)}>{m.status}</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
                          <span className="font-semibold text-accent">
                            ₹{m.price} / {m.unit || 'unit'}
                          </span>
                          <span>
                            {m.quantity} {m.unit}
                          </span>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {activeNav === 'matches' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">AI Matchmaking</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ranked by deal quality and distance using our AI engine.
              </p>

              <Card className="mt-6 p-5">
                <form onSubmit={handleMatchSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                  <div className="sm:col-span-1">
                    <Select
                      value={matchForm.category}
                      onChange={(e) => setMatchForm((p) => ({ ...p, category: e.target.value }))}
                      label="Category"
                    >
                      <option value="">Any</option>
                      {['Plastic', 'Metal', 'Chemical', 'Textile', 'Wood', 'E-waste', 'Paper', 'Glass', 'Rubber'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      label="Quantity"
                      placeholder="e.g. 500"
                      value={matchForm.quantity}
                      onChange={(e) => setMatchForm((p) => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Select
                      value={matchForm.unit}
                      onChange={(e) => setMatchForm((p) => ({ ...p, unit: e.target.value }))}
                      label="Unit"
                    >
                      <option value="kg">kg</option>
                      <option value="tonnes">tonnes</option>
                      <option value="units">units</option>
                      <option value="litres">litres</option>
                    </Select>
                  </div>
                  <div className="sm:col-span-1">
                    <Input
                      label="Near (city)"
                      placeholder="e.g. Pune"
                      value={matchForm.location}
                      onChange={(e) => setMatchForm((p) => ({ ...p, location: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end sm:col-span-1">
                    <Button type="submit" className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find Matches
                    </Button>
                  </div>
                </form>
              </Card>

              <h3 className="mt-8 font-heading text-lg font-bold text-ink">
                Recommended for you
              </h3>
              {loading ? (
                <div className="mt-4 space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-stone-100" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <Card className="mt-4 flex flex-col items-center justify-center py-12 text-center">
                  <Repeat className="h-10 w-10 text-ink-faint" />
                  <p className="mt-3 text-sm text-ink-muted">
                    Create or accept a request to unlock personalised recommendations.
                  </p>
                </Card>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommendations.map((rec) => (
                    <Card key={rec.material_id} className="flex items-center gap-4 p-4 shadow-card">
                      <MatchScoreBadge score={rec.match_score} size={52} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{rec.material_name}</p>
                        <p className="text-xs text-ink-muted">
                          {rec.seller_name} · {rec.distance_km != null ? `${Math.round(rec.distance_km)} km away` : 'distance unavailable'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-semibold text-accent">₹{rec.price} / {rec.unit}</p>
                        <Link to="/marketplace">
                          <Button size="sm" variant="secondary" className="mt-1">View</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeNav === 'impact' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">Environmental Impact</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Metrics representing your contribution to the circular economy.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="flex flex-col items-center justify-center bg-teal-900 p-8 text-center text-white shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-heading text-2xl font-bold text-white">Sustainability Hero</h3>
                  <p className="mt-2 text-sm text-primary-100 max-w-sm">
                    {loading
                      ? 'Loading impact…'
                      : `You have diverted ${impact.tonnes_diverted ?? 0} tonnes of industrial material from landfill.`}
                  </p>
                </Card>

                <Card className="flex flex-col justify-between p-8 shadow-card">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-ink">Impact Metrics</h3>
                    <p className="mt-1 text-sm text-ink-muted">Based on materials procured:</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm">
                      <span className="text-ink-muted">Landfill Diverted</span>
                      <span className="font-bold text-emerald-600">{impact.tonnes_diverted ?? 0} Tonnes</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm">
                      <span className="text-ink-muted">Water Saved</span>
                      <span className="font-bold text-emerald-600">
                        ~ {((impact.co2_reduced_kg ?? 0) * 13).toLocaleString()} Litres
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm">
                      <span className="text-ink-muted">Trees Equivalent</span>
                      <span className="font-bold text-emerald-600">~ {impact.trees_equivalent ?? 0} Trees</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">Carbon Emissions Reduced</span>
                      <span className="font-bold text-emerald-600">
                        ~ {(impact.co2_reduced_tonnes ?? 0).toLocaleString()} Tonnes CO₂
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="mt-6 flex items-center gap-3 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-ink-muted">
                  Impact is calculated from completed requests using category-specific
                  carbon factors (kg CO₂e per tonne diverted).
                </p>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
