import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id] - Get single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { career: true },
    })

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
    }

    // Check ownership
    if (project.career.userId !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { career: true },
    })

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
    }

    if (project.career.userId !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, role, startDate, endDate, countries, industries, businessTypes, achievements } = body

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: name || project.name,
        description: description || project.description,
        role: role || project.role,
        startDate: startDate ? new Date(startDate) : project.startDate,
        endDate: endDate ? new Date(endDate) : project.endDate,
        countries: countries ? JSON.stringify(countries) : project.countries,
        industries: industries ? JSON.stringify(industries) : project.industries,
        businessTypes: businessTypes ? JSON.stringify(businessTypes) : project.businessTypes,
        achievements: achievements !== undefined ? achievements : project.achievements,
      },
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { career: true },
    })

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
    }

    if (project.career.userId !== user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    await prisma.project.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: '프로젝트가 삭제되었습니다' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}