import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Middleware to check corporate access
async function checkCorporate() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '인증이 필요합니다', status: 401 }
  }
  if (user.userType !== 'enterprise') {
    return { error: '기업회원만 접근 가능합니다', status: 403 }
  }
  return { user }
}

// GET /api/corporate/employees - Get employees (소속기술자)
export async function GET() {
  const check = await checkCorporate()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const relations = await prisma.employeeRelation.findMany({
      where: { corporateId: check.user!.id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            currentCountry: true,
            bio: true,
            _count: {
              select: { careers: true, documents: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const employees = relations.map(rel => ({
      id: rel.employee.id,
      name: rel.employee.name,
      email: rel.employee.email,
      currentCountry: rel.employee.currentCountry,
      bio: rel.employee.bio,
      department: rel.department,
      position: rel.position,
      consentGiven: rel.consentGiven,
      consentType: rel.consentType,
      consentStartDate: rel.consentStartDate,
      consentEndDate: rel.consentEndDate,
      paymentConsent: rel.paymentConsent,
      status: rel.status,
      careerCount: rel.employee._count.careers,
      documentCount: rel.employee._count.documents,
    }))

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}