'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'

interface Expert {
  id: string
  name: string
  bio: string | null
  profileImage: string | null
  currentCountry: string | null
  nationality: string | null
  emailVerified: boolean
  createdAt: string
  careers: Array<{
    id: string
    organization: string
    role: string
    country: string
    startDate: string
    endDate: string | null
    description: string | null
    projects: Array<{
      id: string
      name: string
      description: string
    }>
  }>
  educations: Array<{
    id: string
    school: string
    major: string
    degree: string
    country: string
    graduationYear: number
  }>
  languages: Array<{
    id: string
    language: string
    proficiency: string
    certificate: string | null
    score: string | null
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    issuedDate: string
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    status: string
  }>
}

const tabs = ['경력', '학력', '증빙 자료', '언어/자격증']
const [activeTab, setActiveTab] = useState(0)

export default function ExpertDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadExpert(params.id as string)
      trackProfileView(params.id as string)
    }
  }, [params.id])

  const loadExpert = async (id: string) => {
    try {
      const res = await fetch(`/api/experts/${id}`)
      if (res.ok) {
        const data = await res.json()
        setExpert(data.expert)
      } else if (res.status === 404) {
        router.push('/experts')
      }
    } catch (error) {
      console.error('Error loading expert:', error)
    }
    setLoading(false)
  }

  const trackProfileView = async (id: string) => {
    try {
      await fetch(`/api/experts/${id}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() || !expert) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: expert.id,
          content: messageContent,
        }),
      })

      if (res.ok) {
        setShowMessageModal(false)
        setMessageContent('')
        alert('메시지가 전송되었습니다.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setSending(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
  }

  const getInitials = (name: string) => name.slice(0, 2)

  const getProficiencyLabel = (level: string) => {
    const labels: Record<string, string> = {
      native: '모국어',
      advanced: '상급',
      intermediate: '중급',
      beginner: '초급',
    }
    return labels[level] || level
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">전문가를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  const approvedDocs = expert.documents?.filter(d => d.status === 'approved') || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* Profile header - Hero with gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 bg-white/15 backdrop-blur border-2 border-white/30 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {getInitials(expert.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-accent/20 border border-accent/40 rounded-full text-xs mb-2">
                <span className="text-accent font-bold uppercase tracking-widest">ODA Expert</span>
              </div>
              <div className="flex gap-2 items-center mb-1.5 flex-wrap">
                <span className="text-2xl font-bold">{expert.name}</span>
                {expert.emailVerified && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-primary-900 font-bold">
                    ✓ CAIND 인증
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-white border border-white/30">
                  ODA 전문가
                </span>
              </div>
              <div className="text-sm text-primary-100 mb-2">
                📍 {expert.currentCountry || '위치 미지정'}
                {expert.nationality && ` | 국적: ${expert.nationality}`}
              </div>
              {expert.bio && (
                <p className="text-sm text-primary-50 line-clamp-2 max-w-2xl">{expert.bio}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="accent" onClick={() => setShowMessageModal(true)}>
                💬 연락하기
              </Button>
              <button className="text-xs px-4 py-2 bg-white/10 backdrop-blur border border-white/30 text-white rounded hover:bg-white/20 transition">
                🔖 저장
              </button>
              <button className="text-xs px-4 py-2 bg-white/10 backdrop-blur border border-white/30 text-white rounded hover:bg-white/20 transition">
                🔗 공유
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-4 text-sm whitespace-nowrap transition ${
                index === activeTab
                  ? 'text-primary-700 font-bold border-b-2 border-accent'
                  : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-5 px-6 lg:px-14 py-6 items-start">
        <div className="flex-1">
          {activeTab === 0 && (
            <div>
              <div className="font-bold text-base mb-4">경력 사항 ({expert.careers?.length || 0})</div>
              {expert.careers && expert.careers.length > 0 ? (
                expert.careers.map((career, index) => (
                  <div key={career.id} className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-base">{career.organization}</div>
                        <div className="text-sm text-blue-600">{career.role}</div>
                      </div>
                      <Badge label="✓ 증빙됨" variant="green" />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mb-2">
                      <span>📍 {career.country}</span>
                      <span>📅 {formatDate(career.startDate)} ~ {career.endDate ? formatDate(career.endDate) : '현재'}</span>
                    </div>
                    {career.description && (
                      <p className="text-sm text-gray-600 mb-2">{career.description}</p>
                    )}
                    {career.projects && career.projects.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-500 mb-1">수행 프로젝트:</div>
                        <div className="flex flex-wrap gap-2">
                          {career.projects.map((project) => (
                            <span key={project.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                              {project.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {index < expert.careers.length - 1 && <div className="border-b border-gray-200 mt-4" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">경력 정보가 없습니다.</div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <div className="font-bold text-base mb-4">학력 ({expert.educations?.length || 0})</div>
              {expert.educations && expert.educations.length > 0 ? (
                expert.educations.map((edu, index) => (
                  <div key={edu.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="font-bold">{edu.school}</div>
                    <div className="text-sm text-gray-600">
                      {edu.degree} · {edu.major}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      📍 {edu.country} | 🎓 {edu.graduationYear}년 졸업
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">학력 정보가 없습니다.</div>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <div className="font-bold text-base mb-4">증빙 서류 ({approvedDocs.length})</div>
              {approvedDocs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {approvedDocs.map((doc) => (
                    <Card key={doc.id} className="p-3 flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <div className="text-sm font-medium">{doc.name}</div>
                        <Badge label="인증 완료" variant="green" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">인증된 서류가 없습니다.</div>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <div className="mb-6">
                <div className="font-bold text-base mb-3">언어 능력 ({expert.languages?.length || 0})</div>
                {expert.languages && expert.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {expert.languages.map((lang) => (
                      <div key={lang.id} className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="font-medium text-sm">{lang.language}</div>
                        <div className="text-xs text-gray-500">{getProficiencyLabel(lang.proficiency)}</div>
                        {lang.certificate && (
                          <div className="text-xs text-blue-600 mt-1">
                            📜 {lang.certificate} {lang.score && `(${lang.score})`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">등록된 언어가 없습니다.</div>
                )}
              </div>

              <div>
                <div className="font-bold text-base mb-3">자격증 ({expert.certifications?.length || 0})</div>
                {expert.certifications && expert.certifications.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {expert.certifications.map((cert) => (
                      <Card key={cert.id} className="p-3">
                        <div className="font-medium text-sm">{cert.name}</div>
                        <div className="text-xs text-gray-500">{cert.issuer}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          취득일: {formatDate(cert.issuedDate)}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">등록된 자격증이 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4">
          <Card className="p-4">
            <div className="font-bold text-sm mb-3">기본 정보</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">국적</span>
                <span>{expert.nationality || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">거주지</span>
                <span>{expert.currentCountry || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">경력 수</span>
                <span>{expert.careers?.length || 0}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">인증 서류</span>
                <span>{approvedDocs.length}개</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="font-bold text-sm mb-3">프로필 통계</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">등록일</span>
                <span>{formatDate(expert.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">인증 상태</span>
                <Badge label={expert.emailVerified ? '완료' : '미완료'} variant={expert.emailVerified ? 'green' : 'gray'} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={`${expert.name}에게 메시지 보내기`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">메시지</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="전문가에게 전달할 메시지를 입력하세요..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              required
            />
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowMessageModal(false)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={sending || !messageContent.trim()}>
              {sending ? '보내는 중...' : '보내기'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}