import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inquiries/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check access
    if (inquiry.isPrivate && (!user || (user.id !== inquiry.userId && user.role !== 'admin'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Error fetching inquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/inquiries/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, category, status, isPrivate } = body

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Only owner or admin can update
    if (inquiry.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(status && user.role === 'admin' && { status }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ inquiry: updated })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/inquiries/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Only owner or admin can delete
    if (inquiry.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.inquiry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}