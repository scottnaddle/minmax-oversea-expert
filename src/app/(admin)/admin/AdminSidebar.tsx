'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminNavItems = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/users', label: '사용자 관리', icon: '👥' },
  { href: '/admin/documents', label: '서류 관리', icon: '📄' },
  { href: '/admin/certificates', label: '증명서 관리', icon: '📜' },
  { divider: true },
  { href: '/admin/inquiries', label: '문의 관리', icon: '💬' },
  { href: '/admin/consultations', label: '1:1 상담', icon: '🎧' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-primary-700">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          <div>
            <div className="font-bold text-base">관리자 패널</div>
            <div className="text-[10px] text-accent uppercase tracking-widest font-bold">CAIND Admin</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {adminNavItems.map((item, index) => {
          if ('divider' in item && item.divider) {
            return (
              <div key={`divider-${index}`} className="my-3 mx-3 border-t border-primary-700" />
            )
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg mb-0.5 transition border-l-[3px] ${
                isActive
                  ? 'bg-accent/15 text-white font-semibold border-l-accent'
                  : 'text-primary-100 hover:bg-white/5 hover:text-white border-l-transparent'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-primary-700">
        <Link
          href="/dashboard"
          className="text-xs text-primary-200 hover:text-white flex items-center gap-2 transition"
        >
          <span>←</span>
          <span>사용자 화면으로</span>
        </Link>
      </div>
    </aside>
  )
}