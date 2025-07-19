import { type NextRequest, NextResponse } from "next/server"

// POST /api/groups - Crear nuevo grupo
export async function POST(request: NextRequest) {
  try {
    console.log("👥 API Route: POST /api/groups")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      console.log("❌ Token de autorización faltante")
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const body = await request.json()
    console.log("📋 Datos del grupo:", body)

    // Hacer petición al backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/groups`

    console.log("🔗 Haciendo petición a:", fullBackendUrl)

    const response = await fetch(fullBackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    console.log("✅ Grupo creado:", data.name)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error creando grupo:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
  }
}

// GET /api/groups - Obtener grupos del usuario
export async function GET(request: NextRequest) {
  try {
    console.log("📋 API Route: GET /api/groups")

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    // Hacer petición al backend para obtener conversaciones de tipo grupo
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/conversations?type=group`

    const response = await fetch(fullBackendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: `Error del servidor: ${response.status}` }
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error obteniendo grupos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
