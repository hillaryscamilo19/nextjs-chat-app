"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import userIco from "@/public/icon.png";
import { Search, MoreVertical, UserPlus, PencilLine } from "lucide-react"; // Added PencilLine for new chat icon
import type { Conversation, User } from "@/app/page";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUser: User;
  isLoading?: boolean;
  onCreateNewChat?: () => void;
  onRefresh?: () => void;
}

export function ChatSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
  isLoading = false,
  onCreateNewChat,
  onRefresh,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some(
      (p) =>
        p.id !== currentUser.id &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours =
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return "ahora";
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffInHours < 48) return "ayer";
    return messageDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const truncateMessage = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-zinc-900 border-r border-zinc-800 h-full flex flex-col text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex gap-2">
            {/* New Chat / Pencil Icon */}
            {onCreateNewChat && !currentUser.isGuest && (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:bg-zinc-800 hover:text-white"
                onClick={onCreateNewChat}
              >
                <PencilLine className="h-8 w-8" />
              </Button>
            )}

            {/* More Options / Three Dots Icon */}
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:bg-zinc-800 hover:text-white"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar un chat o iniciar uno nuevo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 rounded-lg text-white placeholder:text-gray-400 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* List of Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-400">Cargando chats...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <div className="py-8">
              <p className="text-gray-400 mb-2">No hay conversaciones</p>
              <p className="text-sm text-gray-500 mb-4">
                {currentUser.isGuest
                  ? "Espera a que alguien te escriba"
                  : "¡Inicia una nueva conversación o comparte tu enlace!"}
              </p>
              {!currentUser.isGuest && onCreateNewChat && (
                <Button
                  onClick={onCreateNewChat}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Chat
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants.find(
              (p) => p.id !== currentUser.id
            );
            if (!otherUser) return null;
            const isSelected = selectedConversation?.id === conversation.id;
            return (
              <div
                key={conversation.id}
                className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors 
                ${
                  isSelected
                    ? "bg-zinc-800 border-l-4 border-l-green-500"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-10 h-10 ">
                      <img src={userIco.src} alt="User icon" />
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                    )}
                  </div>
                  {/* Chat Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-100 truncate">
                        {otherUser.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(
                            conversation.lastMessage.createdAt ||
                              conversation.lastMessage.timestamp
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate flex-1">
                        {conversation.lastMessage
                          ? truncateMessage(conversation.lastMessage.content)
                          : "No hay mensajes"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount > 99
                            ? "99+"
                            : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {/* Additional Indicators */}
                    <div className="flex items-center mt-1 gap-2">
                      {conversation.type === "invite" && (
                        <span className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded-full">
                          Invitación
                        </span>
                      )}
                      {otherUser.isGuest && (
                        <span className="text-xs text-orange-400 bg-orange-900 px-2 py-1 rounded-full">
                          Invitado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with User Info */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3">
          <img src={userIco.src} alt="User icon" className="w-10 h-10" />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-100 truncate">
              {currentUser.name}
            </p>
            <p className="text-sm text-gray-400">
              {currentUser.isGuest ? "Usuario invitado" : "En línea.."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
