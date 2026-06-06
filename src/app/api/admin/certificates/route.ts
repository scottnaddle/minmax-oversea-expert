import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/certificates - Get all certificate requests
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const requests = await prisma.certificateRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        payment: true,
        document: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}