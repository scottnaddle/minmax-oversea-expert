import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const certifications = await prisma.certification.findMany({
      where: { userId: user.id },
      orderBy: { issuedDate: 'desc' },
    })

    return NextResponse.json({ certifications })
  } catch (error) {
    console.error('Error fetching certifications:', error)
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
    const { name, issuer, issuedDate, expirationDate, credentialId } = body

    if (!name || !issuer || !issuedDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const certification = await prisma.certification.create({
      data: {
        userId: user.id,
        name,
        issuer,
        issuedDate: new Date(issuedDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        credentialId: credentialId || null,
      },
    })

    return NextResponse.json({ certification }, { status: 201 })
  } catch (error) {
    console.error('Error creating certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}