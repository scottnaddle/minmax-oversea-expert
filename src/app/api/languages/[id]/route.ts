import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const language = await prisma.language.findUnique({
      where: { id },
    })

    if (!language || language.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ language })
  } catch (error) {
    console.error('Error fetching language:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { language, proficiency, certificate, score, expirationDate } = body

    const existing = await prisma.language.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.language.update({
      where: { id },
      data: {
        ...(language && { language }),
        ...(proficiency && { proficiency }),
        ...(certificate !== undefined && { certificate }),
        ...(score !== undefined && { score }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
      },
    })

    return NextResponse.json({ language: updated })
  } catch (error) {
    console.error('Error updating language:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.language.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.language.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting language:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}