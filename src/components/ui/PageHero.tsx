import { ReactNode } from 'react'

interface PageHeroProps {
  /** 영문/소문자 uppercase 라벨 (예: ABOUT CAIND) */
  label?: string
  /** 큰 한글 타이틀 */
  title: string
  /** 서브 텍스트 */
  description?: string | ReactNode
  /** 하단 액션 버튼들 */
  actions?: ReactNode
  /** 우측에 들어갈 컨텐츠 (이미지, 일러스트, 카드) */
  aside?: ReactNode
  /** 히어로 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 배경 변형 */
  variant?: 'default' | 'subtle' | 'dark'
}

const variantClasses = {
  default: 'bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white',
  subtle: 'bg-gradient-to-br from-primary-50 via-white to-blue-50 text-primary-900',
  dark: 'bg-primary-900 text-white',
}

const sizeClasses = {
  sm: 'py-10',
  md: 'py-12',
  lg: 'py-16',
}

export default function PageHero({
  label,
  title,
  description,
  actions,
  aside,
  size = 'md',
  variant = 'default',
}: PageHeroProps) {
  const isDark = variant === 'default' || variant === 'dark'

  return (
    <section
      aria-label={typeof title === 'string' ? title : undefined}
      className={`relative overflow-hidden ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {/* Decorative background pattern */}
      <div aria-hidden="true" className="absolute inset-0 opacity-10">
        <div className={`absolute top-0 right-0 w-96 h-96 ${isDark ? 'bg-accent' : 'bg-primary'} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-0 left-0 w-72 h-72 ${isDark ? 'bg-white' : 'bg-accent'} rounded-full blur-3xl`}></div>
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`hero-grid-${variant}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? 'white' : '#1e3a5f'} strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#hero-grid-${variant})`}/>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 flex gap-12 items-center">
        <div className="flex-1 min-w-0">
          {label && (
            <div className={`text-xs uppercase tracking-widest mb-3 font-bold ${
              isDark ? 'text-accent' : 'text-accent'
            }`}>
              {label}
            </div>
          )}
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 leading-tight ${
            isDark ? 'text-white' : 'text-primary-800'
          }`}>
            {title}
          </h1>
          {description && (
            <p className={`text-sm md:text-base leading-relaxed mb-6 max-w-2xl ${
              isDark ? 'text-primary-100' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}
          {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
        </div>
        {aside && <div className="hidden lg:block">{aside}</div>}
      </div>
    </section>
  )
}