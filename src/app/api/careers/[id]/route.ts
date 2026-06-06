import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/careers/[id] - Get single career
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const career = await prisma.career.findFirst({
      where: { id, userId: user.id },
      include: {
        projects: true,
        documents: true,
      },
    })

    if (!career) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json({ career })
  } catch (error) {
    console.error('Get career error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// PUT /api/careers/[id] - Update career
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.career.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    const body = await request.json()
    const { company, position, country, startDate, endDate, isCurrent, description } = body

    const career = await prisma.career.update({
      where: { id },
      data: {
        company: company || existing.company,
        position: position || existing.position,
        country: country || existing.country,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : (isCurrent ? null : existing.endDate),
        isCurrent: isCurrent !== undefined ? isCurrent : existing.isCurrent,
        description: description !== undefined ? description : existing.description,
      },
      include: {
        projects: true,
      },
    })

    return NextResponse.json({ career })
  } catch (error) {
    console.error('Update career error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/careers/[id] - Delete career
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.career.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: '경력을 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.career.delete({ where: { id } })

    return NextResponse.json({ message: '경력이 삭제되었습니다' })
  } catch (error) {
    console.error('Delete career error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}