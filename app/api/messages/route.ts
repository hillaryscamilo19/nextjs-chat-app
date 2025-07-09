import { NextResponse } from "next/server"

// POST /api/messages - Enviar nuevo mensaje
export async function POST(request: Request) {
  try {
    const { conversationId, content, receiverId } = await request.json()

    // Validaciones básicas
    if (!conversationId || !content || !receiverId) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 })
    }

    // Aquí conectarías con tu backend de Node.js + Express
    // const response = await fetch('http://localhost:3001/api/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     conversationId,
    //     content: content.trim(),
    //     receiverId
    //   }),
    // })

    // Por ahora, simular respuesta exitosa
    const savedMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "1", // ID del usuario actual
      receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json(savedMessage, { status: 201 })
  } catch (error) {
    console.error("Error enviando mensaje:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
