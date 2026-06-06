import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oda.caind.kr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/api',
          '/api/*',
          '/login',
          '/signup',
          '/settings',
          '/messages',
          '/notifications',
        ],
      },
      // 네이버 검색봇 (한국 검색 최적화)
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api'],
      },
      // 다음 검색봇
      {
        userAgent: 'Daum',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api'],
      },
      // Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}