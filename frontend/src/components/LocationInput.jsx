import React, { useEffect, useRef, useState } from 'react'
import Input from './ui/Input.jsx'
import { geocode } from '../api/materials.js'

let placesScriptPromise = null

function loadPlacesScript(apiKey) {
  if (!apiKey || window.google?.maps?.places) return Promise.resolve(window.google)
  if (placesScriptPromise) return placesScriptPromise
  placesScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__wxPlacesReady`
    script.async = true
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    window.__wxPlacesReady = () => resolve(window.google)
    document.head.appendChild(script)
  })
  return placesScriptPromise
}

/**
 * Location input with Google Places autocomplete.
 * Falls back to a plain text input + backend geocoding when no API key.
 */
export default function LocationInput({
  value,
  onChange,
  onLocationChange,
  label = 'Location',
  placeholder = 'e.g. Mumbai, Maharashtra',
  required = false,
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const [enabled, setEnabled] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (!apiKey) {
      setEnabled(false)
      return
    }
    let cancelled = false
    loadPlacesScript(apiKey)
      .then(() => {
        if (cancelled) return
        setEnabled(true)
      })
      .catch(() => setEnabled(false))
    return () => {
      cancelled = true
    }
  }, [apiKey])

  useEffect(() => {
    if (!enabled || !inputRef.current || autocompleteRef.current) return
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' },
    })
    autocompleteRef.current = ac
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      const name =
        place.formatted_address ||
        [place.name, place.address_components?.[0]?.long_name].filter(Boolean).join(', ')
      onChange(name)
      const lat = place.geometry?.location?.lat?.()
      const lng = place.geometry?.location?.lng?.()
      if (lat != null && lng != null) {
        onLocationChange?.({
          address: name,
          latitude: lat,
          longitude: lng,
        })
      }
    })
  }, [enabled, onChange, onLocationChange])

  const handleBlur = async () => {
    if (enabled) return
    if (!value || !value.trim()) return
    try {
      const geo = await geocode(value.trim())
      if (geo?.latitude != null) {
        onLocationChange?.({ address: value, ...geo })
      }
    } catch {
      // ignore - backend fallback already attempted
    }
  }

  return (
    <Input
      ref={inputRef}
      id="location"
      name="location"
      label={label}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      autoComplete={enabled ? 'off' : 'street-address'}
    />
  )
}
