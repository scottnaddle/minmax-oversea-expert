// ODA 전문가 데이터 시드 스크립트
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 ODA 전문가 데이터 시드 생성 중...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  // ========== 전문가 1: 보건/모건前瞻성 전문가 ==========
  const user1 = await prisma.user.upsert({
    where: { email: 'kim@example.com' },
    update: {},
    create: {
      email: 'kim@example.com',
      password: hashedPassword,
      name: '박보건',
      englishName: 'Park Bum-ik',
      nationality: '대한민국',
      currentCountry: '케냐',
      currentCity: '나이로비',
      phone: '+254-712-345-678',
      bio: '12년 이상의 국제보건 개발협력 경험を持つ 전문가입니다. WHO,UNICEF와 협력하여 아프리카·아시아 지역 감염병 관리 및 기초보건 인프라 구축 사업을 수행해왔습니다. 특히 말라리아, 결핵, 에이즈防治 분야에서 다수의 ODA 사업을 총괄한 경력이 있습니다.',
      userType: 'expert',
      role: 'user',
      emailVerified: true,
    },
  })

  console.log('✅ 전문가 계정 생성:', user1.email)

  // 학력
  await prisma.education.createMany({
    data: [
      {
        userId: user1.id,
        school: '서울대학교 대학원',
        major: '국제보건학 석사',
        degree: '석사',
        country: '대한민국',
        graduationYear: 2013,
      },
      {
        userId: user1.id,
        school: '고려대학교',
        major: '의학 학사',
        degree: '학사',
        country: '대한민국',
        graduationYear: 2009,
      },
    ],
  })

  // 언어
  await prisma.language.createMany({
    data: [
      { userId: user1.id, language: '한국어', proficiency: 'native' },
      { userId: user1.id, language: '영어', proficiency: 'advanced', certificate: 'OET', score: 'Grade B' },
      { userId: user1.id, language: '스와힐리어', proficiency: 'basic' },
    ],
  })

  // 자격
  await prisma.certification.createMany({
    data: [
      { userId: user1.id, name: 'WHO certified Public Health Specialist', issuer: 'WHO', issuedDate: new Date('2017-06-01') },
      { userId: user1.id, name: 'Global Fund Technical Review Expert', issuer: 'Global Fund', issuedDate: new Date('2019-03-15') },
    ],
  })

  // 경력 1: UNICEF
  const career1 = await prisma.career.create({
    data: {
      userId: user1.id,
      company: 'UNICEF',
      position: '보건전문가',
      country: '케냐',
      startDate: new Date('2018-01-01'),
      isCurrent: true,
      description: '동아프리카 지역 보건사업 총괄. 케냐, 탄자니아, 우간다에서 모자동장사업 및 감염병 관리 사업 기획 및 모니터링.',
    },
  })

  // 경력 2: Global Fund
  const career2 = await prisma.career.create({
    data: {
      userId: user1.id,
      company: 'Global Fund',
      position: 'Technical Advisor',
      country: '스위스',
      startDate: new Date('2015-03-01'),
      endDate: new Date('2017-12-31'),
      isCurrent: false,
      description: '글로벌 펀드 자문관으로 아시아·태평양 지역 결핵·말라리아 사업을 기술 자문.',
    },
  })

  // 경력 3: 병원
  const career3 = await prisma.career.create({
    data: {
      userId: user1.id,
      company: '국립국제의료원',
      position: '국제협력의官',
      country: '대한민국',
      startDate: new Date('2011-07-01'),
      endDate: new Date('2015-02-28'),
      isCurrent: false,
      description: '해외 의료지원 사업 기획 및 수행. 개발도상국 의료진 연수 프로그램 운영.',
    },
  })

  // 프로젝트
  await prisma.project.createMany({
    data: [
      {
        careerId: career1.id,
        name: '케냐 모자동장 사업',
        description: '케냐 10개 주 500개소에 모자동장 설치 및 지역 보건인력 역량강화.',
        role: 'Project Manager',
        startDate: new Date('2018-06-01'),
        endDate: null,
        countries: JSON.stringify(['케냐']),
        industries: JSON.stringify(['모자동장', '기초보건', '영유아보건']),
        businessTypes: JSON.stringify(['사업관리', '기술협력', '모니터링']),
        achievements: '500개소 모자동장 설치, 2만 명 영유아 등록, 지역 보건인력 200명 교육',
      },
      {
        careerId: career1.id,
        name: '동아프리카 감염병 통합대응 체계 구축',
        description: '동아프리카 공동시장 지역 감염병 감시 및 대응 체계 통합.',
        role: 'Regional Coordinator',
        startDate: new Date('2020-01-01'),
        endDate: null,
        countries: JSON.stringify(['케냐', '탄자니아', '우간다', '에티오피아']),
        industries: JSON.stringify(['감염병관리', '보건체계', '역학조사']),
        businessTypes: JSON.stringify(['사업기획', '지역협력', '정책자문']),
      },
      {
        careerId: career2.id,
        name: '미얀마 결핵 퇴치 사업',
        description: '미얀마 전국 결핵 검사 및 치료 체계 구축.',
        role: 'Technical Advisor',
        startDate: new Date('2015-06-01'),
        endDate: new Date('2017-12-31'),
        countries: JSON.stringify(['미얀마']),
        industries: JSON.stringify(['결핵관리', '감염병', '일차보건']),
        businessTypes: JSON.stringify(['기술자문', '모니터링', '평가']),
        achievements: '결핵 발견율 30% 향상, 치료 성공률 85% 달성',
      },
      {
        careerId: career3.id,
        name: '베트남 의료인력 연수 사업',
        description: '베트남 의료진 대상 응급의료 및 만성병 관리 연수 프로그램.',
        role: 'Program Coordinator',
        startDate: new Date('2012-01-01'),
        endDate: new Date('2014-12-31'),
        countries: JSON.stringify(['베트남']),
        industries: JSON.stringify(['의료연수', '역량강화', '보건체계']),
        businessTypes: JSON.stringify(['사업관리', '연수프로그램', '기술협력']),
      },
    ],
  })

  // 서류
  await prisma.document.createMany({
    data: [
      {
        userId: user1.id,
        careerId: career1.id,
        name: 'UNICEF 재직증명서.pdf',
        type: 'employment',
        fileUrl: '/uploads/unicef_employment.pdf',
        fileKey: 'unicef_emp_001',
        status: 'approved',
      },
      {
        userId: user1.id,
        name: '의사면허증.pdf',
        type: 'certification',
        fileUrl: '/uploads/medical_license.pdf',
        fileKey: 'med_lic_001',
        status: 'approved',
      },
      {
        userId: user1.id,
        name: 'WHO 전문인력 증명서.pdf',
        type: 'certification',
        fileUrl: '/uploads/who_cert.pdf',
        fileKey: 'who_cert_001',
        status: 'approved',
      },
    ],
  })

  console.log('✅ 전문가 1 데이터 생성 완료')

  // ========== 기업 사용자: ODA 컨설팅 ==========
  const user2 = await prisma.user.upsert({
    where: { email: 'hr@abcconsulting.com' },
    update: {},
    create: {
      email: 'hr@abcconsulting.com',
      password: hashedPassword,
      name: '김ODA',
      englishName: 'Kim ODA Manager',
      nationality: '대한민국',
      currentCountry: '대한민국',
      currentCity: '서울',
      phone: '+82-2-1234-5678',
      bio: '한국국제협력단(KOICA) 교육협력팀 HR 매니저입니다. ODA 교육사업 전문가 Pool 관리 및 사업 추진을 담당하고 있습니다.',
      userType: 'enterprise',
      emailVerified: true,
      // 기업회원 전용 필드
      businessNumber: '123-45-67890',
      businessName: '(주)ODA 컨설팅',
      businessType: '정보통신업',
      representativeName: '홍길동',
      establishedDate: '2015-03-15',
      companyPhone: '+82-2-1234-5678',
      companyAddress: '서울특별시 서초구 사임당로 28',
    },
  })

  console.log('✅ 기업 계정 생성:', user2.email)

  // 기업회원 - 소속기술자 관계 생성 (경력관리 위탁 동의)
  await prisma.employeeRelation.upsert({
    where: {
      corporateId_employeeId: {
        corporateId: user2.id,
        employeeId: user1.id,
      },
    },
    update: {},
    create: {
      corporateId: user2.id,
      employeeId: user1.id,
      department: 'ODA사업팀',
      position: '선임연구원',
      consentGiven: true,
      consentType: 'full',
      consentStartDate: new Date(),
      // 1년 후 만료
      consentEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      paymentConsent: true,
      status: 'active',
    },
  })
  console.log('✅ 소속기술자 관계 생성 (위탁 동의)')

  // 메시지
  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: user1.id,
      subject: '케냐 교육보건 통합사업 전문가 참여 제안',
      content: '안녕하세요 박보건 전문가님. KOICA에서는 케냐에서 추진하는 교육보건 통합사업을 위한 전문가를 모시고 있습니다. 감염병 관리 및 모자동장 분야 전문성이 필요하여 연락드립니다. 관심이 있으시면 상세한 사업 계획을 공유해 드리겠습니다.',
      read: false,
    },
  })

  // 알림
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'profile_view',
        title: '프로필 조회',
        content: 'KOICA 교육협력팀이 전문가 프로필을 조회했습니다.',
      },
      {
        userId: user1.id,
        type: 'job_offer',
        title: '사업 참여 제안',
        content: 'KOICA에서 케냐 교육보건 통합사업 전문가 참여를 제안했습니다.',
        data: JSON.stringify({ organization: 'KOICA', project: '케냐 교육보건 통합사업' }),
      },
      {
        userId: user1.id,
        type: 'document_approved',
        title: '서류 인증 완료',
        content: 'UNICEF 재직증명서 인증이 완료되었습니다.',
      },
      {
        userId: user2.id,
        type: 'system',
        title: '전문가 Pool 업데이트',
        content: '신규 전문가 3명이 등록했습니다. 프로필을 검토해 보세요.',
      },
    ],
  })

  console.log('✅ 기업 사용자 및 메시지/알림 생성 완료')

  console.log('\n🎉 ODA 전문가 시드 완료!')
  console.log('\n📋 테스트 계정:')
  console.log('   👤 개인회원(SW기술자): kim@example.com / password123')
  console.log('   🏢 기업회원(ODA 컨설팅): hr@abcconsulting.com / password123')
  console.log('   👤 admin: admin@example.com / password123')
  console.log('')
  console.log('📊 매뉴얼 기반 6가지 경력 신청:')
  console.log('   1) 근무경력 (employment)')
  console.log('   2) 기술경력 (technical)')
  console.log('   3) 학력 (education)')
  console.log('   4) 기술자격 (certification)')
  console.log('   5) 교육 (training)')
  console.log('   6) 상훈 (award)')
}

main()
  .catch((e) => {
    console.error('❌ 시드 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })