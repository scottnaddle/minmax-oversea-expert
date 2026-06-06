import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/projects - Create new project for a career
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { careerId, name, description, role, startDate, endDate, countries, industries, businessTypes, achievements } = body

    if (!careerId || !name || !description || !role || !startDate || !countries || !industries || !businessTypes) {
      return NextResponse.json({ error: '필수 항목을 입력해주세요' }, { status: 400 })
    }

    // Verify career ownership
    const career = await prisma.career.findFirst({
      where: { id: careerId, userId: user.id },
    })

    if (!career) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    const project = await prisma.project.create({
      data: {
        careerId,
        name,
        description,
        role,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        countries: JSON.stringify(countries),
        industries: JSON.stringify(industries),
        businessTypes: JSON.stringify(businessTypes),
        achievements: achievements || null,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}