'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-52px)] bg-[#f2f4f7] flex items-start justify-center py-11 gap-8">
        <div className="bg-white border border-gray-300 rounded p-8 w-[420px] text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2">비밀번호 변경 완료</h2>
          <p className="text-gray-600 text-sm mb-6">
            비밀번호가 성공적으로 변경되었습니다.<br />
            새로운 비밀번호로 로그인해주세요.
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full justify-center">
              로그인하기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-52px)] bg-[#f2f4f7] flex items-start justify-center py-11 gap-8">
        <div className="bg-white border border-gray-300 rounded p-8 w-[420px] text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✕</span>
          </div>
          <h2 className="text-xl font-bold mb-2">유효하지 않은 링크</h2>
          <p className="text-gray-600 text-sm mb-4">
            비밀번호 재설정 링크가 유효하지 않습니다.<br />
            다시 한 번 시도해주세요.
          </p>
          <Link href="/forgot-password">
            <Button variant="secondary" className="w-full justify-center">
              비밀번호 재설정하기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-[#f2f4f7] flex items-start justify-center py-11 gap-8">
      <div className="bg-white border border-gray-300 rounded p-8 w-[420px]">
        <h2 className="text-lg font-bold mb-1">새 비밀번호 설정</h2>
        <p className="text-sm text-gray-600 mb-4">
          새로운 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상 입력"
            required
          />
          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 다시 입력"
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
            {loading ? '변경 중...' : '비밀번호 변경'}
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