import { NextResponse } from 'next/server'
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

// GET /api/admin/users - List all users
export async function GET() {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        role: true,
        nationality: true,
        currentCountry: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            careers: true,
            documents: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}