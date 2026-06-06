'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700',
    accent: 'bg-accent text-primary-900 border border-accent hover:bg-accent-light font-bold',
    gradient: 'bg-gradient-to-r from-primary-700 to-primary-800 text-white border border-primary-700 hover:from-primary-800 hover:to-primary-900',
    secondary: 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50',
    danger: 'bg-red-500 text-white border border-red-500 hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}