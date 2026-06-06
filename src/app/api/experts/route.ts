import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const country = searchParams.get('country') || ''
    const userType = searchParams.get('userType') || 'expert'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: any = {
      userType,
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { bio: { contains: query } },
        { email: { contains: query } },
      ]
    }

    if (country) {
      where.currentCountry = { contains: country }
    }

    const [experts, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          bio: true,
          profileImage: true,
          currentCountry: true,
          nationality: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              careers: true,
              documents: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    // Transform data
    const transformedExperts = experts.map((expert) => {
      // Determine years of experience from careers
      let years = '신규'
      if (expert._count.careers > 0) {
        years = `${expert._count.careers}+년`
      }

      // Get first career organization as primary org
      const primaryOrg = 'ODA 전문가'

      return {
        id: expert.id,
        name: expert.name,
        title: primaryOrg,
        location: expert.currentCountry || '미지정',
        years,
        bio: expert.bio,
        nationality: expert.nationality,
        verified: expert.emailVerified,
        careerCount: expert._count.careers,
        documentCount: expert._count.documents,
        createdAt: expert.createdAt,
      }
    })

    return NextResponse.json({
      experts: transformedExperts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get experts error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}