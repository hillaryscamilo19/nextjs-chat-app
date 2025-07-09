"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"
import { InviteLinkGenerator } from "@/components/invite-link-generator"
import { ContactsModal } from "@/components/contacts-modal"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Link, LogOut, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSocket } from "@/hooks/use-socket"
import { conversationsAPI, messagesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export interface User {
  _id: string
  id: string
  name: string
  email?: string
  avatar?: string
  lastSeen?: Date
  isOnline?: boolean
  isGuest?: boolean
}

export interface Message {
  _id?: string
  id: string
  sender?: User
  senderId: string
  receiverId?: string
  content: string
  createdAt?: string
  timestamp: Date
  readBy?: Array<{ user: string; readAt: string }>
  isRead: boolean
  senderName?: string
  isGuest?: boolean
}

export interface Conversation {
  _id: string
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  lastActivity: string
  type?: string
}

export default function ChatApp() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const socket = useSocket()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showInviteGenerator, setShowInviteGenerator] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Cargar conversaciones al iniciar
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 Cargando conversaciones al iniciar sesión...")
      loadConversations()
    }
  }, [isAuthenticated, user])

  // Socket.IO para actualizaciones en tiempo real
  useEffect(() => {
    if (!socket) return

    // Escuchar nuevas conversaciones
    const handleNewConversation = (conversation: any) => {
      console.log("🆕 Nueva conversación recibida:", conversation)
      const transformedConv = {
        ...conversation,
        id: conversation._id,
        participants: conversation.participants.map((p: any) => ({
          ...p,
          id: p._id,
        })),
      }
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.id === transformedConv.id)
        if (exists) return prev
        return [transformedConv, ...prev]
      })
    }

    // Escuchar actualizaciones de conversaciones
    const handleConversationUpdate = (data: any) => {
      console.log("🔄 Conversación actualizada:", data)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.lastMessage,
                lastActivity: data.lastActivity,
                unreadCount: data.unreadCount || conv.unreadCount,
              }
            : conv,
        ),
      )
    }

    // Escuchar nuevos mensajes para actualizar conversaciones
    const handleNewMessage = (data: { message: any; conversation: string }) => {
      console.log("📨 Nuevo mensaje recibido para actualizar conversaciones:", data)

      // Actualizar la conversación con el último mensaje
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === data.conversation) {
            const isFromCurrentUser = data.message.sender?._id === user?._id || data.message.senderId === user?.id
            return {
              ...conv,
              lastMessage: {
                id: data.message._id,
                senderId: data.message.sender?._id || data.message.senderId,
                content: data.message.content,
                timestamp: new Date(data.message.createdAt),
                isRead: isFromCurrentUser,
                senderName: data.message.sender?.name || data.message.senderName,
                isGuest: data.message.sender?.isGuest || data.message.senderType === "guest",
              },
              lastActivity: data.message.createdAt,
              unreadCount: isFromCurrentUser ? conv.unreadCount : (conv.unreadCount || 0) + 1,
            }
          }
          return conv
        }),
      )
    }

    socket.on("newConversation", handleNewConversation)
    socket.on("conversationUpdate", handleConversationUpdate)
    socket.on("newMessage", handleNewMessage)

    return () => {
      socket.off("newConversation", handleNewConversation)
      socket.off("conversationUpdate", handleConversationUpdate)
      socket.off("newMessage", handleNewMessage)
    }
  }, [socket, user])

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      console.log("📋 Cargando conversaciones...")

      let data = []

      if (user?.isGuest) {
        // Para usuarios invitados, buscar conversaciones de invitación
        const guestToken = localStorage.getItem("guestToken")
        const response = await fetch("/api/conversations/guest", {
          headers: {
            Authorization: `Guest ${guestToken}`,
          },
        })
        if (response.ok) {
          data = await response.json()
        }
      } else {
        // Para usuarios registrados
        data = await conversationsAPI.getAll()
      }

      console.log("✅ Conversaciones cargadas:", data.length)

      // Transformar datos para compatibilidad
      const transformedConversations = data.map((conv: any) => ({
        ...conv,
        id: conv._id,
        participants: conv.participants.map((p: any) => ({
          ...p,
          id: p._id,
        })),
      }))

      setConversations(transformedConversations)
    } catch (error: any) {
      console.error("❌ Error cargando conversaciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return

    try {
      console.log("📤 Enviando mensaje:", content.substring(0, 50) + "...")

      let message

      if (user.isGuest) {
        const guestToken = localStorage.getItem("guestToken")

        const response = await fetch("/api/messages/guest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Guest ${guestToken}`,
          },
          body: JSON.stringify({
            conversationId: selectedConversation._id,
            content: content.trim(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error enviando mensaje")
        }

        message = await response.json()
      } else {
        message = await messagesAPI.send({
          conversationId: selectedConversation._id,
          content: content.trim(),
        })
      }

      console.log("✅ Mensaje enviado y guardado:", message._id)

      // Emitir mensaje via Socket.IO para tiempo real
      if (socket) {
        socket.emit("messageCreated", {
          conversationId: selectedConversation._id,
          message,
        })
      }

      // Actualizar la conversación local
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === selectedConversation._id
            ? {
                ...conv,
                lastMessage: {
                  _id: message._id,
                  id: message._id,
                  sender: user,
                  senderId: user._id,
                  content: content.trim(),
                  createdAt: new Date().toISOString(),
                  timestamp: new Date(),
                  readBy: [],
                  isRead: true,
                },
                lastActivity: new Date().toISOString(),
              }
            : conv,
        ),
      )

      console.log("✅ Mensaje enviado exitosamente y persistido")
    } catch (error: any) {
      console.error("❌ Error enviando mensaje:", error)
      toast({
        title: "Error",
        description: error.message || "Error enviando mensaje",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleCreateNewChat = () => {
    setShowContactsModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const compatibleUser: User = {
    ...user,
    id: user._id,
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden`}>
        <ChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          currentUser={compatibleUser}
          isLoading={isLoadingConversations}
          onCreateNewChat={handleCreateNewChat}
          onRefresh={loadConversations}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Users className="h-5 w-5" />
            </Button>
            {selectedConversation && (
              <div>
                <h2 className="font-semibold">
                  {selectedConversation.participants
                    .filter((p) => p._id !== user._id)
                    .map((p) => p.name)
                    .join(", ")}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.type === "invite" ? "Chat por invitación" : "Chat privado"}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!user.isGuest && (
              <>
                <Button variant="outline" size="sm" onClick={handleCreateNewChat}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Chat
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowInviteGenerator(!showInviteGenerator)}>
                  <Link className="h-4 w-4 mr-2" />
                  Compartir Enlace
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Chat Window */}
          <div className="flex-1">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUser={compatibleUser}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                  <p className="text-gray-500 mb-4">Elige un contacto para comenzar a chatear</p>
                  <div className="space-y-2">
                    {!user.isGuest && (
                      <>
                        <Button onClick={handleCreateNewChat} variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Iniciar Nuevo Chat
                        </Button>
                        <Button onClick={() => setShowInviteGenerator(true)} variant="outline">
                          <Link className="h-4 w-4 mr-2" />
                          Compartir Enlace de Chat
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invite Generator Sidebar */}
          {showInviteGenerator && !user.isGuest && (
            <div className="w-96 border-l bg-white p-4">
              <InviteLinkGenerator currentUser={compatibleUser} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showContactsModal && (
        <ContactsModal
          isOpen={showContactsModal}
          onClose={() => setShowContactsModal(false)}
          onCreateConversation={(participantId) => {
            // Crear nueva conversación
            conversationsAPI.create(participantId).then(() => {
              loadConversations()
              setShowContactsModal(false)
            })
          }}
        />
      )}
    </div>
  )
}
