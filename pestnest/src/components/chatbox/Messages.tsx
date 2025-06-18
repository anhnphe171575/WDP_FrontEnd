// pestnest/src/components/chatbox/Messages.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Message {
  _id?: string
  sender_id: string
  receiver_id: string
  content: string
  time: string
}

interface Chat {
  _id: string
  name: string
  avatar?: string
  lastSeen?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface User {
  _id: string
  name: string
  avatar?: string
  lastSeen?: string
}

// Mock data để test frontend
const mockChats: Chat[] = [
  {
    _id: '1',
    name: 'Nguyễn Văn A',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Xin chào! Bạn có thể giúp tôi không?',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 2
  },
  {
    _id: '2',
    name: 'Trần Thị B',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCount: 0
  },
  {
    _id: '3',
    name: 'Lê Văn C',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Sản phẩm rất tốt!',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 1
  },
  {
    _id: '4',
    name: 'Phạm Thị D',
    avatar: '/api/placeholder/40/40',
    lastMessage: 'Khi nào có hàng mới?',
    lastMessageTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unreadCount: 0
  }
]

const mockMessages: Message[] = [
  {
    _id: '1',
    sender_id: 'current',
    receiver_id: '1',
    content: 'Xin chào! Tôi có thể giúp gì cho bạn?',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    _id: '2',
    sender_id: '1',
    receiver_id: 'current',
    content: 'Xin chào! Bạn có thể giúp tôi không?',
    time: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  },
  {
    _id: '3',
    sender_id: 'current',
    receiver_id: '1',
    content: 'Tất nhiên rồi! Bạn cần hỗ trợ gì?',
    time: new Date(Date.now() - 7 * 60 * 1000).toISOString()
  },
  {
    _id: '4',
    sender_id: '1',
    receiver_id: 'current',
    content: 'Tôi muốn hỏi về sản phẩm mới',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
]

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [currentUserId] = useState<string>("current")
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [currentUser] = useState<User>({
    _id: 'current',
    name: 'Bạn',
    avatar: '/api/placeholder/40/40'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load messages khi chọn chat
  useEffect(() => {
    if (selectedChat) {
      // Simulate loading messages
      setTimeout(() => {
        setMessages(mockMessages)
      }, 500)
    } else {
      setMessages([])
    }
  }, [selectedChat])

  // Gửi tin nhắn
  const handleSendMessage = () => {
    if (inputMessage.trim() && selectedChat && currentUserId) {
      const newMessage: Message = {
        _id: Date.now().toString(),
        sender_id: currentUserId,
        receiver_id: selectedChat._id,
        content: inputMessage,
        time: new Date().toISOString()
      }

      // Thêm tin nhắn vào danh sách hiển thị ngay lập tức
      setMessages(prev => [...prev, newMessage])
      
      // Cập nhật last message cho chat hiện tại
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              lastMessage: inputMessage,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            }
          }
          return chat
        })
      })
      
      setInputMessage("")
    }
  }

  // Scroll xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="container mx-auto max-w-6xl h-[90vh] mt-4 flex gap-4">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedChat?._id === chat._id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage || "Chưa có tin nhắn"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {chat.lastMessageTime ? format(new Date(chat.lastMessageTime), 'HH:mm', { locale: vi }) : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedChat.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.lastSeen ? `Hoạt động ${format(new Date(selectedChat.lastSeen), 'HH:mm', { locale: vi })}` : 'Đang hoạt động'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages list */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-muted/20 space-y-3"
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                        {msg.sender_id !== currentUserId && (
                          <Avatar className="h-6 w-6 mb-1">
                            <AvatarImage src={selectedChat.avatar} />
                            <AvatarFallback className="text-xs">{selectedChat.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            msg.sender_id === currentUserId 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === currentUserId 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {format(new Date(msg.time), 'HH:mm', { locale: vi })}
                          </p>
                        </div>
                        {msg.sender_id === currentUserId && currentUser && (
                          <Avatar className="h-6 w-6 mt-1 ml-auto">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback className="text-xs">{currentUser.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Bắt đầu cuộc trò chuyện với {selectedChat.name}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>
              <p className="text-sm">Hiển thị tất cả lịch sử chat</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}