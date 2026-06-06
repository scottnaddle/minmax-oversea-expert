'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'

interface Inquiry {
  id: string
  title: string
  content: string
  category: string
  status: string
  isPrivate: boolean
  createdAt: string
  user: { id: string; name: string; profileImage: string | null }
  replies: { id: string; content: string; createdAt: string; user: { id: string; name: string } }[]
}

const categories = [
  { value: '', label: '전체' },
  { value: 'general', label: '일반' },
  { value: 'technical', label: '기술' },
  { value: 'payment', label: '결제' },
  { value: 'cooperation', label: '제휴' },
  { value: 'etc', label: '기타' },
]

const statuses = [
  { value: '', label: '전체' },
  { value: 'open', label: '미답변' },
  { value: 'answered', label: '답변완료' },
]

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadInquiries()
  }, [page, selectedCategory, selectedStatus])

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedStatus) params.set('status', selectedStatus)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/inquiries?${params}`)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadInquiries()
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInquiry || !replyContent.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })

      if (res.ok) {
        setShowReplyModal(false)
        setReplyContent('')
        setSelectedInquiry(null)
        loadInquiries()
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
    setSubmitting(false)
  }

  const getCategoryLabel = (cat: string) => {
    const found = categories.find(c => c.value === cat)
    return found ? found.label : cat
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">문의 관리</h1>
          <p className="text-sm text-gray-500 mt-1">사용자들의 문의를 확인하고 답변할 수 있습니다.</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {total}건의 문의
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목 또는 내용 검색..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <Button type="submit" variant="primary" size="sm">검색</Button>
          </form>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inquiry List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : inquiries.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-4 hover:bg-gray-50">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {inquiry.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {getCategoryLabel(inquiry.category)}
                      </span>
                      {inquiry.isPrivate && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          비공개
                        </span>
                      )}
                      <Badge
                        label={inquiry.status === 'answered' ? '답변완료' : '미답변'}
                        variant={inquiry.status === 'answered' ? 'green' : 'yellow'}
                      />
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h3 
                      className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600"
                      onClick={() => { setSelectedInquiry(inquiry); setShowReplyModal(true); }}
                    >
                      {inquiry.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{inquiry.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>👤 {inquiry.user.name}</span>
                      {inquiry.replies && inquiry.replies.length > 0 && (
                        <span className="text-blue-600">💬 {inquiry.replies.length}개의 답변</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Button
                      variant={inquiry.status === 'answered' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => { setSelectedInquiry(inquiry); setShowReplyModal(true); }}
                    >
                      {inquiry.status === 'answered' ? '답변 보기' : '답변하기'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>문의가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => { setShowReplyModal(false); setSelectedInquiry(null); setReplyContent(''); }}
        title="문의 답변"
        size="lg"
      >
        {selectedInquiry && (
          <div>
            {/* Original Inquiry */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  📩 원본 문의
                </span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                  {getCategoryLabel(selectedInquiry.category)}
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2">{selectedInquiry.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedInquiry.content}</p>
              <div className="text-xs text-gray-400">
                {selectedInquiry.user.name} • {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>

            {/* Existing Replies */}
            {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  💬 답변 목록 ({selectedInquiry.replies.length}개)
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {selectedInquiry.replies.map((reply, index) => (
                    <div 
                      key={reply.id} 
                      className={`p-3 rounded-lg ${
                        index % 2 === 0 ? 'bg-white border border-gray-200' : 'bg-blue-50 border border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-blue-600">👤 {reply.user.name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(reply.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {selectedInquiry.status === 'answered' ? '추가 답변 작성' : '답변 작성'}
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="문의에 대한 답변을 입력하세요..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowReplyModal(false); setSelectedInquiry(null); setReplyContent(''); }}
                  type="button"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? '저장 중...' : '답변 저장'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}