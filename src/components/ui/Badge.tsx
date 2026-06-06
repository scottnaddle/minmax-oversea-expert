'use client'

interface BadgeProps {
  label: string
  variant?: 'default' | 'green' | 'orange' | 'blue' | 'success' | 'danger' | 'warning' | 'gray' | 'purple' | 'pink' | 'yellow' | 'red'
}

const variantClasses = {
  default: 'border-gray-400 text-gray-600 bg-gray-50',
  gray: 'border-gray-400 text-gray-600 bg-gray-50',
  green: 'border-green-600 text-green-600 bg-green-50',
  orange: 'border-orange-500 text-orange-600 bg-orange-50',
  blue: 'border-blue-600 text-blue-600 bg-blue-50',
  success: 'border-green-600 text-green-600 bg-green-50',
  danger: 'border-red-500 text-red-600 bg-red-50',
  warning: 'border-yellow-500 text-yellow-600 bg-yellow-50',
  purple: 'border-purple-600 text-purple-600 bg-purple-50',
  pink: 'border-pink-600 text-pink-600 bg-pink-50',
  yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50',
  red: 'border-red-500 text-red-600 bg-red-50',
}

const variantLabels: Record<string, string> = {
  default: '',
  green: '',
  orange: '',
  blue: '',
  success: '',
  danger: '',
  warning: '',
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-[10px] border ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}