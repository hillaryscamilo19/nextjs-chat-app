"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestInvitePage() {
  const [token, setToken] = useState("")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testInviteFlow = async () => {
    setIsLoading(true)
    setResult("🧪 Probando flujo de invitaciones...\n")

    try {
      // Test 1: Verificar token
      if (token.trim()) {
        setResult((prev) => prev + `\n🔍 Verificando token: ${token}\n`)

        const verifyResponse = await fetch(`/api/invite/verify/${token}`)
        const verifyData = await verifyResponse.json()

        if (verifyResponse.ok) {
          setResult((prev) => prev + `✅ Token válido\n`)
          setResult((prev) => prev + `👤 Host: ${verifyData.hostUser.name}\n`)
          setResult((prev) => prev + `⏰ Expira: ${new Date(verifyData.expiresAt).toLocaleString()}\n`)
          setResult((prev) => prev + `🔢 Usos restantes: ${verifyData.usesRemaining}\n`)
        } else {
          setResult((prev) => prev + `❌ Token inválido: ${verifyData.error}\n`)
        }
      } else {
        setResult((prev) => prev + `⚠️ Ingresa un token para probar\n`)
      }

      // Test 2: Probar backend directo
      setResult((prev) => prev + `\n🔗 Probando backend directo...\n`)

      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002/api"
      const healthResponse = await fetch(`${backendUrl}/api/health`)

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setResult((prev) => prev + `✅ Backend conectado\n`)
        setResult((prev) => prev + `📊 Uptime: ${Math.floor(healthData.uptime)}s\n`)
      } else {
        setResult((prev) => prev + `❌ Backend no responde\n`)
      }
    } catch (error) {
      setResult((prev) => prev + `\n❌ Error: ${error}\n`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Prueba de Invitaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Token de Invitación</label>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Pega aquí el token de la URL de invitación"
              />
              <p className="text-xs text-gray-500 mt-1">Ejemplo: si la URL es /invite/abc123, el token es "abc123"</p>
            </div>

            <Button onClick={testInviteFlow} disabled={isLoading} className="w-full">
              {isLoading ? "Probando..." : "��� Probar Invitación"}
            </Button>

            {result && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Resultado:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Información de Debug</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <strong>Frontend:</strong> {typeof window !== "undefined" ? window.location.origin : "N/A"}
            </p>
            <p>
              <strong>Backend API:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://10.0.0.15:3002/api"}
            </p>
            <p>
              <strong>Rutas de invitación:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>/api/invite/verify/[token] - Verificar invitación</li>
              <li>/api/invite/join/[token] - Unirse al chat</li>
              <li>/api/messages/guest - Enviar mensajes como invitado</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
