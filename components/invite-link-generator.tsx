"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Link, Check, RefreshCw, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { inviteAPI } from "@/lib/api"

interface InviteLinkGeneratorProps {
  currentUser: any
}

export function InviteLinkGenerator({ currentUser }: InviteLinkGeneratorProps) {
  const [inviteLink, setInviteLink] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generateInviteLink = async () => {
    setIsGenerating(true)

    try {
      const data = await inviteAPI.generate()
      const fullLink = `${window.location.origin}/invite/${data.token}`
      setInviteLink(fullLink)

      toast({
        title: "Enlace generado",
        description: "Tu enlace de invitación está listo para compartir",
      })
    } catch (error: any) {
      console.error("Error generando enlace:", error)
      toast({
        title: "Error",
        description: error.message || "Error generando enlace",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Función mejorada para copiar al portapapeles con fallbacks
  const copyToClipboard = async () => {
    try {
      // Método 1: Clipboard API moderna (requiere HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast({
          title: "¡Copiado!",
          description: "Enlace copiado al portapapeles",
        })
        setTimeout(() => setCopied(false), 2000)
        return
      }

      // Método 2: Fallback usando document.execCommand (funciona en HTTP)
      const textArea = document.createElement("textarea")
      textArea.value = inviteLink
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (successful) {
        setCopied(true)
        toast({
          title: "¡Copiado!",
          description: "Enlace copiado al portapapeles",
        })
        setTimeout(() => setCopied(false), 2000)
      } else {
        throw new Error("execCommand falló")
      }
    } catch (error) {
      console.error("Error copiando:", error)

      // Método 3: Fallback manual - seleccionar el texto para que el usuario lo copie
      const input = document.querySelector("input[readonly]") as HTMLInputElement
      if (input) {
        input.select()
        input.setSelectionRange(0, 99999) // Para móviles

        toast({
          title: "Selecciona y copia",
          description: "El texto está seleccionado. Usa Ctrl+C (o Cmd+C) para copiarlo",
        })
      } else {
        toast({
          title: "Error al copiar",
          description: "Copia manualmente el enlace desde el campo de texto",
          variant: "destructive",
        })
      }
    }
  }

  // Función para compartir usando Web Share API (móviles)
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Enlace de Chat",
          text: `${currentUser?.name || "Alguien"} te invita a chatear`,
          url: inviteLink,
        })

        toast({
          title: "Compartido",
          description: "Enlace compartido exitosamente",
        })
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error compartiendo:", error)
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Compartir Enlace de Chat
        </CardTitle>
        <p className="text-sm text-gray-600">Genera un enlace para que otros puedan chatear contigo directamente</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button onClick={generateInviteLink} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Link className="h-4 w-4 mr-2" />
              Generar Enlace de Invitación
            </>
          )}
        </Button>

        {inviteLink && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Tu enlace de invitación:</label>

            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => {
                  // Seleccionar todo el texto al hacer clic
                  const input = e.target as HTMLInputElement
                  input.select()
                }}
              />
              <Button onClick={copyToClipboard} variant="outline" size="sm" title="Copiar enlace">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>

              {/* Botón de compartir (solo en móviles con Web Share API) */}
              {navigator.share && (
                <Button onClick={shareLink} variant="outline" size="sm" title="Compartir enlace">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Instrucciones adicionales */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                💡 <strong>Tip:</strong> Haz clic en el campo de texto para seleccionarlo completamente
              </p>
              <p>⏰ El enlace expira en 24 horas y permite hasta 10 usuarios</p>
              <p>🔗 Comparte este enlace por WhatsApp, email o cualquier medio</p>
            </div>

            {/* Botones de acción rápida */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`¡Hola! ${currentUser?.name || "Alguien"} te invita a chatear. Únete aquí: ${inviteLink}`)}`
                  window.open(whatsappUrl, "_blank")
                }}
                className="flex-1"
              >
                📱 WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const emailSubject = encodeURIComponent("Invitación a Chat")
                  const emailBody = encodeURIComponent(
                    `¡Hola!\n\n${currentUser?.name || "Alguien"} te ha invitado a chatear.\n\nÚnete haciendo clic en este enlace:\n${inviteLink}\n\n¡Nos vemos en el chat!`,
                  )
                  window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, "_blank")
                }}
                className="flex-1"
              >
                📧 Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
