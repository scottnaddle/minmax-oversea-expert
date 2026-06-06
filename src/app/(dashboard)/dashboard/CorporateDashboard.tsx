'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import GradientIcon from '@/components/ui/GradientIcon'
import {
  Users, CheckCircle2, ClipboardList, Receipt, Award, ArrowRight,
  Bell, MessageSquare, Phone, Building2, AlertCircle
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: string
  businessName?: string | null
}

interface Props {
  user: User
}

interface Employee {
  id: string
  name: string
  email: string
  department?: string
  position?: string
  consentGiven: boolean
  paymentConsent: boolean
}

interface PendingVerification {
  id: string
  requesterName: string
  organization: string
  role: string
  startDate: string
  endDate?: string
  createdAt: string
}

export default function CorporateDashboard({ user }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([])
  const [pendingApplications, setPendingApplications] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 소속기술자 목록
      const empRes = await fetch('/api/corporate/employees')
      if (empRes.ok) {
        const data = await empRes.json()
        setEmployees(data.employees || [])
      }

      // 기업확인요청 대기 목록
      const verRes = await fetch('/api/corporate/verifications?status=pending')
      if (verRes.ok) {
        const data = await verRes.json()
        setPendingVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error('Error loading corporate dashboard:', error)
    }
    setLoading(false)
  }

  // 활성 직원 수
  const activeEmployees = employees.filter(e => e.consentGiven).length
  // 결제 위탁 동의한 직원
  const paymentConsents = employees.filter(e => e.paymentConsent).length

  if (loading) {
    return (
      <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
        <Sidebar activeItem="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
      <Sidebar activeItem="dashboard" />

      <div className="flex-1 overflow-auto p-6">
        {/* 인사말 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent-dark border border-accent/40 font-bold">
              🏢 기업회원
            </span>
            <h1 className="text-2xl font-bold text-primary-800">
              {user.businessName || user.name}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            소속기술자 관리 및 기업확인요청을 처리할 수 있습니다.
          </p>
        </div>

        {/* 매뉴얼 기반 3대 핵심 기능 - 기업확인요청 / 대리신청 / 수수료 대납 */}
        <Card className="p-5 mb-5" accent="amber">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-1">CORE SERVICES</div>
              <h2 className="text-lg font-bold text-primary-800">🏢 기업회원 3대 핵심 기능</h2>
              <p className="text-xs text-gray-500 mt-0.5">매뉴얼 기반 기업회원 서비스</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/verification" className="group">
              <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-xl hover:shadow-caind hover:border-primary-300 transition">
                <GradientIcon
                  icon={<CheckCircle2 size={20} />}
                  color="blue"
                  size="lg"
                  className="mb-2"
                />
                <h3 className="font-bold text-sm text-primary-800 group-hover:text-primary-600 mb-1">
                  기업확인요청
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  소속기술자가 요청한 경력을<br />전자서명으로 확인 처리
                </p>
                {pendingVerifications.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {pendingVerifications.length}
                    </span>
                    <span className="text-[10px] text-red-600 font-medium">대기 중</span>
                  </div>
                )}
              </div>
            </Link>
            <Link href="/proxy-applications" className="group">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl hover:shadow-caind hover:border-emerald-300 transition">
                <GradientIcon
                  icon={<ClipboardList size={20} />}
                  color="green"
                  size="lg"
                  className="mb-2"
                />
                <h3 className="font-bold text-sm text-primary-800 group-hover:text-primary-600 mb-1">
                  대리 신청
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  소속기술자의 경력·증명서를<br />대신 신청 가능
                </p>
                {pendingApplications > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                      {pendingApplications}
                    </span>
                    <span className="text-[10px] text-red-600 font-medium">대기</span>
                  </div>
                )}
              </div>
            </Link>
            <Link href="/corporate-payments" className="group">
              <div className="p-4 bg-gradient-to-br from-accent/10 to-amber-50 border-2 border-accent/40 rounded-xl hover:shadow-caind hover:border-accent transition">
                <GradientIcon
                  icon={<Receipt size={20} />}
                  color="amber"
                  size="lg"
                  className="mb-2"
                />
                <h3 className="font-bold text-sm text-primary-800 group-hover:text-primary-600 mb-1">
                  수수료 대납
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  소속기술자의 경력관리비를<br />대신 납부
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] text-accent-dark font-medium">
                    {paymentConsents}명 동의
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="col-span-8 space-y-4">
            {/* 핵심 지표 */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<Users size={18} />} color="blue" size="sm" />
                  <div className="text-xs text-gray-500">총 소속기술자</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{employees.length}</div>
                <div className="text-xs text-gray-400 mt-1">활성 {activeEmployees}명</div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<CheckCircle2 size={18} />} color="green" size="sm" />
                  <div className="text-xs text-gray-500">위탁 동의</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{activeEmployees}</div>
                <div className="text-xs text-gray-400 mt-1">대리 신청 가능</div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<AlertCircle size={18} />} color="amber" size="sm" />
                  <div className="text-xs text-gray-500">확인 대기</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{pendingVerifications.length}</div>
                <div className="text-xs text-gray-400 mt-1">기업확인요청</div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<Receipt size={18} />} color="amber" size="sm" />
                  <div className="text-xs text-gray-500">결제 위탁</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{paymentConsents}</div>
                <div className="text-xs text-gray-400 mt-1">수수료 대납 동의</div>
              </Card>
            </div>

            {/* 기업확인요청 대기 목록 */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-accent uppercase tracking-widest font-bold mb-1">VERIFICATION QUEUE</div>
                  <h2 className="text-lg font-bold text-primary-800">⏳ 기업확인 대기</h2>
                  <p className="text-xs text-gray-500 mt-0.5">소속기술자의 경력 확인 요청 - 전자서명으로 처리</p>
                </div>
                <Link href="/verification">
                  <Button variant="primary" size="sm">전체보기 →</Button>
                </Link>
              </div>

              {pendingVerifications.length > 0 ? (
                <div className="space-y-2">
                  {pendingVerifications.slice(0, 5).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <GradientIcon icon={<CheckCircle2 size={16} />} color="amber" size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-primary-800">{v.requesterName}</h3>
                          <Badge label="대기" variant="yellow" />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {v.organization} · {v.role} · {v.startDate} ~ {v.endDate || '현재'}
                        </p>
                      </div>
                      <Link href={`/verification/${v.id}`}>
                        <Button variant="primary" size="sm">확인하기</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-sm">대기 중인 확인 요청이 없습니다.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-4">
            {/* 소속기술자 미리보기 */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-primary-800 flex items-center gap-2">
                  <Users size={14} /> 소속기술자
                </h3>
                <Link href="/employees" className="text-xs text-primary-600 hover:underline">전체 →</Link>
              </div>
              {employees.length > 0 ? (
                <div className="space-y-2">
                  {employees.slice(0, 4).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {emp.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary-800 truncate">{emp.name}</div>
                        <div className="text-[10px] text-gray-500">{emp.department || emp.position}</div>
                      </div>
                      {emp.consentGiven && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">위탁</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  소속기술자가 없습니다
                </div>
              )}
            </Card>

            {/* 매뉴얼 안내 */}
            <Card className="p-5 bg-gradient-to-br from-accent/10 to-amber-50 border-accent/30">
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-2">MANUAL GUIDE</div>
              <h3 className="text-sm font-bold text-primary-800 mb-2">📖 기업회원 매뉴얼</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                소속기술자 경력관리 위탁 동의가 있어야 대리 신청·수수료 대납이 가능합니다.
              </p>
              <Link href="/guide/koica" className="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline font-medium">
                매뉴얼 보기 →
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}