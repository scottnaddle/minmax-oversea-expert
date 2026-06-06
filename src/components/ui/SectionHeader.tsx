import { ReactNode } from 'react'

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: ReactNode
  className?: string
}

export default function SectionHeader({
  label,
  title,
  description,
  align = 'center',
  action,
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`mb-8 flex ${align === 'center' ? 'flex-col items-center' : 'items-end justify-between'} ${className}`}>
      <div className={alignClass}>
        {label && (
          <div className="text-xs text-accent uppercase tracking-widest mb-2 font-bold">
            {label}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-primary-800">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}