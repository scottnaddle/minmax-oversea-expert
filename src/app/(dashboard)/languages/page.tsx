'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface Language {
  id: string
  language: string
  proficiency: string
  certificate: string | null
  score: string | null
  expirationDate: string | null
}

const LANGUAGES = [
  '한국어', '영어', '중국어', '일본어', '스페인어', '프랑스어',
  '독일어', '포르투갈어', '러시아어', '아랍어', '베트남어',
  '태국어', '인도네시아어', '말레이시아어', '몽골어', '캄보디아어',
  '라오스어', '미얀마어', '네팔어', '스리랑카어', '힌디어',
  '베냉어', '크메르어', '기타'
]

const PROFICIENCY_LEVELS = [
  { value: 'native', label: '모국어', color: 'green' },
  { value: 'advanced', label: '상급', color: 'blue' },
  { value: 'intermediate', label: '중급', color: 'yellow' },
  { value: 'beginner', label: '초급', color: 'gray' },
]

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    language: '',
    proficiency: '',
    certificate: '',
    score: '',
    expirationDate: '',
  })

  useEffect(() => {
    loadLanguages()
  }, [])

  const loadLanguages = async () => {
    try {
      const res = await fetch('/api/languages')
      if (res.ok) {
        const data = await res.json()
        setLanguages(data.languages || [])
      }
    } catch (error) {
      console.error('Error loading languages:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/languages/${editingId}` : '/api/languages'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        loadLanguages()
        setShowModal(false)
        setEditingId(null)
        setFormData({ language: '', proficiency: '', certificate: '', score: '', expirationDate: '' })
      }
    } catch (error) {
      console.error('Error saving language:', error)
    }
  }

  const handleEdit = (lang: Language) => {
    setEditingId(lang.id)
    setFormData({
      language: lang.language,
      proficiency: lang.proficiency,
      certificate: lang.certificate || '',
      score: lang.score || '',
      expirationDate: lang.expirationDate?.split('T')[0] || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/languages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLanguages(languages.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Error deleting language:', error)
    }
  }

  const getProficiencyInfo = (level: string) => {
    return PROFICIENCY_LEVELS.find(p => p.value === level) || PROFICIENCY_LEVELS[3]
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="languages" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="languages" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">어학 능력</h1>
            <p className="text-gray-500 text-sm mt-1">사용 가능한 언어와 자격증을 등록하세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + 언어 추가
          </Button>
        </div>

        {languages.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">🗣️</div>
            <h2 className="text-xl font-bold mb-2">어학 능력이 등록되지 않았습니다</h2>
            <p className="text-gray-500 mb-6">
              영어, 중국어, 일본어 등 사용 가능한 언어를 등록하세요.<br />
              공인어학시험 결과를 함께 등록하면 신뢰도가 높아집니다.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              언어 추가하기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => {
              const profInfo = getProficiencyInfo(lang.proficiency)
              
              return (
                <Card key={lang.id} className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {lang.language === '영어' ? '🇺🇸' :
                         lang.language === '중국어' ? '🇨🇳' :
                         lang.language === '일본어' ? '🇯🇵' :
                         lang.language === '한국어' ? '🇰🇷' : '🌍'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{lang.language}</h3>
                        <Badge label={profInfo.label} variant={profInfo.color as any} />
                        {lang.certificate && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">📜 {lang.certificate}</span>
                            {lang.score && <span className="ml-2">({lang.score})</span>}
                          </div>
                        )}
                        {lang.expirationDate && (
                          <div className="text-xs text-gray-400 mt-1">
                            유효기간: {new Date(lang.expirationDate).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(lang)}>
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(lang.id)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingId(null); }}
            title={editingId ? '어학 수정' : '어학 추가'}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">언어 *</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택하세요</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">숙련도 *</label>
                <div className="grid grid-cols-4 gap-2">
                  {PROFICIENCY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, proficiency: level.value })}
                      className={`p-3 border rounded-lg text-center transition ${
                        formData.proficiency === level.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                        level.color === 'green' ? 'bg-green-500' :
                        level.color === 'blue' ? 'bg-blue-500' :
                        level.color === 'yellow' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <div className="text-xs">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3 text-gray-600">공인어학시험 (선택)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">시험명</label>
                    <Input
                      value={formData.certificate}
                      onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      placeholder="예: TOEFL, IELTS, HSK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">점수/등급</label>
                    <Input
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                      placeholder="예: 110, 7.5, 6급"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">유효기간</label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
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