'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface Education {
  id: string
  school: string
  major: string
  degree: string
  country: string
  graduationYear: number
}

const DEGREE_TYPES = [
  { value: '고등학교', label: '고등학교' },
  { value: '대학교(학사)', label: '대학교 (학사)' },
  { value: '대학교(석사)', label: '대학교 (석사)' },
  { value: '대학교(박사)', label: '대학교 (박사)' },
  { value: '전문대학', label: '전문대학' },
  { value: '기타', label: '기타' },
]

const MAJORS = [
  '교육학', '교육공학', '、初等교육', '교육정책', '국제교육',
  '개발학', '국제개발', '개발경제', '국제관계', '정치학',
  '경제학', '경영학', '회계학', '금융학',
  '보건학', '공중보건', '의학', '간호학',
  '농학', '식품과학', '환경학',
  '사회학', '인류학', '심리학',
  '법학', '국제법',
  '통역/번역', '어학',
  'IT/컴퓨터공학', '데이터사이언스',
  '기타'
]

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    school: '',
    major: '',
    degree: '',
    country: '',
    graduationYear: '',
  })

  useEffect(() => {
    loadEducations()
  }, [])

  const loadEducations = async () => {
    try {
      const res = await fetch('/api/education')
      if (res.ok) {
        const data = await res.json()
        setEducations(data.educations || [])
      }
    } catch (error) {
      console.error('Error loading education:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/education/${editingId}` : '/api/education'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          graduationYear: parseInt(formData.graduationYear),
        }),
      })

      if (res.ok) {
        loadEducations()
        setShowModal(false)
        setEditingId(null)
        setFormData({ school: '', major: '', degree: '', country: '', graduationYear: '' })
      }
    } catch (error) {
      console.error('Error saving education:', error)
    }
  }

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id)
    setFormData({
      school: edu.school,
      major: edu.major,
      degree: edu.degree,
      country: edu.country,
      graduationYear: edu.graduationYear.toString(),
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/education/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setEducations(educations.filter(e => e.id !== id))
      }
    } catch (error) {
      console.error('Error deleting education:', error)
    }
  }

  const getDegreeLabel = (degree: string) => {
    return DEGREE_TYPES.find(d => d.value === degree)?.label || degree
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="education" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="education" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">학력 관리</h1>
            <p className="text-gray-500 text-sm mt-1">최종 학력부터 순서대로 등록해주세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + 학력 추가
          </Button>
        </div>

        {educations.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-xl font-bold mb-2">학력 정보가 없습니다</h2>
            <p className="text-gray-500 mb-6">
              학력 정보를 등록하여 전문가 프로필을 완성하세요.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              학력 추가하기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <Card key={edu.id} className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{edu.school}</h3>
                        <Badge label={getDegreeLabel(edu.degree)} variant="blue" />
                      </div>
                      <p className="text-gray-600">{edu.major}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📍 {edu.country}</span>
                        <span>📅 {edu.graduationYear}년 졸업</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                      수정
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(edu.id)}>
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingId(null); }}
            title={editingId ? '학력 수정' : '학력 추가'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">학교명 *</label>
                <Input
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="예: 서울대학교, Harvard University"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">학위 *</label>
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">선택하세요</option>
                    {DEGREE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">졸업년도 *</label>
                  <Input
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="2020"
                    min="1950"
                    max="2030"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">전공 *</label>
                <select
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  {MAJORS.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">소재 국가 *</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="예: 대한민국, 미국"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  )
}