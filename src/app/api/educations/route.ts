import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/educations - Get all educations for current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const educations = await prisma.education.findMany({
      where: { userId: user.id },
      orderBy: { graduationYear: 'desc' },
    })

    return NextResponse.json({ educations })
  } catch (error) {
    console.error('Get educations error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// POST /api/educations - Create new education
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { school, major, degree, country, graduationYear } = body

    if (!school || !major || !degree || !country || !graduationYear) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const education = await prisma.education.create({
      data: {
        userId: user.id,
        school,
        major,
        degree,
        country,
        graduationYear: parseInt(graduationYear),
      },
    })

    return NextResponse.json({ education }, { status: 201 })
  } catch (error) {
    console.error('Create education error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}