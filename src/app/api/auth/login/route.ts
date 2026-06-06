import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    })

    // Set cookie
    const response = NextResponse.json({
      message: '로그인되었습니다',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role,
      },
      redirectUrl: user.role === 'admin' ? '/admin' : '/dashboard',
    })
    response.headers.set('Set-Cookie', setAuthCookie(token))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}