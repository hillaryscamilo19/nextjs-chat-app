import { type NextRequest, NextResponse } from "next/server"

// GET /api/groups/[groupId] - Obtener información del grupo
export async function GET(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params
    console.log("📋 API Route: GET /api/groups/[groupId]", groupId)

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/groups/${groupId}`

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
    console.error("❌ Error obteniendo grupo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT /api/groups/[groupId] - Actualizar información del grupo
export async function PUT(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params
    console.log("✏️ API Route: PUT /api/groups/[groupId]", groupId)

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const body = await request.json()

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
    const fullBackendUrl = `${backendUrl}/api/groups/${groupId}`

    const response = await fetch(fullBackendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
    console.error("❌ Error actualizando grupo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
