import type { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://oda.caind.kr'

// 정적 페이지 목록
const staticPages: Array<{
  path: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1.0 },
  { path: '/experts', changeFrequency: 'daily', priority: 0.9 },
  { path: '/guide', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about-caind', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/signup', changeFrequency: 'monthly', priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))

  // 가이드 페이지 동적 추가
  try {
    const guideMetaPath = path.join(process.cwd(), 'content', 'guide', '_meta.json')
    const guideMeta = JSON.parse(await fs.readFile(guideMetaPath, 'utf-8'))
    if (guideMeta.items) {
      for (const item of guideMeta.items) {
        entries.push({
          url: `${SITE_URL}/guide/${item.id}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch (err) {
    // 메타 파일 없으면 무시
  }

  return entries
}