"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Smile, Paperclip, Mic, MoreVertical, Phone, Video } from "lucide-react"
import type { Conversation, User, Message } from "@/app/page"
import { useSocket } from "@/hooks/use-socket"
import { useToast } from "@/hooks/use-toast"

interface ChatWindowProps {
  conversation: Conversation
  currentUser: User
  onSendMessage: (content: string) => void
}

export function ChatWindow({ conversation, currentUser, onSendMessage }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevConversationRef = useRef<string>("")
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const socket = useSocket()
  const otherUser = conversation.participants.find((p) => p.id !== currentUser.id)

  // Socket.IO para mensajes en tiempo real
  useEffect(() => {
    if (!socket) return

    // Unirse a la conversación
    socket.emit("joinConversation", conversation.id)

    // Escuchar nuevos mensajes
    const handleNewMessage = (data: { message: any; conversation: string }) => {
      if (data.conversation === conversation.id) {
        console.log("📨 Nuevo mensaje recibido via Socket:", data.message)

        const newMessage: Message = {
          id: data.message._id,
          senderId: data.message.sender?._id || data.message.senderId,
          receiverId: currentUser.id,
          content: data.message.content,
          timestamp: new Date(data.message.createdAt || data.message.timestamp),
          isRead: false,
          senderName: data.message.sender?.name || data.message.senderName,
          isGuest: data.message.sender?.isGuest || data.message.senderType === "guest",
        }

        setMessages((prev) => {
          // Evitar duplicados
          const exists = prev.some((msg) => msg.id === newMessage.id)
          if (exists) return prev
          return [...prev, newMessage]
        })

        // Marcar como leído automáticamente si no es del usuario actual
        if (data.message.sender?._id !== currentUser.id && data.message.senderId !== currentUser.id) {
          socket.emit("markAsRead", {
            conversationId: conversation.id,
            messageId: data.message._id,
          })
        }
      }
    }

    // Escuchar indicador de escritura
    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== currentUser.id) {
        setOtherUserTyping(data.isTyping)
      }
    }

    // Escuchar mensajes leídos
    const handleMessageRead = (data: { messageId: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId && msg.senderId === currentUser.id ? { ...msg, isRead: true } : msg,
        ),
      )
    }

    socket.on("newMessage", handleNewMessage)
    socket.on("userTyping", handleUserTyping)
    socket.on("messageRead", handleMessageRead)

    return () => {
      socket.off("newMessage", handleNewMessage)
      socket.off("userTyping", handleUserTyping)
      socket.off("messageRead", handleMessageRead)
      socket.emit("leaveConversation", conversation.id)
    }
  }, [socket, conversation.id, currentUser.id])

  // Cargar mensajes cuando cambia la conversación
  useEffect(() => {
    const loadMessages = async () => {
      if (prevConversationRef.current !== conversation.id) {
        setIsLoading(true)
        setMessages([]) // Limpiar mensajes anteriores

        try {
          console.log("📋 Cargando mensajes para conversación:", conversation.id)
          let messagesData: any[] = []

          if (currentUser.isGuest) {
            // Cargar mensajes como invitado
            const guestToken = localStorage.getItem("guestToken")
            if (!guestToken) {
              console.log("❌ Token de invitado no encontrado")
              setIsLoading(false)
              return
            }

            const response = await fetch(`/api/messages/conversation/${conversation.id}/guest`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Guest ${guestToken}`,
              },
            })

            if (response.ok) {
              messagesData = await response.json()
              console.log("✅ Mensajes de invitado cargados:", messagesData.length)
            } else {
              const errorData = await response.json()
              console.error("❌ Error cargando mensajes de invitado:", errorData)
              toast({
                title: "Error",
                description: "No se pudieron cargar los mensajes",
                variant: "destructive",
              })
            }
          } else {
            // Cargar mensajes como usuario registrado
            const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            })

            if (response.ok) {
              messagesData = await response.json()
              console.log("✅ Mensajes de usuario registrado cargados:", messagesData.length)
            } else {
              const errorData = await response.json()
              console.error("❌ Error cargando mensajes de usuario:", errorData)
              toast({
                title: "Error",
                description: "No se pudieron cargar los mensajes",
                variant: "destructive",
              })
            }
          }

          // Transformar mensajes para compatibilidad
          const transformedMessages: Message[] = messagesData.map((msg: any) => ({
            id: msg._id,
            senderId: msg.sender?._id || msg.senderId,
            receiverId: otherUser?.id || "unknown",
            content: msg.content,
            timestamp: new Date(msg.createdAt || msg.timestamp),
            isRead: msg.readBy?.some((r: any) => r.user === currentUser.id) || false,
            senderName: msg.sender?.name || msg.senderName,
            isGuest: msg.sender?.isGuest || msg.senderType === "guest",
          }))

          console.log("📋 Mensajes transformados:", transformedMessages.length)
          setMessages(transformedMessages)
          prevConversationRef.current = conversation.id

          // Marcar mensajes como leídos
          if (transformedMessages.length > 0) {
            const unreadMessages = transformedMessages.filter((msg) => !msg.isRead && msg.senderId !== currentUser.id)

            if (unreadMessages.length > 0 && socket) {
              unreadMessages.forEach((msg) => {
                socket.emit("markAsRead", {
                  conversationId: conversation.id,
                  messageId: msg.id,
                })
              })
            }
          }
        } catch (error) {
          console.error("❌ Error cargando mensajes:", error)
          toast({
            title: "Error",
            description: "Error de conexión al cargar mensajes",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadMessages()
  }, [conversation.id, currentUser.id, currentUser.isGuest, otherUser?.id, socket, toast])

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Manejar indicador de escritura
  const handleTyping = (value: string) => {
    setMessage(value)

    if (!socket) return

    if (value.trim() && !isTyping) {
      setIsTyping(true)
      socket.emit("typing", { conversationId: conversation.id, isTyping: true })
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Establecer nuevo timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit("typing", { conversationId: conversation.id, isTyping: false })
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (message.trim()) {
      const messageContent = message.trim()

      // Crear mensaje temporal para mostrar inmediatamente
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: otherUser?.id || "unknown",
        content: messageContent,
        timestamp: new Date(),
        isRead: false,
        senderName: currentUser.name,
        isGuest: currentUser.isGuest,
      }

      // Agregar mensaje inmediatamente a la lista
      setMessages((prev) => [...prev, tempMessage])

      // Limpiar input y detener indicador de escritura
      setMessage("")
      setIsTyping(false)
      if (socket) {
        socket.emit("typing", { conversationId: conversation.id, isTyping: false })
      }

      // Enviar mensaje al backend (esto guardará en BD)
      onSendMessage(messageContent)
    }
  }

  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    }
  }

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== currentUser.id) return null
    if (msg.id.startsWith("temp-")) return "⏳"
    if (msg.isRead) return "✓✓"
    return "✓"
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoy"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    } else {
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header del Chat */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-500 text-white">
              {(otherUser?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser?.name || "Usuario"}</h3>
            <p className="text-sm text-gray-500">
              {otherUserTyping ? "escribiendo..." : otherUser?.isOnline ? "en línea" : "desconectado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chat-pattern">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            <div className="bg-white rounded-lg p-6 shadow-sm max-w-sm mx-auto">
              <p className="text-lg font-medium mb-2">¡Hola! 👋</p>
              <p className="text-sm">No hay mensajes aún. ¡Sé el primero en escribir algo!</p>
            </div>
          </div>
        )}

        {Object.entries(messageGroups).map(([dateString, dayMessages]) => (
          <div key={dateString}>
            {/* Separador de fecha */}
            <div className="flex justify-center my-4">
              <div className="bg-white px-3 py-1 rounded-full shadow-sm text-xs text-gray-600">
                {formatDateHeader(dateString)}
              </div>
            </div>

            {/* Mensajes del día */}
            {dayMessages.map((msg, index) => {
              const isFromCurrentUser = msg.senderId === currentUser.id
              const senderName = isFromCurrentUser ? currentUser.name : msg.senderName || otherUser?.name || "Usuario"
              const showAvatar = !isFromCurrentUser && (index === 0 || dayMessages[index - 1].senderId !== msg.senderId)

              return (
                <div key={msg.id} className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex gap-2 max-w-xs lg:max-w-md ${isFromCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {showAvatar && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-400 text-white text-xs">
                          {senderName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Mensaje */}
                    <div
                      className={`rounded-lg px-3 py-2 shadow-sm ${
                        isFromCurrentUser
                          ? "bg-green-500 text-white rounded-br-sm"
                          : "bg-white text-gray-900 rounded-bl-sm"
                      } ${!showAvatar && !isFromCurrentUser ? "ml-10" : ""}`}
                    >
                      {/* Nombre del remitente para invitados */}
                      {!isFromCurrentUser && msg.isGuest && showAvatar && (
                        <p className="text-xs font-semibold mb-1 text-blue-600">{msg.senderName}</p>
                      )}

                      <p className="text-sm break-words leading-relaxed">{msg.content}</p>

                      {/* Hora y estado del mensaje */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-xs ${isFromCurrentUser ? "text-green-100" : "text-gray-500"}`}>
                          {formatMessageTime(msg.timestamp)}
                        </span>
                        {isFromCurrentUser && (
                          <span className={`text-xs ${msg.isRead ? "text-blue-200" : "text-green-200"}`}>
                            {getMessageStatus(msg)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Indicador de escritura */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-400 text-white text-xs">
                  {(otherUser?.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensaje */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" className="text-gray-500">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="pr-12 rounded-full border-gray-300 focus:border-green-500 focus:ring-green-500"
              disabled={isLoading}
            />
            {!message.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>

          {message.trim() ? (
            <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600 rounded-full p-2">
              <Send className="h-4 w-4" />
            </Button>
          ) : null}
        </form>
      </div>
    </div>
  )
}
