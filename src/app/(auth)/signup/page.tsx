'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Briefcase, ArrowRight, UserPlus } from 'lucide-react'
import PageHero from '@/components/ui/PageHero'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'expert' as 'expert' | 'enterprise',
    currentCountry: '',
    expertise: '',
    // 기업회원 전용
    businessNumber: '',
    businessName: '',
    businessType: '',
    representativeName: '',
    companyPhone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      router.push('/login?registered=true')
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
        label="SIGN UP"
        title="회원가입"
        description="CAIND ODA 전문가 경력관리 플랫폼의 회원이 되어보세요"
      />

      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-white rounded-t-xl border border-gray-200 border-b-0 overflow-hidden shadow-sm">
            <Link
              href="/login"
              className="flex-1 text-center py-3 text-sm text-gray-500 hover:text-primary-700 transition"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-3 text-sm font-bold text-primary-700 border-b-2 border-accent bg-primary-50"
            >
              회원가입
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-b-xl shadow-caind p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-primary-900 mx-auto mb-3 shadow-md">
                <UserPlus size={24} />
              </div>
              <h2 className="text-xl font-bold text-primary-800">계정 만들기</h2>
            </div>

            {/* User type selector */}
            <div className="mb-5">
              <div className="text-xs font-medium text-gray-700 mb-2">가입 유형</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'expert' })}
                  className={`py-3 px-3 text-center border-2 rounded-lg text-sm font-medium transition ${
                    formData.userType === 'expert'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <User size={18} className="mx-auto mb-1" />
                  전문가 (개인)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'enterprise' })}
                  className={`py-3 px-3 text-center border-2 rounded-lg text-sm font-medium transition ${
                    formData.userType === 'enterprise'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <Briefcase size={18} className="mx-auto mb-1" />
                  기업 / 기관
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">이름 (실명)</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="김철수"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">이메일</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">비밀번호</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8자 이상"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">비밀번호 확인</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="재입력"
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">거주 국가</label>
                <input
                  name="currentCountry"
                  value={formData.currentCountry}
                  onChange={handleChange}
                  placeholder="예: 싱가포르"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">전문 분야</label>
                <input
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  placeholder="예: 금융, IT, 건설"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {formData.userType === 'enterprise' && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <p className="text-xs font-bold text-primary-700 mb-3">🏢 기업 정보</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">사업자번호</label>
                        <input
                          name="businessNumber"
                          value={formData.businessNumber}
                          onChange={handleChange}
                          placeholder="000-00-00000"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">기업명</label>
                        <input
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          placeholder="주식회사 예시"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">기업 유형</label>
                        <input
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          placeholder="예: 컨설팅, 건설"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">대표자명</label>
                        <input
                          name="representativeName"
                          value={formData.representativeName}
                          onChange={handleChange}
                          placeholder="대표자 성명"
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="text-xs font-medium text-gray-700 mb-1 block">기업 연락처</label>
                      <input
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        placeholder="02-0000-0000"
                        className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <label className="text-xs text-gray-600 mt-2 flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-primary-600" />
                <span>서비스 이용약관 및 개인정보처리방침에 동의합니다</span>
              </label>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 inline-flex items-center justify-center gap-2 rounded-lg font-bold bg-gradient-to-r from-primary-700 to-primary-800 text-white hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? '처리 중...' : <>회원가입 완료 <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}