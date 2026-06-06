'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientIcon from '@/components/ui/GradientIcon'

interface GuideItem {
  id: string
  title: string
  description: string
  icon: string
}

interface GuideMeta {
  title: string
  description: string
}

const iconStyle: Record<string, { color: any; emoji: string }> = {
  policy: { color: 'blue', emoji: '📋' },
  procedure: { color: 'green', emoji: '📝' },
  koica: { color: 'purple', emoji: '🏛️' },
  notice: { color: 'orange', emoji: '📢' },
}

export default function GuidePage() {
  const [meta, setMeta] = useState<GuideMeta | null>(null)
  const [items, setItems] = useState<GuideItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [_, setPageLoaded] = useState(false)

  useEffect(() => {
    loadGuide()
  }, [])

  const loadGuide = async () => {
    try {
      const res = await fetch('/api/guide')
      if (res.ok) {
        const data = await res.json()
        setMeta(data.meta)
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error loading guide:', error)
    }
    setLoading(false)
    setPageLoaded(true)
  }

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-page-gradient flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-gradient">
      {/* Hero - CAIND 네이비 그라데이션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        {/* Decorative Pattern */}
        <div aria-hidden="true" className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="guide-hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#guide-hero-grid)"/>
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-xs mb-4">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span className="text-accent font-bold uppercase tracking-widest">GUIDE CENTER</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
            {meta?.title || 'ODA 전문가 가이드'}
          </h1>
          <p className="text-base text-primary-100 max-w-2xl mb-8">
            {meta?.description || '모든 정보를 한 곳에서 확인하세요'}
          </p>

          {/* Search Box */}
          <div className="max-w-xl">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="원하는 가이드를 검색하세요..."
                className="w-full h-12 pl-12 pr-4 rounded-xl text-gray-800 text-sm bg-white shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            <div>
              <div className="text-2xl font-bold text-accent">{items.length}</div>
              <div className="text-xs text-primary-200">전체 가이드</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <div className="text-2xl font-bold text-accent">100%</div>
              <div className="text-xs text-primary-200">무료 제공</div>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <div className="text-2xl font-bold text-accent">24/7</div>
              <div className="text-xs text-primary-200">언제든 열람</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <SectionHeader
          label="GUIDE LIST"
          title="가이드 목록"
          description={`${filteredItems.length}개의 가이드를 찾았습니다`}
        />

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-5">
            {filteredItems.map((item, index) => {
              const style = iconStyle[item.icon] || iconStyle.policy
              return (
                <Link key={item.id} href={`/guide/${item.id}`} className="group">
                  <Card
                    className="relative overflow-hidden hover:shadow-caind-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 p-0"
                    interactive
                    bordered={false}
                  >
                    {/* Gradient Accent Bar */}
                    <div className={`h-1 bg-gradient-to-r ${
                      style.color === 'blue' ? 'from-primary-500 to-indigo-600' :
                      style.color === 'green' ? 'from-emerald-500 to-teal-600' :
                      style.color === 'purple' ? 'from-purple-500 to-pink-600' :
                      'from-orange-500 to-red-500'
                    }`}></div>

                    <div className="p-6">
                      {/* Icon + Title */}
                      <div className="flex items-start gap-4 mb-4">
                        <GradientIcon
                          icon={<span>{style.emoji}</span>}
                          color={style.color}
                          size="lg"
                          badge={
                            <span className="text-primary-700 text-[8px]">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-primary-800 mb-1 group-hover:text-primary-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>📖 가이드</span>
                          <span>·</span>
                          <span>5분 분량</span>
                        </div>
                        <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                          읽기 <span>→</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="p-16 text-center" bordered>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-primary-800 mb-2">검색 결과가 없습니다</h3>
            <p className="text-sm text-gray-500 mb-4">다른 키워드로 검색해보세요.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-primary-600 hover:underline font-medium"
            >
              전체 가이드 보기 →
            </button>
          </Card>
        )}

        {/* Quick Services */}
        <div className="mt-16">
          <SectionHeader
            label="QUICK ACCESS"
            title="빠른 서비스"
            description="가이드 외 자주 사용하는 서비스로 빠르게 이동하세요"
          />
          <div className="grid grid-cols-3 gap-4">
            <Link href="/experts">
              <Card className="p-5 hover:shadow-caind-lg hover:border-primary-200 transition-all group" interactive>
                <GradientIcon
                  icon={<span>🔍</span>}
                  color="blue"
                  size="md"
                  className="mb-3"
                />
                <h3 className="font-bold text-sm mb-1 text-primary-800">전문가 검색</h3>
                <p className="text-xs text-gray-500">ODA 전문가를 찾아보세요</p>
              </Card>
            </Link>
            <Link href="/inquiries">
              <Card className="p-5 hover:shadow-caind-lg hover:border-primary-200 transition-all group" interactive>
                <GradientIcon
                  icon={<span>💬</span>}
                  color="green"
                  size="md"
                  className="mb-3"
                />
                <h3 className="font-bold text-sm mb-1 text-primary-800">문의 게시판</h3>
                <p className="text-xs text-gray-500">질문하고 답변을 받아보세요</p>
              </Card>
            </Link>
            <Link href="/consultations">
              <Card className="p-5 hover:shadow-caind-lg hover:border-primary-200 transition-all group" interactive>
                <GradientIcon
                  icon={<span>📞</span>}
                  color="purple"
                  size="md"
                  className="mb-3"
                />
                <h3 className="font-bold text-sm mb-1 text-primary-800">1:1 상담</h3>
                <p className="text-xs text-gray-500">전문가와 직접 상담</p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}