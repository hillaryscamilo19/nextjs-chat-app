"use client"

import { useState } from "react"

export default function CorsTestPage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testCors = async () => {
    setIsLoading(true)
    setResult("🧪 Probando CORS...")

    try {
      // Test con diferentes URLs
      const tests = [
        { name: "Health Check", url: "http://localhost:3001/api/health" },
        { name: "Register Test", url: "http://localhost:3001/api/auth/register", method: "POST" },
      ]

      for (const test of tests) {
        try {
          const options = {
            method: test.method || "GET",
            headers: {
              "Content-Type": "application/json",
            },
            ...(test.method === "POST" && {
              body: JSON.stringify({
                name: "Test User",
                email: "test@example.com",
                password: "123456",
              }),
            }),
          }

          const response = await fetch(test.url, options)
          const data = await response.json()

          if (response.ok) {
            setResult((prev) => prev + `\n✅ ${test.name}: OK`)
          } else {
            setResult((prev) => prev + `\n⚠️ ${test.name}: ${data.error || "Error"}`)
          }
        } catch (error) {
          setResult((prev) => prev + `\n❌ ${test.name}: ${error}`)
        }
      }

      setResult((prev) => prev + `\n\n🌐 Tu origen: ${window.location.origin}`)
    } catch (error) {
      setResult((prev) => prev + `\n❌ Error general: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔗 Prueba de CORS</h1>
      <p>Esta página prueba la conectividad con el backend desde tu IP actual.</p>

      <button
        onClick={testCors}
        disabled={isLoading}
        style={{
          padding: "10px 20px",
          backgroundColor: isLoading ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          marginBottom: "20px",
        }}
      >
        {isLoading ? "Probando..." : "🚀 Probar CORS"}
      </button>

      {result && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
          }}
        >
          {result}
        </div>
      )}

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Información de debug:</strong>
        </p>
        <p>• Tu origen actual: {typeof window !== "undefined" ? window.location.origin : "N/A"}</p>
        <p>• Backend URL: http://localhost:3001/api</p>
        <p>• Si ves errores de CORS, verifica que el backend esté configurado correctamente.</p>
      </div>
    </div>
  )
}
