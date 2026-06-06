import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'ODA 가이드 - 제도, 신청절차, 안내 공지',
  description: 'ODA 전문가 제도 안내, KOICA·UN 신청 절차, 모집 공지 등 ODA 관련 종합 가이드. CAIND가 제공하는 최신 ODA 정보를 확인하세요.',
  path: '/guide',
  keywords: [
    'ODA 가이드',
    'ODA 신청절차',
    'KOICA 신청',
    'ODA 제도',
    'ODA 공지',
    'ODA 안내',
  ],
})

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}