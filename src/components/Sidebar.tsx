'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, User, Briefcase, FileText, MessageSquare, Bell, Settings,
  GraduationCap, Languages, Award, Phone, Users, Building2,
  ClipboardList, CheckCircle2, Receipt, LogOut
} from 'lucide-react'

interface SidebarProps {
  activeItem?: string
}

interface UserInfo {
  name: string
  email: string
  userType: string
  businessName?: string | null
  currentCountry: string | null
}

// 👤 개인회원 (SW기술자) 메뉴
const personalNavItems = [
  { id: 'dashboard', label: '대시보드', icon: Home, href: '/dashboard' },
  { id: 'profile', label: '내 프로필', icon: User, href: '/profile' },
  { id: 'career', label: '내 경력', icon: Briefcase, href: '/career' },
  { id: 'applications', label: '신청내역', icon: ClipboardList, href: '/applications' },
  { id: 'documents', label: '증빙 서류', icon: FileText, href: '/documents' },
  { id: 'supplements', label: '보완 서류', icon: CheckCircle2, href: '/supplements' },
  { id: 'certificates', label: '증명서 발급', icon: Award, href: '/certificates' },
  { id: 'education', label: '학력', icon: GraduationCap, href: '/education' },
  { id: 'certifications', label: '자격증', icon: Award, href: '/certifications' },
  { id: 'languages', label: '어학 능력', icon: Languages, href: '/languages' },
  { id: 'inquiries', label: '문의 게시판', icon: MessageSquare, href: '/inquiries' },
  { id: 'consultations', label: '1:1 상담', icon: Phone, href: '/consultations' },
  { id: 'messages', label: '메시지', icon: MessageSquare, href: '/messages', badge: 2 },
  { id: 'notifications', label: '알림', icon: Bell, href: '/notifications', badge: 3 },
]

// 🏢 기업회원 메뉴
const corporateNavItems = [
  { id: 'dashboard', label: '기업 대시보드', icon: Home, href: '/dashboard' },
  { id: 'company-profile', label: '기업 정보', icon: Building2, href: '/company-profile' },
  { id: 'employees', label: '소속기술자 관리', icon: Users, href: '/employees' },
  { id: 'verification', label: '기업확인요청', icon: CheckCircle2, href: '/verification' },
  { id: 'proxy', label: '대리 신청', icon: ClipboardList, href: '/proxy-applications' },
  { id: 'payments', label: '수수료 대납', icon: Receipt, href: '/corporate-payments' },
  { id: 'certificates', label: '증명서 발급', icon: Award, href: '/corporate-certificates' },
  { id: 'inquiries', label: '문의 게시판', icon: MessageSquare, href: '/inquiries' },
  { id: 'consultations', label: '1:1 상담', icon: Phone, href: '/consultations' },
  { id: 'messages', label: '메시지', icon: MessageSquare, href: '/messages', badge: 2 },
  { id: 'notifications', label: '알림', icon: Bell, href: '/notifications', badge: 3 },
]

export default function Sidebar({ activeItem = 'dashboard' }: SidebarProps) {
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          setUserInfo(data.user)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  const getInitials = (name: string) => name.slice(0, 2)
  const isCorporate = userInfo?.userType === 'enterprise'
  const navItems = isCorporate ? corporateNavItems : personalNavItems

  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
      {/* User info header */}
      <div className="px-4 pb-4 border-b border-gray-100 mb-2">
        <Link href={isCorporate ? '/company-profile' : '/profile'} className="flex gap-3 items-center group">
          {isCorporate ? (
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center text-primary-900 text-sm font-bold shadow-sm group-hover:shadow-md transition">
              🏢
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition">
              {userInfo?.name ? getInitials(userInfo.name) : '??'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-primary-800 truncate">
              {userInfo?.name || '로딩 중...'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {isCorporate ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-dark border border-accent/40 font-bold">
                  🏢 기업회원
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 border border-primary-200 font-bold">
                  👤 SW기술자
                </span>
              )}
            </div>
          </div>
        </Link>
        {isCorporate && userInfo?.businessName && (
          <div className="mt-2 text-[11px] text-gray-500 truncate flex items-center gap-1">
            <Building2 size={10} />
            {userInfo.businessName}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || activeItem === item.id
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg mb-0.5 transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold border-l-[3px] border-l-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700 border-l-[3px] border-l-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary-600' : ''} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Settings (separate, bottom) */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition ${
              pathname === '/settings' || activeItem === 'settings'
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
            }`}
          >
            <Settings size={16} />
            <span className="flex-1">설정</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="pt-3 mt-2 border-t border-gray-100 px-4">
        <div className="text-[10px] text-gray-400 leading-relaxed">
          <span className="text-accent font-bold">CAIND</span> ODA 전문가<br />경력관리 시스템
        </div>
      </div>
    </aside>
  )
}