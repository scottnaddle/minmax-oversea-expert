import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const educations = await prisma.education.findMany({
      where: { userId: user.id },
      orderBy: { graduationYear: 'desc' },
    })

    return NextResponse.json({ educations })
  } catch (error) {
    console.error('Error fetching education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { school, major, degree, country, graduationYear } = body

    if (!school || !major || !degree || !country || !graduationYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
    console.error('Error creating education:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}