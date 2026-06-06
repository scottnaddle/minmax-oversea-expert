import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all conversations (unique users the current user has messaged with)
    const sentMessages = await prisma.message.findMany({
      where: { senderId: user.id },
      select: { receiverId: true },
      distinct: ['receiverId'],
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: user.id },
      select: { senderId: true },
      distinct: ['senderId'],
    })

    // Get all unique user IDs
    const allUserIds = [...new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId),
    ])]

    // Get conversation details for each user
    const conversations = await Promise.all(
      allUserIds.map(async (otherUserId) => {
        // Get the other user's info
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            profileImage: true,
            currentCountry: true,
          },
        })

        if (!otherUser) return null

        // Get the last message and unread count
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: user.id },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })

        const unreadCount = await prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: user.id,
            read: false,
          },
        })

        return {
          user: otherUser,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isFromMe: lastMessage.senderId === user.id,
          } : null,
          unreadCount,
        }
      })
    )

    // Sort by last message time
    const validConversations = conversations
      .filter(c => c !== null)
      .sort((a, b) => {
        if (!a?.lastMessage) return 1
        if (!b?.lastMessage) return -1
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      })

    return NextResponse.json({ conversations: validConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, content } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        subject: '',
        content,
      },
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'message',
        title: '새 메시지',
        content: `${user.name}님이 메시지를 보냈습니다: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
        data: JSON.stringify({ messageId: message.id, senderId: user.id }),
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}