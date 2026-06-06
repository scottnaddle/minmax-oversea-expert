import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/inquiries/[id]/replies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: inquiryId } = await params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Verify inquiry exists
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { user: { select: { id: true, name: true } } },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Check access for private inquiries
    if (inquiry.isPrivate && user.id !== inquiry.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const reply = await prisma.inquiryReply.create({
      data: {
        inquiryId,
        userId: user.id,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    })

    // Update inquiry status if first reply
    const replyCount = await prisma.inquiryReply.count({
      where: { inquiryId },
    })

    if (replyCount === 1) {
      await prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: 'answered' },
      })
    }

    // Notify inquiry owner if not replying to own inquiry
    if (inquiry.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: inquiry.userId,
          type: 'inquiry_reply',
          title: '문의 답변 등록',
          content: `${user.name}님이 "${inquiry.title}" 문의를 답변했습니다.`,
          data: JSON.stringify({ inquiryId }),
        },
      })
    }

    return NextResponse.json({ reply }, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}