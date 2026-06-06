'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import GradientIcon from '@/components/ui/GradientIcon'
import SectionHeader from '@/components/ui/SectionHeader'
import {
  Users, Mail, Briefcase, Calendar, ArrowRight, Plus, CheckCircle2, Receipt, UserCheck
} from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  currentCountry?: string | null
  bio?: string | null
  department?: string | null
  position?: string | null
  consentGiven: boolean
  consentType?: string | null
  consentStartDate?: string | null
  consentEndDate?: string | null
  paymentConsent: boolean
  status: string
  careerCount: number
  documentCount: number
}

const consentColors: Record<string, { label: string; color: string }> = {
  full: { label: '전체 위탁', color: 'green' },
  partial: { label: '부분 위탁', color: 'amber' },
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'consent' | 'payment'>('all')

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/corporate/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
    setLoading(false)
  }

  const filteredEmployees = employees.filter(emp => {
    if (filter === 'all') return true
    if (filter === 'active') return emp.status === 'active'
    if (filter === 'consent') return emp.consentGiven
    if (filter === 'payment') return emp.paymentConsent
    return true
  })

  if (loading) {
    return (
      <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
        <Sidebar activeItem="employees" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-68px)] bg-page-gradient flex">
      <Sidebar activeItem="employees" />

      <div className="flex-1 overflow-auto p-6">
        <SectionHeader
          label="EMPLOYEE MANAGEMENT"
          title="소속기술자 관리"
          description="위탁 동의한 소속기술자를 조회하고 관리할 수 있습니다"
        />

        {/* 필터 + 액션 */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-2">
            {[
              { id: 'all', label: `전체 ${employees.length}` },
              { id: 'active', label: `활성 ${employees.filter(e => e.status === 'active').length}` },
              { id: 'consent', label: `위탁동의 ${employees.filter(e => e.consentGiven).length}` },
              { id: 'payment', label: `결제동의 ${employees.filter(e => e.paymentConsent).length}` },
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
          <Button variant="accent" size="sm">
            <Plus size={14} className="mr-1" /> 소속기술자 초대
          </Button>
        </div>

        {/* 안내 배너 */}
        <Card className="p-4 mb-4 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start gap-3">
            <GradientIcon icon={<Users size={18} />} color="blue" size="md" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-primary-800 mb-1">📋 매뉴얼 안내</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                소속기술자 경력관리는 <strong>위탁 동의</strong>가 필수입니다. 위탁 동의한 기술자에 한해 대리 신청 및 수수료 대납이 가능합니다.
                동의 종료일 이후에는 조회·관리가 불가하니 기간을 관리해 주세요.
              </p>
            </div>
          </div>
        </Card>

        {/* 직원 목록 */}
        {filteredEmployees.length > 0 ? (
          <div className="space-y-3">
            {filteredEmployees.map((emp) => (
              <Card key={emp.id} className="p-4 hover:shadow-caind transition">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.name.slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-primary-800">{emp.name}</h3>
                      {emp.consentGiven && (
                        <Badge
                          label={consentColors[emp.consentType || 'full']?.label || '위탁동의'}
                          variant={emp.consentType === 'full' ? 'green' : 'yellow'}
                        />
                      )}
                      {emp.paymentConsent && (
                        <Badge label="💰 결제위탁" variant="blue" />
                      )}
                      <Badge
                        label={emp.status === 'active' ? '활성' : '비활성'}
                        variant={emp.status === 'active' ? 'green' : 'gray'}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {emp.email}
                      </span>
                      {emp.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} /> {emp.department}
                        </span>
                      )}
                      {emp.consentEndDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> 동의종료: {new Date(emp.consentEndDate).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                    {emp.bio && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{emp.bio}</p>
                    )}
                  </div>

                  {/* Stats + Actions */}
                  <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-base font-bold text-primary-800">{emp.careerCount}</div>
                      <div className="text-[10px] text-gray-500">경력</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-primary-800">{emp.documentCount}</div>
                      <div className="text-[10px] text-gray-500">서류</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="secondary" size="sm">상세보기</Button>
                    <Button variant="ghost" size="sm">대리신청</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-primary-800 mb-2">소속기술자가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">
              기술자가 회원정보에서 경력관리 위탁에 동의하면 자동으로 등록됩니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}