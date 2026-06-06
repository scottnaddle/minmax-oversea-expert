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

// POST /api/admin/consultations/[id]/reply - Reply to a consultation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '메시지 내용을 입력하세요' }, { status: 400 })
    }

    // Get the consultation
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!consultation) {
      return NextResponse.json({ error: '상담을 찾을 수 없습니다' }, { status: 404 })
    }

    // Create reply
    const reply = await prisma.consultationReply.create({
      data: {
        consultationId: id,
        userId: check.user!.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    // Update consultation status to in_progress if it was pending
    if (consultation.status === 'pending') {
      await prisma.consultation.update({
        where: { id },
        data: { status: 'in_progress' },
      })
    }

    // Notify the user
    await prisma.notification.create({
      data: {
        userId: consultation.userId,
        type: 'consultation_reply',
        title: '새 메시지',
        content: `"${consultation.title}" 상담에 새 메시지가 도착했습니다.`,
        data: JSON.stringify({ consultationId: id }),
      },
    })

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}