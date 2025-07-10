"use client"

import { useState } from "react"

export default function SimpleTestPage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testBackend = async () => {
    setIsLoading(true)
    setResult("Probando conexión...")

    try {
      // Test 1: Health check
      const healthResponse = await fetch("http://10.0.0.15:3001/api/health")
      const healthData = await healthResponse.json()

      if (healthResponse.ok) {
        setResult((prev) => prev + "\n✅ Backend conectado: " + JSON.stringify(healthData))
      } else {
        setResult((prev) => prev + "\n❌ Backend no responde")
        return
      }

      // Test 2: Register
      const registerResponse = await fetch("http://10.0.0.15:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "123456",
        }),
      })

      const registerData = await registerResponse.json()

      if (registerResponse.ok) {
        setResult((prev) => prev + "\n✅ Usuario registrado: " + registerData.user.name)
      } else {
        setResult((prev) => prev + "\n⚠️ Registro: " + registerData.error)
      }

      // Test 3: Login
      const loginResponse = await fetch("http://10.0.0.15:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "123456",
        }),
      })

      const loginData = await loginResponse.json()

      if (loginResponse.ok) {
        setResult((prev) => prev + "\n✅ Login exitoso: " + loginData.user.name)
        setResult((prev) => prev + "\n🔑 Token: " + loginData.token.substring(0, 20) + "...")
      } else {
        setResult((prev) => prev + "\n❌ Login falló: " + loginData.error)
      }
    } catch (error) {
      setResult((prev) => prev + "\n❌ Error de conexión: " + String(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🧪 Prueba Simple de Backend</h1>

      <button
        onClick={testBackend}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Probando..." : "🚀 Probar Backend"}
      </button>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>Resultado:</strong>
          <br />
          {result}
        </div>
      )}
    </div>
  )
}
