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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = sessionStorage.getItem('userId') || ''
      setCurrentUserId(id)
    }
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) return
      try {
        const res = await api.get(`/api/messages/conversation/${currentUserId}`)
        setConversations(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchConversations()
  }, [currentUserId])

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        try {
          const res = await api.get(`/api/messages/${selectedConversation._id}`)
          setMessages(res.data)
        } catch (err) {
          console.error(err)
        }
      } else {
        setMessages([])
      }
    }
    fetchMessages()
  }, [selectedConversation])

  useEffect(() => {
    if (!currentUserId) return

    socket = io(SOCKET_URL, {
      auth: {
        token: sessionStorage.getItem('token')
      }
    })

    if (selectedConversation) {
      socket.emit('joinRoom', selectedConversation._id)
    }

    socket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.disconnect()
    }
  }, [currentUserId, selectedConversation])

  const handleSendMessage = async () => {
    if (inputMessage.trim() && selectedConversation && currentUserId) {
      try {
        socket.emit('sendMessage', {
          conversationId: selectedConversation._id,
          senderId: currentUserId,
          content: inputMessage
        })
        setInputMessage("")
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="container mx-auto max-w-6xl h-[90vh] mt-4 flex gap-4">
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?._id === conv._id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>{conv._id[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conv.customerId === currentUserId ? conv.staffId : conv.customerId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>
                      {selectedConversation._id[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.customerId === currentUserId
                        ? selectedConversation.staffId
                        : selectedConversation.customerId}
                    </CardTitle>
                  </div>
                </div>
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
                      <p>Bắt đầu cuộc trò chuyện</p>
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
              <p className="text-lg font-medium mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>
              <p className="text-sm">Hiển thị tất cả lịch sử chat</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}