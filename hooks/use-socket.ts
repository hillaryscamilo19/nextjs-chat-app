"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./use-auth"

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Crear conexión Socket.IO
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://10.0.0.15:3002"
  

    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    newSocket.on("connect", () => {
     

      // Autenticar usuario
      if (user.isGuest) {
        const guestToken = localStorage.getItem("guestToken")
    
        newSocket.emit("authenticateGuest", guestToken)
      } else {
       
        newSocket.emit("authenticate", token)
      }
    })

    newSocket.on("authenticated", (data) => {
      if (data.success) {
        
      } else {
        console.error("❌ Error autenticando en Socket.IO:", data.error)
      }
    })

    newSocket.on("disconnect", (reason) => {

    })

    newSocket.on("connect_error", (error) => {
      console.error("❌ Error de conexión Socket.IO:", error)
    })

    setSocket(newSocket)

    return () => {
      console.log("🔌 Cerrando conexión Socket.IO")
      newSocket.close()
    }
  }, [isAuthenticated, user, token])

  return socket
}
