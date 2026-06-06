import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

// GET /api/certificates/[id] - Get certificate request detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    const certificateRequest = await prisma.certificateRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, bio: true, currentCountry: true },
        },
        payment: true,
        document: true,
      },
    })

    if (!certificateRequest) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check access - owner or admin
    if (user && certificateRequest.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ certificateRequest })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/certificates/[id] - Update certificate (admin approve/issue)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const { status, action } = await request.json()

    const certificateRequest = await prisma.certificateRequest.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!certificateRequest) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let updatedRequest: any = certificateRequest

    // Handle different actions
    if (action === 'approve') {
      // Approve and issue certificate
      const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`
      
      // Create uploads directory if not exists
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates')
      await fs.mkdir(uploadsDir, { recursive: true })

      // Generate QR code
      const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify/${certificateId}`
      const qrCodeData = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })

      // Save QR code
      const qrCodePath = `/uploads/certificates/${certificateId}-qr.png`
      const qrCodeBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64')
      await fs.writeFile(path.join(process.cwd(), 'public', qrCodePath), qrCodeBuffer)

      // Update certificate request
      await prisma.certificateRequest.update({
        where: { id },
        data: { 
          status: 'issued',
          approvedBy: user.id,
          approvedAt: new Date(),
          issuedAt: new Date(),
        },
      })
      
      updatedRequest = await prisma.certificateRequest.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true } },
          payment: true,
          document: true,
        },
      })

      // Create certificate document
      await prisma.certificateDocument.create({
        data: {
          requestId: id,
          certificateId,
          qrCode: qrCodePath,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        },
      })

      // Notify user
      await prisma.notification.create({
        data: {
          userId: certificateRequest.userId,
          type: 'certificate_issued',
          title: '증명서 발급 완료',
          content: `신청하신 증명서가 발급되었습니다. 인증 ID: ${certificateId}`,
          data: JSON.stringify({ 
            certificateRequestId: id, 
            certificateId,
            verifyUrl,
          }),
        },
      })

    } else if (action === 'reject') {
      await prisma.certificateRequest.update({
        where: { id },
        data: { 
          status: 'rejected',
          approvedBy: user.id,
          approvedAt: new Date(),
        },
      })
      
      updatedRequest = await prisma.certificateRequest.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true } },
          payment: true,
          document: true,
        },
      })

      // Notify user
      await prisma.notification.create({
        data: {
          userId: certificateRequest.userId,
          type: 'certificate_rejected',
          title: '증명서 발급 거절',
          content: '신청하신 증명서 발급이 거절되었습니다. 문의 게시판을 이용해주시기 바랍니다.',
          data: JSON.stringify({ certificateRequestId: id }),
        },
      })

    } else if (status) {
      updatedRequest = await prisma.certificateRequest.update({
        where: { id },
        data: { status },
      })
    }

    return NextResponse.json({ certificateRequest: updatedRequest })
  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}