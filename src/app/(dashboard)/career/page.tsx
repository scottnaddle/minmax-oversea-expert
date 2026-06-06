'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Note from '@/components/ui/Note'

interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string | null
  country: string
  role: string
  contribution: string
}

interface Career {
  id: string
  organization: string
  country: string
  startDate: string
  endDate: string | null
  role: string
  description: string
  projects: Project[]
}

const ODA_ORGS = [
  { name: 'KOICA', fullName: '한국국제협력단', color: 'blue' },
  { name: 'UNESCO', fullName: '유네스코', color: 'purple' },
  { name: 'World Bank', fullName: '세계은행', color: 'green' },
  { name: 'JICA', fullName: '일본국제협력기구', color: 'orange' },
  { name: 'UNICEF', fullName: '유니세프', color: 'pink' },
  { name: 'WHO', fullName: '세계보건기구', color: 'red' },
  { name: 'KDI', fullName: '한국개발원', color: 'blue' },
  { name: 'ADB', fullName: '아시아개발은행', color: 'yellow' },
]

const ODA_SECTORS = ['교육정책', '교육현장', '교사양성', '교육내용', '교육기술', '청년就业', '职业教育', '교육행정', '교육시설', '기타']
const ODA_PROJECT_TYPES = ['기술협력', '是无偿援助', '차입금', '민관협력', '현장파견', '컨설팅', '역량강화', '정책자문']

