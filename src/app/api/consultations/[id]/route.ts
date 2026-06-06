import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/consultations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        expert: {
          select: { id: true, name: true, profileImage: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!consultation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check access
    const isOwner = consultation.userId === user.id
    const isExpert = consultation.expertId === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isExpert && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ consultation })
  } catch (error) {
    console.error('Error fetching consultation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/consultations/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, notes, expertId } = await request.json()

    const consultation = await prisma.consultation.findUnique({
      where: { id },
    })

    if (!consultation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Only owner or admin can update basic info
    // Only admin can assign expert or change status to completed
    const isOwner = consultation.userId === user.id
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        ...(status && isAdmin && { status }),
        ...(notes && isAdmin && { notes }),
        ...(expertId && isAdmin && { expertId }),
      },
      include: {
        user: { select: { id: true, name: true } },
        expert: { select: { id: true, name: true } },
      },
    })

    // Notify user if status changed
    if (status && status !== consultation.status && !isOwner) {
      await prisma.notification.create({
        data: {
          userId: consultation.userId,
          type: 'consultation',
          title: '상담 상태 변경',
          content: `요청하신 상담 "${consultation.title}" 상태가 "${status}"로 변경되었습니다.`,
          data: JSON.stringify({ consultationId: id }),
        },
      })
    }

    return NextResponse.json({ consultation: updated })
  } catch (error) {
    console.error('Error updating consultation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}