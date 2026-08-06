import React from 'react'

const variants = {
  verified: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
  available: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  accepted: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
  reserved: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100',
  sold: 'bg-stone-100 text-ink-muted ring-1 ring-inset ring-stone-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
  neutral: 'bg-stone-100 text-ink-muted ring-1 ring-inset ring-stone-200',
}

export default function Badge({ variant = 'available', className = '', children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}