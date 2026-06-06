import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id: viewedId } = await params

    if (!user) {
      // Allow anonymous views but don't track
      return NextResponse.json({ success: true, tracked: false })
    }

    // Don't track if viewing own profile
    if (user.id === viewedId) {
      return NextResponse.json({ success: true, tracked: false })
    }

    // Verify the viewed user exists
    const viewedUser = await prisma.user.findUnique({
      where: { id: viewedId },
      select: { id: true, name: true },
    })

    if (!viewedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Record the view
    await prisma.profileView.create({
      data: {
        viewerId: user.id,
        viewedId,
      },
    })

    // Create notification for the viewed user
    // Only notify once per day per viewer (avoid spam)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingView = await prisma.profileView.findFirst({
      where: {
        viewerId: user.id,
        viewedId,
        createdAt: { gte: today },
      },
    })

    if (!existingView) {
      await prisma.notification.create({
        data: {
          userId: viewedId,
          type: 'profile_view',
          title: '프로필 조회',
          content: `${user.name}님이 프로필을 조회했습니다.`,
          data: JSON.stringify({
            viewerId: user.id,
            viewerName: user.name,
          }),
        },
      })
    }

    return NextResponse.json({ success: true, tracked: true })
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}