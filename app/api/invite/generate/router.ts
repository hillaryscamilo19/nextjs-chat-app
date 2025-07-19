import { type NextRequest, NextResponse } from "next/server"

// POST /api/invite/generate - Generar enlace de invitación
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API Route: POST /api/invite/generate")

    // Obtener el token de autorización
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      console.log("❌ Token de autorización faltante")
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/invite/generate`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.log("✅ Datos generados:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error en generate invite:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}
