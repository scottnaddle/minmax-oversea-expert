import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Middleware to check admin access
async function checkAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '인증이 필요합니다', status: 401 }
  }
  if (user.role !== 'admin') {
    return { error: '관리자 권한이 필요합니다', status: 403 }
  }
  return { user }
}

// PUT /api/admin/documents/[id] - Update document status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { status } = await request.json()

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태입니다' }, { status: 400 })
    }

    const document = await prisma.document.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification for user
    const notificationMessage = status === 'approved'
      ? '제출하신 증빙서류가 승인되었습니다.'
      : status === 'rejected'
        ? '제출하신 증빙서류가 거절되었습니다.'
        : '증빙서류 검토가 진행 중입니다.'

    await prisma.notification.create({
      data: {
        userId: document.user.id,
        type: 'document_status',
        title: `증빙서류 ${status === 'approved' ? '승인' : status === 'rejected' ? '거절' : '검토 중'}`,
        content: notificationMessage,
      },
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/admin/documents/[id] - Delete document
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    await prisma.document.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '문서가 삭제되었습니다' })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}