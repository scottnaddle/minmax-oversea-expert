'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Note from '@/components/ui/Note'
import Modal from '@/components/ui/Modal'

interface Document {
  id: string
  name: string
  type: string
  status: string
  rejectionReason?: string
  createdAt: string
  fileUrl?: string
}

const DOCUMENT_TYPES = [
  { value: '재직증명서', label: '재직증명서', icon: '📋' },
  { value: '학위증명서', label: '학위증명서', icon: '🎓' },
  { value: '자격증', label: '자격증', icon: '🏆' },
  { value: '퇴직증명서', label: '퇴직증명서', icon: '📜' },
  { value: '경력증명서', label: '경력증명서', icon: '💼' },
  { value: '포트폴리오', label: '포트폴리오', icon: '📁' },
  { value: '평가서', label: '평가서/추천서', icon: '⭐' },
  { value: '기타', label: '기타', icon: '📎' },
]

const statusConfig = {
  approved: { label: '인증 완료', color: 'green', icon: '✅' },
  pending: { label: '검토 중', color: 'yellow', icon: '⏳' },
  rejected: { label: '반려', color: 'red', icon: '❌' },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
    setLoading(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', uploadType)
      formData.append('name', selectedFile.name)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        loadDocuments()
        setShowUploadModal(false)
        setSelectedFile(null)
        setUploadType('')
      }
    } catch (error) {
      console.error('Error uploading:', error)
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 서류를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Stats
  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="documents" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="documents" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">증빙 서류 관리</h1>
            <p className="text-gray-500 text-sm mt-1">경력 및 전문가 인증을 위한 서류를 관리하세요</p>
          </div>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            + 서류 업로드
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <Card 
            className={`p-4 cursor-pointer transition ${filter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilter('all')}
          >
            <div className="text-gray-500 text-xs mb-1">전체</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card 
            className={`p-4 cursor-pointer transition ${filter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setFilter('approved')}
          >
            <div className="text-green-600 text-xs mb-1">인증 완료</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </Card>
          <Card 
            className={`p-4 cursor-pointer transition ${filter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <div className="text-yellow-600 text-xs mb-1">검토 중</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </Card>
          <Card 
            className={`p-4 cursor-pointer transition ${filter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            <div className="text-red-500 text-xs mb-1">반려</div>
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="서류명 또는 종류로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Documents List */}
        {filteredDocs.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">파일명</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">종류</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">업로드일</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => {
                  const typeInfo = DOCUMENT_TYPES.find(t => t.value === doc.type) || DOCUMENT_TYPES[7]
                  const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeInfo.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{doc.name}</div>
                            {doc.status === 'rejected' && doc.rejectionReason && (
                              <div className="text-xs text-red-500 mt-1">
                                반려 사유: {doc.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={typeInfo.label} variant="gray" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{status.icon}</span>
                          <Badge label={status.label} variant={status.color as any} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {doc.fileUrl && (
                            <Button variant="secondary" size="sm">보기</Button>
                          )}
                          {doc.status === 'rejected' && (
                            <Button variant="primary" size="sm">재제출</Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500"
                            onClick={() => handleDelete(doc.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">
              {searchQuery ? '🔍' : '📋'}
            </div>
            <h2 className="text-xl font-bold mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '업로드된 서류가 없습니다'}
            </h2>
            <p className="text-gray-500 mb-6">
              {!searchQuery && '재직증명서, 학위증명서, 자격증 등을 업로드하여\n전문가 인증을 완료하세요.'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                서류 업로드
              </Button>
            )}
          </Card>
        )}

        {/* Tips */}
        {!searchQuery && stats.pending === 0 && stats.total > 0 && (
          <Note type="info">
            💡 팁: 재직증명서, 자격증 등 공식 서류를 인증하면 전문가 신뢰도가 높아집니다.
          </Note>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <Modal
            isOpen={showUploadModal}
            onClose={() => { setShowUploadModal(false); setSelectedFile(null); setUploadType(''); }}
            title="서류 업로드"
          >
            <div className="space-y-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium mb-2">서류 종류 *</label>
                <div className="grid grid-cols-4 gap-2">
                  {DOCUMENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setUploadType(type.value)}
                      className={`p-3 border rounded-lg text-center transition ${
                        uploadType === type.value 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <div className="text-xl mb-1">{type.icon}</div>
                      <div className="text-xs">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">파일 선택 *</label>
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📤</div>
                      <div className="text-gray-600">클릭하여 파일 선택</div>
                      <div className="text-xs text-gray-400 mt-1">
                        PDF, JPG, PNG (최대 10MB)
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Notice */}
              <Note type="warning">
                ⚠️ 파일은 검토 후 인증 처리됩니다. 깨끗한 스캔본이나 원본 스캔 파일을 업로드해주세요.
              </Note>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                  취소
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadType || uploading}
                >
                  {uploading ? '업로드 중...' : '업로드'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}