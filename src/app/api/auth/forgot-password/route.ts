import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // 보안을 위해 사용자가 없어도 성공 응답을 반환
      return NextResponse.json({
        success: true,
        message: '입력한 이메일로 비밀번호 재설정 링크를 보내드렸습니다.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1시간 후 만료

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // In production, send email here
    // For demo, return the token directly
    console.log(`🔑 Password reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 링크를 생성했습니다.',
      // Demo only - remove in production
      resetToken,
      resetUrl: `/reset-password/${resetToken}`,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}