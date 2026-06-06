import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/consultations
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        OR: [
          { userId: user.id },
          { expertId: user.id },
          { user: { role: 'admin' } }, // Admin sees all
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        expert: {
          select: { id: true, name: true, profileImage: true },
        },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ consultations })
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/consultations
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { expertId, type, title, content, preferredDate } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId: user.id,
        expertId: expertId || null,
        type: type || 'other',
        title,
        content,
        preferredDate: preferredDate || null,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    })

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'consultation',
            title: '새 상담 요청',
            content: `${user.name}님이 "${title}" 상담을 요청했습니다.`,
            data: JSON.stringify({ consultationId: consultation.id }),
          },
        })
      )
    )

    return NextResponse.json({ consultation }, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}