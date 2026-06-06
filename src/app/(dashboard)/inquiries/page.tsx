'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface Inquiry {
  id: string
  title: string
  content: string
  category: string
  status: string
  isPrivate: boolean
  createdAt: string
  user: { id: string; name: string }
  replies: { id: string; content: string; createdAt: string; user: { id: string; name: string } }[]
}

const categories = [
  { value: '', label: '전체' },
  { value: 'general', label: '일반 문의' },
  { value: 'career', label: '경력 관련' },
  { value: 'project', label: '프로젝트 관련' },
  { value: 'technical', label: '기술 지원' },
  { value: 'consultation', label: '상담 요청' },
]

const statusConfig: Record<string, { label: string; variant: string }> = {
  open: { label: '답변 대기', variant: 'yellow' },
  answered: { label: '답변 완료', variant: 'green' },
  closed: { label: '종료', variant: 'gray' },
}

const categoryIcons: Record<string, string> = {
  general: '💬',
  career: '💼',
  project: '📋',
  technical: '🔧',
  consultation: '👨‍🏫',
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInquiry, setNewInquiry] = useState({
    title: '',
    content: '',
    category: 'general',
    isPrivate: false,
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadInquiries()
    // Auto-refresh every 30 seconds to catch admin status updates
    const interval = setInterval(loadInquiries, 30000)
    return () => clearInterval(interval)
  }, [page, selectedCategory, searchQuery])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (selectedCategory) params.set('category', selectedCategory)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/inquiries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Error loading inquiries:', error)
    }
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInquiry.title || !newInquiry.content) return

    setCreating(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewInquiry({ title: '', content: '', category: 'general', isPrivate: false })
        loadInquiries()
      }
    } catch (error) {
      console.error('Error creating inquiry:', error)
    }
    setCreating(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '오늘'
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  if (loading && inquiries.length === 0) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="inquiries" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="inquiries" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">문의 게시판</h1>
            <p className="text-gray-500 text-sm mt-1">ODA 전문가 관련 질문과 답변을 공유하세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + 문의하기
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-5">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCategory(cat.value); setPage(1); }}
                className={`px-3 py-1.5 text-xs rounded-full transition ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-xs">
            <Input
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-5 text-sm">
          <span className="text-gray-500">총 <span className="font-bold text-gray-800">{total}</span>건</span>
          <span className="text-gray-300">|</span>
          <span className="text-yellow-600">답변 대기 {inquiries.filter(i => i.status === 'open').length}건</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-600">답변 완료 {inquiries.filter(i => i.status === 'answered').length}건</span>
        </div>

        {/* List */}
        {inquiries.length > 0 ? (
          <div className="space-y-3">
            {inquiries.map((inquiry) => {
              const status = statusConfig[inquiry.status] || statusConfig.open
              const catIcon = categoryIcons[inquiry.category] || '💬'

              return (
                <Link key={inquiry.id} href={`/inquiries/${inquiry.id}`}>
                  <Card className="p-4 hover:shadow-md transition cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg shrink-0">
                        {catIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{inquiry.title}</h3>
                          {inquiry.isPrivate && <span className="text-xs">🔒</span>}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{inquiry.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{inquiry.user.name}</span>
                          <span>·</span>
                          <span>{formatDate(inquiry.createdAt)}</span>
                          <span>·</span>
                          <span>💬 {inquiry.replies?.length || 0}</span>
                        </div>
                      </div>
                      <Badge label={status.label} variant={status.variant as any} />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">❓</div>
            <h2 className="text-xl font-bold mb-2">문의가 없습니다</h2>
            <p className="text-gray-500 mb-6">
              첫 번째 문의를 등록해보세요!
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              문의하기
            </Button>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded ${
                  p === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="문의하기"
            size="lg"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리 *</label>
                <select
                  value={newInquiry.category}
                  onChange={(e) => setNewInquiry({ ...newInquiry, category: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c.value).map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">제목 *</label>
                <Input
                  value={newInquiry.title}
                  onChange={(e) => setNewInquiry({ ...newInquiry, title: e.target.value })}
                  placeholder="문의 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">내용 *</label>
                <textarea
                  value={newInquiry.content}
                  onChange={(e) => setNewInquiry({ ...newInquiry, content: e.target.value })}
                  placeholder="상세하게 설명해주세요..."
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 h-40"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newInquiry.isPrivate}
                  onChange={(e) => setNewInquiry({ ...newInquiry, isPrivate: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>비밀글로 작성 (본인과 관리자만 확인 가능)</span>
              </label>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}