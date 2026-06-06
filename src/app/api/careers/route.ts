import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/careers - Get all careers for current user
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const careers = await prisma.career.findMany({
      where: { userId: user.id },
      include: {
        projects: true,
        documents: true,
      },
      orderBy: { startDate: 'desc' },
    })

    return NextResponse.json({ careers })
  } catch (error) {
    console.error('Get careers error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// POST /api/careers - Create new career
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { company, position, country, startDate, endDate, isCurrent, description } = body

    if (!company || !position || !country || !startDate) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    const career = await prisma.career.create({
      data: {
        userId: user.id,
        company,
        position,
        country,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description: description || null,
      },
      include: {
        projects: true,
      },
    })

    return NextResponse.json({ career }, { status: 201 })
  } catch (error) {
    console.error('Create career error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}