"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBackendPage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("123456")
  const [name, setName] = useState("Test User")

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://10.0.0.15:3002/api/health")
      const data = await response.json()
      setResult(`✅ Backend conectado: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testRegister = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://10.0.0.15:3002/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Usuario registrado: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Error en registro: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://10.0.0.15:3002/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Login exitoso: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Error en login: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error de conexión: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Pruebas de Backend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={testConnection} disabled={isLoading}>
                🔗 Probar Conexión
              </Button>
              <Button onClick={testRegister} disabled={isLoading}>
                👤 Registrar Usuario
              </Button>
              <Button onClick={testLogin} disabled={isLoading}>
                🔑 Hacer Login
              </Button>
            </div>

            {result && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Resultado:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
