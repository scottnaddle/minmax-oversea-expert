'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface Stats {
  users: { total: number; experts: number; enterprises: number }
  careers: number
  projects: number
  documents: { total: number; pending: number; approved: number; rejected: number }
  educations: number
  languages: number
  inquiries: { total: number; open: number; answered: number }
  consultations: { total: number; pending: number }
}

interface RecentUser {
  id: string
  name: string
  email: string
  userType: string
  createdAt: string
}

interface RecentDocument {
  id: string
  name: string
  type: string
  status: string
  createdAt: string
  user: { name: string }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setRecentUsers(data.recentUsers)
        setRecentDocs(data.recentDocuments)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
    setLoading(false)
  }

  // Calculate approval rate
  const approvalRate = stats && stats.documents.total > 0
    ? Math.round((stats.documents.approved / stats.documents.total) * 100)
    : 0

  // Calculate rejection rate
  const rejectionRate = stats && stats.documents.total > 0
    ? Math.round((stats.documents.rejected / stats.documents.total) * 100)
    : 0

  // Calculate pending rate
  const pendingRate = stats && stats.documents.total > 0
    ? Math.round((stats.documents.pending / stats.documents.total) * 100)
    : 0

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
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">전체 사용자</div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{stats?.users.total || 0}</div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              전문가 {stats?.users.experts || 0}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              기업 {stats?.users.enterprises || 0}
            </span>
          </div>
        </div>

        {/* Careers Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">경력 & 프로젝트</div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">💼</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{stats?.careers || 0}</div>
          <div className="text-xs text-gray-500">
            프로젝트 {stats?.projects || 0}건
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">서류 관리</div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📄</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{stats?.documents.total || 0}</div>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-600">대기 {stats?.documents.pending || 0}</span>
            <span className="text-green-600">승인 {stats?.documents.approved || 0}</span>
            <span className="text-red-600">거절 {stats?.documents.rejected || 0}</span>
          </div>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">승인률</div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{approvalRate}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${approvalRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>승인 {approvalRate}%</span>
            <span>거절 {rejectionRate}%</span>
            <span>대기 {pendingRate}%</span>
          </div>
        </div>
      </div>

      {/* CRM Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Inquiries Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">문의게시판</div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{stats?.inquiries.total || 0}</div>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-600">미답변 {stats?.inquiries.open || 0}</span>
            <span className="text-green-600">답변완료 {stats?.inquiries.answered || 0}</span>
          </div>
        </div>

        {/* Consultations Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">1:1 상담</div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🎧</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">{stats?.consultations.total || 0}</div>
          <div className="flex gap-2 text-xs">
            <span className="text-yellow-600">대기 {stats?.consultations.pending || 0}</span>
          </div>
        </div>

        {/* Messages Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">메시지</div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">✉️</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">-</div>
          <div className="text-xs text-gray-500">1:1 메시지</div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-500 text-sm">알림</div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🔔</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">-</div>
          <div className="text-xs text-gray-500">알림 관리</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Link href="/admin/users" className="block">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <div className="font-semibold text-sm">사용자 관리</div>
                <div className="text-xs text-gray-500">사용자 목록 및 역할 관리</div>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/inquiries" className="block">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <div className="font-semibold text-sm">문의 관리</div>
                <div className="text-xs text-gray-500">
                  미답변 {stats?.inquiries.open || 0}건
                </div>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/consultations" className="block">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎧</span>
              </div>
              <div>
                <div className="font-semibold text-sm">상담 관리</div>
                <div className="text-xs text-gray-500">
                  대기 {stats?.consultations.pending || 0}건
                </div>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/documents?status=pending" className="block">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <div className="font-semibold text-sm">서류 검토</div>
                <div className="text-xs text-gray-500">
                  대기 중 {stats?.documents.pending || 0}건
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* CRM Pending Alerts */}
      {((stats?.inquiries?.open ?? 0) > 0 || (stats?.consultations?.pending ?? 0) > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(stats?.inquiries?.open ?? 0) > 0 && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <div className="font-semibold text-blue-800">답변 필요</div>
                  <div className="text-sm text-blue-700">
                    {stats?.inquiries?.open ?? 0}건의 문의가 답장을 기다리고 있습니다.
                  </div>
                </div>
              </div>
              <Link href="/admin/inquiries?status=open">
                <Button variant="primary" size="sm">답변하기 →</Button>
              </Link>
            </div>
          )}
          {(stats?.consultations?.pending ?? 0) > 0 && (
            <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎧</span>
                </div>
                <div>
                  <div className="font-semibold text-purple-800">상담 대기</div>
                  <div className="text-sm text-purple-700">
                    {stats?.consultations?.pending ?? 0}건의 상담 요청이 대기 중입니다.
                  </div>
                </div>
              </div>
              <Link href="/admin/consultations?status=pending">
                <Button variant="primary" size="sm">확인하기 →</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h2 className="font-bold">최근 가입한 사용자</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">
              더보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.userType === 'expert'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {user.userType === 'expert' ? '전문가' : '기업'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                등록된 사용자가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h2 className="font-bold">최근 등록된 서류</h2>
            <Link href="/admin/documents" className="text-sm text-blue-600 hover:underline">
              더보기 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm">📄</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm truncate max-w-[180px]">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {doc.status === 'approved' ? '승인' :
                       doc.status === 'rejected' ? '거절' : '대기'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                등록된 서류가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}