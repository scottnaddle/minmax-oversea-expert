'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface Reply {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; role: string }
}

interface Inquiry {
  id: string
  title: string
  content: string
  category: string
  status: string
  isPrivate: boolean
  createdAt: string
  user: { id: string; name: string }
  replies: Reply[]
}

const categoryLabels: Record<string, string> = {
  general: '일반 문의',
  career: '경력 관련',
  project: '프로젝트 관련',
  technical: '기술 지원',
  consultation: '상담 요청',
}

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadInquiry(params.id as string)
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => loadInquiry(params.id as string), 30000)
      return () => clearInterval(interval)
    }
  }, [params.id])

  const loadInquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`)
      if (res.ok) {
        const data = await res.json()
        setInquiry(data.inquiry)
      } else if (res.status === 404) {
        router.push('/inquiries')
      }
    } catch (error) {
      console.error('Error loading inquiry:', error)
    }
    setLoading(false)
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !inquiry) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })

      if (res.ok) {
        setReplyContent('')
        loadInquiry(inquiry.id)
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!inquiry) return

    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/inquiries')
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="inquiries" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="inquiries" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">문의를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  const statusConfig = {
    open: { label: '답변 대기', variant: 'yellow' },
    answered: { label: '답변 완료', variant: 'green' },
    closed: { label: '종료', variant: 'gray' },
  }

  const status = statusConfig[inquiry.status as keyof typeof statusConfig] || statusConfig.open

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="inquiries" />
      
      <div className="flex-1 overflow-auto p-5">
        {/* Back button */}
        <Link href="/inquiries" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← 문의 목록으로
        </Link>

        <div className="grid grid-cols-3 gap-5">
          {/* Main content */}
          <div className="col-span-2 space-y-4">
            {/* Question */}
            <Card className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge label={categoryLabels[inquiry.category] || inquiry.category} variant="blue" />
                    <Badge label={status.label} variant={status.variant as any} />
                    {inquiry.isPrivate && <span className="text-xs">🔒 비밀글</span>}
                  </div>
                  <h1 className="text-xl font-bold">{inquiry.title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {inquiry.user.name.slice(0, 2)}
                </div>
                <span className="font-medium">{inquiry.user.name}</span>
                <span>·</span>
                <span>{formatDate(inquiry.createdAt)}</span>
              </div>

              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{inquiry.content}</p>
              </div>
            </Card>

            {/* Replies */}
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800">답변 ({inquiry.replies?.length || 0})</h2>

              {inquiry.replies && inquiry.replies.length > 0 ? (
                inquiry.replies.map((reply) => (
                  <Card key={reply.id} className="p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        reply.user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {reply.user.name.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{reply.user.name}</span>
                          {reply.user.role === 'admin' && (
                            <Badge label="관리자" variant="red" />
                          )}
                          <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  아직 답변이 없습니다.
                </Card>
              )}
            </div>

            {/* Reply Form */}
            <Card className="p-4">
              <h3 className="font-bold text-sm mb-3">답변 작성</h3>
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24 mb-3"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" disabled={submitting || !replyContent.trim()}>
                    {submitting ? '등록 중...' : '답변 등록'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold text-sm mb-3">문의 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">분류</span>
                  <span>{categoryLabels[inquiry.category] || inquiry.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상태</span>
                  <Badge label={status.label} variant={status.variant as any} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">조회수</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">답변 수</span>
                  <span>{inquiry.replies?.length || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-sm mb-3">작성자</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {inquiry.user.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-sm">{inquiry.user.name}</div>
                  <div className="text-xs text-gray-500">게시글 작성자</div>
                </div>
              </div>
            </Card>

            <Button variant="secondary" className="w-full" onClick={() => router.push('/inquiries')}>
              목록으로
            </Button>

            <Button 
              variant="ghost" 
              className="w-full text-red-500" 
              onClick={() => setShowDeleteModal(true)}
            >
              삭제
            </Button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="문의 삭제"
          >
            <p className="mb-4">정말 이 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                취소
              </Button>
              <Button variant="primary" className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}