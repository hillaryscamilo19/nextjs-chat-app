// Configuración de la API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://10.0.0.15:3002/api";

console.log("🔗 API Base URL:", API_BASE_URL); // Debug log

// Función helper para hacer requests autenticados
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log("🌐 Making request to:", fullUrl); // Debug log

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Error de conexión" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// API Functions
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiRequest("/auth/logout", { method: "POST" });
  },
};

export const conversationsAPI = {
  getAll: async () => {
    return apiRequest("/conversations");
  },

  create: async (participantId: string) => {
    return apiRequest("/conversations", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    });
  },

  getById: async (id: string) => {
    return apiRequest(`/conversations/${id}`);
  },
};

export const messagesAPI = {
  getByConversation: async (conversationId: string, page = 1, limit = 50) => {
    return apiRequest(
      `/messages/conversation/${conversationId}?page=${page}&limit=${limit}`
    );
  },

  send: async (messageData: {
    conversationId: string;
    content: string;
    type?: string;
  }) => {
    return apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  },
};

export const usersAPI = {
  getProfile: async () => {
    return apiRequest("/users/me");
  },

  search: async (query: string) => {
    return apiRequest(`/users/search?q=${encodeURIComponent(query)}`);
  },

  getAll: async () => {
    return apiRequest("/users");
  },
};

export const inviteAPI = {
  generate: async () => {
    return apiRequest("/invite/generate", { method: "POST" });
  },

  verify: async (token: string) => {
    return apiRequest(`/invite/verify/${token}`);
  },

  join: async (token: string, guestName: string) => {
    return apiRequest(`/invite/join/${token}`, {
      method: "POST",
      body: JSON.stringify({ guestName }),
    });
  },
};

// ✅ Nueva API para grupos
export const groupsAPI = {
  create: async (groupData: {
    name: string;
    description?: string;
    participants: string[];
    settings?: {
      onlyAdminsCanMessage?: boolean;
      onlyAdminsCanAddMembers?: boolean;
      onlyAdminsCanEditInfo?: boolean;
    };
  }) => {
    return apiRequest("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  },

  getAll: async () => {
    return apiRequest("/groups");
  },

  getById: async (groupId: string) => {
    return apiRequest(`/groups/${groupId}`);
  },

  update: async (
    groupId: string,
    updateData: {
      name?: string;
      description?: string;
      settings?: {
        onlyAdminsCanMessage?: boolean;
        onlyAdminsCanAddMembers?: boolean;
        onlyAdminsCanEditInfo?: boolean;
      };
    }
  ) => {
    return apiRequest(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  },

  addMembers: async (groupId: string, userIds: string[]) => {
    return apiRequest(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    });
  },

  removeMember: async (groupId: string, userId: string) => {
    return apiRequest(`/groups/${groupId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  updateAdmin: async (groupId: string, userId: string, isAdmin: boolean) => {
    return apiRequest(`/groups/${groupId}/members/${userId}/admin`, {
      method: "PUT",
      body: JSON.stringify({ isAdmin }),
    });
  },

  leave: async (groupId: string) => {
    return apiRequest(`/groups/${groupId}/leave`, {
      method: "POST",
    });
  },
};

// ✅ Nueva API para settings
export const settingsAPI = {
  getSettings: async () => {
    return apiRequest("/settings");
  },

  updateSettings: async (settings: {
    notifications?: any;
    privacy?: any;
    appearance?: any;
    storage?: any;
  }) => {
    return apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  blockUser: async (userId: string) => {
    return apiRequest(`/settings/block/${userId}`, { method: "POST" });
  },

  unblockUser: async (userId: string) => {
    return apiRequest(`/settings/unblock/${userId}`, { method: "POST" });
  },

  muteConversation: async (conversationId: string) => {
    return apiRequest(`/settings/mute/${conversationId}`, { method: "POST" });
  },

  unmuteConversation: async (conversationId: string) => {
    return apiRequest(`/settings/unmute/${conversationId}`, { method: "POST" });
  },
};

// ✅ Nueva API para calls
export const callsAPI = {
  createCall: async (conversationId: string, type: "audio" | "video") => {
    return apiRequest("/calls", {
      method: "POST",
      body: JSON.stringify({ conversationId, type }),
    });
  },

  getCallsByConversation: async (conversationId: string) => {
    return apiRequest(`/calls/conversation/${conversationId}`);
  },

  joinCall: async (callId: string) => {
    return apiRequest(`/calls/${callId}/join`, { method: "POST" });
  },

  endCall: async (callId: string) => {
    return apiRequest(`/calls/${callId}/end`, { method: "POST" });
  },

  declineCall: async (callId: string) => {
    return apiRequest(`/calls/${callId}/decline`, { method: "POST" });
  },

  getCallHistory: async () => {
    return apiRequest("/calls/user/history");
  },
};

// ✅ Nueva API para pinned messages
export const pinnedMessagesAPI = {
  pinMessage: async (
    messageId: string,
    conversationId: string,
    title?: string
  ) => {
    return apiRequest("/pinned-messages", {
      method: "POST",
      body: JSON.stringify({ messageId, conversationId, title }),
    });
  },

  getPinnedMessages: async (conversationId: string) => {
    return apiRequest(`/pinned-messages/conversation/${conversationId}`);
  },

  unpinMessage: async (pinnedMessageId: string) => {
    return apiRequest(`/pinned-messages/${pinnedMessageId}`, {
      method: "DELETE",
    });
  },

  updateOrder: async (pinnedMessageId: string, order: number) => {
    return apiRequest(`/pinned-messages/${pinnedMessageId}/order`, {
      method: "PUT",
      body: JSON.stringify({ order }),
    });
  },
};
