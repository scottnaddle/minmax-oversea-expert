import Link from 'next/link'

export default async function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <section className="text-center py-11 px-8 bg-blue-50 border-b border-gray-300">
        <div className="text-xs text-primary uppercase tracking-wider mb-2.5">
          서비스 소개
        </div>
        <h1 className="text-2xl font-bold mb-2">신뢰할 수 있는 해외 전문가 플랫폼</h1>
        <p className="text-sm text-gray-500">경력 증빙 기반의 전문가-기업 연결 서비스</p>
      </section>

      {/* Benefits */}
      <section className="flex border-b border-gray-300">
        <div className="flex-1 py-7 px-12 border-r border-gray-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-primary flex items-center justify-center text-lg">
              👤
            </div>
            <div className="text-base font-bold text-primary">전문가 혜택</div>
          </div>
          <div className="space-y-2">
            {[
              '해외 경력 체계적 등록 및 관리',
              '증빙 서류 안전 보관',
              '기업/기관의 채용 제안 수신',
              '귀국 후 국내 취업 연계',
              '전문가 네트워크 접근',
            ].map((item, index) => (
              <div key={index} className="flex gap-2 py-2 text-xs border-b border-gray-200 last:border-0">
                <span className="text-primary">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 py-7 px-12">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-green-100 border border-green-600 flex items-center justify-center text-lg">
              🏢
            </div>
            <div className="text-base font-bold text-green-600">기업/기관 혜택</div>
          </div>
          <div className="space-y-2">
            {[
              '인증된 전문가 검색',
              '경력 및 자격 확인 용이',
              '전문가에게 직접 연락',
              '맞춤형 인재 추천',
              '채용 비용 절감',
            ].map((item, index) => (
              <div key={index} className="flex gap-2 py-2 text-xs border-b border-gray-200 last:border-0">
                <span className="text-green-600">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Process */}
      <section className="py-8 px-8 border-b border-gray-300">
        <h2 className="text-base font-bold text-center mb-1.5">인증 프로세스</h2>
        <p className="text-xs text-gray-500 text-center mb-5">철저한 서류 검토로 신뢰성을 보장합니다</p>
        
        <div className="flex items-center justify-center">
          {[
            { icon: '📤', title: '서류 업로드', desc: '재직증명서, 자격증, 학위증명서' },
            { icon: '🔍', title: '전문 검토팀 확인', desc: '2-3 영업일 이내' },
            { icon: '✅', title: '인증 완료', desc: '프로필에 인증 배지 표시' },
            { icon: '🌟', title: '신뢰도 강화', desc: '기업 검색 우선 노출' },
          ].map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="text-center w-[180px]">
                <div className="text-2xl mb-1.5">{step.icon}</div>
                <div className="font-bold text-xs mb-0.5">{step.title}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</div>
              </div>
              {index < 3 && (
                <div className="text-gray-400 text-lg mx-1 mb-5">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-7 px-8 bg-blue-50 flex justify-center gap-3.5">
        <Link href="/signup" className="btn-primary flex items-center gap-1">
          전문가로 시작하기 <span>→</span>
        </Link>
        <Link href="/experts" className="btn-secondary">
          전문가 찾기
        </Link>
      </section>
    </div>
  )
}