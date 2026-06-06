import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkCorporate() {
  const user = await getCurrentUser()
  if (!user) return { error: '인증이 필요합니다', status: 401 }
  if (user.userType !== 'enterprise') return { error: '기업회원만 접근 가능합니다', status: 403 }
  return { user }
}

// POST /api/corporate/verifications/[id]/approve - 기업확인 (전자서명 처리)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await checkCorporate()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    // 요청 조회
    const verification = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { career: true, requester: true },
    })

    if (!verification) {
      return NextResponse.json({ error: '확인 요청을 찾을 수 없습니다' }, { status: 404 })
    }

    if (verification.corporateId !== check.user!.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    if (verification.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 요청입니다' }, { status: 400 })
    }

    // 요청 승인 처리
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'approved',
        signedAt: new Date(),
        // TODO: 실제 전자서명 데이터 저장 (certificateUrl)
      },
    })

    // Career 검증 상태 업데이트
    await prisma.career.update({
      where: { id: verification.careerId },
      data: {
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        verifiedBy: check.user!.id,
      },
    })

    // 기술자에게 알림
    await prisma.notification.create({
      data: {
        userId: verification.requesterId,
        type: 'verification_approved',
        title: '기업확인 완료',
        content: `${check.user!.name}에서 ${verification.career.company} 경력을 확인 처리했습니다.`,
        data: JSON.stringify({ careerId: verification.careerId }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving verification:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}