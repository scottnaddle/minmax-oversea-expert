'use client'

import { MouseEventHandler, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  /** hover 효과 활성화 */
  interactive?: boolean
  /** 보더 두께 */
  bordered?: boolean
  /** 좌측 컬러 액센트 바 */
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'amber' | 'red' | null
}

const accentClasses = {
  blue: 'border-l-4 border-primary-700',
  green: 'border-l-4 border-emerald-500',
  purple: 'border-l-4 border-purple-500',
  orange: 'border-l-4 border-orange-500',
  amber: 'border-l-4 border-accent',
  red: 'border-l-4 border-red-500',
}

export default function Card({
  children,
  className = '',
  onClick,
  interactive = false,
  bordered = true,
  accent = null,
}: CardProps) {
  const borderClass = bordered ? 'border border-gray-200' : ''
  const interactiveClass = interactive
    ? 'hover:shadow-caind hover:border-primary-200 cursor-pointer transition-all'
    : ''
  const accentClass = accent ? accentClasses[accent] : ''

  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${borderClass} ${interactiveClass} ${accentClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}