import React from 'react'

export default function Card({ variant = 'standard', className = '', children, ...props }) {
  const baseClass = variant === 'glass' ? 'glass-card' : 'card'
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  )
}