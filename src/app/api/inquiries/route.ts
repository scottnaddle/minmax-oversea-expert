import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inquiries - List inquiries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const currentUser = await getCurrentUser()

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    // If not logged in or not admin, only show non-private inquiries
    if (!currentUser || currentUser.role !== 'admin') {
      where.isPrivate = false
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({
      inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/inquiries - Create inquiry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, category, isPrivate } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        title,
        content,
        category: category || 'general',
        isPrivate: isPrivate || false,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    // Notify admins about new inquiry
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'inquiry',
            title: '새 문의글',
            content: `${user.name}님이 "${title}" 문의를 등록했습니다.`,
            data: JSON.stringify({ inquiryId: inquiry.id }),
          },
        })
      )
    )

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}