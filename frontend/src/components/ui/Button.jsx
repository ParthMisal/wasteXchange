import React from 'react'

const base =
  'inline-flex items-center justify-center rounded-xl px-6 py-2.5 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-sm',
  secondary: 'border border-stone-300 bg-white text-ink hover:bg-stone-50 shadow-sm',
  ghost: 'bg-transparent text-primary hover:bg-primary-50',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
  'white-outline': 'border border-white/20 bg-transparent text-white hover:bg-white/10 shadow-sm',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}