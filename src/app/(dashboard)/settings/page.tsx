'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Note from '@/components/ui/Note'

interface User {
  id: string
  email: string
  name: string
  profileImage: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Email change state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Account delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    marketing: false,
  })

  const [profileVisibility, setProfileVisibility] = useState(0)
  const [contactVisibility, setContactVisibility] = useState(1)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setNewEmail(data.user.email)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
    setLoading(false)
  }

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setPasswordLoading(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Email change handler
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')

    if (!newEmail || !newEmail.includes('@')) {
      setEmailError('유효한 이메일을 입력해주세요')
      return
    }

    setEmailLoading(true)

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      setEmailSuccess('이메일이 변경되었습니다')
      setUser({ ...user!, email: newEmail })
      setShowEmailForm(false)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setEmailLoading(false)
    }
  }

  // Account delete handler
  const handleDeleteAccount = async () => {
    setDeleteError('')

    if (!deletePassword) {
      setDeleteError('비밀번호를 입력해주세요')
      return
    }

    setDeleteLoading(true)

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '오류가 발생했습니다')
      }

      // Redirect to home after deletion
      router.push('/')
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="settings" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="settings" />

      <div className="flex-1 overflow-auto p-5">
        <h1 className="text-xl font-bold mb-4">설정</h1>

        {/* Account Info */}
        <div className="bg-white border border-gray-300 rounded p-4 mb-3">
          <div className="font-bold text-sm mb-3">계정 정보</div>

          {/* Email */}
          <div className="flex gap-2.5 mb-3">
            <div className="flex-[2]">
              <label className="text-xs text-gray-500 mb-1 block">이메일</label>
              <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200 text-sm">
                {user?.email}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="self-end mb-0.5"
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              {showEmailForm ? '취소' : '변경하기'}
            </Button>
          </div>

          {showEmailForm && (
            <form onSubmit={handleEmailChange} className="mb-3">
              <Input
                label="새 이메일"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
              />
              {emailError && <div className="text-red-500 text-sm mt-1">{emailError}</div>}
              {emailSuccess && <div className="text-green-500 text-sm mt-1">{emailSuccess}</div>}
              <div className="flex gap-2 mt-2">
                <Button type="submit" variant="primary" size="sm" disabled={emailLoading}>
                  {emailLoading ? '변경 중...' : '이메일 변경'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowEmailForm(false)}>
                  취소
                </Button>
              </div>
            </form>
          )}

          {/* Password */}
          <div className="flex gap-2.5">
            <div className="flex-[2]">
              <label className="text-xs text-gray-500 mb-1 block">비밀번호</label>
              <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200 text-sm">
                ••••••••
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="self-end mb-0.5"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? '취소' : '변경하기'}
            </Button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="현재 비밀번호"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                />
                <Input
                  label="새 비밀번호"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6자 이상"
                />
                <Input
                  label="비밀번호 확인"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                />
              </div>
              {passwordError && <div className="text-red-500 text-sm mt-2">{passwordError}</div>}
              {passwordSuccess && <div className="text-green-500 text-sm mt-2">{passwordSuccess}</div>}
              <div className="flex gap-2 mt-3">
                <Button type="submit" variant="primary" size="sm" disabled={passwordLoading}>
                  {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(false)}>
                  취소
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-gray-300 rounded p-4 mb-3">
          <div className="font-bold text-sm mb-3">알림 설정</div>
          {[
            { key: 'email', label: '이메일 알림', desc: '채용 제안, 프로필 조회 등 이메일로 받기' },
            { key: 'sms', label: 'SMS 알림', desc: '중요 알림을 문자로 받기' },
            { key: 'marketing', label: '마케팅 정보 수신', desc: '뉴스레터 및 서비스 업데이트' },
          ].map((item, index) => (
            <div
              key={item.key}
              className={`flex justify-between items-center py-2 ${index < 2 ? 'border-b border-gray-200' : ''}`}
            >
              <div>
                <div className={`text-sm ${notifications[item.key as keyof typeof notifications] ? 'font-semibold' : ''}`}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-mid'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                    notifications[item.key as keyof typeof notifications] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Profile Visibility */}
        <div className="bg-white border border-gray-300 rounded p-4 mb-3">
          <div className="font-bold text-sm mb-3">프로필 공개 설정</div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-sm">프로필 공개 범위</span>
            <div className="flex gap-1.5">
              {['전체 공개', '기업 회원만', '비공개'].map((opt, index) => (
                <div
                  key={opt}
                  onClick={() => setProfileVisibility(index)}
                  className={`px-2.5 py-1 rounded text-[11px] cursor-pointer border ${
                    index === profileVisibility
                      ? 'bg-blue-100 border-primary text-primary'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm">연락처 공개</span>
            <div className="flex gap-1.5">
              {['공개', '비공개'].map((opt, index) => (
                <div
                  key={opt}
                  onClick={() => setContactVisibility(index)}
                  className={`px-2.5 py-1 rounded text-[11px] cursor-pointer border ${
                    index === contactVisibility
                      ? 'bg-blue-100 border-primary text-primary'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-500 rounded p-3.5">
          <div className="font-bold text-xs text-red-500 mb-2">위험 구역</div>

          {showDeleteConfirm ? (
            <div className="bg-white rounded p-3">
              <div className="text-sm font-semibold text-red-600 mb-2">
                정말 계정을 삭제하시겠습니까?
              </div>
              <div className="text-xs text-gray-600 mb-3">
                이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
              </div>
              <Input
                label="비밀번호 확인"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
              {deleteError && <div className="text-red-500 text-sm mt-1">{deleteError}</div>}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? '삭제 중...' : '계정 삭제'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                    setDeleteError('')
                  }}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-red-700">계정 탈퇴</div>
                <div className="text-xs text-red-500">계정을 탈퇴하면 모든 데이터가 삭제됩니다.</div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                계정 탈퇴
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}