import { type NextRequest, NextResponse } from "next/server"

// GET /api/conversations/guest - Obtener conversaciones para usuarios invitados
export async function GET(request: NextRequest) {
  try {
    console.log("📋 API Route: GET /api/conversations/guest")

    // Obtener el token de invitado
    const authHeader = request.headers.get("authorization")
    const guestToken = authHeader?.split(" ")[1]

    if (!guestToken || !authHeader?.startsWith("Guest ")) {
      console.log("❌ Token de invitado faltante")
      return NextResponse.json({ error: "Token de invitado requerido" }, { status: 401 })
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001"
    const fullBackendUrl = `${backendUrl}/api/conversations/guest`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Guest ${guestToken}`,
      },
    })

    console.log("📊 Respuesta del backend:", response.status, response.statusText)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `Error del servidor: ${response.status}` }
      }
      console.log("❌ Error del backend:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log("✅ Conversaciones de invitado obtenidas:", data.length)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error obteniendo conversaciones de invitado:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
