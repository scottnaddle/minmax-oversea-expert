'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 flex-1">
        {label && <span className="text-[11px] text-gray-500">{label}</span>}
        <input
          ref={ref}
          className={`w-full h-[30px] border border-gray-mid rounded bg-gray-light px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input