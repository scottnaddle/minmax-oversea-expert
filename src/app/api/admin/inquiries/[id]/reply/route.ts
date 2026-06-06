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

// POST /api/admin/inquiries/[id]/reply - Reply to an inquiry
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
      return NextResponse.json({ error: '답변 내용을 입력하세요' }, { status: 400 })
    }

    // Get the inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!inquiry) {
      return NextResponse.json({ error: '문의를 찾을 수 없습니다' }, { status: 404 })
    }

    // Create reply
    const reply = await prisma.inquiryReply.create({
      data: {
        inquiryId: id,
        userId: check.user!.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    // Update inquiry status to answered
    await prisma.inquiry.update({
      where: { id },
      data: { status: 'answered' },
    })

    // Notify the user
    await prisma.notification.create({
      data: {
        userId: inquiry.userId,
        type: 'inquiry_reply',
        title: '문의 답변 도착',
        content: `"${inquiry.title}" 문의에 답변이 등록되었습니다.`,
        data: JSON.stringify({ inquiryId: id }),
      },
    })

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// GET /api/admin/inquiries/[id]/reply - Get replies for an inquiry
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params

    const replies = await prisma.inquiryReply.findMany({
      where: { inquiryId: id },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ replies })
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}