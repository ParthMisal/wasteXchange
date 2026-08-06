import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Sparkles } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Select from '../components/ui/Select.jsx'
import MatchScoreBadge from '../components/ui/MatchScoreBadge.jsx'
import { getMatches } from '../api/materials.js'

const sortOptions = {
  match_score: 'Best Match',
  distance: 'Distance',
  price: 'Price',
}

const normalize = (data) => {
  if (Array.isArray(data)) return data
  return data?.matches || []
}

export default function MatchResults() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const quantity = searchParams.get('quantity') || ''
  const unit = searchParams.get('unit') || ''
  const location = searchParams.get('location') || ''

  const [matches, setMatches] = useState([])
  const [sortBy, setSortBy] = useState('match_score')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const params = {}
    if (category) params.category = category
    if (quantity) params.quantity = quantity
    if (location) params.location = location

    setLoading(true)
    setError('')
    getMatches(params)
      .then((data) => {
        if (!cancelled) setMatches(normalize(data))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Failed to load matches.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category, quantity, location])

  const sorted = useMemo(() => {
    const list = [...matches]
    if (sortBy === 'distance') {
      return list.sort(
        (a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity),
      )
    }
    if (sortBy === 'price') {
      return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    }
    return list.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
  }, [matches, sortBy])

  return (
    <div className="min-h-screen bg-surface px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-2xl font-bold text-ink">AI Match Results</h1>

        <Card className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm text-ink-muted">
              Looking for:{' '}
              <span className="font-medium text-ink">
                {category || 'any category'} - {quantity || 'any quantity'}
                {unit ? ` ${unit}` : ''} near {location || 'your location'}
              </span>
            </p>
          </div>
          <Link
            to="/marketplace"
            className="shrink-0 text-sm font-medium text-primary hover:text-primary-800"
          >
            Edit Requirement
          </Link>
        </Card>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {loading
              ? 'Finding the best matches…'
              : `${sorted.length} match${sorted.length === 1 ? '' : 'es'} found`}
          </p>
          <div className="w-44">
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="flex animate-pulse items-center gap-6 p-6">
                <div className="h-16 w-16 shrink-0 rounded-full bg-stone-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 rounded bg-stone-100" />
                  <div className="h-4 w-1/2 rounded bg-stone-100" />
                </div>
                <div className="hidden w-40 space-y-3 sm:block">
                  <div className="h-4 w-3/4 rounded bg-stone-100" />
                  <div className="h-4 w-1/2 rounded bg-stone-100" />
                </div>
                <div className="h-9 w-28 shrink-0 rounded-lg bg-stone-100" />
              </Card>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Card className="mt-6 flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="h-12 w-12 text-ink-faint" />
            <p className="mt-4 font-medium text-ink">No matches found</p>
            <p className="mt-1 text-sm text-ink-muted">
              Try adjusting your requirement to broaden the search.
            </p>
            <Link to="/marketplace" className="mt-5">
              <Button variant="secondary" size="sm">
                Adjust Requirement
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {sorted.map((m, i) => (
              <Card
                key={m.material_id}
                className="fade-in flex flex-col gap-5 p-6 shadow-card sm:flex-row sm:items-center"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-1">
                  <MatchScoreBadge score={m.match_score} size={64} />
                  <span className="text-xs font-medium text-ink-muted sm:mt-1">
                    Match
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading font-semibold text-ink">
                    {m.material_name || 'Untitled material'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{m.category || 'Other'}</Badge>
                    <span className="text-sm text-ink-muted">
                      {m.quantity ?? 0} {m.unit || ''}
                    </span>
                  </div>
                  <p className="mt-1 font-heading font-semibold text-accent">
                    ₹{m.price ?? 0} / {m.unit || 'unit'}
                  </p>
                </div>

                <div className="w-full shrink-0 sm:w-44">
                  <p className="font-medium text-ink">{m.seller_name || 'Seller'}</p>
                  {m.verified && (
                    <Badge variant="verified" className="mt-1">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                  <p className="mt-1 text-xs text-ink-faint">
                    {m.distance_km != null ? `${Math.round(m.distance_km)} km away` : ''}
                  </p>
                </div>

                <Button className="shrink-0">Send Request</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}