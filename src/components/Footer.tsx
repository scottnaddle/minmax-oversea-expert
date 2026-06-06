import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-primary-800 text-white mt-12">
      {/* Top section with logo and info */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-8">
          {/* CAIND Logo and Description */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/caind-logo-white.png"
                alt="CAIND 국제개발컨설팅협회"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-primary-100 leading-relaxed mb-3">
              <span className="text-accent font-bold">사단법인 국제개발컨설팅협회</span>
              <br />
              Consulting Association for International Development
            </p>
            <p className="text-xs text-primary-200 leading-relaxed">
              국제개발컨설팅 산업의 활성화와 국제원조시장에서 일자리 창출의 블루오션 개척, 개발효과성의 극대화로 국제사회 및 국가경제에 기여하고자 설립되었습니다.
            </p>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-sm font-bold text-accent mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li><Link href="/experts" className="hover:text-white transition">전문가 찾기</Link></li>
              <li><Link href="/guide" className="hover:text-white transition">가이드</Link></li>
              <li><Link href="/inquiries" className="hover:text-white transition">문의 게시판</Link></li>
              <li><Link href="/consultations" className="hover:text-white transition">1:1 상담</Link></li>
            </ul>
          </div>

          {/* CAIND Links */}
          <div>
            <h4 className="text-sm font-bold text-accent mb-3">협회</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li><a href="https://caind.kr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">CAIND 홈페이지</a></li>
              <li><a href="https://caind.kr/?page_id=127" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">협회 소개</a></li>
              <li><a href="https://caind.kr/?page_id=236" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">회원 가입</a></li>
              <li><a href="https://caind.kr/?page_id=161" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">오시는 길</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      <div className="border-t border-primary-700">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-4 text-xs text-primary-200">
            <div>
              <div className="text-accent font-semibold mb-1">주소</div>
              <div>서울시 서초구 사임당로 28<br />청호나이스빌딩 5층 524호</div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">연락처</div>
              <div>TEL 02-539-7113<br />caind@caind.kr</div>
            </div>
            <div>
              <div className="text-accent font-semibold mb-1">고유번호</div>
              <div>211-82-75543<br />사단법인 국제개발컨설팅협회</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-primary-900 border-t border-primary-700">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center text-xs text-primary-300">
          <div>
            Copyright(c) 2025 by CAIND. All Rights Reserved.
          </div>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-white transition">개인정보 처리방침</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}