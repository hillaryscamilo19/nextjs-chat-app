"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestMessageLoadingPage() {
  const [conversationId, setConversationId] = useState("686e8f0b808a036d94b9ab2f")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testMessageLoading = async () => {

        return
      }

      // Test 1: Verificar ruta API
      const apiUrl = `/api/conversations/${conversationId}/messages`
      setResult((prev) => prev + `🔗 Probando: ${apiUrl}\n`)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      setResult((prev) => prev + `📊 Status: ${response.status} ${response.statusText}\n`)

      if (response.status === 404) {
        setResult((prev) => prev + `❌ RUTA NO ENCONTRADA\n`)
        setResult((prev) => prev + `💡 La ruta API no existe o no está configurada correctamente\n`)
      } else if (response.ok) {
        const messages = await response.json()
        setResult((prev) => prev + `✅ Mensajes cargados: ${messages.length}\n`)
        setResult((prev) => prev + `📋 Primeros mensajes:\n`)
    setIsLoading(true)
    setResult("🧪 Probando carga de mensajes...\n")

    try {
      const token = localStorage.getItem("authToken")

      if (!token) {
        setResult((prev) => prev + "❌ Token de autenticación no encontrado\n")
        setResult((prev) => prev + "💡 Inicia sesión primero\n")
        messages.slice(0, 3).forEach((msg, index) => {
          setResult(
            (prev) =>
              prev + `  ${index + 1}. ${msg.sender?.name || msg.senderName}: ${msg.content.substring(0, 50)}...\n`,
          )
        })
      } else {
        const errorData = await response.json()
        setResult((prev) => prev + `❌ Error: ${errorData.error}\n`)
      }

      // Test 2: Verificar backend directo
      setResult((prev) => prev + `\n🔗 Probando backend directo...\n`)

      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
      const directUrl = `${backendUrl}/api/messages/conversation/${conversationId}`

      const directResponse = await fetch(directUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      setResult((prev) => prev + `📊 Backend directo: ${directResponse.status} ${directResponse.statusText}\n`)

      if (directResponse.ok) {
        const directMessages = await directResponse.json()
        setResult((prev) => prev + `✅ Backend directo funciona: ${directMessages.length} mensajes\n`)
      } else {
        const directError = await directResponse.json()
        setResult((prev) => prev + `❌ Backend directo error: ${directError.error}\n`)
      }
    } catch (error) {
      setResult((prev) => prev + `❌ Error general: ${error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFromStorage = () => {
    const token = localStorage.getItem("authToken")
    const user = localStorage.getItem("authUser")

    setResult("📱 Datos del localStorage:\n")
    setResult((prev) => prev + `🔑 Token: ${token ? "✅ Presente" : "❌ Faltante"}\n`)

    if (user) {
      try {
        const userData = JSON.parse(user)
        setResult((prev) => prev + `👤 Usuario: ${userData.name} (${userData.email})\n`)
      } catch (error) {
        setResult((prev) => prev + `❌ Error parseando usuario\n`)
      }
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test de Carga de Mensajes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ID de Conversación</label>
              <Input
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="ID de conversación"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={loadFromStorage} variant="outline">
                📱 Cargar desde Storage
              </Button>
              <Button onClick={testMessageLoading} disabled={isLoading}>
                {isLoading ? "Probando..." : "🚀 Probar Carga"}
              </Button>
            </div>

            {result && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Resultado:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap font-mono max-h-96">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛠️ Solución de Problemas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>Si ves error 404:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>
                Verifica que existe: <code>app/api/conversations/[id]/messages/route.ts</code>
              </li>
              <li>
                Reinicia el servidor: <code>npm run dev</code>
              </li>
              <li>Verifica que el backend esté corriendo en puerto 3002</li>
            </ol>

            <p className="mt-4">
              <strong>Si ves error de autenticación:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Inicia sesión primero</li>
              <li>Verifica que el token esté en localStorage</li>
              <li>Verifica que el backend esté configurado correctamente</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
