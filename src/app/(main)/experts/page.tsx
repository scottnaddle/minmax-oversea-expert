'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface Expert {
  id: string
  name: string
  title: string
  location: string
  years: string
  bio: string | null
  nationality: string | null
  verified: boolean
  careerCount: number
  documentCount: number
  createdAt: string
}

const industries = ['금융', 'IT/기술', '건설/엔지니어링', '의료/보건', '교육', '마케팅', '에너지', ' 농업']
const countries = ['싱가포르', 'UAE', '미국', '영국', '베트남', '한국', '일본', '중국', '기타']

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)

  useEffect(() => {
    loadExperts()
  }, [page, searchQuery, selectedCountry, showVerifiedOnly])

  const loadExperts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCountry) params.set('country', selectedCountry)
      params.set('page', page.toString())

      const res = await fetch(`/api/experts?${params}`)
      if (res.ok) {
        const data = await res.json()
        let filteredExperts = data.experts || []
        
        // Client-side filter for verified only (since API doesn't have this filter yet)
        if (showVerifiedOnly) {
          filteredExperts = filteredExperts.filter((e: Expert) => e.verified)
        }
        
        setExperts(filteredExperts)
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Error loading experts:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadExperts()
  }

  const getInitials = (name: string) => name.slice(0, 2)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Search Section - 랜딩 톤앤매너 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div aria-hidden="true" className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-xs mb-3">
            <span className="text-accent font-bold uppercase tracking-widest">Find Experts</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">ODA 전문가 찾기</h1>
          <p className="text-sm text-primary-100 mb-5">검증된 글로벌 ODA 전문가를 검색하고 매칭하세요</p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 items-center max-w-2xl">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="전문 분야, 이름, 키워드 검색..."
                className="w-full h-11 pl-11 pr-4 rounded-lg text-gray-800 text-sm bg-white shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 bg-accent text-primary-900 rounded-lg font-bold hover:bg-accent-light transition"
            >
              검색
            </button>
          </form>
        </div>
      </section>

      <div className="flex">
        {/* Filter sidebar */}
        <aside className="w-[260px] bg-white border-r border-gray-200 py-5 px-4 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-accent rounded"></div>
            <div className="font-bold text-sm text-primary-800">필터</div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-xs mb-2 text-gray-700 flex justify-between">
              <span>전문 분야</span>
              <span className="text-gray-400">▾</span>
            </div>
            {industries.map((industry) => (
              <label key={industry} className="flex items-center gap-2 py-1.5 text-xs text-gray-700 cursor-pointer hover:text-primary-700 transition">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span>{industry}</span>
              </label>
            ))}
            <div className="h-px bg-gray-100 mt-3" />
          </div>

          <div className="mb-4">
            <div className="font-bold text-xs mb-2 text-gray-700 flex justify-between">
              <span>근무 국가</span>
              <span className="text-gray-400">▾</span>
            </div>
            {countries.map((country) => (
              <div
                key={country}
                className={`flex items-center gap-2 py-1.5 text-xs cursor-pointer transition ${
                  selectedCountry === country ? 'text-primary-700 font-semibold' : 'text-gray-700 hover:text-primary-700'
                }`}
                onClick={() => setSelectedCountry(selectedCountry === country ? '' : country)}
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                  selectedCountry === country ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                }`}>
                  {selectedCountry === country && <span className="text-white text-[10px]">✓</span>}
                </span>
                <span>{country}</span>
              </div>
            ))}
            <div className="h-px bg-gray-100 mt-3" />
          </div>

          <label
            className={`flex items-center gap-2 py-2 text-xs cursor-pointer transition ${
              showVerifiedOnly ? 'text-primary-700 font-semibold' : 'text-gray-700'
            }`}
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
          >
            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
              showVerifiedOnly ? 'bg-accent border-accent' : 'border-gray-300'
            }`}>
              {showVerifiedOnly && <span className="text-white text-[10px]">✓</span>}
            </span>
            <span>🏆 CAIND 인증 전문가만</span>
          </label>

          {(selectedCountry || showVerifiedOnly) && (
            <button
              onClick={() => { setSelectedCountry(''); setShowVerifiedOnly(false); }}
              className="text-xs text-primary-600 hover:underline mt-3 font-medium"
            >
              필터 초기화
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="text-xs text-accent uppercase tracking-widest font-bold mb-1">RESULTS</div>
              <h2 className="text-2xl font-bold text-primary-800">
                <span className="text-accent">{total}</span>명의 전문가
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              정렬: <span className="text-primary-700 font-medium cursor-pointer">최근 등록순 ▾</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : experts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {experts.map((expert) => (
                  <Link
                    key={expert.id}
                    href={`/experts/${expert.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-caind hover:border-primary-200 transition group"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {getInitials(expert.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm text-primary-800 truncate group-hover:text-primary-600 transition">{expert.name}</div>
                          {expert.verified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-dark border border-accent/40 font-semibold shrink-0">
                              ✓ 인증
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate">{expert.title}</div>
                        <div className="text-xs text-gray-500">📍 {expert.location}</div>
                      </div>
                    </div>

                    {expert.bio && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {expert.bio}
                      </p>
                    )}

                    <div className="flex gap-1.5 mb-3">
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-100">
                        경력 {expert.careerCount}건
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                        서류 {expert.documentCount}건
                      </span>
                    </div>

                    <div className="block w-full text-center border border-primary-200 rounded-lg py-2 text-xs font-medium text-primary-700 group-hover:bg-primary-50 transition">
                      프로필 보기 →
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← 이전
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 text-sm rounded-lg transition ${
                          page === pageNum
                            ? 'bg-primary-600 text-white border border-primary-600 shadow-sm'
                            : 'border border-gray-200 hover:bg-primary-50 hover:border-primary-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    다음 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-primary-800 mb-2">검색 결과가 없습니다</h2>
              <p className="text-sm text-gray-500">다른 키워드로 검색하거나 필터를 조정해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}