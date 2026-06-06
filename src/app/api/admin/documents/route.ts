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

// GET /api/admin/documents - List all documents
export async function GET(request: Request) {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const whereBase: any = {}
    if (type) whereBase.type = type

    const [documents, pending, approved, rejected] = await Promise.all([
      prisma.document.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.document.count({ where: { ...whereBase, status: 'pending' } }),
      prisma.document.count({ where: { ...whereBase, status: 'approved' } }),
      prisma.document.count({ where: { ...whereBase, status: 'rejected' } }),
    ])

    return NextResponse.json({ documents, pending, approved, rejected, total: documents.length })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}