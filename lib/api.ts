// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Función helper para hacer requests autenticados
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken")

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error de conexión" }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// API Functions
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  logout: async () => {
    return apiRequest("/auth/logout", { method: "POST" })
  },
}

export const conversationsAPI = {
  getAll: async () => {
    return apiRequest("/conversations")
  },

  create: async (participantId: string) => {
    return apiRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    })
  },

  getById: async (id: string) => {
    return apiRequest(`/conversations/${id}`)
  },
}

export const messagesAPI = {
  getByConversation: async (conversationId: string, page = 1, limit = 50) => {
    return apiRequest(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`)
  },

  send: async (messageData: { conversationId: string; content: string; type?: string }) => {
    return apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    })
  },
}

export const usersAPI = {
  getProfile: async () => {
    return apiRequest("/users/me")
  },

  search: async (query: string) => {
    return apiRequest(`/users/search?q=${encodeURIComponent(query)}`)
  },

  getAll: async () => {
    return apiRequest("/users")
  },
}

export const inviteAPI = {
  generate: async () => {
    return apiRequest("/invite/generate", { method: "POST" })
  },

  verify: async (token: string) => {
    return apiRequest(`/invite/verify/${token}`)
  },

  join: async (token: string, guestName: string) => {
    return apiRequest(`/invite/join/${token}`, {
      method: "POST",
      body: JSON.stringify({ guestName }),
    })
  },
}
