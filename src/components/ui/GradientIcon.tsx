import { ReactNode } from 'react'

interface GradientIconProps {
  icon: ReactNode
  /** 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'rose' | 'indigo' */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'rose' | 'indigo' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 아이콘 안 우측 상단 배지 */
  badge?: ReactNode
  className?: string
}

const colorClasses = {
  blue: 'from-blue-500 to-indigo-600',
  green: 'from-emerald-500 to-teal-600',
  purple: 'from-purple-500 to-pink-600',
  orange: 'from-orange-500 to-red-500',
  emerald: 'from-emerald-500 to-cyan-600',
  rose: 'from-rose-500 to-pink-600',
  indigo: 'from-indigo-500 to-purple-600',
  amber: 'from-amber-500 to-orange-600',
}

const sizeClasses = {
  sm: 'w-8 h-8 text-base',
  md: 'w-10 h-10 text-lg',
  lg: 'w-12 h-12 text-2xl',
  xl: 'w-14 h-14 text-3xl',
}

export default function GradientIcon({
  icon,
  color = 'blue',
  size = 'lg',
  badge,
  className = '',
}: GradientIconProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-md`}
      >
        {icon}
      </div>
      {badge && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full flex items-center justify-center shadow text-[8px] font-bold text-gray-600">
          {badge}
        </div>
      )}
    </div>
  )
}