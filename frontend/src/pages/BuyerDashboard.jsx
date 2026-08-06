import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Inbox, Leaf, Eye, FileText } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'

const navItems = [
  { key: 'requests', label: 'My Requests', icon: Inbox },
  { key: 'saved', label: 'Saved Materials', icon: Eye },
  { key: 'impact', label: 'Environmental Impact', icon: Leaf },
]

const statusVariant = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'sold' // Using 'sold' green style
  if (s === 'pending') return 'available' // Using available blue style
  if (s === 'rejected') return 'danger' // Needs a danger badge variant if added
  return 'neutral'
}

export default function BuyerDashboard() {
  const [activeNav, setActiveNav] = useState('requests')
  
  // Dummy data for visual completion
  const summary = {
    activeRequests: 4,
    savedItems: 12,
    materialsProcured: 150, // in tonnes
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
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { label: 'Active Requests', value: summary.activeRequests },
            { label: 'Saved Materials', value: summary.savedItems },
            { label: 'Tonnes Procured', value: summary.materialsProcured },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{stat.label}</p>
              <div className="mt-2 font-heading text-3xl font-extrabold text-ink">
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          {activeNav === 'requests' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">My Requests</h2>
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
                    {[
                      { id: '1', name: 'Recycled PET flakes', seller: 'EcoPlastics Inc', quantity: 200, unit: 'kg', status: 'Pending', date: '2026-08-05' },
                      { id: '2', name: 'High Grade Copper shavings', seller: 'MetalWorks Ltd', quantity: 5, unit: 'tonnes', status: 'Approved', date: '2026-08-04' },
                    ].map((req) => (
                      <tr key={req.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 font-semibold">{req.name}</td>
                        <td className="px-6 py-4">{req.seller}</td>
                        <td className="px-6 py-4">{req.quantity} {req.unit}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-ink-muted">{req.date}</td>
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
            </>
          )}

          {activeNav === 'saved' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">Saved Materials</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 's1', name: 'Industrial Wood Pallets', category: 'Wood', quantity: 50, unit: 'units', status: 'available' },
                  { id: 's2', name: 'Textile Offcuts (Cotton)', category: 'Textile', quantity: 500, unit: 'kg', status: 'available' },
                ].map((m) => (
                  <Card key={m.id} className="p-4 shadow-card">
                    <div className="relative">
                      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                        <FileText className="h-10 w-10 text-ink-faint" />
                      </div>
                    </div>
                    <h3 className="mt-3 truncate font-heading font-semibold text-ink">
                      {m.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="neutral">{m.category}</Badge>
                      <Badge variant="available">Available</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
                      <span>
                        {m.quantity} {m.unit}
                      </span>
                      <Link to={`/marketplace?item=${m.id}`}>
                        <Button size="sm" variant="secondary">View</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {activeNav === 'impact' && (
            <>
              <h2 className="font-heading text-xl font-bold text-ink">Environmental Impact</h2>
              <p className="text-sm text-ink-muted mt-1">Metrics representing your contribution to circular economy.</p>
              
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="flex flex-col items-center justify-center p-8 text-center bg-teal-900 text-white border-0 shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-heading text-2xl font-bold text-white">Sustainability Hero</h3>
                  <p className="mt-2 text-sm text-primary-100 max-w-sm">
                    By sourcing recycled materials, your company has reduced embodied carbon significantly!
                  </p>
                </Card>

                <Card className="p-8 shadow-card flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-ink">Impact Metrics</h3>
                    <p className="text-sm text-ink-muted mt-1">Based on materials procured:</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-3">
                      <span className="text-ink-muted">🌍 Landfill Diverted</span>
                      <span className="font-bold text-emerald-600">150 Tonnes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-b border-stone-100 pb-3">
                      <span className="text-ink-muted">💧 Water Saved</span>
                      <span className="font-bold text-emerald-600">~ 20,000 Liters</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">📉 Carbon Emissions Reduced</span>
                      <span className="font-bold text-emerald-600">~ 420 Tonnes CO₂</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
