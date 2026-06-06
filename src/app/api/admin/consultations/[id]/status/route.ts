import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Middleware to check admin access
async function checkAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '인증이 필요합니다', status: 401 }
  }
  if (user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다', status: 403 }
  }
  return { user }
}

// PATCH /api/admin/consultations/[id]/status - Update consultation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const { status } = await request.json()

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다' }, { status: 400 })
    }

    const consultation = await prisma.consultation.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    // Notify user about status change
    await prisma.notification.create({
      data: {
        userId: consultation.userId,
        type: 'consultation_status',
        title: '상담 상태 변경',
        content: `"${consultation.title}" 상담 상태가 "${status === 'in_progress' ? '진행중' : status === 'completed' ? '완료' : status === 'cancelled' ? '취소' : '대기'}"로 변경되었습니다.`,
        data: JSON.stringify({ consultationId: id }),
      },
    })

    return NextResponse.json({ consultation })
  } catch (error) {
    console.error('Error updating consultation status:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}