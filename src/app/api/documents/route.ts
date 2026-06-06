import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string
    const name = formData.get('name') as string

    if (!file || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, you would upload to cloud storage here
    // For now, we'll create a record without actual file storage
    const fileKey = `${user.id}/${Date.now()}-${file.name}`
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        name: name || file.name,
        type,
        status: 'pending',
        fileUrl: `/uploads/${fileKey}`,
        fileKey,
        rejectionReason: null,
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}