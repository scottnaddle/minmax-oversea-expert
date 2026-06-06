'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import GradientIcon from '@/components/ui/GradientIcon'
import { Briefcase, FileText, CheckCircle2, Award, Users, ArrowRight, BookOpen, Languages, GraduationCap, Bell, MessageSquare, Phone } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface Props {
  user: User
}

interface Career {
  id: string
  organization: string
  country: string
  startDate: string
  endDate: string | null
  role: string
  category?: string
  applicationStatus?: string
  verificationStatus?: string
  _count: { projects: number }
}

interface Document {
  id: string
  name: string
  type: string
  status: string
}

interface Stats {
  totalCareers: number
  totalProjects: number
  pendingDocuments: number
  approvedDocuments: number
  rejectedDocuments: number
}

// 매뉴얼 기준 6가지 경력 신청 카테고리
const careerCategories = [
  { value: 'employment', label: '근무경력', icon: '💼' },
  { value: 'technical', label: '기술경력', icon: '⚙️' },
  { value: 'education', label: '학력', icon: '🎓' },
  { value: 'certification', label: '기술자격', icon: '📜' },
  { value: 'training', label: '교육', icon: '📚' },
  { value: 'award', label: '상훈', icon: '🏆' },
]

const ODA_ORGS = ['KOICA', 'UNESCO', 'World Bank', 'JICA', 'KDI School', 'UNICEF', 'WHO', 'ADB', 'UNDP', 'USAID']

