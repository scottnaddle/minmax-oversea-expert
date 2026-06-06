'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface Certificate {
  id: string
  type: string
  title: string
  content: string
  issuedAt: string
  expiresAt: string | null
  holder: {
    name: string
    bio: string | null
    country: string | null
    nationality: string | null
  }
}

function VerifyContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{
    valid: boolean
    expired?: boolean
    certificate?: Certificate
    error?: string
  } | null>(null)

  useEffect(() => {
    const certificateId = params.certificateId as string
    if (certificateId) {
      verifyCertificate(certificateId)
    }
  }, [params.certificateId])

  const verifyCertificate = async (certificateId: string) => {
    try {
      const res = await fetch(`/api/verify/${certificateId}`)
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ valid: false, error: 'Verification failed' })
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🔍</div>
          <p className="text-gray-500">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📜</div>
          <h1 className="text-2xl font-bold">ODA 전문가 경력 인증</h1>
          <p className="text-gray-500 text-sm">ODA 전문가 경력관리 시스템</p>
        </div>

        {result?.valid ? (
          <Card className="p-6">
            {/* Valid Badge */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">✓</span>
              </div>
              <Badge label="유효한 증명서" variant="green" />
              <h2 className="text-xl font-bold mt-2">인증 완료</h2>
            </div>

            {/* Certificate Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500">인증서 번호</div>
                <div className="font-mono font-bold text-lg">{result.certificate?.id}</div>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">증명서 종류</div>
                  <div className="font-medium">{result.certificate?.type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">제목</div>
                  <div className="font-medium">{result.certificate?.title}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">내용</div>
                  <div className="text-sm">{result.certificate?.content}</div>
                </div>
              </div>
            </div>

            {/* Holder Info */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-sm mb-3">소유자 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">이름</span>
                  <span className="font-medium">{result.certificate?.holder.name}</span>
                </div>
                {result.certificate?.holder.nationality && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">국적</span>
                    <span>{result.certificate.holder.nationality}</span>
                  </div>
                )}
                {result.certificate?.holder.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">거주지</span>
                    <span>{result.certificate.holder.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">발급일</span>
                  <span>{result.certificate?.issuedAt && formatDate(result.certificate.issuedAt)}</span>
                </div>
                {result.certificate?.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">만료일</span>
                    <span>{formatDate(result.certificate.expiresAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 mt-4 text-center text-xs text-gray-400">
              이 증명서는 ODA 전문가 경력관리 시스템에서 발급되었습니다.<br />
              진위 여부는 위 QR 코드를 통해 확인할 수 있습니다.
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            {/* Invalid Badge */}
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl text-red-500">✕</span>
              </div>
              <Badge label={result?.expired ? '만료된 증명서' : '유효하지 않은 증명서'} variant="red" />
              <h2 className="text-xl font-bold mt-2 mb-4">
                {result?.expired ? '만료된 증명서' : '인증 실패'}
              </h2>
              <p className="text-gray-500">
                {result?.error || (
                  result?.expired 
                    ? '해당 증명서는 만료되었습니다.'
                    : '유효하지 않은 인증서 번호이거나 존재하지 않는 증명서입니다.'
                )}
              </p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <a href="/" className="text-blue-600 hover:underline">
            ODA 전문가 경력관리 시스템으로 이동
          </a>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🔍</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}