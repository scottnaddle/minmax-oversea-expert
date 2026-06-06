import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdmin() {
  const user = await getCurrentUser()
  if (!user) return { error: '인증이 필요합니다', status: 401 }
  if (user.role !== 'admin') return { error: '관리자 권한이 필요합니다', status: 403 }
  return { user }
}

// POST /api/admin/certificates/[id]/reject
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
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: '반려 사유를 입력해주세요' }, { status: 400 })
    }

    const cert = await prisma.certificateRequest.findUnique({ where: { id } })
    if (!cert) {
      return NextResponse.json({ error: '증명서 요청을 찾을 수 없습니다' }, { status: 404 })
    }

    const updated = await prisma.certificateRequest.update({
      where: { id },
      data: {
        status: 'rejected',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

// Notify user
    await prisma.notification.create({
      data: {
        userId: cert.userId,
        type: 'document_rejected',
        title: '증명서 발급 반려',
        content: `증명서 발급이 반려되었습니다. 사유: ${reason}`,
      },
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    console.error('Error rejecting certificate:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}