export default function PersonalDashboard({ user }: Props) {
  const [careers, setCareers] = useState<Career[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCareers: 0,
    totalProjects: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const careersRes = await fetch('/api/careers')
      if (careersRes.ok) {
        const data = await careersRes.json()
        setCareers(data.careers || [])
        setStats(prev => ({
          ...prev,
          totalCareers: data.careers?.length || 0,
          totalProjects: data.careers?.reduce((sum: number, c: Career) => sum + (c._count?.projects || 0), 0) || 0,
        }))
      }

      const docsRes = await fetch('/api/documents')
      if (docsRes.ok) {
        const data = await docsRes.json()
        const docs: Document[] = data.documents || []
        setStats(prev => ({
          ...prev,
          pendingDocuments: docs.filter(d => d.status === 'pending').length,
          approvedDocuments: docs.filter(d => d.status === 'approved').length,
          rejectedDocuments: docs.filter(d => d.status === 'rejected').length,
        }))
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
    setLoading(false)
  }

  // 프로필 완성도 계산
  const completeness = 75 // TODO: 실제 계산

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
          <h1 className="text-2xl font-bold text-primary-800">
            안녕하세요, {user.name}님 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            CAIND ODA 전문가 경력관리 시스템에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 매뉴얼 기반 빠른 액션 - 6가지 경력 신청 */}
        <Card className="p-5 mb-5" accent="amber">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-1">QUICK ACTIONS</div>
              <h2 className="text-lg font-bold text-primary-800">📋 경력 신청하기</h2>
              <p className="text-xs text-gray-500 mt-0.5">매뉴얼 기준 6가지 경력 카테고리</p>
            </div>
            <Link href="/career/new">
              <Button variant="accent" size="sm">+ 새 신청</Button>
            </Link>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {careerCategories.map((cat) => (
              <Link
                key={cat.value}
                href={`/career/new?category=${cat.value}`}
                className="group"
              >
                <div className="text-center px-2 py-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition">
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-primary-800 group-hover:text-primary-600">
                    {cat.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<Briefcase size={18} />} color="blue" size="sm" />
                  <div className="text-xs text-gray-500">경력 신청</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{stats.totalCareers}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ODA {careers.filter(c => c.organization && ODA_ORGS.some(org => c.organization.includes(org))).length}개
                </div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<Award size={18} />} color="purple" size="sm" />
                  <div className="text-xs text-gray-500">자격/교육</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">-</div>
                <div className="text-xs text-gray-400 mt-1">자격증 + 교육이수</div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<FileText size={18} />} color="green" size="sm" />
                  <div className="text-xs text-gray-500">증빙 서류</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{stats.approvedDocuments}</div>
                <div className="text-xs text-gray-400 mt-1">
                  총 {stats.pendingDocuments + stats.approvedDocuments + stats.rejectedDocuments}개
                </div>
              </Card>
              <Card className="p-4" interactive>
                <div className="flex items-center gap-2 mb-2">
                  <GradientIcon icon={<CheckCircle2 size={18} />} color="orange" size="sm" />
                  <div className="text-xs text-gray-500">프로필 완성도</div>
                </div>
                <div className="text-2xl font-bold text-primary-800">{completeness}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-accent h-1.5 rounded-full"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </Card>
            </div>

            {/* 경력 신청내역 타임라인 (매뉴얼 진행상태) */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-accent uppercase tracking-widest font-bold mb-1">APPLICATIONS</div>
                  <h2 className="text-lg font-bold text-primary-800">📂 내 경력 신청내역</h2>
                </div>
                <Link href="/applications" className="text-xs text-primary-600 hover:underline font-medium">
                  전체보기 →
                </Link>
              </div>

              {careers.length > 0 ? (
                <div className="space-y-2">
                  {careers.slice(0, 3).map((career, index) => {
                    const cat = careerCategories.find(c => c.value === (career as any).category)
                    return (
                      <div
                        key={career.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center text-white text-base shrink-0">
                          {cat?.icon || '💼'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-primary-800 truncate">{career.organization}</h3>
                            <Badge
                              label={(career as any).applicationStatus === 'completed' ? '완료' : '검토중'}
                              variant={(career as any).applicationStatus === 'completed' ? 'green' : 'yellow'}
                            />
                            <Badge
                              label={(career as any).verificationStatus === 'verified' ? '✓ 검증완료' : '미검증'}
                              variant={(career as any).verificationStatus === 'verified' ? 'blue' : 'gray'}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {career.role} · {career.country}
                          </p>
                        </div>
                        <Link href={`/career/${career.id}`} className="text-xs text-primary-600 hover:underline">
                          상세 →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">아직 신청한 경력이 없습니다.</p>
                  <Link href="/career/new" className="text-xs text-primary-600 hover:underline">
                    첫 경력 신청하기 →
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-4">
            {/* 빠른 서비스 */}
            <Card className="p-5">
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-2">QUICK SERVICES</div>
              <h3 className="text-sm font-bold text-primary-800 mb-3">🚀 자주 사용하는 메뉴</h3>
              <div className="space-y-1">
                {[
                  { icon: FileText, label: '증명서 발급', href: '/certificates', desc: 'CAIND 공인 증명서' },
                  { icon: Bell, label: '보완 서류', href: '/supplements', desc: '협회 보완 요청 확인' },
                  { icon: MessageSquare, label: '문의 게시판', href: '/inquiries', desc: '1:1 문의' },
                  { icon: Phone, label: '1:1 상담', href: '/consultations', desc: '전문가 상담' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-primary-50 transition group"
                    >
                      <GradientIcon icon={<Icon size={14} />} color="blue" size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary-800 group-hover:text-primary-600">{item.label}</div>
                        <div className="text-[10px] text-gray-500">{item.desc}</div>
                      </div>
                      <ArrowRight size={12} className="text-gray-400" />
                    </Link>
                  )
                })}
              </div>
            </Card>

            {/* 매뉴얼 안내 */}
            <Card className="p-5 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-2">MANUAL GUIDE</div>
              <h3 className="text-sm font-bold text-primary-800 mb-2">📖 매뉴얼 안내</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                SW기술자 경력관리 매뉴얼에 따라 경력 신청 → 협회 검토 → 보완 → 완료 절차로 진행됩니다.
              </p>
              <Link href="/guide/procedure/overview" className="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline font-medium">
                매뉴얼 보기 →
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}