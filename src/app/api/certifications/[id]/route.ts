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

    const certification = await prisma.certification.findUnique({
      where: { id },
    })

    if (!certification || certification.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ certification })
  } catch (error) {
    console.error('Error fetching certification:', error)
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
    const { name, issuer, issuedDate, expirationDate, credentialId } = body

    const certification = await prisma.certification.findUnique({
      where: { id },
    })

    if (!certification || certification.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.certification.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(issuer && { issuer }),
        ...(issuedDate && { issuedDate: new Date(issuedDate) }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
        ...(credentialId !== undefined && { credentialId }),
      },
    })

    return NextResponse.json({ certification: updated })
  } catch (error) {
    console.error('Error updating certification:', error)
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

    const certification = await prisma.certification.findUnique({
      where: { id },
    })

    if (!certification || certification.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.certification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}