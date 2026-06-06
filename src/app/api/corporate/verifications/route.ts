import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkCorporate() {
  const user = await getCurrentUser()
  if (!user) return { error: '인증이 필요합니다', status: 401 }
  if (user.userType !== 'enterprise') return { error: '기업회원만 접근 가능합니다', status: 403 }
  return { user }
}

// GET /api/corporate/verifications - 기업확인요청 목록
export async function GET(request: NextRequest) {
  const check = await checkCorporate()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { corporateId: check.user!.id }
    if (status) where.status = status

    const verifications = await prisma.verificationRequest.findMany({
      where,
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        career: {
          select: {
            id: true,
            company: true,
            position: true,
            country: true,
            startDate: true,
            endDate: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format with requester info embedded
    const formatted = verifications.map(v => ({
      id: v.id,
      requesterName: v.requester.name,
      requesterEmail: v.requester.email,
      organization: v.career.company,
      role: v.career.position,
      country: v.career.country,
      startDate: v.career.startDate,
      endDate: v.career.endDate,
      description: v.career.description,
      status: v.status,
      createdAt: v.createdAt,
    }))

    return NextResponse.json({ verifications: formatted })
  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}