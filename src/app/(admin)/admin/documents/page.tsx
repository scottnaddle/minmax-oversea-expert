'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Document {
  id: string
  name: string
  type: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [statusFilter, typeFilter])

  const loadDocuments = async () => {
    try {
      let url = '/api/admin/documents'
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (params.toString()) url += '?' + params.toString()

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
    setLoading(false)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(documents.map(d => d.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectDoc = (id: string) => {
    if (selectedDocs.includes(id)) {
      setSelectedDocs(selectedDocs.filter(d => d !== id))
    } else {
      setSelectedDocs([...selectedDocs, id])
    }
  }

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedDocs.length === 0) {
      setMessage('선택된 문서가 없습니다.')
      return
    }

    if (!confirm(`선택한 ${selectedDocs.length}건의 문서를 ${action === 'approve' ? '승인' : '거절'} 처리하시겠습니까?`)) {
      return
    }

    try {
      const status = action === 'approve' ? 'approved' : 'rejected'
      let successCount = 0
      let failCount = 0

      for (const id of selectedDocs) {
        const res = await fetch(`/api/admin/documents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (res.ok) {
          successCount++
        } else {
          failCount++
        }
      }

      setMessage(`${successCount}건 처리 완료${failCount > 0 ? `, ${failCount}건 실패` : ''}`)
      setSelectedDocs([])
      setSelectAll(false)
      loadDocuments()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('일괄 처리 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setMessage(`문서가 ${status === 'approved' ? '승인' : '거절'} 처리되었습니다.`)
        loadDocuments()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id))
        setMessage('문서가 삭제되었습니다.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  // Filter documents by search query
  const filteredDocuments = searchQuery
    ? documents.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      employment: '재직증명',
      degree: '학위증명',
      certification: '자격증',
      language: '어학성적',
      portfolio: '포트폴리오',
      other: '기타',
    }
    return labels[type] || type
  }

  const getStatusStats = () => ({
    pending: documents.filter(d => d.status === 'pending').length,
    approved: documents.filter(d => d.status === 'approved').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  })

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">서류 관리</h1>
        <div className="text-sm text-gray-500">
          전체 {documents.length}건 | 대기 {stats.pending} | 승인 {stats.approved} | 거절 {stats.rejected}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded text-sm text-blue-800">
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="문서명, 사용자명, 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded text-sm ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s === '' ? '전체' : s === 'pending' ? '대기' : s === 'approved' ? '승인' : '거절'}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="">모든 유형</option>
            <option value="employment">재직증명</option>
            <option value="degree">학위증명</option>
            <option value="certification">자격증</option>
            <option value="language">어학성적</option>
            <option value="portfolio">포트폴리오</option>
            <option value="other">기타</option>
          </select>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedDocs.length > 0 && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedDocs.length}건 선택됨
            </span>
            <button
              onClick={() => { setSelectedDocs([]); setSelectAll(false) }}
              className="text-xs text-blue-600 hover:underline"
            >
              선택 해제
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBatchAction('approve')}
            >
              일괄 승인
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBatchAction('reject')}
            >
              일괄 거절
            </Button>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll && selectedDocs.length === filteredDocuments.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">문서명</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">유형</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">사용자</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상태</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">등록일</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocuments.map((doc) => (
              <tr
                key={doc.id}
                className={`hover:bg-gray-50 ${selectedDocs.includes(doc.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => handleSelectDoc(doc.id)}
                    className="w-4 h-4 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-sm truncate max-w-[200px]">{doc.name}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getTypeLabel(doc.type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">{doc.user.name}</div>
                  <div className="text-xs text-gray-500">{doc.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status === 'approved' ? '승인' :
                     doc.status === 'rejected' ? '거절' : '대기'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {doc.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(doc.id, 'approved')}
                      >
                        승인
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                      >
                        거절
                      </Button>
                    </div>
                  )}
                  {doc.status !== 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(doc.id)}
                    >
                      삭제
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDocuments.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            {searchQuery ? '검색 결과가 없습니다.' : '해당하는 서류가 없습니다.'}
          </div>
        )}
      </div>

      {/* Pagination info */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        총 {filteredDocuments.length}건 표시
        {searchQuery && documents.length !== filteredDocuments.length && (
          <span> (전체 {documents.length}건 중)</span>
        )}
      </div>
    </div>
  )
}