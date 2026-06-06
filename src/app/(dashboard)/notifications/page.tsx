'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  read: boolean
  data: string | null
  createdAt: string
}

const notificationIcons: Record<string, string> = {
  profile_view: '👁️',
  job_offer: '💼',
  document_approved: '✅',
  document_rejected: '❌',
  message: '💬',
  career: '💼',
  system: '🔔',
}

const notificationColors: Record<string, string> = {
  profile_view: 'text-blue-600 bg-blue-50',
  job_offer: 'text-green-600 bg-green-50',
  document_approved: 'text-green-600 bg-green-50',
  document_rejected: 'text-red-600 bg-red-50',
  message: 'text-blue-600 bg-blue-50',
  career: 'text-purple-600 bg-purple-50',
  system: 'text-gray-600 bg-gray-50',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days === 1) return '어제'
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const getNotificationLink = (notification: Notification) => {
    try {
      const data = notification.data ? JSON.parse(notification.data) : {}
      
      switch (notification.type) {
        case 'message':
          return `/messages`
        case 'profile_view':
          return data.viewerId ? `/experts/${data.viewerId}` : '/experts'
        case 'document_approved':
        case 'document_rejected':
          return '/documents'
        case 'career':
          return '/career'
        default:
          return '/dashboard'
      }
    } catch {
      return '/dashboard'
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="notifications" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="notifications" />
      
      <div className="flex-1 overflow-auto p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold">알림</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림이 있습니다` : '모든 알림을 확인했습니다'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              모두 읽음으로 표시
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          <Badge label={`전체 ${notifications.length}`} variant="blue" />
          <Badge label={`읽지 않음 ${unreadCount}`} variant={unreadCount > 0 ? 'red' : 'gray'} />
        </div>

        {notifications.length > 0 ? (
          <Card className="overflow-hidden">
            {notifications.map((notification, index) => (
              <a
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`flex gap-4 p-4 hover:bg-gray-50 transition cursor-pointer ${
                  index < notifications.length - 1 ? 'border-b border-gray-100' : ''
                } ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${notificationColors[notification.type] || notificationColors.system}`}>
                  {notificationIcons[notification.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-sm">{notification.title}</div>
                    <div className="text-xs text-gray-400 shrink-0 ml-2">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.content}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </a>
            ))}
          </Card>
        ) : (
          <Card className="p-10 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-xl font-bold mb-2">알림이 없습니다</h2>
            <p className="text-gray-500">
              새로운 알림이 도착하면 여기에 표시됩니다.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}