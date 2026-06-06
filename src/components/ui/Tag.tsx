'use client'

interface TagProps {
  label: string
  variant?: 'default' | 'blue' | 'green' | 'warning'
}

export default function Tag({ label, variant = 'default' }: TagProps) {
  const variantClasses = {
    default: 'bg-gray-200 border-gray-300 text-gray-700',
    blue: 'bg-blue-100 border-blue-400 text-blue-600',
    green: 'bg-green-100 border-green-600 text-green-600',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs border ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}