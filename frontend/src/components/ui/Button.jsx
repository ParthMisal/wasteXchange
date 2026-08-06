import React from 'react'

const base =
  'inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-800',
  secondary: 'border border-primary bg-transparent text-primary hover:bg-primary-50',
  ghost: 'bg-transparent text-primary hover:bg-primary-50',
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