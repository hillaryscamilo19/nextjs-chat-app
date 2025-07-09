"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, X, UserPlus, Phone } from "lucide-react"
import { usersAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Contact {
  _id: string
  name: string
  email?: string
  phone?: string
  isOnline?: boolean
}

interface ContactsModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateConversation: (participantId: string) => void
}

export function ContactsModal({ isOpen, onClose, onCreateConversation }: ContactsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  const loadContacts = async () => {
    setIsLoading(true)
    try {
      const data = await usersAPI.getAll()
      setContacts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchContacts = async () => {
    if (!searchTerm.trim()) {
      loadContacts()
      return
    }

    setIsLoading(true)
    try {
      const data = await usersAPI.search(searchTerm)
      setContacts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error buscando contactos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChat = (contactId: string) => {
    onCreateConversation(contactId)
  }

  const handleAddByPhone = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de teléfono",
        variant: "destructive",
      })
      return
    }

    // Aquí podrías implementar la lógica para buscar por teléfono
    toast({
      title: "Función en desarrollo",
      description: "La búsqueda por teléfono estará disponible pronto",
    })
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo Chat</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Búsqueda */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchContacts()}
              className="pl-10"
            />
          </div>

          {/* Agregar por teléfono */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddByPhone} variant="outline">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de contactos */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Buscando contactos...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 mb-2">No se encontraron contactos</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? "Intenta con otro término de búsqueda" : "No hay usuarios registrados"}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleCreateChat(contact._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-500 text-white">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                      <p className="text-sm text-gray-500 truncate">{contact.email || contact.phone || "Usuario"}</p>
                    </div>

                    <Button variant="ghost" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">Los contactos se sincronizan automáticamente</p>
        </div>
      </div>
    </div>
  )
}
