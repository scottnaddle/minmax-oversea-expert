import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'CAIND 국제개발컨설팅협회 소개',
  description: '사단법인 국제개발컨설팅협회(CAIND)는 ODA 산업 발전과 일자리 창출을 위해 설립된 비영리 단체입니다. 설립 목적, 비전, 주요 사업, 연혁을 확인하세요.',
  path: '/about-caind',
  keywords: [
    'CAIND',
    '국제개발컨설팅협회',
    'CAIND 소개',
    'ODA 협회',
    '국제개발협력',
  ],
})

export default function AboutCaindLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}