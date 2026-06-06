import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/verify/[certificateId] - Public certificate verification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    // Find certificate document
    const document = await prisma.certificateDocument.findUnique({
      where: { certificateId },
      include: {
        request: {
          include: {
            user: {
              select: {
                name: true,
                bio: true,
                currentCountry: true,
                nationality: true,
              },
            },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ 
        valid: false,
        error: 'Certificate not found' 
      }, { status: 404 })
    }

    // Check if expired
    const isExpired = document.expiresAt && new Date() > document.expiresAt

    // Certificate type labels
    const typeLabels: Record<string, string> = {
      career: '경력 증명서',
      oda_experience: 'ODA 경력 증명서',
      project: '프로젝트 증명서',
      education: '학력 증명서',
    }

    return NextResponse.json({
      valid: !isExpired && document.isVerified,
      expired: isExpired,
      certificate: {
        id: document.certificateId,
        type: typeLabels[document.request.type] || document.request.type,
        title: document.request.title,
        content: document.request.content,
        issuedAt: document.issuedAt,
        expiresAt: document.expiresAt,
        holder: {
          name: document.request.user.name,
          bio: document.request.user.bio,
          country: document.request.user.currentCountry,
          nationality: document.request.user.nationality,
        },
      },
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json({ 
      valid: false,
      error: 'Verification failed' 
    }, { status: 500 })
  }
}