import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Certificate type labels and prices
const CERTIFICATE_TYPES = {
  career: { label: '경력 증명서', price: 55000, description: 'ODA 프로젝트 경력 증명' },
  oda_experience: { label: 'ODA 경력 증명서', price: 77000, description: 'KOICA, UNESCO 등 국제기구 경력 인증' },
  project: { label: '프로젝트 증명서', price: 44000, description: '특정 프로젝트 참여经历的증명' },
  education: { label: '학력 증명서', price: 33000, description: '교육 이수经历的증명' },
}

// GET /api/certificates - Get user's certificate requests
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.certificateRequest.findMany({
      where: { userId: user.id },
      include: {
        payment: true,
        document: true,
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ 
      requests,
      certificateTypes: CERTIFICATE_TYPES 
    })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/certificates - Create certificate request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, title, content } = await request.json()

    if (!type || !CERTIFICATE_TYPES[type as keyof typeof CERTIFICATE_TYPES]) {
      return NextResponse.json({ error: 'Invalid certificate type' }, { status: 400 })
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const certificateRequest = await prisma.certificateRequest.create({
      data: {
        userId: user.id,
        type,
        title,
        content,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    })

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'certificate',
            title: '증명서 발급 요청',
            content: `${user.name}님이 ${CERTIFICATE_TYPES[type as keyof typeof CERTIFICATE_TYPES].label}을 요청했습니다.`,
            data: JSON.stringify({ certificateRequestId: certificateRequest.id }),
          },
        })
      )
    )

    return NextResponse.json({ 
      certificateRequest,
      price: CERTIFICATE_TYPES[type as keyof typeof CERTIFICATE_TYPES].price 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating certificate request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}