import { type NextRequest, NextResponse } from "next/server"

// POST /api/messages/guest - Enviar mensaje como invitado
export async function POST(request: NextRequest) {
  try {
    console.log("📤 API Route: POST /api/messages/guest")

    const authHeader = request.headers.get("authorization")
    const guestToken = authHeader?.split(" ")[1]

    if (!guestToken || !authHeader?.startsWith("Guest ")) {
      console.log("❌ Token de invitado faltante")
      return NextResponse.json({ error: "Token de invitado requerido" }, { status: 401 })
    }

    const body = await request.json()
    console.log("📋 Body recibido:", body)

    if (!body.conversationId || !body.content?.trim()) {
      console.log("❌ Datos faltantes")
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/messages/guest`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Guest ${guestToken}`,
      },
      body: JSON.stringify(body),
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
    console.log("✅ Mensaje enviado:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error enviando mensaje de invitado:", error)
    return NextResponse.json({ error: "Error enviando mensaje", details: error.message }, { status: 500 })
  }
}


