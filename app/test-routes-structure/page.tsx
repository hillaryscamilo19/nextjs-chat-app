"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRoutesStructurePage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testAllRoutes = async () => {
    setIsLoading(true)
    setResult("🧪 Probando todas las rutas API...\n")

    const routes = [
      { name: "Health Check", method: "GET", url: "/api/test-routes" },
      { name: "Invite Generate", method: "POST", url: "/api/invite/generate" },
      { name: "Invite Verify", method: "GET", url: "/api/invite/verify/test-token" },
      { name: "Invite Join", method: "POST", url: "/api/invite/join/test-token" },
      { name: "Messages Guest", method: "POST", url: "/api/messages/guest" },
      { name: "Messages Conversation Guest", method: "GET", url: "/api/messages/conversation/test-id/guest" },
      { name: "Conversations", method: "GET", url: "/api/conversations" },
      { name: "Conversation Messages", method: "GET", url: "/api/conversations/test-id/messages" },
    ]

    for (const route of routes) {
      try {
        setResult((prev) => prev + `\n🔍 ${route.name} (${route.method} ${route.url})\n`)

        const options: RequestInit = {
          method: route.method,
          headers: {
            "Content-Type": "application/json",
            ...(route.name.includes("Guest") && { Authorization: "Guest test-token" }),
          },
        }

        if (route.method === "POST") {
          options.body = JSON.stringify({ test: true, guestName: "Test User" })
        }

        const response = await fetch(route.url, options)

        setResult((prev) => prev + `   📊 Status: ${response.status} ${response.statusText}\n`)

        if (response.status === 404) {
          setResult((prev) => prev + `   ❌ RUTA NO ENCONTRADA\n`)
        } else if (response.status < 500) {
          setResult((prev) => prev + `   ✅ Ruta existe\n`)
        } else {
          setResult((prev) => prev + `   ⚠️ Error del servidor\n`)
        }
      } catch (error) {
        setResult((prev) => prev + `   ❌ Error: ${error}\n`)
      }
    }

    setResult((prev) => prev + `\n✅ Pruebas completadas`)
    setIsLoading(false)
  }

  useEffect(() => {
    testAllRoutes()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Verificación de Estructura de Rutas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAllRoutes} disabled={isLoading} className="w-full">
              {isLoading ? "Probando..." : "🚀 Probar Todas las Rutas"}
            </Button>

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
            <CardTitle>📁 Estructura Esperada</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
              {`app/api/
├── invite/
│   ├── generate/
│   │   └── route.ts
│   ├── verify/
│   │   └── [token]/
│   │       └── route.ts
│   └── join/
│       └── [token]/
│           └── route.ts
├── messages/
│   ├── guest/
│   │   └── route.ts
│   └── conversation/
│       └── [id]/
│           └── guest/
│               └── route.ts ← ESTA FALTA
├── conversations/
│   ├── route.ts
│   └── [id]/
│       └── messages/
│           └── route.ts
└── test-routes/
    └── route.ts`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛠️ Solución</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>Si ves errores 404, significa que faltan archivos de rutas. Para solucionarlo:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Verifica que todos los archivos route.ts estén en su lugar</li>
              <li>Reinicia el servidor de desarrollo (npm run dev)</li>
              <li>Verifica que no haya errores de sintaxis en los archivos</li>
              <li>Asegúrate de que cada route.ts exporte las funciones correctas</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
