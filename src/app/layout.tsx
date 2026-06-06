import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCurrentUser } from '@/lib/auth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oda.caind.kr'
const SITE_NAME = 'CAIND ODA 전문가 경력관리'
const SITE_NAME_EN = 'CAIND ODA Expert Career Management'
const SITE_DESCRIPTION = '국제개발컨설팅협회(CAIND)가 운영하는 ODA 전문가 경력관리 및 글로벌 매칭 플랫폼. 해외 경력 증빙, CAIND 공인 경력증명서 발급, KOICA·UN기구 매칭까지 한 번에.'
const SITE_KEYWORDS = [
  'ODA',
  'ODA 전문가',
  '국제개발협력',
  'CAIND',
  '국제개발컨설팅협회',
  'KOICA',
  'ODA 신청',
  '해외봉사단',
  'ODA 사업',
  '개발협력',
  'ODA 경력',
  'ODA 경력증명서',
  'ODA 컨설팅',
  '국제원조',
  'ODA 매칭',
  'ODA 인력',
]

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e3a5f',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SITE_NAME_EN}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: '사단법인 국제개발컨설팅협회', url: 'https://caind.kr' }],
  creator: 'CAIND (Consulting Association for International Development)',
  publisher: 'CAIND',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  // ✅ 검색 노출 허용 (기존 noindex 제거)
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'ko-KR': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - CAIND 공식 운영`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CAIND ODA 전문가 경력관리 플랫폼',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/images/og-image.png'],
    creator: '@caind',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    // Google Search Console / Naver Search Advisor 등록 후 추가
    // google: 'your-google-verification-code',
    // other: { 'naver-site-verification': 'your-naver-verification-code' },
  },
  category: 'professional services',
  classification: 'ODA, 국제개발협력, 경력관리',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // ✅ JSON-LD 구조화 데이터: Organization (홈페이지/전역)
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${SITE_URL}#organization`,
    name: '사단법인 국제개발컨설팅협회',
    alternateName: 'CAIND',
    url: SITE_URL,
    logo: `${SITE_URL}/images/caind-logo.png`,
    description: SITE_DESCRIPTION,
    foundingDate: '2023',
    legalName: 'Consulting Association for International Development',
    taxID: '211-82-75543',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '청호나이스빌딩 5층 524호',
      addressLocality: '서초구',
      addressRegion: '서울특별시',
      postalCode: '06651',
      addressCountry: 'KR',
      postOfficeBoxNumber: '사임당로 28',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+82-2-539-7113',
      contactType: 'customer service',
      email: 'caind@caind.kr',
      areaServed: 'KR',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [
      'https://caind.kr',
    ],
  }

  // ✅ JSON-LD: WebSite (검색 엔진 사이트링크 검색박스)
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'ko-KR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/experts?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://caind.kr" />
        <link rel="preconnect" href="https://caind.kr" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#fafaf8] flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}