import Link from 'next/link'
import { Award, Target, Users, Globe, BookOpen, Handshake, MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

const businesses = [
  { icon: BookOpen, title: '교육인증', desc: '국제개발컨설팅 전문가 교육과정 운영' },
  { icon: Globe, title: '해외시장 진출 지원', desc: 'ODA 시장 진출 정보 제공 및 컨설팅' },
  { icon: Target, title: 'ODA 사업 발굴 지원', desc: '해외 개발협력 사업 발굴 및 기획 지원' },
  { icon: Award, title: '심사·평가', desc: 'ODA 사업 성과 평가 및 자문' },
  { icon: Handshake, title: '회원사 협력', desc: '회원사 간 네트워크 및 협력체계 구축' },
  { icon: Users, title: '정책환경 개선', desc: '국제개발컨설팅 산업 정책 개선 활동' },
]

export default function AboutCaindPage() {
  return (
    <div className="bg-[#fafaf8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-xs text-accent uppercase tracking-widest mb-3 font-bold">
            ABOUT CAIND
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            사단법인 국제개발컨설팅협회
          </h1>
          <p className="text-lg text-primary-100 mb-2">
            Consulting Association for International Development
          </p>
          <p className="text-sm text-primary-200 max-w-3xl leading-relaxed">
            국제개발컨설팅 산업의 활성화와 국제원조시장에서 일자리 창출의 블루오션 개척,
            개발효과성의 극대화로 국제사회 및 국가경제에 기여하고자 설립되었습니다.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-8 border-l-4 border-primary-700 shadow-caind">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-6 h-6 text-primary-700" />
              <h2 className="text-xl font-bold text-primary-800">설립 목적</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              국제개발컨설팅 산업의 육성과 경쟁력 강화, 회원사 간 협력체계 구축,
              정부 정책 수립 기여, 사회공헌 활동 등을 통해 국제개발협력 분야에서의
              대한민국 위상을 높이고, 회원사 및 소속 전문가들의 권익 보호와 복지 증진을 도모합니다.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border-l-4 border-accent shadow-caind">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-6 h-6 text-accent" />
              <h2 className="text-xl font-bold text-primary-800">비전과 목표</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              국제개발협력 분야의 글로벌 리더로 도약하여, 대한민국 ODA 산업의
              품질 향상과 일자리 창출에 기여합니다. 특히 ODA 전문가 경력관리
              플랫폼을 통해 검증된 인재와 글로벌 일자리를 연결하는 핵심 허브 역할을 수행합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Business */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-xs text-accent uppercase tracking-widest mb-2 font-bold">MAIN BUSINESS</div>
          <h2 className="text-3xl font-bold text-primary-800">주요 사업</h2>
          <p className="text-sm text-gray-500 mt-2">CAIND가 제공하는 핵심 서비스</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {businesses.map((b, idx) => {
            const Icon = b.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-caind-lg hover:border-primary-200 transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="font-bold text-base text-primary-800 mb-2">{b.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Platform Introduction */}
      <section className="bg-primary-50 border-y border-primary-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs text-accent uppercase tracking-widest mb-2 font-bold">OUR PLATFORM</div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">ODA 전문가 경력관리 플랫폼</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                CAIND가 운영하는 이 플랫폼은 해외 ODA 전문가의 경력을 체계적으로 관리하고
                검증된 인재를 글로벌 기업·기관과 연결하는 종합 서비스입니다.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>해외 경력 등록 및 증빙 서류 관리</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>CAIND 공인 경력증명서 발급</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>기업과 전문가 매칭 서비스</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-accent mt-0.5">✓</span>
                  <span>ODA 신청 절차 및 제도 안내</span>
                </li>
              </ul>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded font-bold hover:bg-primary-800 transition"
              >
                지금 시작하기 →
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-caind-lg max-w-sm">
                <img
                  src="/images/caind-logo.png"
                  alt="CAIND"
                  className="h-16 mx-auto mb-4"
                />
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-bold text-primary-800">CAIND 공인 플랫폼</div>
                  <div className="text-xs text-gray-500 mt-1">검증된 ODA 전문가 네트워크</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-caind p-8">
          <div className="text-center mb-6">
            <div className="text-xs text-accent uppercase tracking-widest mb-2 font-bold">CONTACT US</div>
            <h2 className="text-2xl font-bold text-primary-800">협회 정보 및 연락처</h2>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-primary-800 mb-1">주소</div>
                <div className="text-gray-600">
                  서울시 서초구 사임당로 28<br />청호나이스빌딩 5층 524호
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-primary-800 mb-1">연락처</div>
                <div className="text-gray-600">
                  TEL 02-539-7113<br />FAX 02-539-7114
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-primary-800 mb-1">이메일</div>
                <div className="text-gray-600">caind@caind.kr</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a
              href="https://caind.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-primary-900 rounded font-bold hover:bg-accent-light transition"
            >
              CAIND 공식 홈페이지 방문 <ExternalLink size={16} />
            </a>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            사단법인 국제개발컨설팅협회 | 고유번호 211-82-75543
          </div>
        </div>
      </section>
    </div>
  )
}