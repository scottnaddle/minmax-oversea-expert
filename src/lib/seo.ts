import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oda.caind.kr'
const SITE_NAME = 'CAIND ODA 전문가 경력관리'

export function buildMetadata({
  title,
  description,
  path = '',
  keywords = [],
  image,
  type = 'website',
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
}): Metadata {
  const fullUrl = `${SITE_URL}${path}`
  const ogImage = image || `${SITE_URL}/images/og-image.png`
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: 'ko_KR',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  }
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  author,
  image,
}: {
  title: string
  description: string
  url: string
  datePublished?: string
  author?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${SITE_URL}${url}`,
    datePublished: datePublished || new Date().toISOString(),
    author: { '@type': 'Organization', name: author || 'CAIND' },
    publisher: {
      '@type': 'Organization',
      name: 'CAIND',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/caind-logo.png` },
    },
    image: image || `${SITE_URL}/images/og-image.png`,
    inLanguage: 'ko-KR',
  }
}

export { SITE_URL, SITE_NAME }