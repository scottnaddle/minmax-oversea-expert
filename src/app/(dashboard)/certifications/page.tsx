'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface Certification {
  id: string
  name: string
  issuer: string
  issuedDate: string
  expirationDate: string | null
  credentialId: string | null
}

const COMMON_CERTS = [
  { name: 'PMP', issuer: 'PMI' },
  { name: 'スクラムマスター', issuer: 'Scrum Alliance' },
  { name: 'TOEFL', issuer: 'ETS' },
  { name: 'IELTS', issuer: 'British Council / IDP' },
  { name: 'HSK', issuer: '孔子学院总部/国家汉办' },
  { name: 'CFA', issuer: 'CFA Institute' },
  { name: 'CPA', issuer: 'American Institute of CPAs' },
  { name: '공인행정사', issuer: '대한민국 행정안전부' },
  { name: '국제개발전문가', issuer: 'KOICA' },
  { name: 'ODA 전문가', issuer: '한국국제협력단' },
]

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issuedDate: '',
    expirationDate: '',
    credentialId: '',
  })

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      const res = await fetch('/api/certifications')
      if (res.ok) {
        const data = await res.json()
        setCerts(data.certifications || [])
      }
    } catch (error) {
      console.error('Error loading certifications:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/certifications/${editingId}` : '/api/certifications'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        loadCertifications()
        setShowModal(false)
        setEditingId(null)
        setFormData({ name: '', issuer: '', issuedDate: '', expirationDate: '', credentialId: '' })
      }
    } catch (error) {
      console.error('Error saving certification:', error)
    }
  }

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id)
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issuedDate: cert.issuedDate.split('T')[0],
      expirationDate: cert.expirationDate?.split('T')[0] || '',
      credentialId: cert.credentialId || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCerts(certs.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting certification:', error)
    }
  }

  const selectQuickCert = (cert: typeof COMMON_CERTS[0]) => {
    setFormData({ ...formData, name: cert.name, issuer: cert.issuer })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="certifications" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="certifications" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">자격증 관리</h1>
            <p className="text-gray-500 text-sm mt-1">공인 자격증 및 면허증을 등록하세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + 자격증 추가
          </Button>
        </div>

        {certs.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold mb-2">자격증이 없습니다</h2>
            <p className="text-gray-500 mb-6">
              PMP, CFA, 공인자격증 등을 등록하여<br />
              전문가 역량을 증명하세요.
            </p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              자격증 추가하기
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {certs.map((cert) => (
              <Card key={cert.id} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                    🏅
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cert)}>
                      수정
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(cert.id)}>
                      삭제
                    </Button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.issuer}</p>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <div>취득일: {new Date(cert.issuedDate).toLocaleDateString('ko-KR')}</div>
                  {cert.expirationDate && (
                    <div>유효기간: {new Date(cert.expirationDate).toLocaleDateString('ko-KR')}</div>
                  )}
                  {cert.credentialId && (
                    <div className="text-gray-400">자격번호: {cert.credentialId}</div>
                  )}
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
            title={editingId ? '자격증 수정' : '자격증 추가'}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Select */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-2">자주 등록하는 자격증</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CERTS.map((cert) => (
                      <button
                        key={cert.name}
                        type="button"
                        onClick={() => selectQuickCert(cert)}
                        className="px-3 py-1 text-xs border rounded-full hover:bg-blue-50 hover:border-blue-400 transition"
                      >
                        {cert.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">자격증명 *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: PMP, CFA Level 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">발급 기관 *</label>
                  <Input
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="예: PMI, CFA Institute"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">취득일 *</label>
                  <Input
                    type="date"
                    value={formData.issuedDate}
                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">유효기간</label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">자격번호 (Credential ID)</label>
                <Input
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="발급 기관에서 부여한 고유 번호"
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