import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const expert = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        currentCountry: true,
        nationality: true,
        emailVerified: true,
        createdAt: true,
        careers: {
          orderBy: { startDate: 'desc' },
          include: {
            projects: true,
          },
        },
        educations: {
          orderBy: { graduationYear: 'desc' },
        },
        languages: true,
        certifications: {
          orderBy: { issuedDate: 'desc' },
        },
        documents: {
          where: { status: 'approved' },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    })

    if (!expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 })
    }

    return NextResponse.json({ expert })
  } catch (error) {
    console.error('Error fetching expert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}