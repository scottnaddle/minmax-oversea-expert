'use client'

interface NoteProps {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
  className?: string
}

const typeStyles = {
  info: 'bg-blue-50 border-blue-300 text-blue-800',
  warning: 'bg-yellow-100 border-dashed border-yellow-400 text-yellow-800',
  error: 'bg-red-50 border-red-300 text-red-800',
  success: 'bg-green-50 border-green-300 text-green-800',
}

export default function Note({ children, type = 'warning', className = '' }: NoteProps) {
  return (
    <div className={`border px-3 py-2 rounded text-xs ${typeStyles[type]} ${className}`}>
      {children}
    </div>
  )
}