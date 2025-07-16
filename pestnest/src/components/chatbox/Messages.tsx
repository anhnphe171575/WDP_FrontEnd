"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MessageCircle, MoreVertical, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { io, type Socket } from "socket.io-client"
import { jwtDecode } from "jwt-decode"
import { api } from "../../../utils/axios"

interface Message {
  _id?: string
  senderId: string
  content: string
  conversationId: string
  createdAt?: string
  isRead?: boolean
}

interface Conversation {
  _id: string
  customerId: string
  staffId: string
  lastMessageAt?: string
  status: string
}

interface ApiError {
  response?: {
    data?: {
      error?: string
    }
  }
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"
let socket: Socket | null = null

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<number | null>(null)

  // Lấy userId và role từ token
  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = "";
      let role: string | null = null;
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<{ id?: string; _id?: string, role?: number }>(token);
          console.log('decoded token:', decoded);
          id = decoded.id || decoded._id || "";
          if (id) {
            sessionStorage.setItem("userId", id);
          }
          if (decoded.role !== undefined) {
            role = decoded.role.toString();
            sessionStorage.setItem("role", role);
          }
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
      } else {
        // Nếu không có token thì lấy từ sessionStorage
        id = sessionStorage.getItem("userId") || "";
        role = sessionStorage.getItem("role");
      }
      console.log('userId:', id);
      console.log('role:', role);
      if (role) {
        setCurrentUserRole(Number(role));
        console.log('setCurrentUserRole:', Number(role));
      }
      if (!id) {
        setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        setIsLoading(false);
        return;
      }
      setCurrentUserId(id);
    }
  }, [])

  // Tạo hoặc lấy danh sách conversation khi có userId
  useEffect(() => {
    if (!currentUserId) return

    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        setError("")
        const response = await api.get(`/messages/conversation/${currentUserId}`)
        setConversations(response.data)
        
        // Chỉ set selectedConversation nếu có conversation, không tự động tạo mới
        setSelectedConversation(response.data.find((conv: Conversation) => conv.status === 'active') || null)
      } catch {
        setError("Không thể lấy danh sách cuộc trò chuyện.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [currentUserId])

  // Hàm tạo cuộc trò chuyện mới khi bấm nút "Tôi cần hỗ trợ"
  const handleRequestSupport = async () => {
    try {
      setIsLoading(true)
      const response = await api.post('/messages/conversation', {
        customerId: currentUserId
      })
      
      if (response.data.success) {
        // Thêm conversation mới vào danh sách
        setConversations([response.data.data, ...conversations])
        setSelectedConversation(response.data.data)
        setError("")
      } else {
        setError(response.data.error || "Không thể tạo cuộc trò chuyện mới.")
      }
    } catch (error) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', error)
      const apiError = error as ApiError
      setError(apiError.response?.data?.error || "Không thể tạo cuộc trò chuyện mới.")
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy lịch sử tin nhắn khi có selectedConversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${selectedConversation._id}`)
        setMessages(response.data || [])
      } catch {
        setError("Không thể tải lịch sử tin nhắn.")
      }
    }

    fetchMessages()
  }, [selectedConversation])

  // Kết nối Socket.IO
  useEffect(() => {
    if (!currentUserId || !selectedConversation) return

    const connectSocket = () => {
      setIsConnecting(true)
      if (socket) {
        socket.disconnect()
      }
      socket = io(SOCKET_URL, {
        auth: {
          token: sessionStorage.getItem("token"),
        },
        transports: ["websocket", "polling"],
      })
      socket.on("connect", () => {
        setIsConnecting(false)
        setError("")
        socket?.emit("join", currentUserId)
      })
      socket.on("connect_error", () => {
        setIsConnecting(false)
        setError("Không thể kết nối real-time. Đang thử kết nối lại...")
      })
      socket.on("disconnect", () => {
        setIsConnecting(true)
      })
      socket.on("newMessage", (data) => {
        if (data.conversationId === selectedConversation._id) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg._id === data.message._id)
            if (exists) return prev
            return [...prev, data.message]
          })
        }
      })
      socket.on("onlineUsers", (users: string[]) => {
        setOnlineUsers(users)
      })
      socket.on("userOnline", (userId: string) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])])
      })
      socket.on("userOffline", (userId: string) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId))
      })
      socket.on("userTyping", ({ userId, isTyping: typing }) => {
        if (userId !== currentUserId) {
          setIsTyping(typing)
          if (typing) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current)
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false)
            }, 3000)
          }
        }
      })
      socket.on("error", (error) => {
        setError(error.message || "Có lỗi xảy ra")
      })
    }
    connectSocket()
    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [currentUserId, selectedConversation])

  // Auto scroll xuống cuối vùng chatbox khi vào hội thoại hoặc messages thay đổi
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [selectedConversation, messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || !currentUserId || !socket) return
    try {
      const messageData = {
        conversationId: selectedConversation._id,
        content: inputMessage.trim(),
      }
      socket.emit("sendMessage", messageData)
      setInputMessage("")
      socket.emit("typing", {
        conversationId: selectedConversation._id,
        isTyping: false,
      })
    } catch {
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.")
    }
  }

  // Handle typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    if (socket && selectedConversation) {
      socket.emit("typing", {
        conversationId: selectedConversation._id,
        isTyping: e.target.value.length > 0,
      })
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("typing", {
          conversationId: selectedConversation._id,
          isTyping: false,
        })
      }, 1000)
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Retry connection
  const retryConnection = () => {
    setError("")
    window.location.reload()
  }

  // Hàm kết thúc cuộc trò chuyện
  const handleEndConversation = async () => {
    if (!selectedConversation) return;
    try {
      setIsLoading(true);
      await api.post('/messages/end-conversation', {
        conversationId: selectedConversation._id
      });
      // Sau khi kết thúc, có thể reload lại danh sách hội thoại hoặc thông báo
      setError('Đã kết thúc cuộc trò chuyện.');
      // Optionally: Xoá khỏi danh sách hoặc reload lại
      setSelectedConversation(null);
      const response = await api.get(`/messages/conversation/${currentUserId}`);
      setConversations(response.data);
    } catch {
      setError('Không thể kết thúc cuộc trò chuyện.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state - chỉ hiển thị cho customer
  if (isLoading && currentUserRole === 1) {
    return (
      <div className="container mx-auto max-w-2xl h-[90vh] mt-4 flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-lg font-medium mb-2">Đang xử lý...</p>
            <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state - chỉ hiển thị cho customer
  if (error && !selectedConversation && currentUserRole === 1) {
    return (
      <div className="container mx-auto max-w-2xl h-[90vh] mt-4 flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-8 w-8 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2 text-center">{error}</p>
            <Button onClick={retryConnection} className="mt-4">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isStaffOnline = selectedConversation && onlineUsers.includes(selectedConversation.staffId)
  const isCustomer = currentUserRole === 1;
  const isMarketing = currentUserRole === 4;

  // Kiểm tra xem customer có conversation active không
  const hasActiveConversation = conversations.some(conv => conv.status === 'active');

  return (
    <div className="w-full flex flex-col items-center justify-center bg-muted/5">
      {/* Nút "Tôi cần hỗ trợ" nằm ngoài Card, căn lề trái */}
      {isCustomer && !hasActiveConversation && (
        <div style={{ maxWidth: '950px', width: '100%' }} className="mb-4">
          <Button 
            onClick={handleRequestSupport} 
            disabled={isLoading}
            className="ml-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang kết nối...
              </>
            ) : (
              'Tôi cần hỗ trợ'
            )}
          </Button>
        </div>
      )}

      <Card className="w-full flex flex-col" style={{ maxWidth: '950px' }}>
        <div className="flex border-b">
          <div className="w-1/4 border-r bg-muted/10 overflow-y-auto">
            <div className="p-2 font-semibold">Danh sách hội thoại</div>
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`p-3 cursor-pointer hover:bg-muted/30 ${selectedConversation?._id === conv._id ? 'bg-muted/40 font-bold' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div>{isCustomer ? 'Chăm sóc khách hàng' : 'Khách hàng'}</div>
                  <div className="text-xs text-muted-foreground">Cập nhật: {conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "HH:mm dd/MM/yyyy", { locale: vi }) : ''}</div>
                </div>
              ))
            ) : (
              <div className="p-3 text-muted-foreground">
                {isMarketing ? 'Không có hội thoại nào' : 'Không có hội thoại nào'}
              </div>
            )}
          </div>
          <div className="w-3/4 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {/* <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback>MK</AvatarFallback>
                    </Avatar> */}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{isCustomer ? 'Chăm sóc khách hàng' : 'Khách hàng'}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {isStaffOnline ? "Đang hoạt động" : "Không hoạt động"}
                      </p>
                    </div>
                    {isMarketing && selectedConversation?.status !== 'closed' && (
                      <Button variant="destructive" size="sm" onClick={handleEndConversation} disabled={isLoading}>
                        Kết thúc cuộc trò chuyện
                      </Button>
                    )}
                  </div>
                  <div className="flex-1" />
                  <div className="flex flex-row-reverse items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {isConnecting && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <div
                    className="p-4 bg-muted/20 space-y-3"
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
                    ref={chatBoxRef}
                  >
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div
                          key={msg._id || index}
                          className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${msg.senderId === currentUserId ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-lg px-3 py-2 text-sm ${
                                msg.senderId === currentUserId
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background border"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.senderId === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm", { locale: vi }) : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>{isCustomer ? 'Bắt đầu cuộc trò chuyện với nhân viên marketing' : 'Chờ tin nhắn từ khách hàng'}</p>
                        </div>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[70%]">
                          <div className="bg-background border rounded-lg px-3 py-2 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t">
                    {selectedConversation?.status === 'closed' && (
                      <div className="mb-2 text-destructive text-sm font-medium">
                        Cuộc trò chuyện đã kết thúc, bạn không thể gửi tin nhắn mới.
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                        disabled={isConnecting || selectedConversation?.status === 'closed'}
                      />
                      <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isConnecting || selectedConversation?.status === 'closed'} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              isCustomer ? (
                <CardContent className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Bạn cần hỗ trợ từ nhân viên?</p>
                    <p className="text-sm mb-4">Nhấn nút bên dưới để kết nối với nhân viên hỗ trợ.</p>
                  </div>
                </CardContent>
              ) : isMarketing ? (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Chờ khách hàng kết nối</p>
                    <p className="text-sm">Khi có khách hàng mới, cuộc trò chuyện sẽ xuất hiện ở đây</p>
                  </div>
                </CardContent>
              ) : null
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
