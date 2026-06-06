'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface Consultation {
  id: string
  type: string
  title: string
  content: string
  status: string
  preferredDate: string | null
  createdAt: string
  user: { id: string; name: string }
  expert: { id: string; name: string } | null
  replies: { id: string; content: string; createdAt: string; user: { id: string; name: string } }[]
}

const consultationTypes = [
  { value: 'career', label: '경력 상담', icon: '💼', description: 'ODA 프로젝트 경력 설계, 이력서 작성' },
  { value: 'project', label: '프로젝트 상담', icon: '📋', description: '프로젝트 참여 방법, 계약 조건' },
  { value: 'technical', label: '기술 상담', icon: '🔧', description: '전문 기술 역량 평가, 인증' },
  { value: 'other', label: '기타', icon: '💬', description: '다른 궁금한 사항' },
]

const statusConfig: Record<string, { label: string; variant: string }> = {
  pending: { label: '대기 중', variant: 'yellow' },
  in_progress: { label: '진행 중', variant: 'blue' },
  completed: { label: '완료', variant: 'green' },
  cancelled: { label: '취소', variant: 'gray' },
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [newConsultation, setNewConsultation] = useState({
    type: 'career',
    title: '',
    content: '',
    preferredDate: '',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadConsultations()
    // Auto-refresh every 30 seconds to catch admin status updates
    const interval = setInterval(loadConsultations, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadConsultations = async () => {
    try {
      const res = await fetch('/api/consultations')
      if (res.ok) {
        const data = await res.json()
        setConsultations(data.consultations || [])
      }
    } catch (error) {
      console.error('Error loading consultations:', error)
    }
    setLoading(false)
  }

  const loadConsultationDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConsultation(data.consultation)
        // Also update the list with fresh data
        setConsultations(prev => prev.map(c => c.id === id ? data.consultation : c))
      }
    } catch (error) {
      console.error('Error loading consultation detail:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newConsultation.title || !newConsultation.content) return

    setCreating(true)
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConsultation),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setNewConsultation({ type: 'career', title: '', content: '', preferredDate: '' })
        loadConsultations()
      }
    } catch (error) {
      console.error('Error creating consultation:', error)
    }
    setCreating(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="consultations" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="consultations" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">1:1 상담</h1>
            <p className="text-gray-500 text-sm mt-1">ODA 전문가와 1:1 맞춤 상담을 받아보세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + 상담 요청
          </Button>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {consultationTypes.map((type) => (
            <Card 
              key={type.value}
              className="p-4 text-center cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setNewConsultation({ ...newConsultation, type: type.value })
                setShowCreateModal(true)
              }}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-bold text-sm">{type.label}</div>
              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
            </Card>
          ))}
        </div>

        {/* My Consultations */}
        <h2 className="font-bold text-lg mb-4">내 상담 요청</h2>

        {consultations.length > 0 ? (
          <div className="space-y-4">
            {consultations.map((consultation) => {
              const status = statusConfig[consultation.status] || statusConfig.pending
              const typeInfo = consultationTypes.find(t => t.value === consultation.type)

              return (
                <Card 
                  key={consultation.id} 
                  className="p-5 hover:shadow-md transition cursor-pointer"
                  onClick={() => loadConsultationDetail(consultation.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {typeInfo?.icon || '💬'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{consultation.title}</h3>
                        <Badge label={status.label} variant={status.variant as any} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{consultation.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>요청일: {formatDate(consultation.createdAt)}</span>
                        {consultation.preferredDate && (
                          <span>희망일: {formatDate(consultation.preferredDate)}</span>
                        )}
                        {consultation.expert && (
                          <span>담당자: {consultation.expert.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="text-xl font-bold mb-2">아직 상담 요청이 없습니다</h2>
            <p className="text-gray-500 mb-6">
              ODA 전문가와 1:1 맞춤 상담을 받아보세요!<br />
              경력 설계, 프로젝트 참여, 기술 인증 등 도와드립니다.
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              첫 상담 요청하기
            </Button>
          </Card>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="상담 요청"
            size="lg"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">상담 유형 *</label>
                <div className="grid grid-cols-2 gap-2">
                  {consultationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewConsultation({ ...newConsultation, type: type.value })}
                      className={`p-3 border rounded-lg text-left transition ${
                        newConsultation.type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">제목 *</label>
                <Input
                  value={newConsultation.title}
                  onChange={(e) => setNewConsultation({ ...newConsultation, title: e.target.value })}
                  placeholder="상담 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">상담 내용 *</label>
                <textarea
                  value={newConsultation.content}
                  onChange={(e) => setNewConsultation({ ...newConsultation, content: e.target.value })}
                  placeholder="어떤 도움이 필요하신지 자세히 설명해주세요..."
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 h-32"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">희망 상담 일시</label>
                <Input
                  type="datetime-local"
                  value={newConsultation.preferredDate}
                  onChange={(e) => setNewConsultation({ ...newConsultation, preferredDate: e.target.value })}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                💡 상담 요청 후 1-2영업일 내에 담당자가 연락드립니다.
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? '요청 중...' : '상담 요청'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Detail Modal */}
        {selectedConsultation && (
          <Modal
            isOpen={!!selectedConsultation}
            onClose={() => setSelectedConsultation(null)}
            title="상담 상세"
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{selectedConsultation.title}</h3>
                  <Badge 
                    label={statusConfig[selectedConsultation.status]?.label || '대기 중'} 
                    variant={statusConfig[selectedConsultation.status]?.variant as any || 'gray'} 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm font-medium mb-2">상담 내용</div>
                <p className="text-sm whitespace-pre-wrap">{selectedConsultation.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">요청일</span>
                  <div>{formatDate(selectedConsultation.createdAt)}</div>
                </div>
                {selectedConsultation.preferredDate && (
                  <div>
                    <span className="text-gray-500">희망 일시</span>
                    <div>{formatDate(selectedConsultation.preferredDate)}</div>
                  </div>
                )}
                {selectedConsultation.expert && (
                  <div>
                    <span className="text-gray-500">담당 전문가</span>
                    <div>{selectedConsultation.expert.name}</div>
                  </div>
                )}
              </div>

              {selectedConsultation.replies && selectedConsultation.replies.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    💬 메시지 ({selectedConsultation.replies.length}개)
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedConsultation.replies.map((reply: any, index: number) => (
                      <div 
                        key={reply.id} 
                        className={`p-3 rounded-lg ${
                          index % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-medium text-blue-600 mb-1">
                          👤 {reply.user?.name || '담당자'}
                        </div>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(reply.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}