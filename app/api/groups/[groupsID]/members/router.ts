import { type NextRequest, NextResponse } from "next/server"

// POST /api/groups/[groupId]/members - Agregar miembros al grupo
export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params
    console.log("👥 API Route: POST /api/groups/[groupId]/members", groupId)

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }

    const body = await request.json()

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3001"
    const fullBackendUrl = `${backendUrl}/api/groups/${groupId}/members`

    const response = await fetch(fullBackendUrl, {
      method: "POST",
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
    console.error("❌ Error agregando miembros:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
