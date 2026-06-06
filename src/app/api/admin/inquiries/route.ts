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

// GET /api/admin/inquiries - List all inquiries for admin
export async function GET(request: Request) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

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

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
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
    console.error('Error fetching admin inquiries:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}