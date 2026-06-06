import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const languages = await prisma.language.findMany({
      where: { userId: user.id },
      orderBy: [
        { proficiency: 'asc' }, // native first
        { language: 'asc' },
      ],
    })

    return NextResponse.json({ languages })
  } catch (error) {
    console.error('Error fetching languages:', error)
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
    const { language, proficiency, certificate, score, expirationDate } = body

    if (!language || !proficiency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const lang = await prisma.language.create({
      data: {
        userId: user.id,
        language,
        proficiency,
        certificate: certificate || null,
        score: score || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    })

    return NextResponse.json({ language: lang }, { status: 201 })
  } catch (error) {
    console.error('Error creating language:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}