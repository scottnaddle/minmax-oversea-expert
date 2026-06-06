'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'

interface User {
  id: string
  email: string
  name: string
  userType: string
  role: string
  nationality: string | null
  currentCountry: string | null
  emailVerified: boolean
  createdAt: string
  _count: {
    careers: number
    documents: number
    messages: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'expert' | 'enterprise'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
    setLoading(false)
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`"${name}" 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
        setMessage('사용자가 삭제되었습니다.')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setMessage(data.error || '삭제 실패')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        loadUsers()
        setMessage('권한이 변경되었습니다.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesType = filter === 'all' || user.userType === filter
    const matchesSearch = !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.nationality && user.nationality.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.currentCountry && user.currentCountry.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Stats
  const stats = {
    total: users.length,
    experts: users.filter(u => u.userType === 'expert').length,
    enterprises: users.filter(u => u.userType === 'enterprise').length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <div className="text-sm text-gray-500 mt-1">
            전체 {stats.total}명 | 전문가 {stats.experts}명 | 기업 {stats.enterprises}명 | 관리자 {stats.admins}명
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded text-sm text-blue-800">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="이름, 이메일, 국적 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'expert', 'enterprise'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded text-sm ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '전체' : f === 'expert' ? '전문가' : '기업'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">사용자</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">유형</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">권한</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">국적</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">현재 위치</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">데이터</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">가입일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    label={user.userType === 'expert' ? '전문가' : '기업'}
                    variant={user.userType === 'expert' ? 'blue' : 'orange'}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 bg-white"
                  >
                    <option value="user">일반</option>
                    <option value="admin">관리자</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.nationality || '-'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.currentCountry || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-0.5 rounded" title="경력">
                      💼 {user._count.careers}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded" title="서류">
                      📄 {user._count.documents}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded" title="메시지">
                      💬 {user._count.messages}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                  >
                    삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            {searchQuery ? '검색 결과가 없습니다.' : '해당하는 사용자가 없습니다.'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        총 {filteredUsers.length}명 표시
        {searchQuery && users.length !== filteredUsers.length && (
          <span> (전체 {users.length}명 중)</span>
        )}
      </div>
    </div>
  )
}