import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Globe, Award, FileCheck, Users, Briefcase, CheckCircle2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { buildBreadcrumbJsonLd, SITE_URL } from '@/lib/seo'

const SITE_URL_LOCAL = SITE_URL

export const metadata: Metadata = {
  title: 'CAIND ODA 전문가 경력관리 - 글로벌 매칭 플랫폼',
  description: '국제개발컨설팅협회(CAIND) 공식 운영. 해외 ODA 전문가 경력 등록·증빙·증명서 발급과 기업 매칭을 한 번에. KOICA·UN기구 매칭까지 지원합니다.',
  keywords: [
    'ODA 전문가',
    'ODA 경력',
    'ODA 매칭',
    'CAIND',
    '국제개발컨설팅협회',
    'KOICA',
    'ODA 신청',
    'ODA 컨설팅',
  ],
  alternates: {
    canonical: SITE_URL_LOCAL,
  },
  openGraph: {
    title: 'CAIND ODA 전문가 경력관리 - 글로벌 매칭 플랫폼',
    description: '해외 ODA 전문가 경력 등록·증빙·증명서 발급과 기업 매칭을 한 번에',
    url: SITE_URL_LOCAL,
    type: 'website',
    images: [`${SITE_URL_LOCAL}/images/og-image.png`],
  },
}

