'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface CertificateRequest {
  id: string
  type: string
  title: string
  content: string
  status: string
  createdAt: string
  issuedAt: string | null
  payment: { amount: number; status: string } | null
  document: { certificateId: string; qrCode: string } | null
}

const CERTIFICATE_TYPES = [
  { 
    value: 'career', 
    label: '경력 증명서', 
    price: 55000,
    icon: '💼',
    description: 'ODA 프로젝트 경력을 공식적으로 증명합니다',
    fields: ['근무 기관', '직책', '근무 기간', '담당 업무']
  },
  { 
    value: 'oda_experience', 
    label: 'ODA 경력 증명서', 
    price: 77000,
    icon: '🌍',
    description: 'KOICA, UNESCO 등 국제기구 경력을 인증합니다',
    fields: ['국제기구명', '파견 기간', '프로젝트명', '담당 역할']
  },
  { 
    value: 'project', 
    label: '프로젝트 증명서', 
    price: 44000,
    icon: '📋',
    description: '특정 프로젝트 참여经历的官方认证',
    fields: ['프로젝트명', '수행 기간', '수행 기관', '프로젝트 내용']
  },
  { 
    value: 'education', 
    label: '학력 증명서', 
    price: 33000,
    icon: '🎓',
    description: '교육 이수经历的공식 인증',
    fields: ['교육 기관', '교육 과정', '수료 기간', '이수 내용']
  },
]

const statusConfig: Record<string, { label: string; variant: string }> = {
  pending: { label: '요청 대기', variant: 'gray' },
  paid: { label: '결제 완료', variant: 'blue' },
  approved: { label: '승인 완료', variant: 'green' },
  issued: { label: '발급 완료', variant: 'green' },
  rejected: { label: '거절', variant: 'red' },
}

export default function CertificatesPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [creating, setCreating] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<CertificateRequest | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const res = await fetch('/api/certificates')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !formData.title || !formData.content) return

    setCreating(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          ...formData,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setShowCreateModal(false)
        setFormData({ title: '', content: '' })
        setPendingRequest(data.certificateRequest)
        
        // Create payment intent
        const paymentRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            certificateType: selectedType,
            certificateRequestId: data.certificateRequest.id,
          }),
        })

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json()
          setClientSecret(paymentData.clientSecret)
          setShowPaymentModal(true)
        }
        
        loadCertificates()
      }
    } catch (error) {
      console.error('Error creating certificate:', error)
    }
    setCreating(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="certificates" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="certificates" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">증명서 발급</h1>
            <p className="text-gray-500 text-sm mt-1">ODA 전문가 경력을 공식적으로 증명받으세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + 증명서 신청
          </Button>
        </div>

        {/* Certificate Types */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {CERTIFICATE_TYPES.map((type) => (
            <Card 
              key={type.value}
              className="p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setSelectedType(type.value)
                setShowCreateModal(true)
              }}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-bold text-sm mb-1">{type.label}</div>
              <div className="text-xs text-gray-500 mb-2">{type.description}</div>
              <div className="text-lg font-bold text-blue-600">
                ₩{formatPrice(type.price)}
              </div>
            </Card>
          ))}
        </div>

        {/* My Requests */}
        <h2 className="font-bold text-lg mb-4">내 신청 목록</h2>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => {
              const typeInfo = CERTIFICATE_TYPES.find(t => t.value === request.type)
              const status = statusConfig[request.status] || statusConfig.pending

              return (
                <Card key={request.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {typeInfo?.icon || '📄'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{request.title}</h3>
                        <Badge label={status.label} variant={status.variant as any} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{request.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>신청일: {formatDate(request.createdAt)}</span>
                        {request.payment && (
                          <span>결제: ₩{formatPrice(request.payment.amount)}</span>
                        )}
                        {request.document && (
                          <span>인증 ID: {request.document.certificateId}</span>
                        )}
                      </div>
                    </div>
                    {request.status === 'issued' && request.document && (
                      <div className="text-center">
                        <img 
                          src={request.document.qrCode} 
                          alt="QR Code" 
                          className="w-20 h-20 mb-2"
                        />
                        <Button variant="secondary" size="sm">
                          PDF 다운로드
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">📜</div>
            <h2 className="text-xl font-bold mb-2">아직 신청한 증명서가 없습니다</h2>
            <p className="text-gray-500 mb-6">
              ODA 전문가 경력을 공식적으로 증명받고<br />
              QR 코드로 인증받을 수 있습니다.
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              첫 증명서 신청하기
            </Button>
          </Card>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            isOpen={showCreateModal}
            onClose={() => { setShowCreateModal(false); setFormData({ title: '', content: '' }); }}
            title={selectedType ? CERTIFICATE_TYPES.find(t => t.value === selectedType)?.label + ' 신청' : '증명서 신청'}
            size="lg"
          >
            {!selectedType ? (
              <div className="grid grid-cols-2 gap-4">
                {CERTIFICATE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className="p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-bold">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                    <p className="text-sm font-bold text-blue-600">₩{formatPrice(type.price)}</p>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded flex items-center gap-2">
                  <span className="text-2xl">{CERTIFICATE_TYPES.find(t => t.value === selectedType)?.icon}</span>
                  <div>
                    <div className="font-medium">{CERTIFICATE_TYPES.find(t => t.value === selectedType)?.label}</div>
                    <div className="text-xs text-blue-600">
                      ₩{formatPrice(CERTIFICATE_TYPES.find(t => t.value === selectedType)?.price || 0)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedType('')}>
                    변경
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">증명서 제목 *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: KOICA 파견 경력 증명"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">상세 내용 *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="증명받고 싶은 내용을 상세히 작성해주세요..."
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 h-40"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                  💡 증명서 발급 후 QR 코드가 포함되며, 누구나 QR 코드로 경력을 확인할 수 있습니다.
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                    취소
                  </Button>
                  <Button type="submit" variant="primary" disabled={creating}>
                    {creating ? '처리 중...' : '결제하기'}
                  </Button>
                </div>
              </form>
            )}
          </Modal>
        )}

        {/* Payment Modal (Simplified - In production, use Stripe Elements) */}
        {showPaymentModal && (
          <Modal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            title="결제"
          >
            <div className="text-center py-4">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="font-bold text-lg mb-2">결제 정보</h3>
              <p className="text-gray-500 mb-4">
                결제 모듈 연동 준비 중입니다.<br />
                (Stripe 연동 예정)
              </p>
              <div className="bg-gray-100 p-4 rounded mb-4 text-left text-sm">
                <div className="flex justify-between mb-2">
                  <span>증명서 발급비</span>
                  <span className="font-bold">
                    ₩{formatPrice(pendingRequest ? CERTIFICATE_TYPES.find(t => t.value === pendingRequest.type)?.price || 0 : 0)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ※ 결제 완료 후 관리자의 승인 절차가 진행됩니다.
                </div>
              </div>
              <Button variant="primary" onClick={() => {
                alert('Stripe 결제 연동 필요 (.env에 Stripe 키 설정)')
              }}>
                Stripe로 결제하기
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}