'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface Message {
  id: string
  content: string
  createdAt: string
  read: boolean
  senderId: string
  receiverId: string
  sender: { id: string; name: string; profileImage: string | null }
  receiver: { id: string; name: string; profileImage: string | null }
}

interface Conversation {
  user: {
    id: string
    name: string
    profileImage: string | null
    currentCountry: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    isFromMe: boolean
  } | null
  unreadCount: number
}

interface CurrentUser {
  id: string
  name: string
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadCurrentUser()
    loadConversations()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser)
    }
  }, [selectedUser])

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
    setLoading(false)
  }

  const loadConversation = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setOtherUser(data.otherUser)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser,
          content: newMessage,
        }),
      })

      if (res.ok) {
        setNewMessage('')
        loadConversation(selectedUser)
        loadConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setSending(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '어제'
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name: string) => name.slice(0, 2)

  if (loading) {
    return (
      <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
        <Sidebar activeItem="messages" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-52px)] bg-[#f2f4f7] flex">
      <Sidebar activeItem="messages" />
      
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div className={`${selectedUser ? 'hidden md:block' : ''} w-full md:w-[350px] border-r border-gray-300 bg-white flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold">메시지</h1>
          </div>

          <div className="flex-1 overflow-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.user.id}
                  onClick={() => setSelectedUser(conv.user.id)}
                  className={`flex gap-3 p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedUser === conv.user.id ? 'bg-blue-50' : ''
                  } ${conv.unreadCount > 0 ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(conv.user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm">{conv.user.name}</div>
                      {conv.lastMessage && (
                        <div className="text-xs text-gray-400">
                          {formatTime(conv.lastMessage.createdAt)}
                        </div>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {conv.lastMessage.isFromMe && <span className="text-gray-400">나: </span>}
                        {conv.lastMessage.content}
                      </div>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-3">💬</div>
                <p>받은 메시지가 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : ''}`}>
          {selectedUser && otherUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  ←
                </button>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {getInitials(otherUser.name)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{otherUser.name}</div>
                  {otherUser.currentCountry && (
                    <div className="text-xs text-gray-500">📍 {otherUser.currentCountry}</div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    메시지가 없습니다. 대화를 시작해보세요!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = currentUser?.id === msg.senderId
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2 shrink-0">
                            {msg.sender.name.slice(0, 2)}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            isMe
                              ? 'bg-blue-500 text-white rounded-br-md'
                              : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">{msg.content}</div>
                          <div className={`text-xs mt-1.5 flex items-center gap-1 ${isMe ? 'text-blue-100 justify-end' : 'text-gray-400'}`}>
                            {!isMe && <span>{msg.sender.name}</span>}
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMe && (
                              <span className="ml-1">
                                {msg.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e as any)
                      }
                    }}
                    placeholder="메시지를 입력하세요..."
                    rows={1}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={!newMessage.trim() || sending}
                    className="h-11 w-11 !p-0 flex items-center justify-center rounded-full"
                  >
                    {sending ? '...' : '➤'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p>대화를 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}