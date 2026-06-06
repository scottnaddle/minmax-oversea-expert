'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다')
      }

      router.push(data.redirectUrl || '/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        label="SIGN IN"
        title="로그인"
        description="CAIND ODA 전문가 경력관리 플랫폼에 오신 것을 환영합니다"
      />

      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-white rounded-t-xl border border-gray-200 border-b-0 overflow-hidden shadow-sm">
            <Link
              href="/login"
              className="flex-1 text-center py-3 text-sm font-bold text-primary-700 border-b-2 border-accent bg-primary-50"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-3 text-sm text-gray-500 hover:text-primary-700 transition"
            >
              회원가입
            </Link>
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-caind p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold text-primary-800">계정에 로그인</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">이메일</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full h-10 pl-10 pr-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">비밀번호</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 inline-flex items-center justify-center gap-2 rounded-lg font-bold bg-gradient-to-r from-primary-700 to-primary-800 text-white hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? '로그인 중...' : <>로그인 <ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100 text-center">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary-600 hover:underline font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}