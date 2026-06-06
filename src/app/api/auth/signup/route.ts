import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { signupSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, userType, currentCountry, expertise, businessNumber, businessName, businessType, representativeName, companyPhone } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType,
        currentCountry: currentCountry || null,
        bio: expertise || null,
        ...(userType === 'enterprise' && {
          businessNumber: businessNumber || null,
          businessName: businessName || null,
          businessType: businessType || null,
          representativeName: representativeName || null,
          companyPhone: companyPhone || null,
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
      },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    })

    // Set cookie
    const response = NextResponse.json(
      { message: '회원가입이 완료되었습니다', user },
      { status: 201 }
    )
    response.headers.set('Set-Cookie', setAuthCookie(token))

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}