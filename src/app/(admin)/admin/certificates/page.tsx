'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

interface CertificateRequest {
  id: string
  type: string
  title: string
  content: string
  status: string
  createdAt: string
  payment: { amount: number; status: string; stripePaymentId: string } | null
  document: { certificateId: string; qrCode: string } | null
  user: { id: string; name: string; email: string }
}

const typeLabels: Record<string, string> = {
  career: '경력 증명서',
  oda_experience: 'ODA 경력 증명서',
  project: '프로젝트 증명서',
  education: '학력 증명서',
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  pending: { label: '요청 대기', variant: 'gray' },
  paid: { label: '결제 완료', variant: 'blue' },
  approved: { label: '승인 완료', variant: 'green' },
  issued: { label: '발급 완료', variant: 'green' },
  rejected: { label: '거절', variant: 'red' },
}

export default function AdminCertificatesPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      // Load all certificate requests (admin sees all)
      const res = await fetch('/api/admin/certificates')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (res.ok) {
        loadRequests()
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error approving:', error)
    }
    setProcessing(false)
  }

  const handleReject = async (id: string) => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (res.ok) {
        loadRequests()
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    }
    setProcessing(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter)

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending' || r.status === 'paid').length,
    issued: requests.filter(r => r.status === 'issued').length,
    revenue: requests
      .filter(r => r.payment?.status === 'completed')
      .reduce((sum, r) => sum + (r.payment?.amount || 0), 0),
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
          <h1 className="text-2xl font-bold">증명서 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {stats.total}건 | 대기 {stats.pending}건 | 발급 {stats.issued}건 | 수익 ₩{formatPrice(stats.revenue)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-500">전체 신청</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-gray-500">처리 대기</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
          <div className="text-xs text-gray-500">발급 완료</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">₩{formatPrice(stats.revenue)}</div>
          <div className="text-xs text-gray-500">총 수익</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: '전체' },
          { key: 'pending', label: '요청 대기' },
          { key: 'paid', label: '결제 완료' },
          { key: 'issued', label: '발급 완료' },
          { key: 'rejected', label: '거절' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm rounded ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Request List */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredRequests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.pending
              const isSelected = selectedRequest?.id === request.id

              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate">{request.title}</span>
                    <Badge label={status.label} variant={status.variant as any} />
                  </div>
                  <div className="text-xs text-gray-500">
                    {request.user.name} · {formatDate(request.createdAt)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {typeLabels[request.type] || request.type}
                    {request.payment && ` · ₩${formatPrice(request.payment.amount)}`}
                  </div>
                </div>
              )
            })}
            {filteredRequests.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                신청이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="col-span-2">
          {selectedRequest ? (
            <Card className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge label={typeLabels[selectedRequest.type] || selectedRequest.type} variant="blue" />
                  <h2 className="text-lg font-bold mt-2">{selectedRequest.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedRequest.user.name} ({selectedRequest.user.email})
                  </div>
                </div>
                <Badge 
                  label={statusConfig[selectedRequest.status]?.label || selectedRequest.status} 
                  variant={statusConfig[selectedRequest.status]?.variant as any} 
                />
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="whitespace-pre-wrap text-sm">{selectedRequest.content}</p>
              </div>

              {/* Payment Info */}
              {selectedRequest.payment && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold text-sm mb-2">결제 정보</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">결제 금액</span>
                      <span className="font-medium">₩{formatPrice(selectedRequest.payment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">결제 상태</span>
                      <Badge 
                        label={selectedRequest.payment.status === 'completed' ? '결제 완료' : '결제 대기'} 
                        variant={selectedRequest.payment.status === 'completed' ? 'green' : 'yellow'} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Certificate Document */}
              {selectedRequest.document && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="font-bold text-sm mb-2">발급된 증명서</h3>
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedRequest.document.qrCode} 
                      alt="QR Code" 
                      className="w-24 h-24"
                    />
                    <div>
                      <div className="font-mono font-bold">{selectedRequest.document.certificateId}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        검증 URL: /verify/{selectedRequest.document.certificateId}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'paid') && (
                <div className="border-t pt-4 flex gap-2 justify-end">
                  <Button 
                    variant="secondary"
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={processing}
                    className="text-red-500"
                  >
                    거절
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={processing}
                  >
                    {processing ? '처리 중...' : '승인 및 발급'}
                  </Button>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                신청일: {formatDate(selectedRequest.createdAt)}
              </div>
            </Card>
          ) : (
            <Card className="p-10 text-center text-gray-500">
              신청을 선택해주세요
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}