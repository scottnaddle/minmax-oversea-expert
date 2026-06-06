'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import GradientIcon from '@/components/ui/GradientIcon'
import SectionHeader from '@/components/ui/SectionHeader'
import { CheckCircle2, X, Calendar, Briefcase, User, FileSignature } from 'lucide-react'

interface Verification {
  id: string
  requesterName: string
  requesterEmail: string
  organization: string
  role: string
  country: string
  startDate: string
  endDate?: string | null
  description?: string | null
  status: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  pending: { label: '대기', variant: 'yellow' },
  approved: { label: '승인', variant: 'green' },
  rejected: { label: '반려', variant: 'red' },
}

export default function VerificationPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const res = await fetch('/api/corporate/verifications')
      if (res.ok) {
        const data = await res.json()
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error('Error loading verifications:', error)
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    if (!confirm('이 경력을 확인(승인) 처리하시겠습니까? 전자서명으로 처리됩니다.')) return
    try {
      const res = await fetch(`/api/corporate/verifications/${id}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        loadVerifications()
      }
    } catch (error) {
      console.error('Error approving:', error)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('반려 사유를 입력하세요:')
    if (!reason) return
    try {
      const res = await fetch(`/api/corporate/verifications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        loadVerifications()
      }
    } catch (error) {
      console.error('Error rejecting:', error)
    }
  }

  const filteredVerifications = verifications.filter(v => {
    if (filter === 'all') return true
    return v.status === filter
  })

  if (loading) {
    return (
      <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
        <Sidebar activeItem="verification" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
      <Sidebar activeItem="verification" />

      <div className="flex-1 overflow-auto p-6">
        <SectionHeader
          label="CAREER VERIFICATION"
          title="기업확인요청"
          description="소속기술자가 요청한 경력을 전자서명으로 확인 처리할 수 있습니다"
        />

        {/* 매뉴얼 안내 */}
        <Card className="p-4 mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-start gap-3">
            <GradientIcon icon={<FileSignature size={18} />} color="amber" size="md" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-primary-800 mb-1">📋 매뉴얼 안내</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                경력 확인 시 <strong>기업 범용 공인인증서</strong>로 전자서명하시면 됩니다.
                경력기간·내용이 상이할 경우 반려도 가능합니다. 반려 시 사유를 구체적으로 작성해 주세요.
              </p>
            </div>
          </div>
        </Card>

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'pending', label: `대기 ${verifications.filter(v => v.status === 'pending').length}`, color: 'amber' },
            { id: 'approved', label: `승인 ${verifications.filter(v => v.status === 'approved').length}`, color: 'green' },
            { id: 'rejected', label: `반려 ${verifications.filter(v => v.status === 'rejected').length}`, color: 'red' },
            { id: 'all', label: `전체 ${verifications.length}`, color: 'blue' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                filter === f.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 요청 목록 */}
        {filteredVerifications.length > 0 ? (
          <div className="space-y-3">
            {filteredVerifications.map((v) => {
              const status = statusConfig[v.status] || statusConfig.pending
              return (
                <Card key={v.id} className="p-5 hover:shadow-caind transition" accent={v.status === 'pending' ? 'amber' : v.status === 'approved' ? 'green' : 'red'}>
                  <div className="flex items-start gap-4">
                    <GradientIcon
                      icon={<User size={20} />}
                      color="blue"
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base text-primary-800">{v.requesterName}</h3>
                        <Badge label={status.label} variant={status.variant as any} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">근무처</div>
                          <div className="font-medium text-primary-800">{v.organization}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">직위</div>
                          <div className="font-medium text-primary-800">{v.role}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">근무국가</div>
                          <div className="font-medium text-primary-800">{v.country}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">근무기간</div>
                          <div className="font-medium text-primary-800">
                            {new Date(v.startDate).toLocaleDateString('ko-KR')} ~ {v.endDate ? new Date(v.endDate).toLocaleDateString('ko-KR') : '현재'}
                          </div>
                        </div>
                      </div>
                      {v.description && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="text-xs text-gray-500 mb-1">담당업무</div>
                          <p className="text-xs text-gray-700 leading-relaxed">{v.description}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-400">
                          요청일: {new Date(v.createdAt).toLocaleString('ko-KR')}
                        </div>
                        {v.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReject(v.id)}
                            >
                              <X size={14} className="mr-1" /> 반려
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(v.id)}
                            >
                              <CheckCircle2 size={14} className="mr-1" /> 확인 (전자서명)
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-3">✓</div>
            <h3 className="text-lg font-bold text-primary-800 mb-2">
              {filter === 'pending' ? '대기 중인 확인 요청이 없습니다' : '해당하는 요청이 없습니다'}
            </h3>
            <p className="text-sm text-gray-500">
              소속기술자가 경력 확인을 요청하면 여기에 표시됩니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}