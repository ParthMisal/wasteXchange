import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-lg border border-stone-200 bg-white p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}