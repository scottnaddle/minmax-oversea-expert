'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import Card from '@/components/ui/Card'

interface GuideItem {
  id: string
  title: string
  description: string
  icon: string
  content: string
}

interface GuideMeta {
  title: string
  description: string
}

interface GuideListItem {
  id: string
  title: string
  description: string
  icon: string
}

const iconStyle: Record<string, { gradient: string; emoji: string; bgLight: string; textColor: string }> = {
  policy: {
    gradient: 'from-primary-800 via-primary-700 to-primary-600',
    emoji: '📋',
    bgLight: 'bg-primary-50',
    textColor: 'text-primary-700'
  },
  procedure: { 
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600', 
    emoji: '📝',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  koica: {
    gradient: 'from-primary-700 via-primary-600 to-primary-800',
    emoji: '🏛️',
    bgLight: 'bg-primary-50',
    textColor: 'text-primary-700'
  },
  notice: {
    gradient: 'from-primary-800 via-primary-700 to-primary-600',
    emoji: '📢',
    bgLight: 'bg-accent/10',
    textColor: 'text-accent-dark'
  },
}

export default function GuideItemPage() {
  const params = useParams()
  const itemId = params.item as string

  const [item, setItem] = useState<GuideItem | null>(null)
  const [meta, setMeta] = useState<GuideMeta | null>(null)
  const [allItems, setAllItems] = useState<GuideListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (itemId) {
      loadAll()
    }
  }, [itemId])

  const loadAll = async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const [itemRes, listRes] = await Promise.all([
        fetch(`/api/guide?item=${itemId}`),
        fetch('/api/guide'),
      ])

      if (itemRes.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (itemRes.ok) {
        const data = await itemRes.json()
        setItem(data.item)
        setMeta(data.meta)
      } else {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (listRes.ok) {
        const data = await listRes.json()
        setAllItems(data.items || [])
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setNotFound(true)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-6">요청하신 가이드 문서가 존재하지 않습니다.</p>
          <Link href="/guide" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            ← 가이드 홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const style = iconStyle[item.icon] || iconStyle.policy
  const currentIndex = allItems.findIndex((i) => i.id === itemId)
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null
  const nextItem = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null

  // Estimate reading time
  const wordCount = item.content.length
  const readTime = Math.max(1, Math.ceil(wordCount / 500))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Banner with gradient */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} text-white`}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300 rounded-full blur-3xl"></div>
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-xs opacity-80 mb-6 flex items-center gap-2">
            <Link href="/guide" className="hover:opacity-100 hover:underline">가이드</Link>
            <span>›</span>
            <span className="opacity-100">{item.title}</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="text-6xl shrink-0">{style.emoji}</div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs mb-3">
                <span>📖 가이드</span>
                <span>·</span>
                <span>약 {readTime}분</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">{item.title}</h1>
              <p className="text-sm opacity-90 leading-relaxed">{item.description}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/20">
            <button className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-md transition flex items-center gap-1">
              <span>👍</span> 도움됨
            </button>
            <button className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-md transition flex items-center gap-1">
              <span>🔗</span> 공유
            </button>
            <button className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-md transition flex items-center gap-1">
              <span>📑</span> 북마크
            </button>
            <button className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-md transition flex items-center gap-1">
              <span>🖨️</span> 인쇄
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="col-span-1">
            <div className="sticky top-4 space-y-3">
              {/* Table of Contents Card */}
              <Card className={`p-4 ${style.bgLight} border-2 border-opacity-20`}>
                <h3 className={`font-bold text-sm mb-3 ${style.textColor} flex items-center gap-2`}>
                  <span>📑</span> 목차
                </h3>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li><a href="#overview" className="hover:text-blue-600">개요</a></li>
                  <li><a href="#details" className="hover:text-blue-600">상세 내용</a></li>
                  <li><a href="#related" className="hover:text-blue-600">관련 가이드</a></li>
                </ul>
              </Card>

              {/* All Guides Card */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <span>📚</span> 전체 가이드
                </h3>
                <ul className="space-y-1">
                  {allItems.map((i) => {
                    const isActive = i.id === itemId
                    const itemStyle = iconStyle[i.icon] || iconStyle.policy
                    return (
                      <li key={i.id}>
                        <Link
                          href={`/guide/${i.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                            isActive
                              ? `${style.bgLight} ${style.textColor} font-semibold`
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{itemStyle.emoji}</span>
                          <span className="truncate">{i.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Card>

              {/* Contact CTA */}
              <Card className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                <h3 className="font-bold text-sm mb-2 text-primary-800">💬 도움이 필요하신가요?</h3>
                <p className="text-xs text-gray-600 mb-3">전문가에게 직접 문의하세요.</p>
                <Link href="/consultations" className="block text-center text-xs bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                  1:1 상담 받기
                </Link>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-3">
            <div id="overview" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Content Header */}
              <div className={`px-8 pt-6 pb-4 ${style.bgLight} border-b border-gray-100`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 ${style.bgLight} ${style.textColor} text-xs font-semibold rounded-full border border-current border-opacity-20`}>
                    {item.title}
                  </span>
                  <span className="text-xs text-gray-500">최종 업데이트: 2025-01-15</span>
                </div>
              </div>

              {/* Markdown Content */}
              <div id="details" className="px-8 py-8">
                <article className="prose prose-slate max-w-none
                  prose-headings:text-primary-800
                  prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-200
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
                  prose-h4:text-base prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
                  prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:my-1 prose-li:text-gray-700
                  prose-strong:text-primary-800 prose-strong:font-semibold
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:my-4
                  prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 prose-code:font-mono
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg
                  prose-hr:my-8 prose-hr:border-gray-200
                ">
                  <ReactMarkdown
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6 rounded-lg border border-gray-200">
                          <table className="w-full border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className={`${style.bgLight}`}>{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className={`border-b border-gray-200 px-4 py-3 text-left text-sm font-bold ${style.textColor}`}>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700">
                          {children}
                        </td>
                      ),
                      hr: () => <hr className="my-8 border-t-2 border-gray-100" />,
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </article>
              </div>

              {/* Tags & Share */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500 font-semibold">태그:</span>
                  {['ODA', 'KOICA', '전문가', '해외봉사', '개발협력'].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white text-gray-600 px-2.5 py-1 rounded-md border border-gray-200 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">이 가이드가 도움이 되셨나요?</div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:border-green-300 hover:text-green-600 transition">
                      👍 네 (24)
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:border-red-300 hover:text-red-600 transition">
                      👎 아니요 (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prev / Next Navigation */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {prevItem ? (
                <Link href={`/guide/${prevItem.id}`}>
                  <div className="group bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer h-full">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <span>←</span> 이전 가이드
                    </div>
                    <div className="font-bold text-sm text-primary-800 group-hover:text-primary-600 transition-colors flex items-center gap-2">
                      <span className="text-lg">{iconStyle[prevItem.icon]?.emoji}</span>
                      <span className="truncate">{prevItem.title}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div></div>
              )}
              {nextItem && (
                <Link href={`/guide/${nextItem.id}`}>
                  <div className="group bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer h-full text-right">
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-end gap-1">
                      다음 가이드 <span>→</span>
                    </div>
                    <div className="font-bold text-sm text-primary-800 group-hover:text-primary-600 transition-colors flex items-center gap-2 justify-end">
                      <span className="truncate">{nextItem.title}</span>
                      <span className="text-lg">{iconStyle[nextItem.icon]?.emoji}</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Related Pages */}
            <div id="related" className="mt-8">
              <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                <span>🔗</span> 관련 가이드
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {allItems
                  .filter((i) => i.id !== itemId)
                  .slice(0, 4)
                  .map((i) => {
                    const itemStyle = iconStyle[i.icon] || iconStyle.policy
                    return (
                      <Link
                        key={i.id}
                        href={`/guide/${i.id}`}
                        className="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${itemStyle.gradient} flex items-center justify-center text-lg shrink-0`}>
                            {itemStyle.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-primary-800 group-hover:text-primary-600 transition-colors truncate">
                              {i.title}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">{i.description}</div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 rounded-2xl p-8 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center gap-6">
                <div className="text-5xl">💬</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">이 주제에 대해 더 궁금한 점이 있으신가요?</h3>
                  <p className="text-sm opacity-90 mb-3">문의 게시판에 질문을 남기시거나, 전문가와 1:1 상담을 받아보세요.</p>
                  <div className="flex gap-2 flex-wrap">
                    <Link href="/inquiries">
                      <span className="inline-block px-4 py-2 bg-accent text-primary-900 text-sm font-bold rounded-lg hover:bg-accent-light cursor-pointer transition">
                        문의 게시판 →
                      </span>
                    </Link>
                    <Link href="/consultations">
                      <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-lg border border-white/30 hover:bg-white/30 cursor-pointer transition">
                        1:1 상담 →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}