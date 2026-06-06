'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Note from '@/components/ui/Note'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      setSent(true)
      if (data.resetToken) {
        setResetToken(data.resetToken)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-52px)] bg-[#f2f4f7] flex items-start justify-center py-11 gap-8">
        <div className="bg-white border border-gray-300 rounded p-8 w-[420px] text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2">이메일 발송 완료</h2>
          <p className="text-gray-600 text-sm mb-4">
            {email}로 비밀번호 재설정 링크를 발송했습니다.
          </p>
          {resetToken && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-4 text-left">
              <div className="text-xs text-yellow-700 mb-1 font-semibold">🔑 Demo 모드 - 토큰:</div>
              <code className="text-xs break-all text-yellow-800">{resetToken}</code>
              <div className="text-xs text-yellow-600 mt-2">
                위 링크로 이동: <Link href={`/reset-password/${resetToken}`} className="underline">비밀번호 재설정</Link>
              </div>
            </div>
          )}
          <Note type="info" className="text-xs mb-4">
            이메일이 도착하지 않으면 스팸 폴더를 확인해주세요.<br />
            링크는 1시간 동안 유효합니다.
          </Note>
          <Link href="/login">
            <Button variant="primary" className="w-full justify-center">
              로그인 페이지로 이동
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#f2f4f7] flex items-start justify-center py-11 gap-8">
      <div className="bg-white border border-gray-300 rounded p-8 w-[420px]">
        <div className="flex border-b border-gray-300 mb-5">
          <Link
            href="/login"
            className="flex-1 text-center py-2 text-sm text-gray-500"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="flex-1 text-center py-2 text-sm text-gray-500"
          >
            회원가입
          </Link>
        </div>

        <h2 className="text-lg font-bold mb-2">비밀번호 재설정</h2>
        <p className="text-sm text-gray-600 mb-4">
          가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
          />

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? '발송 중...' : '재설정 링크 발송'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}