export default function CareerPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    organization: '',
    country: '',
    startDate: '',
    endDate: '',
    role: '',
    description: '',
  })
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    country: '',
    role: '',
    contribution: '',
  })

  useEffect(() => {
    loadCareers()
  }, [])

  const loadCareers = async () => {
    try {
      const res = await fetch('/api/careers')
      if (res.ok) {
        const data = await res.json()
        setCareers(data.careers || [])
      }
    } catch (error) {
      console.error('Error loading careers:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCareer 
        ? `/api/careers/${editingCareer.id}`
        : '/api/careers'
      const method = editingCareer ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        loadCareers()
        setShowModal(false)
        setEditingCareer(null)
        setFormData({ organization: '', country: '', startDate: '', endDate: '', role: '', description: '' })
      }
    } catch (error) {
      console.error('Error saving career:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 경력을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/careers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCareers(careers.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting career:', error)
    }
  }

  const handleEdit = (career: Career) => {
    setEditingCareer(career)
    setFormData({
      organization: career.organization,
      country: career.country,
      startDate: career.startDate.split('T')[0],
      endDate: career.endDate?.split('T')[0] || '',
      role: career.role,
      description: career.description || '',
    })
    setShowModal(true)
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectForm,
          careerId: selectedCareerId,
        }),
      })

      if (res.ok) {
        loadCareers()
        setShowProjectModal(false)
        setSelectedCareerId(null)
        setProjectForm({ name: '', description: '', startDate: '', endDate: '', country: '', role: '', contribution: '' })
      }
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleProjectDelete = async (projectId: string) => {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (res.ok) {
        loadCareers()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
  }

  const getOrgInfo = (orgName: string) => {
    return ODA_ORGS.find(org => orgName && orgName.includes(org.name))
  }

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const months = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years > 0) {
      return remainingMonths > 0 ? `${years}년 ${remainingMonths}개월` : `${years}년`
    }
    return `${months}개월`
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="career" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="career" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">경력 관리</h1>
            <p className="text-gray-500 text-sm mt-1">ODA 프로젝트 경력을 등록하고 관리하세요</p>
          </div>
          <Button variant="primary" onClick={() => { setEditingCareer(null); setShowModal(true); }}>
            + 경력 추가
          </Button>
        </div>

        {careers.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">💼</div>
            <h2 className="text-xl font-bold mb-2">ODA 프로젝트 경력이 없습니다</h2>
            <p className="text-gray-500 mb-6">
              KOICA, UNESCO, World Bank 등 국제기구에서의<br />
              개발협력 경험을 등록해보세요.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              첫 경력 추가하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {careers.map((career) => {
              const orgInfo = getOrgInfo(career.organization)
              const duration = calculateDuration(career.startDate, career.endDate)
              
              return (
                <Card key={career.id} className="p-5">
                  {/* Career Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{career.organization}</h3>
                        {orgInfo && (
                          <Badge label={orgInfo.name} variant={orgInfo.color as any} />
                        )}
                        <Badge label="ODA" variant="blue" />
                      </div>
                      <p className="text-gray-600">{career.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(career)}>
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(career.id)}>
                        삭제
                      </Button>
                    </div>
                  </div>

                  {/* Career Info */}
                  <div className="flex gap-6 text-sm text-gray-500 mb-4">
                    <span>📍 {career.country}</span>
                    <span>📅 {formatDate(career.startDate)} ~ {career.endDate ? formatDate(career.endDate) : '현재'}</span>
                    <span>⏱️ {duration}</span>
                    <span>📋 {career.projects?.length || 0}개 프로젝트</span>
                  </div>

                  {career.description && (
                    <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
                      {career.description}
                    </p>
                  )}

                  {/* Projects Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-sm">프로젝트 목록</h4>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => { setSelectedCareerId(career.id); setShowProjectModal(true); }}
                      >
                        + 프로젝트 추가
                      </Button>
                    </div>

                    {career.projects && career.projects.length > 0 ? (
                      <div className="space-y-2">
                        {career.projects.map((project) => (
                          <div key={project.id} className="bg-blue-50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-sm">{project.name}</h5>
                                <p className="text-xs text-gray-500 mt-1">
                                  {project.role} | {project.country} | {formatDate(project.startDate)} ~ {project.endDate ? formatDate(project.endDate) : '진행중'}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400"
                                onClick={() => handleProjectDelete(project.id)}
                              >
                                ×
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">{project.description}</p>
                            {project.contribution && (
                              <div className="mt-2 p-2 bg-white rounded text-xs">
                                <span className="font-medium text-blue-600">담당 업무:</span> {project.contribution}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded">
                        등록된 프로젝트가 없습니다
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Career Add/Edit Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingCareer(null); }}
            title={editingCareer ? '경력 수정' : '경력 추가'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">기관명 *</label>
                <select
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <optgroup label=" двусторонняя">
                    <option value="KOICA">KOICA (한국국제협력단)</option>
                    <option value="JICA">JICA (일본국제협력기구)</option>
                    <option value="USAID">USAID (미국국제개발처)</option>
                    <option value="DFAT">DFAT (호주외무무역성)</option>
                    <option value="GIZ">GIZ (독일국제협력기구)</option>
                  </optgroup>
                  <optgroup label="다자간">
                    <option value="UNESCO">UNESCO (유네스코)</option>
                    <option value="World Bank">World Bank (세계은행)</option>
                    <option value="UNICEF">UNICEF (유니세프)</option>
                    <option value="WHO">WHO (세계보건기구)</option>
                    <option value="ADB">ADB (아시아개발은행)</option>
                    <option value="UNDP">UNDP (유엔개발계획)</option>
                  </optgroup>
                  <optgroup label="국내">
                    <option value="KDI School">KDI School</option>
                    <option value="KOICA">KOICA</option>
                  </optgroup>
                  <optgroup label="기타">
                    <option value="기타">기타</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">근무 국가 *</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="예: 우간다, 캄보디아"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">직책/역할 *</label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="예: 교육전문가, 컨설턴트"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">시작일 *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">종료일</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                  <label className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <input type="checkbox" checked={!formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.checked ? '' : formData.endDate })} />
                    재직 중
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="경력에 대한 상세 설명"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  {editingCareer ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Project Add Modal */}
        {showProjectModal && (
          <Modal
            isOpen={showProjectModal}
            onClose={() => { setShowProjectModal(false); setSelectedCareerId(null); }}
            title="프로젝트 추가"
          >
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">프로젝트명 *</label>
                <Input
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="예: ○○ 교육역량 강화 프로젝트"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">프로젝트 설명</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="프로젝트에 대한 설명"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">수행 국가 *</label>
                  <Input
                    value={projectForm.country}
                    onChange={(e) => setProjectForm({ ...projectForm, country: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">담당 역할</label>
                  <Input
                    value={projectForm.role}
                    onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })}
                    placeholder="예: 교육과정 개발"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">시작일 *</label>
                  <Input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">종료일</label>
                  <Input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">담당 업무 (Contribution)</label>
                <textarea
                  value={projectForm.contribution}
                  onChange={(e) => setProjectForm({ ...projectForm, contribution: e.target.value })}
                  placeholder="본인이该项目에서 담당한 구체적인 업무를 입력하세요"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowProjectModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  추가
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}