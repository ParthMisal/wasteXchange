import React, { useEffect, useState } from 'react'
import { ShieldCheck, Package, Search } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import { searchMaterials } from '../api/materials.js'

const categories = ['All', 'Plastic', 'Metal', 'Chemical', 'Textile', 'Wood', 'E-waste']

const sortOptions = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  distance: 'Distance',
}

const normalize = (data) => {
  if (Array.isArray(data)) return data
  return data?.materials || data?.listings || []
}

export default function Marketplace() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minQty, setMinQty] = useState('')
  const [maxQty, setMaxQty] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    let cancelled = false
    const params = {}
    if (debouncedQuery.trim()) params.query = debouncedQuery.trim()
    if (category !== 'All') params.category = category
    if (sort !== 'newest') params.sort = sort
    if (minPrice !== '') params.minPrice = minPrice
    if (maxPrice !== '') params.maxPrice = maxPrice
    if (minQty !== '') params.minQuantity = minQty
    if (maxQty !== '') params.maxQuantity = maxQty
    if (verifiedOnly) params.verifiedOnly = true

    setLoading(true)
    setError('')
    searchMaterials(params)
      .then((data) => {
        if (!cancelled) setMaterials(normalize(data))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message || err.message || 'Failed to load materials.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, category, sort, minPrice, maxPrice, minQty, maxQty, verifiedOnly])

  const firstImage = (m) =>
    m?.imageUrl || m?.image || (Array.isArray(m?.images) && m.images.length ? m.images[0] : null)

  return (
    <div className="min-h-screen bg-surface px-6 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Marketplace</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            className="pl-9"
            placeholder="Search materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56">
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(sortOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => {
          const active = category === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'border border-stone-300 text-ink-muted hover:border-primary hover:text-primary'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <Card>
            <h2 className="font-heading font-semibold text-ink">Filters</h2>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">Price (INR)</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-ink-faint">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink">Quantity</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                />
                <span className="text-ink-faint">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                />
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
              />
              <span>Verified sellers only</span>
            </label>
          </Card>
        </aside>

        <section className="flex-1">
          {error && <p className="mb-4 text-sm text-danger">{error}</p>}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-4">
                  <div className="h-40 animate-pulse rounded-lg bg-stone-100" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-stone-100" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-stone-100" />
                  <div className="mt-4 flex gap-3">
                    <div className="h-9 w-1/2 animate-pulse rounded-lg bg-stone-100" />
                    <div className="h-9 w-1/2 animate-pulse rounded-lg bg-stone-100" />
                  </div>
                </Card>
              ))}
            </div>
          ) : materials.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-ink-faint" />
              <p className="mt-4 font-medium text-ink">No materials found</p>
              <p className="mt-1 text-sm text-ink-muted">
                Try adjusting your search or filters.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((m) => {
                const image = firstImage(m)
                const quantity = `${m.quantity ?? 0} ${m.unit || ''}`.trim()
                return (
                  <Card key={m.id} className="flex flex-col p-4 shadow-card">
                    <div className="relative">
                      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                        {image ? (
                          <img src={image} alt={m.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-10 w-10 text-ink-faint" />
                        )}
                      </div>
                      <div className="absolute left-2 top-2">
                        <Badge variant="neutral">{m.category || 'Other'}</Badge>
                      </div>
                      {m.verified && (
                        <div className="absolute right-2 top-2">
                          <Badge variant="verified">
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 truncate font-heading font-semibold text-ink">
                      {m.name || 'Untitled material'}
                    </h3>

                    <p className="mt-1 text-sm text-ink-muted">{quantity}</p>

                    <p className="mt-2 font-heading font-bold text-accent">
                      ₹{m.price} / {m.unit || 'unit'}
                    </p>

                    <p className="mt-1 text-xs text-ink-faint">
                      {m.distanceKm != null ? `${Math.round(m.distanceKm)} km away` : 'Distance available'}
                    </p>

                    <div className="mt-auto flex gap-3 pt-4">
                      <Button variant="secondary" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        Request
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 md:hidden">
        <Card>
          <h2 className="font-heading font-semibold text-ink">Filters</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Price (INR)</p>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <span className="text-ink-faint">–</span>
                <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
              />
              Verified sellers only
            </label>
          </div>
        </Card>
      </div>
    </div>
  )
}