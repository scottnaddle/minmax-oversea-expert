'use client'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ProgressBar({ 
  value, 
  max = 100, 
  color = 'bg-blue-600',
  size = 'md',
  showLabel = false 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${color} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  )
}