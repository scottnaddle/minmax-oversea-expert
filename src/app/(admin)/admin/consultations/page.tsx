'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'

interface Consultation {
  id: string
  title: string
  content: string
  type: string
  status: string
  preferredDate: string | null
  createdAt: string
  user: { id: string; name: string; profileImage: string | null; email: string }
  expert: { id: string; name: string; profileImage: string | null } | null
  replies: { id: string; content: string; user: { id: string; name: string } }[]
}

const types = [
  { value: '', label: '전체' },
  { value: 'career', label: '경력' },
  { value: 'project', label: '프로젝트' },
  { value: 'technical', label: '기술' },
  { value: 'other', label: '기타' },
]

const statuses = [
  { value: '', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'in_progress', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
]

const statusColors: Record<string, string> = {
  pending: 'yellow',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'gray',
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    loadConsultations()
  }, [page, selectedType, selectedStatus])

  const loadConsultations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (selectedType) params.set('type', selectedType)
      if (selectedStatus) params.set('status', selectedStatus)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/consultations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConsultations(data.consultations || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadConsultations()
  }

  const handleStatusUpdate = async (consultationId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        loadConsultations()
        if (selectedConsultation?.id === consultationId) {
          setSelectedConsultation({ ...selectedConsultation, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
    setUpdatingStatus(false)
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConsultation || !replyContent.trim()) return

    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/consultations/${selectedConsultation.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })

      if (res.ok) {
        setShowReplyModal(false)
        setReplyContent('')
        loadConsultations()
        // Refresh selected consultation
        const detailRes = await fetch(`/api/admin/consultations?search=${selectedConsultation.id}`)
        if (detailRes.ok) {
          const data = await detailRes.json()
          const updated = data.consultations?.find((c: Consultation) => c.id === selectedConsultation.id)
          if (updated) setSelectedConsultation(updated)
        }
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
    setUpdatingStatus(false)
  }

  const getTypeLabel = (type: string) => {
    const found = types.find(t => t.value === type)
    return found ? found.label : type
  }

  const getStatusLabel = (status: string) => {
    const found = statuses.find(s => s.value === status)
    return found ? found.label : status
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">1:1 상담 관리</h1>
          <p className="text-sm text-gray-500 mt-1">사용자들의 상담 요청을 확인하고 관리할 수 있습니다.</p>
        </div>
        <div className="text-sm text-gray-500">
          총 {total}건의 상담
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

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
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

      {/* Consultation List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : consultations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="p-4 hover:bg-gray-50">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {consultation.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {getTypeLabel(consultation.type)}
                      </span>
                      <Badge
                        label={getStatusLabel(consultation.status)}
                        variant={statusColors[consultation.status] as any || 'gray'}
                      />
                      {consultation.expert && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          담당: {consultation.expert.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(consultation.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h3 
                      className="font-semibold text-sm mb-1 cursor-pointer hover:text-blue-600"
                      onClick={() => { setSelectedConsultation(consultation); setShowDetailModal(true); }}
                    >
                      {consultation.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{consultation.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>📧 {consultation.user.email}</span>
                      {consultation.preferredDate && (
                        <span>📅 희망: {new Date(consultation.preferredDate).toLocaleDateString('ko-KR')}</span>
                      )}
                      <span>💬 {consultation.replies.length}개의 메시지</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setSelectedConsultation(consultation); setShowDetailModal(true); }}
                    >
                      상세
                    </Button>
                    {consultation.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(consultation.id, 'in_progress')}
                        disabled={updatingStatus}
                      >
                        수락
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🎧</div>
            <p>상담 요청이 없습니다.</p>
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedConsultation(null); }}
        title="상담 상세"
        size="lg"
      >
        {selectedConsultation && (
          <div>
            {/* Status Update */}
            <div className="flex gap-2 mb-4">
              {statuses.slice(1).map(s => (
                <button
                  key={s.value}
                  onClick={() => handleStatusUpdate(selectedConsultation.id, s.value)}
                  disabled={updatingStatus || selectedConsultation.status === s.value}
                  className={`px-3 py-1 text-xs rounded border ${
                    selectedConsultation.status === s.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Request Info */}
            <div className="bg-gray-50 rounded p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  {getTypeLabel(selectedConsultation.type)}
                </span>
                <Badge
                  label={getStatusLabel(selectedConsultation.status)}
                  variant={statusColors[selectedConsultation.status] as any || 'gray'}
                />
              </div>
              <h3 className="font-semibold mb-2">{selectedConsultation.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{selectedConsultation.content}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>신청자: {selectedConsultation.user.name}</span>
                <span>📧 {selectedConsultation.user.email}</span>
                {selectedConsultation.preferredDate && (
                  <span>📅 희망일: {new Date(selectedConsultation.preferredDate).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>

            {/* Replies */}
            {selectedConsultation.replies && selectedConsultation.replies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  💬 메시지 목록 ({selectedConsultation.replies.length}개)
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {selectedConsultation.replies.map((reply, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        index % 2 === 0 ? 'bg-white border border-gray-200' : 'bg-purple-50 border border-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-purple-600">👤 {reply.user.name}</span>
                        <span className="text-xs text-gray-400">보냄</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleReply} className="border-t pt-4">
              <div className="mb-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="상담 답변 또는 메시지를 입력하세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowDetailModal(false); setSelectedConsultation(null); setReplyContent(''); }}
                  type="button"
                >
                  닫기
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={updatingStatus || !replyContent.trim()}
                >
                  {updatingStatus ? '저장 중...' : '메시지 전송'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}