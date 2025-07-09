import { NextResponse } from "next/server"

export async function GET() {
  const routes = [
    "/api/invite/generate",
    "/api/invite/verify/[token]",
    "/api/invite/join/[token]",
    "/api/messages/guest",
  ]

  return NextResponse.json({
    message: "Rutas API disponibles",
    routes,
    timestamp: new Date().toISOString(),
    backend: process.env.NEXT_PUBLIC_API_URL,
  })
}
