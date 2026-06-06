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

// GET /api/admin/users/[id] - Get user details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        careers: { include: { projects: true } },
        educations: true,
        languages: true,
        certifications: true,
        documents: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user (role, etc)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const body = await request.json()
    const { role, userType } = body

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(role && { role }),
        ...(userType && { userType }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await checkAdmin()
  if (check.error || !check.user) {
    return NextResponse.json({ error: check.error || '인증 오류' }, { status: check.status || 401 })
  }

  try {
    // Prevent self-deletion
    if (params.id === check.user.id) {
      return NextResponse.json({ error: '자신의 계정은 삭제할 수 없습니다' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '사용자가 삭제되었습니다' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}