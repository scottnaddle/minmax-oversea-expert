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

// GET /api/admin/stats - Get system statistics
export async function GET() {
  const check = await checkAdmin()
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status })
  }

  try {
    // User statistics
    const totalUsers = await prisma.user.count()
    const expertUsers = await prisma.user.count({ where: { userType: 'expert' } })
    const enterpriseUsers = await prisma.user.count({ where: { userType: 'enterprise' } })

    // Career & Project statistics
    const totalCareers = await prisma.career.count()
    const totalProjects = await prisma.project.count()

    // Document statistics
    const totalDocuments = await prisma.document.count()
    const pendingDocuments = await prisma.document.count({ where: { status: 'pending' } })
    const approvedDocuments = await prisma.document.count({ where: { status: 'approved' } })
    const rejectedDocuments = await prisma.document.count({ where: { status: 'rejected' } })

    // Education & Language
    const totalEducations = await prisma.education.count()
    const totalLanguages = await prisma.language.count()

    // Inquiry statistics
    const totalInquiries = await prisma.inquiry.count()
    const openInquiries = await prisma.inquiry.count({ where: { status: 'open' } })
    const answeredInquiries = await prisma.inquiry.count({ where: { status: 'answered' } })

    // Consultation statistics
    const totalConsultations = await prisma.consultation.count()
    const pendingConsultations = await prisma.consultation.count({ where: { status: 'pending' } })

    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
      },
    })

    // Recent documents
    const recentDocuments = await prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          experts: expertUsers,
          enterprises: enterpriseUsers,
        },
        careers: totalCareers,
        projects: totalProjects,
        documents: {
          total: totalDocuments,
          pending: pendingDocuments,
          approved: approvedDocuments,
          rejected: rejectedDocuments,
        },
        educations: totalEducations,
        languages: totalLanguages,
        inquiries: {
          total: totalInquiries,
          open: openInquiries,
          answered: answeredInquiries,
        },
        consultations: {
          total: totalConsultations,
          pending: pendingConsultations,
        },
      },
      recentUsers,
      recentDocuments,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}