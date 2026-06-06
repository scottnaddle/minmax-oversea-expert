import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const user = await getCurrentUser()
  if (!user) return { error: '인증이 필요합니다', status: 401 }
  if (user.role !== 'admin') return { error: '관리자 권한이 필요합니다', status: 403 }
  return { user }
}

// POST /api/admin/certificates/[id]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { id } = await params
    const { } = await request.json().catch(() => ({}))

    const cert = await prisma.certificateRequest.findUnique({ where: { id } })
    if (!cert) {
      return NextResponse.json({ error: '증명서 요청을 찾을 수 없습니다' }, { status: 404 })
    }

    const updated = await prisma.certificateRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: check.user!.id,
        approvedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        document: true,
      },
    })

    // Notify user
    await prisma.notification.create({
      data: {
        userId: cert.userId,
        type: 'document_approved',
        title: '증명서 발급 승인',
        content: '증명서 발급이 승인되었습니다. 발급 완료 후 알림을 드리겠습니다.',
      },
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    console.error('Error approving certificate:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}