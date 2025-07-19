import { type NextRequest, NextResponse } from "next/server"

// POST /api/invite/join/[token] - Unirse al chat como invitado
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    console.log("🚀 API Route: POST /api/invite/join/[token]")
    console.log("📋 Params:", params)

    const { token } = params

    if (!token) {
      console.log("❌ Token faltante")
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    let body
    try {
      body = await request.json()
      console.log("📋 Body recibido:", body)
    } catch (error) {
      console.log("❌ Error parseando JSON:", error)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }

    if (!body.guestName || body.guestName.trim().length < 2) {
      console.log("❌ Nombre inválido:", body.guestName)
      return NextResponse.json({ error: "Nombre debe tener al menos 2 caracteres" }, { status: 400 })
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/invite/join/${token}`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    console.log("✅ Datos del backend:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error en API route:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

// Método GET para debugging
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  console.log("🔍 GET request to join route - this should be POST")
  return NextResponse.json({
    message: "Esta ruta requiere método POST",
    token: params.token,
    timestamp: new Date().toISOString(),
    method: "GET",
    expectedMethod: "POST",
  })
}
