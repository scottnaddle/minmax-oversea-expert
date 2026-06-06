import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkCorporate() {
  const user = await getCurrentUser()
  if (!user) return { error: '인증이 필요합니다', status: 401 }
  if (user.userType !== 'enterprise') return { error: '기업회원만 접근 가능합니다', status: 403 }
  return { user }
}

// POST /api/corporate/verifications/[id]/reject - 기업확인 반려
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
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: '반려 사유를 입력해주세요' }, { status: 400 })
    }

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

    // 요청 반려 처리
    await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        signedAt: new Date(),
      },
    })

    // Career 상태 업데이트
    await prisma.career.update({
      where: { id: verification.careerId },
      data: {
        verificationStatus: 'rejected',
        applicationStatus: 'supplement',
        supplementReason: `기업확인 반려: ${reason}`,
      },
    })

    // 기술자에게 알림
    await prisma.notification.create({
      data: {
        userId: verification.requesterId,
        type: 'verification_rejected',
        title: '기업확인 반려',
        content: `${check.user!.name}에서 경력확인을 반려했습니다. 사유: ${reason}`,
        data: JSON.stringify({ careerId: verification.careerId }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting verification:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}