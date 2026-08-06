import React from 'react'

const base =
  'w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary'

export default function Input({ className = '', label, id, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input id={id} className={`${base} ${className}`} {...props} />
    </div>
  )
}