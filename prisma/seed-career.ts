// ODA 교육 분야 전문가 seed script
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 ODA 교육 전문가 시드 데이터 생성 중...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { email: 'admin@example.com' },
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '관리자',
      englishName: 'Admin',
      nationality: '대한민국',
      currentCountry: '대한민국',
      currentCity: '서울',
      bio: '시스템 관리자입니다.',
      userType: 'enterprise',
      role: 'admin',
      emailVerified: true,
    },
  })

  console.log('✅ 관리자 계정 생성: admin@example.com')

  // Create test user - ODA 교육 전문가
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { email: 'test@example.com' },
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: '김교육',
      englishName: 'Kim Kyung-Yuk',
      nationality: '대한민국',
      currentCountry: '대한민국',
      currentCity: '서울',
      phone: '+82-10-1234-5678',
      bio: '15년 이상의 국제개발협력 경험を持つ 교육 분야 전문가입니다. KOICA, UNESCO, World Bank 등 주요 국제기구에서 수원국 기초교육 강화 및 직업기술교육 분야 사업을 수행해왔습니다. 라오스, 캄보디아, 몽골, 에티오피아 등 10개국 이상에서 교육 개발사업을 경험했습니다.',
      userType: 'expert',
      role: 'user',
      emailVerified: true,
    },
  })

  console.log('✅ 전문가 계정 생성:', testUser.email)

  // Clear existing data
  await prisma.project.deleteMany({ where: { career: { userId: testUser.id } } })
  await prisma.career.deleteMany({ where: { userId: testUser.id } })
  await prisma.education.deleteMany({ where: { userId: testUser.id } })
  await prisma.language.deleteMany({ where: { userId: testUser.id } })
  await prisma.certification.deleteMany({ where: { userId: testUser.id } })
  await prisma.document.deleteMany({ where: { userId: testUser.id } })

  // ========== 학력 (교육학 중심) ==========
  await prisma.education.createMany({
    data: [
      {
        userId: testUser.id,
        school: '서울대학교 대학원',
        major: '국제개발협력학 석사',
        degree: '석사',
        country: '대한민국',
        graduationYear: 2012,
      },
      {
        userId: testUser.id,
        school: '한국교원대학교',
        major: '교육학 학사',
        degree: '학사',
        country: '대한민국',
        graduationYear: 2008,
      },
      {
        userId: testUser.id,
        school: 'UNESCO IIEP',
        major: 'Educational Planning and Management',
        degree: '수료',
        country: '프랑스',
        graduationYear: 2018,
      },
    ],
  })
  console.log('✅ 학력 정보 3건 생성')

  // ========== 언어 능력 ==========
  await prisma.language.createMany({
    data: [
      { userId: testUser.id, language: '한국어', proficiency: 'native' },
      { userId: testUser.id, language: '영어', proficiency: 'advanced', certificate: 'IELTS', score: '7.5' },
      { userId: testUser.id, language: '라오어', proficiency: 'intermediate' },
      { userId: testUser.id, language: '프랑스어', proficiency: 'basic' },
    ],
  })
  console.log('✅ 언어 능력 4건 생성')

  // ========== 자격/수료 ==========
  await prisma.certification.createMany({
    data: [
      { userId: testUser.id, name: 'KOICA 해외협력봉사단 교육 분야 장학생', issuer: '한국국제협력단', issuedDate: new Date('2010-03-01') },
      { userId: testUser.id, name: 'ADB certified Development Expert', issuer: '아시아개발은행', issuedDate: new Date('2016-09-15') },
      { userId: testUser.id, name: 'UNESCO Master Trainer', issuer: 'UNESCO', issuedDate: new Date('2019-06-20') },
      { userId: testUser.id, name: '국제개발협력 전문가(무역)', issuer: '한국무역협회', issuedDate: new Date('2015-12-01') },
    ],
  })
  console.log('✅ 자격/수료 4건 생성')

  // ========== 경력 ==========
  // 경력 1: KOICA (현직)
  const career1 = await prisma.career.create({
    data: {
      userId: testUser.id,
      company: '한국국제협력단(KOICA)',
      position: '수석 프로젝트관리관',
      country: '대한민국',
      startDate: new Date('2020-01-01'),
      isCurrent: true,
      description: 'KOICA 교육협력팀 수석관리관으로 라오스, 캄보디아 교육사업 총괄 기획 및 모니터링 담당. 연간 약 1,500만 달러 규모의 교육 ODA 사업 관리.',
    },
  })

  // 경력 2: UNESCO
  const career2 = await prisma.career.create({
    data: {
      userId: testUser.id,
      company: 'UNESCO',
      position: '교육전문가',
      country: '파리(프랑스)',
      startDate: new Date('2016-03-01'),
      endDate: new Date('2019-12-31'),
      isCurrent: false,
      description: 'UNESCO亚太教育局에서 아시아·태평양 지역 기초교육 정책 자문 및 역량강화사업 담당. 몽골, 네팔 기초교육 체계 개선 프로젝트 수행.',
    },
  })

  // 경력 3: World Bank
  const career3 = await prisma.career.create({
    data: {
      userId: testUser.id,
      company: 'World Bank',
      position: '교육분야 Consultant',
      country: '미국',
      startDate: new Date('2014-06-01'),
      endDate: new Date('2016-02-28'),
      isCurrent: false,
      description: 'World Bank 교육패널에서 에티오피아 직업기술교육(TVET) 체계 구축 사업 기술자문. 현지 정부 역량강화 및 사업 모니터링 담당.',
    },
  })

  // 경력 4: JICA
  const career4 = await prisma.career.create({
    data: {
      userId: testUser.id,
      company: 'JICA',
      position: '교육협력 전문가',
      country: '일본',
      startDate: new Date('2012-08-01'),
      endDate: new Date('2014-05-31'),
      isCurrent: false,
      description: 'JICA 교육협력실에서 동남아시아 교육사업 Coordinato. 캄보디아 초등교육 품질 개선사업 프로젝트 매니저.',
    },
  })

  // 경력 5: 국공립大学 연구원
  const career5 = await prisma.career.create({
    data: {
      userId: testUser.id,
      company: '한국개발원(KDI)',
      position: '선임연구위원',
      country: '대한민국',
      startDate: new Date('2009-01-01'),
      endDate: new Date('2012-07-31'),
      isCurrent: false,
      description: '국제개발협력센터에서 ODA 효과성 및 교육협력 정책 연구. 수원국 교육개발협력 체계 분석 및 정책 권고.',
    },
  })

  console.log('✅ 경력 5건 생성')

  // ========== 프로젝트 (ODA 교육사업) ==========

  // KOICA 프로젝트들
  await prisma.project.createMany({
    data: [
      {
        careerId: career1.id,
        name: '라오스 기초교육 품질 개선 사업',
        description: '라오스 북부 5개 주 초등학교 학습환경 개선 및 교사 역량강화. 150개교 교육인프라 개선, 500명 교사 연수 프로그램 운영.',
        role: '사업 총괄 관리자',
        startDate: new Date('2020-03-01'),
        endDate: new Date('2024-02-29'),
        countries: JSON.stringify(['라오스']),
        industries: JSON.stringify(['기초교육', '교사연수', '교육인프라']),
        businessTypes: JSON.stringify(['사업관리', '기술협력', '현장실행']),
        achievements: '학생 학습성취도 25% 향상, 150개교 교육여건 개선, 500명 교사 역량 강화',
      },
      {
        careerId: career1.id,
        name: '캄보디아 직업기술교육(TVET) 체계 현대화 사업',
        description: '캄보디아 vocational training centers 현대화 및 교육과정 개발. 관광, IT, 제조 분야 직종 훈련 프로그램 설계.',
        role: 'Project Director',
        startDate: new Date('2021-01-01'),
        endDate: null,
        countries: JSON.stringify(['캄보디아']),
        industries: JSON.stringify(['직업기술교육', '고용촉진', '산업맞춤형人才培养']),
        businessTypes: JSON.stringify(['사업관리', '정책자문', '역량강화']),
        achievements: '3개 직업전문학교 시설 현대화, 8개 신규 훈련과정 개발',
      },
    ],
  })

  // UNESCO 프로젝트들
  await prisma.project.createMany({
    data: [
      {
        careerId: career2.id,
        name: '몽골 기초교육 체계 개선 사업',
        description: '몽골 교육부와 협력하여 2017教育改革支援. 교사평가체계 구축, 교육과정 개발, 학습지도 자료 제작.',
        role: 'Lead Education Specialist',
        startDate: new Date('2016-06-01'),
        endDate: new Date('2018-12-31'),
        countries: JSON.stringify(['몽골']),
        industries: JSON.stringify(['교육정책', '교사연수', '교육과정']),
        businessTypes: JSON.stringify(['정책자문', '기술협력', '역량강화']),
        achievements: '교사 평가 모델 수립, 국가 교육과정 개정 참여, 2,000명 교사 대상 연수 프로그램',
      },
      {
        careerId: career2.id,
        name: '네팔 교육 긴급복구 사업',
        description: '2015年地震 후 네팔 교육부 긴급복구 지원. 임시교실 설치, 심리사회적 지원 프로그램, 교육재개 계획 수립.',
        role: 'Emergency Education Coordinator',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2016-12-31'),
        countries: JSON.stringify(['네팔']),
        industries: JSON.stringify(['긴급구호', '교육복구', '심리지원']),
        businessTypes: JSON.stringify(['긴급대응', '사업관리', '지역사회개발']),
        achievements: '500개 임시교실 설치, 3만 명 학생 교육재개, 지역 교육담당官 역량강화',
      },
      {
        careerId: career2.id,
        name: '아시아·태평양 교육정책 네트워킹',
        description: 'UNESCO亚太教育局 주관 아시아·태평양 20개국 교육정책 네트워킹 플랫폼 구축 및 연례 컨퍼런스 개최.',
        role: 'Program Coordinator',
        startDate: new Date('2017-01-01'),
        endDate: new Date('2019-12-31'),
        countries: JSON.stringify(['태국', '베트남', '인도네시아', '스리랑카', '말레이시아']),
        industries: JSON.stringify(['교육정책', '네트워크', '국제협력']),
        businessTypes: JSON.stringify(['네트워킹', '정책대화', '지식공유']),
        achievements: '연간 컨퍼런스 3회 개최, 20개국 100명 이상 전문가 네트워크 구축',
      },
    ],
  })

  // World Bank 프로젝트들
  await prisma.project.create({
    data: {
      careerId: career3.id,
      name: '에티오피아 TVET 체계 구축 사업',
      description: '에티오피아 노동省 및 교육省와 협력하여 직업기술교육 체계 구축. 10개 지역 TVET센터 설립, 훈련교사 양성, 기업 연계 프로그램 개발.',
      role: 'Senior Education Specialist',
      startDate: new Date('2014-08-01'),
      endDate: new Date('2016-02-29'),
      countries: JSON.stringify(['에티오피아']),
      industries: JSON.stringify(['직업기술교육', '노동시장', '산업연계']),
      businessTypes: JSON.stringify(['사업기획', '기술자문', '모니터링평가']),
      achievements: '10개 지역 TVET센터 설계, 200명 훈련교사 양성, 기업연계就业 프로그램 구축',
    },
  })

  // JICA 프로젝트
  await prisma.project.create({
    data: {
      careerId: career4.id,
      name: '캄보디아 초등교육 품질 개선사업',
      description: '캄보디아 교육청과 협력하여 초등학교 교육과정 개선 및 교사 연수 프로그램 개발. 학습성취도 평가 체계 구축.',
      role: 'Project Manager',
      startDate: new Date('2013-01-01'),
      endDate: new Date('2014-05-31'),
      countries: JSON.stringify(['캄보디아']),
      industries: JSON.stringify(['초등교육', '교육과정', '교사연수']),
      businessTypes: JSON.stringify(['사업관리', '교육과정개발', '모니터링']),
      achievements: '국가 수준 학습평가 도구 개발, 1,000명 교사 대상 연수 프로그램 운영',
    },
  })

  // KDI 연구
  await prisma.project.createMany({
    data: [
      {
        careerId: career5.id,
        name: '한국 ODA 교육협력 효과성 분석 연구',
        description: '한국政府对 교육 ODA 사업의 효과성 및 효율성 분석. 수원국 교육개발 현황 및 한국 협력 방안 연구.',
        role: '연구책임자',
        startDate: new Date('2009-03-01'),
        endDate: new Date('2011-12-31'),
        countries: JSON.stringify(['대한민국', '베트남', '캄보디아', '미얀마']),
        industries: JSON.stringify(['ODA 정책', '교육개발', '연구분석']),
        businessTypes: JSON.stringify(['정책연구', '효과성평가', '자문']),
        achievements: '정책연구보고서 3건 발간, ODA 교육협력 정책 권고',
      },
      {
        careerId: career5.id,
        name: '아세안 교육협력 현황 및 전망',
        description: '아세안 지역 교육협력 현황 분석 및 향후 협력 방향 연구. 역내 교육교류 확대 방안 마련.',
        role: '선임연구자',
        startDate: new Date('2011-01-01'),
        endDate: new Date('2012-06-30'),
        countries: JSON.stringify(['인도네시아', '말레이시아', '태국', '베트남']),
        industries: JSON.stringify(['교육교류', '국제협력', '정책분석']),
        businessTypes: JSON.stringify(['연구', '정책자문', '보고서작성']),
        achievements: '연구보고서 및 정책브리프 발간, 학술 논문 게재',
      },
    ],
  })

  console.log('✅ 프로젝트 9건 생성')

  // ========== 증빙서류 ==========
  await prisma.document.createMany({
    data: [
      {
        userId: testUser.id,
        careerId: career1.id,
        name: 'KOICA 재직증명서.pdf',
        type: 'employment',
        fileUrl: '/uploads/koica_employment.pdf',
        fileKey: 'koica_emp_001',
        status: 'approved',
      },
      {
        userId: testUser.id,
        name: '서울대 대학원 졸업증명서.pdf',
        type: 'degree',
        fileUrl: '/uploads/snu_degree.pdf',
        fileKey: 'snu_deg_001',
        status: 'approved',
      },
      {
        userId: testUser.id,
        name: 'UNESCO 전문가 수료증.pdf',
        type: 'certification',
        fileUrl: '/uploads/unesco_cert.pdf',
        fileKey: 'unesco_cert_001',
        status: 'approved',
      },
      {
        userId: testUser.id,
        name: 'ADB 자격증.pdf',
        type: 'certification',
        fileUrl: '/uploads/adb_cert.pdf',
        fileKey: 'adb_cert_001',
        status: 'pending',
      },
      {
        userId: testUser.id,
        name: 'IELTS 성적표.pdf',
        type: 'language',
        fileUrl: '/uploads/ielts_score.pdf',
        fileKey: 'ielts_001',
        status: 'approved',
      },
    ],
  })
  console.log('✅ 증빙서류 5건 생성')

  // ========== 알림 ==========
  await prisma.notification.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'profile_view',
        title: '프로필 조회',
        content: '에티오피아 교육부가 프로젝트 전문가 프로필을 조회했습니다.',
      },
      {
        userId: testUser.id,
        type: 'job_offer',
        title: '사업 참여 제안',
        content: 'UNESCO에서 몽골 교육정책 자문 사업 참여를 제안했습니다.',
      },
      {
        userId: testUser.id,
        type: 'document_approved',
        title: '서류 인증 완료',
        content: 'KOICA 재직증명서 인증이 완료되었습니다.',
      },
      {
        userId: testUser.id,
        type: 'system',
        title: '전문가 등록 완료',
        content: 'ODA 교육 전문가로 등록이 완료되었습니다. 프로필을 활성화하세요.',
      },
    ],
  })
  console.log('✅ 알림 4건 생성')

  console.log('\n🎉 ODA 교육 전문가 시드 데이터 생성 완료!')
  console.log('\n📋 테스트 계정:')
  console.log('   Email: test@example.com')
  console.log('   Password: password123')
  console.log('\n📊 데이터 현황:')
  console.log('   - 경력 5건 (KOICA, UNESCO, World Bank, JICA, KDI)')
  console.log('   - 프로젝트 9건 (라오스, 캄보디아, 몽골, 네팔, 에티오피아)')
  console.log('   - 학력 3건')
  console.log('   - 언어 4건')
  console.log('   - 자격/수료 4건')
  console.log('   - 증빙서류 5건')
}

main()
  .catch((e) => {
    console.error('❌ 시드 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })