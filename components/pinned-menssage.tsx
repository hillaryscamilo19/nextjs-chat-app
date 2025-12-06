"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Pin, Trash2 } from "lucide-react"
import { pinnedMessagesAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Conversation, User } from "@/app/page"

interface PinnedMessage {
  _id: string
  message: {
    _id: string
    content: string
    sender?: { name: string; avatar?: string }
    createdAt: string
  }
  pinnedBy?: { name: string }
  title?: string
  order: number
}

interface PinnedMessagesProps {
  conversation: Conversation
  currentUser: User
}

export function PinnedMessages({ conversation, currentUser }: PinnedMessagesProps) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadPinnedMessages()
    }
  }, [isOpen, conversation.id])

  const loadPinnedMessages = async () => {
    setIsLoading(true)
    try {
      const messages = await pinnedMessagesAPI.getPinnedMessages(conversation._id)
      setPinnedMessages(messages)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes fijados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const unpinMessage = async (pinnedMessageId: string) => {
    try {
      await pinnedMessagesAPI.unpinMessage(pinnedMessageId)
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== pinnedMessageId))
      toast({
        title: "Mensaje desfijado",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="relative">
        <Pin className="h-4 w-4 mr-2" />
        Destacados
        {pinnedMessages.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {pinnedMessages.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mensajes Destacados</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando...</p>
                </div>
              ) : pinnedMessages.length === 0 ? (
                <div className="p-4 text-center">
                  <Pin className="h-8 w-8 text-gray-400 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-500">No hay mensajes destacados</p>
                  <p className="text-sm text-gray-400 mt-1">Fija mensajes importantes para acceder rápidamente</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {pinnedMessages.map((pinnedMsg) => (
                    <div key={pinnedMsg._id} className="p-3 border rounded-lg hover:bg-gray-50">
                      {pinnedMsg.title && <p className="text-xs font-semibold text-blue-600 mb-1">{pinnedMsg.title}</p>}

                      <p className="text-sm text-gray-900 mb-2 break-words">{pinnedMsg.message.content}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{pinnedMsg.message.sender?.name || pinnedMsg.pinnedBy?.name}</span>

                        {(pinnedMsg.pinnedBy?.name === currentUser.name ||
                          conversation.createdBy?.name === currentUser.name ||
                          conversation.admins?.some((a: any) => a.name === currentUser.name)) && (
                          <Button
                            onClick={() => unpinMessage(pinnedMsg._id)}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
