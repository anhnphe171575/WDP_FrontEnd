"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageCircle, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { api } from '../../../utils/axios'
import { io, Socket } from 'socket.io-client'

interface Message {
  _id?: string
  senderId: string
  content: string
  conversationId: string
  createdAt?: string
}

interface Conversation {
  _id: string
  customerId: string
  staffId: string
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
let socket: Socket

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lấy userId từ sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('userId') || ''
      setCurrentUserId(id)
    }
  }, [])

  // Khi có userId, tự động random ghép với 1 marketing (tạo/lấy conversation)
  useEffect(() => {
    if (!currentUserId) return
    const createOrGetConversation = async () => {
      try {
        const res = await api.post('/api/messages/conversation', { customerId: currentUserId })
        console.log('Conversation API response:', res.data)
        setConversation(res.data)
      } catch (err) {
        alert('Không thể tạo cuộc trò chuyện với nhân viên marketing!')
        console.error(err)
      }
    }
    createOrGetConversation()
  }, [currentUserId])

  // Khi đã có conversation, lấy lịch sử tin nhắn
  useEffect(() => {
    if (!conversation) {
      setMessages([])
      return
    }
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${conversation._id}`)
        setMessages(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMessages()
  }, [conversation])

  // Kết nối socket và join room khi đã có conversation
  useEffect(() => {
    if (!currentUserId || !conversation) return
    socket = io(SOCKET_URL, {
      auth: {
        token: sessionStorage.getItem('token')
      }
    })
    socket.emit('join', conversation._id)
    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message])
    })
    return () => {
      socket.disconnect()
    }
  }, [currentUserId, conversation])

  // Gửi tin nhắn mới qua socket
  const handleSendMessage = async () => {
    if (inputMessage.trim() && conversation && currentUserId) {
      try {
        socket.emit('sendMessage', {
          conversationId: conversation._id,
          senderId: currentUserId,
          content: inputMessage
        })
        setInputMessage("")
        // Tin nhắn sẽ được nhận lại qua socket
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="container mx-auto max-w-2xl h-[90vh] mt-4 flex flex-col">
      <Card className="flex-1 flex flex-col">
        {conversation ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback>
                    {conversation.staffId[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    Nhân viên Marketing
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Mã: {conversation.staffId}</p>
                </div>
                <div className="flex-1" />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <div
                className="flex-1 overflow-y-auto p-4 bg-muted/20 space-y-3"
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.senderId === currentUserId ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            msg.senderId === currentUserId 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-background border'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === currentUserId 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm', { locale: vi }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Bắt đầu cuộc trò chuyện với nhân viên marketing</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

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
              <p className="text-lg font-medium mb-2">Đang ghép nối với nhân viên marketing...</p>
              <p className="text-sm">Vui lòng chờ trong giây lát</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}