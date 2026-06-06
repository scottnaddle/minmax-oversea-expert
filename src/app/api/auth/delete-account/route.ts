import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // Get full user with password
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!fullUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, fullUser.password)
    if (!isValid) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    })

    // Clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: '계정이 삭제되었습니다.',
    })

    return response
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}