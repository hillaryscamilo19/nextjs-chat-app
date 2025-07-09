"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, AlertCircle, Loader2 } from "lucide-react"
import { ChatWindow } from "@/components/chat-window"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  name: string
  email?: string
  avatar?: string
  isOnline?: boolean
  isGuest?: boolean
}

interface Conversation {
  id: string
  participants: User[]
  type: string
  unreadCount: number
}

interface InviteInfo {
  hostUser: User
  isValid: boolean
  conversationId?: string
  expiresAt?: string
  usesRemaining?: number
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [guestName, setGuestName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const token = params.token as string

  // Verificar invitación al cargar
  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        setError("Token de invitación no válido")
        setIsLoading(false)
        return
      }

      try {
        console.log("🔍 Verificando invitación con token:", token)

        const response = await fetch(`/api/invite/verify/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("📊 Respuesta de verificación:", response.status, response.statusText)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("❌ Error response text:", errorText)

          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: `Error ${response.status}: ${response.statusText}` }
          }

          setError(errorData.error || "Error verificando invitación")
          return
        }

        const data = await response.json()
        console.log("✅ Datos de verificación:", data)

        setInviteInfo(data)
        setError("")
      } catch (err) {
        console.error("❌ Error verificando invitación:", err)
        setError("Error de conexión al verificar invitación")
      } finally {
        setIsLoading(false)
      }
    }

    verifyInvite()
  }, [token])

  // Unirse al chat como invitado
  const handleJoinChat = async () => {
    if (!guestName.trim() || !inviteInfo) return

    setIsJoining(true)
    setError("")

    try {
      console.log("🚀 Uniéndose al chat con nombre:", guestName.trim())

      const requestBody = {
        guestName: guestName.trim(),
      }

      console.log("📤 Enviando datos:", requestBody)

      const response = await fetch(`/api/invite/join/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📊 Respuesta de unirse:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ Error response text:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `Error ${response.status}: ${response.statusText}` }
        }

        setError(errorData.error || "Error uniéndose al chat")
        return
      }

      const data = await response.json()
      console.log("✅ Datos de unirse:", data)

      setCurrentUser(data.guestUser)
      setConversation(data.conversation)

      // Guardar datos del invitado en localStorage
      localStorage.setItem("guestUser", JSON.stringify(data.guestUser))
      localStorage.setItem("guestToken", data.guestToken)

      toast({
        title: "¡Bienvenido!",
        description: `Te has unido al chat como ${data.guestUser.name}`,
      })
    } catch (err) {
      console.error("❌ Error uniéndose al chat:", err)
      setError("Error de conexión")
    } finally {
      setIsJoining(false)
    }
  }

  // Enviar mensaje como invitado
  const handleSendMessage = async (content: string) => {
    if (!conversation || !currentUser) return

    try {
      const guestToken = localStorage.getItem("guestToken")

      if (!guestToken) {
        throw new Error("Token de invitado no encontrado")
      }

      console.log("📤 Enviando mensaje:", content)

      const response = await fetch("/api/messages/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Guest ${guestToken}`,
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error enviando mensaje" }))
        throw new Error(errorData.error || "Error enviando mensaje")
      }

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado",
      })
    } catch (error: any) {
      console.error("❌ Error enviando mensaje:", error)
      toast({
        title: "Error",
        description: error.message || "Error enviando mensaje",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando invitación...</p>
          <p className="text-xs text-gray-400 mt-2">Token: {token}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Invitación Inválida</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="text-xs text-gray-400 mb-4 p-2 bg-gray-100 rounded">
              <p>Token: {token}</p>
              <p>Timestamp: {new Date().toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                🔄 Intentar de Nuevo
              </Button>
              <Button onClick={() => router.push("/")} variant="default" className="w-full">
                🏠 Ir al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si ya está en el chat
  if (currentUser && conversation && inviteInfo) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header del chat de invitado */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {inviteInfo.hostUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">Chat con {inviteInfo.hostUser.name}</h2>
              <p className="text-sm text-gray-500">Conectado como {currentUser.name}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>💬 Chat por invitación</div>
            <div>👤 Usuario invitado</div>
          </div>
        </div>

        {/* Ventana de chat */}
        <ChatWindow conversation={conversation} currentUser={currentUser} onSendMessage={handleSendMessage} />
      </div>
    )
  }

  // Formulario para unirse al chat
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {inviteInfo?.hostUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{inviteInfo?.hostUser.name} te ha invitado a chatear</CardTitle>
          <p className="text-gray-600">Ingresa tu nombre para comenzar la conversación</p>

          {inviteInfo?.usesRemaining && (
            <p className="text-xs text-blue-600 mt-2">✨ {inviteInfo.usesRemaining} usos restantes</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre
            </label>
            <Input
              id="guestName"
              type="text"
              placeholder="Ingresa tu nombre"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={50}
              onKeyPress={(e) => {
                if (e.key === "Enter" && guestName.trim()) {
                  handleJoinChat()
                }
              }}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {error}
            </div>
          )}

          <Button onClick={handleJoinChat} disabled={!guestName.trim() || isJoining} className="w-full">
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uniéndose...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Unirse al Chat
              </>
            )}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={() => router.push("/login")}>
              ¿Tienes una cuenta? Inicia sesión
            </Button>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-400 text-center p-2 bg-gray-50 rounded">
            <p>Debug: Token {token}</p>
            <p>Backend: {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
