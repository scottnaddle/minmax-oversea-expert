'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface NavLink {
  label: string
  href: string
}

interface NavbarProps {
  user?: {
    id: string
    name: string
    email: string
    userType: string
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const mainLinks: NavLink[] = [
    { label: '전문가 찾기', href: '/experts' },
    { label: '가이드', href: '/guide' },
    { label: '협회 소개', href: '/about-caind' },
  ]

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    setLoggingOut(false)
    setShowLogoutModal(false)
  }

  return (
    <nav className="h-[68px] bg-white border-b-2 border-primary-600 flex items-center px-6 md:px-8 gap-6 shrink-0 relative">
      {/* CAIND Logo */}
      <Link href="/" className="flex items-center gap-3 group" aria-label="CAIND 홈으로">
        <div className="relative">
          <Image
            src="/images/caind-logo.png"
            alt="CAIND 국제개발컨설팅협회 로고"
            width={113}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>
        <div className="hidden lg:flex flex-col leading-tight">
          <span className="text-[10px] text-accent font-bold tracking-widest uppercase">CAIND</span>
          <span className="text-sm font-bold text-primary-800">ODA 전문가 경력관리</span>
        </div>
      </Link>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm px-3 py-2 rounded transition ${
              pathname === link.href
                ? 'text-primary-600 font-bold border-b-2 border-accent'
                : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Auth buttons */}
      <div className="hidden md:flex items-center gap-2">
        {user ? (
          <div className="relative">
            {/* User Menu Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-primary-50 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.name.slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-gray-800">{user.name}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100 bg-primary-50">
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className="text-xs text-primary-600 font-medium mt-1">CAIND 회원</div>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} />
                    대시보드
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    ⚙️ 설정
                  </Link>
                </div>
                <div className="p-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      setShowLogoutModal(true)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 text-red-600 w-full"
                  >
                    <LogOut size={14} />
                    로그아웃
                  </button>
                </div>
              </div>
            )}

            {showUserMenu && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)} 
              />
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="text-sm px-3 py-2 text-primary-700 hover:bg-primary-50 rounded font-medium transition">
              로그인
            </Link>
            <Link href="/signup" className="text-sm px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium transition">
              가입하기
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-white border-b-2 border-primary-600 p-4 md:hidden z-50">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 py-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <Link href="/dashboard" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  대시보드
                </Link>
                <Link href="/settings" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  설정
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLogoutModal(true)
                  }}
                  className="py-2 text-sm text-red-600 text-left w-full"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  로그인
                </Link>
                <Link href="/signup" className="block py-2 text-sm font-semibold text-primary-600" onClick={() => setMobileMenuOpen(false)}>
                  가입하기
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="로그아웃"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="text-5xl mb-4">👋</div>
          <p className="text-gray-600 mb-6">
            정말 로그아웃 하시겠습니까?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
              disabled={loggingOut}
            >
              취소
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              disabled={loggingOut}
            >
              {loggingOut ? '로그아웃 중...' : '로그아웃'}
            </button>
          </div>
        </div>
      </Modal>
    </nav>
  )
}