export default async function HomePage() {
  const user = await getCurrentUser()

  // Get real stats from database
  const [
    expertCount,
    enterpriseCount,
    careerCount,
    projectCount,
    countryCount,
    recentExperts,
  ] = await Promise.all([
    prisma.user.count({ where: { userType: 'expert' } }),
    prisma.user.count({ where: { userType: 'enterprise' } }),
    prisma.career.count(),
    prisma.project.count(),
    prisma.career.groupBy({
      by: ['country'],
      _count: { country: true },
    }),
    prisma.user.findMany({
      where: { userType: 'expert' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        bio: true,
        currentCountry: true,
        emailVerified: true,
        _count: {
          select: { careers: true },
        },
      },
    }),
  ])

  const stats = [
    { number: `${expertCount}+`, label: '등록 전문가', icon: Users },
    { number: `${enterpriseCount}+`, label: '파트너 기업', icon: Briefcase },
    { number: `${projectCount}+`, label: '완료 프로젝트', icon: FileCheck },
    { number: `${countryCount.length}+`, label: '활동 국가', icon: Globe },
  ]

  const uniqueCountries = [...new Set(countryCount.map(c => c.country))]

  // ✅ JSON-LD: ItemList (전문가 통계 — 검색 결과에 노출)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CAIND ODA 전문가 목록',
    description: 'CAIND에 등록된 검증된 ODA 전문가 네트워크',
    numberOfItems: expertCount,
    itemListElement: recentExperts.map((expert, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: expert.name,
      url: `${SITE_URL_LOCAL}/experts/${expert.id}`,
    })),
  }

  // ✅ BreadcrumbList
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: '홈', url: '/' },
  ])

  return (
    <div className="bg-[#fafaf8]">
      {/* ✅ SEO JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section - 시맨틱 <header> + <main> 구조 */}
      <header>
        <section 
          aria-label="ODA 전문가 경력관리 플랫폼 히어로"
          className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white"
        >
          {/* Decorative Pattern */}
          <div aria-hidden="true" className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)"/>
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-16 flex gap-12 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-xs mb-4">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                <span className="text-accent font-semibold">CAIND 공식 운영 플랫폼</span>
              </div>
              <h1 className="text-4xl font-bold mb-3 leading-tight">
                해외 ODA 전문가 경력을<br />체계적으로 관리하세요
              </h1>
              <p className="text-base text-primary-100 mb-6 leading-relaxed">
                전문가는 경력을 증빙하고, 기업은 검증된 인재를 찾습니다.<br />
                <strong>CAIND 공인 경력증명서</strong>로 글로벌 일자리에 연결하세요.
              </p>
              <div className="flex gap-3 flex-wrap">
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-primary-900 rounded font-bold hover:bg-accent-light transition"
                  >
                    대시보드로 이동 <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/signup" 
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-primary-900 rounded font-bold hover:bg-accent-light transition"
                    >
                      전문가로 시작하기 <ArrowRight size={16} />
                    </Link>
                    <Link 
                      href="/experts" 
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur border border-white/30 text-white rounded hover:bg-white/20 transition"
                    >
                      전문가 찾기
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 bg-accent/20 rounded-2xl blur-2xl"></div>
                <div className="relative w-[420px] h-[260px] bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center p-8">
                  <div className="text-center">
                    <Image
                      src="/images/caind-logo-white.png"
                      alt="CAIND 국제개발컨설팅협회 로고"
                      className="h-20 mx-auto mb-4"
                      width={200}
                      height={60}
                    />
                    <div className="text-2xl mb-1" role="img" aria-label="지구본">🌍</div>
                    <div className="text-sm font-semibold">ODA 전문가 네트워크</div>
                    <div className="text-xs text-primary-100 mt-1">CAIND가 인증하는 글로벌 인재</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      {/* Stats Section — 시맨틱 <section> + aria-label */}
      <section aria-label="플랫폼 주요 통계" className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={`py-6 px-4 text-center ${index < stats.length - 1 ? 'border-r border-gray-200' : ''}`}
              >
                <Icon className="w-6 h-6 text-accent mx-auto mb-2" aria-hidden="true" />
                <div className="text-2xl font-bold text-primary-800">
                  <span aria-label={`${stat.label} ${stat.number}`}>{stat.number}</span>
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CAIND Association Introduction Banner */}
      <section aria-label="CAIND 협회 소개" className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-6">
          <div className="shrink-0">
            <Award className="w-12 h-12 text-primary-700" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-primary-800 mb-1">
              사단법인 국제개발컨설팅협회 (CAIND) 공식 운영
            </h2>
            <p className="text-sm text-gray-600">
              국제개발컨설팅 산업의 활성화와 국제원조시장에서 일자리 창출을 위해 설립된 협회 산하 플랫폼입니다.
            </p>
          </div>
          <a 
            href="https://caind.kr" 
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 bg-primary-700 text-white text-sm rounded hover:bg-primary-800 transition"
          >
            협회 홈페이지 →
          </a>
        </div>
      </section>

      {/* How it works */}
      <section aria-label="서비스 이용 절차" className="py-10 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-primary-800">어떻게 작동하나요?</h2>
            <p className="text-sm text-gray-500">3단계로 간단하게 시작하세요</p>
          </div>
          <ol className="flex flex-col md:flex-row items-stretch md:items-start max-w-4xl mx-auto gap-4">
            {[
              { num: 1, title: '경력 등록', desc: '해외 근무 이력, 학력,\n전문 분야를 입력합니다.' },
              { num: 2, title: '증빙 검토', desc: '재직증명서, 자격증 등\n서류를 업로드합니다.' },
              { num: 3, title: '매칭/연결', desc: '기업 제안 수락 또는\n프로젝트에 참여합니다.' },
            ].map((step, idx) => (
              <li key={step.num} className="flex-1 text-center px-6 relative">
                <div className="w-12 h-12 rounded-full bg-primary-700 text-white flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-md">
                  {step.num}
                </div>
                <h3 className="font-bold text-sm mb-2 text-primary-800">{step.title}</h3>
                <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                  {step.desc}
                </p>
                {idx < 2 && (
                  <span aria-hidden="true" className="hidden md:block absolute right-0 top-6 text-accent text-2xl">→</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured Experts */}
      <section aria-label="주목받는 전문가" className="py-10 px-6 bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-800">주목받는 전문가</h2>
              <p className="text-sm text-gray-500 mt-1">CAIND가 인증한 검증된 ODA 전문가</p>
            </div>
            <Link 
              href="/experts" 
              className="inline-flex items-center gap-1 px-4 py-2 border border-primary-300 text-primary-700 text-sm rounded hover:bg-primary-50 transition"
              aria-label="전문가 전체 보기"
            >
              전체 보기 <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {recentExperts.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none">
              {recentExperts.map((expert) => (
                <li key={expert.id}>
                  <Link
                    href={`/experts/${expert.id}`}
                    className="block border border-gray-200 rounded-lg p-5 bg-white hover:shadow-caind transition"
                    aria-label={`${expert.name} 프로필 보기`}
                  >
                    <div className="flex gap-3 mb-3 items-start">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                        {expert.name.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-primary-800">{expert.name}</h3>
                        <p className="text-xs text-gray-500">
                          {expert.bio ? expert.bio.slice(0, 30) + '...' : 'ODA 전문가'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          📍 {expert.currentCountry || '미지정'}
                        </p>
                      </div>
                      {expert.emailVerified && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-dark border border-accent/40 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} aria-hidden="true" /> CAIND 인증
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap pt-3 border-t border-gray-100">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700">
                        경력 {expert._count.careers}건
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-3" role="img" aria-label="사람들">👥</div>
              <p>아직 등록된 전문가가 없습니다.</p>
              <Link href="/signup" className="text-primary-600 hover:underline text-sm">
                첫 전문가로 등록해보세요 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Countries Section */}
      {uniqueCountries.length > 0 && (
        <section aria-label="활동 국가" className="py-10 px-6 bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-primary-800">활동 국가</h2>
              <p className="text-sm text-gray-500">전 세계 {uniqueCountries.length}개국에서 활동 중</p>
            </div>
            <ul className="flex flex-wrap justify-center gap-2 list-none" aria-label="활동 국가 목록">
              {uniqueCountries.slice(0, 20).map((country) => (
                <li key={country}>
                  <span className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full">
                    {country}
                  </span>
                </li>
              ))}
              {uniqueCountries.length > 20 && (
                <li>
                  <span className="px-3 py-1.5 text-xs bg-accent/20 text-accent-dark border border-accent/40 rounded-full font-semibold">
                    +{uniqueCountries.length - 20}개국
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}