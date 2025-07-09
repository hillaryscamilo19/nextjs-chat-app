"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugRoutesPage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testRoutes = async () => {
    setIsLoading(true)
    setResult("🧪 Probando rutas API...\n")

    const tests = [
      {
        name: "Test Routes Info",
        method: "GET",
        url: "/api/test-routes",
      },
      {
        name: "Invite Join (GET - should fail)",
        method: "GET",
        url: "/api/invite/join/test-token",
      },
      {
        name: "Invite Join (POST - should work)",
        method: "POST",
        url: "/api/invite/join/test-token",
        body: { guestName: "Test User" },
      },
      {
        name: "Invite Verify",
        method: "GET",
        url: "/api/invite/verify/test-token",
      },
    ]

    for (const test of tests) {
      try {
        setResult((prev) => prev + `\n🔍 ${test.name}...\n`)

        const options: RequestInit = {
          method: test.method,
          headers: {
            "Content-Type": "application/json",
          },
        }

        if (test.body) {
          options.body = JSON.stringify(test.body)
        }

        const response = await fetch(test.url, options)
        const data = await response.json()

        setResult((prev) => prev + `   Status: ${response.status} ${response.statusText}\n`)
        setResult((prev) => prev + `   Response: ${JSON.stringify(data, null, 2)}\n`)
      } catch (error) {
        setResult((prev) => prev + `   ❌ Error: ${error}\n`)
      }
    }

    setResult((prev) => prev + `\n✅ Pruebas completadas`)
    setIsLoading(false)
  }

  useEffect(() => {
    // Auto-ejecutar al cargar
    testRoutes()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug de Rutas API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testRoutes} disabled={isLoading} className="w-full">
              {isLoading ? "Probando..." : "🚀 Probar Rutas"}
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
            <CardTitle>📁 Estructura de Archivos Esperada</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
              {`app/
├── api/
│   ├── invite/
│   │   ├── generate/
│   │   │   └── route.ts
│   │   ├── verify/
│   │   │   └── [token]/
│   │   │       └── route.ts
│   │   └── join/
│   │       └── [token]/
│   │           └── route.ts
│   └── messages/
│       └── guest/
│           └── route.ts`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
