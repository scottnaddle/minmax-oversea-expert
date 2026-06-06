import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'ODA 전문가 찾기',
  description: 'CAIND 공인 ODA 전문가를 검색하세요. 국가·전문 분야·경력별로 필터링하여 검증된 인재를 만날 수 있습니다. KOICA, UN기구, NGO 경력 보유 전문가들이 등록되어 있습니다.',
  path: '/experts',
  keywords: [
    'ODA 전문가 검색',
    'ODA 매칭',
    '해외 전문가',
    'KOICA 전문가',
    'ODA 컨설턴트',
    'ODA 인력풀',
    'ODA 인재',
  ],
})

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}