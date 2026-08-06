import React from 'react'
import { MapPin } from 'lucide-react'

const toCoords = (loc) => {
  if (!loc) return null
  if (typeof loc === 'object' && loc?.latitude != null && loc?.longitude != null) {
    return [loc.latitude, loc.longitude]
  }
  return null
}

/**
 * Route preview. Uses a live Google Maps embed (no API key required) when
 * coordinates are available; otherwise falls back to the stylised SVG route.
 */
export default function MapView({
  sellerLocation,
  buyerLocation,
  distanceKm,
  durationMin,
}) {
  const from = toCoords(sellerLocation)
  const to = toCoords(buyerLocation)

  // If one side is missing, fall back to showing a single place map
  if (from || to) {
    const coords = from || to
    const q = coords ? `${coords[0]},${coords[1]}` : ''
    const directionUrl = from && to
      ? `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}`
      : `https://www.google.com/maps?q=${q}&z=12`
    return (
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
        <iframe
          title="Map preview"
          src={`${directionUrl}&output=embed`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="pointer-events-none absolute left-3 top-3">
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
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[70%] text-[10px] text-ink-muted">
          <p className="truncate">{typeof sellerLocation === 'string' ? sellerLocation : ''}</p>
          <p className="truncate">{typeof buyerLocation === 'string' ? buyerLocation : ''}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-stone-200 bg-[#EDEBDf]">
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
        <p>{typeof sellerLocation === 'string' ? sellerLocation : 'Seller'}</p>
        <p>{typeof buyerLocation === 'string' ? buyerLocation : 'Buyer'}</p>
      </div>
    </div>
  )
}
