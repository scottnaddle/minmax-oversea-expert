# CAIND ODA 전문가 경력관리 시스템

사단법인 국제개발컨설팅협회(CAIND) ODA 전문가 경력관리 플랫폼 — SW기술자 매뉴얼 기반 경력 관리, ODA사업 경력 검증, 기업 위탁 동의 및 대리 신청을 지원하는 풀스택 웹 애플리케이션입니다.

## 주요 기능

### 개인회원 (SW기술자)
- **6가지 경력 카테고리** — 근무경력, 기술경력, 학력, 기술자격, 교육이수, 상훈
- **ODA 사업 경력 관리** — KOICA 사업 중심 경력申报 및 검증
- **증빙 서류 관리** — 경력당 최대 5개 파일 업로드
- **증명서 발급** — 경력, ODA, 학력 증명서 PDF 발급 (QR 코드 포함)
- **전자서명 확인** — 기업확인 요청 및 전자서명 처리

### 기업회원 (기업/기관)
- **소속기술자 관리** — 위탁 동의 직원 조회 및 관리
- **기업확인요청** — 소속기술자 경력 전자서명 확인/반려
- **대리 신청** — 소속기술자 대신 경력·증명서 신청
- **수수료 대납** — 소속기술자 경력관리비 대납 동의 및 처리

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) — PostgreSQL 전환 가능
- **Auth**: JWT (cookie-based)
- **Payments**: Stripe (증명서 발급 결제)
- **Branding**: CAIND (사단법인 국제개발컨설팅협회) — Navy `#1e3a5f` + Gold `#c9a861`

## 시작하기

```bash
# 의존성 설치
npm install

# DB 스키마 적용
npx prisma db push

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 테스트 계정

| 유형 | 이메일 | 비밀번호 |
|------|--------|---------|
| 개인회원 | kim@example.com | password123 |
| 기업회원 | hr@abcconsulting.com | password123 |
| 관리자 | admin@example.com | password123 |

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/           # 공개 페이지 (홈, 가이드, 전문가 찾기 등)
│   ├── (auth)/           # 로그인, 회원가입
│   ├── (dashboard)/      # 개인/기업 대시보드
│   ├── (admin)/          # 관리자 패널
│   └── api/              # API Routes
├── components/           # React 컴포넌트
├── lib/                  # 유틸리티 (auth, prisma, validations, seo)
└── styles/               # 글로벌 CSS

prisma/
└── schema.prisma         # DB 스키마 정의

public/
├── images/               # 로고, OG 이미지
└── robots.txt, sitemap.xml
```

## CAIND 정보

- **협회**: 사단법인 국제개발컨설팅협회 (Consulting Association for International Development)
- **고유번호**: 211-82-75543
- **주소**: 서울 서초구 사임당로 28 청호나이스빌딩 5층 524호
- **연락처**: TEL 02-539-7113 | caind@caind.kr
- **홈페이지**: https://caind.kr/