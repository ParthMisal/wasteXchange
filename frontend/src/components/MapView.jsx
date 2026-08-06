import React from 'react'
import { MapPin } from 'lucide-react'

const toLabel = (loc) => {
  if (!loc) return 'Unknown'
  if (typeof loc === 'string') return loc
  if (typeof loc === 'object' && (loc.lat != null || loc.name)) {
    return loc.name || `${loc.lat != null ? loc.lat : ''},${loc.lng != null ? loc.lng : ''}`
  }
  return 'Unknown'
}

export default function MapView({
  sellerLocation,
  buyerLocation,
  distanceKm,
  durationMin,
}) {
  const from = toLabel(sellerLocation)
  const to = toLabel(buyerLocation)

  return (
    <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-[#EDEBDf]">
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <pattern id="map-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#D6D3D1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid)" />
        <rect width="100" height="100" fill="none" stroke="#E7E5E4" strokeWidth="0.25" />
      </svg>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1="30"
          y1="30"
          x2="72"
          y2="72"
          stroke="#134E4A"
          strokeWidth="1.2"
          strokeDasharray="2.5 1.5"
        />
      </svg>

      <div className="absolute left-[22%] top-[22%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <MapPin className="h-7 w-7 text-danger drop-shadow" />
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink shadow-sm">
          Seller
        </span>
      </div>

      <div className="absolute right-[20%] bottom-[20%] flex -translate-y-1/2 flex-col items-center">
        <MapPin className="h-7 w-7 text-accent drop-shadow" />
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink shadow-sm">
          Buyer
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-white px-4 py-2 text-center shadow-sm ring-1 ring-stone-200">
          {distanceKm != null ? (
            <p className="text-xs font-semibold text-ink">
              ≈ {Math.round(distanceKm)} km
              {durationMin != null ? ` · ${Math.round(durationMin)} min` : ''}
            </p>
          ) : (
            <p className="text-xs font-semibold text-ink">Route</p>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute left-3 top-3 text-[10px] text-ink-muted">
        <p>{from}</p>
        <p>{to}</p>
      </div>
    </div>
  )
}