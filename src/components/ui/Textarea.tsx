'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <span className="text-[11px] text-gray-500">{label}</span>}
        <textarea
          ref={ref}
          className={`w-full border border-gray-mid rounded bg-gray-light px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea