import { type NextRequest, NextResponse } from "next/server"

// GET /api/invite/verify/[token] - Verificar invitación
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    console.log("🔍 API Route: GET /api/invite/verify/[token]")
    console.log("📋 Params:", params)

    const { token } = params

    if (!token) {
      console.log("❌ Token faltante")
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3001"
    const fullBackendUrl = `${backendUrl}/api/invite/verify/${token}`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
    console.log("✅ Datos de verificación:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error verificando invitación:", error)
    return NextResponse.json({ error: "Error verificando invitación", details: error.message }, { status: 500 })
  }
}
