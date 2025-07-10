"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Users, Search, Settings } from "lucide-react"
import { usersAPI, groupsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  name: string
  email?: string
  avatar?: string
  isOnline?: boolean
}

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated: (group: any) => void
  currentUser: User
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated, currentUser }: CreateGroupModalProps) {
  const [step, setStep] = useState(1) // 1: Info, 2: Miembros, 3: Configuración
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Configuraciones del grupo
  const [settings, setSettings] = useState({
    onlyAdminsCanMessage: false,
    onlyAdminsCanAddMembers: false,
    onlyAdminsCanEditInfo: true,
  })

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && step === 2) {
      loadUsers()
    }
  }, [isOpen, step])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const users = await usersAPI.getAll()
      // Filtrar el usuario actual
      setAvailableUsers(users.filter((user) => user._id !== currentUser._id))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      loadUsers()
      return
    }

    setIsLoading(true)
    try {
      const users = await usersAPI.search(query)
      setAvailableUsers(users.filter((user) => user._id !== currentUser._id))
    } catch (error) {
      toast({
        title: "Error",
        description: "Error buscando usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id)
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id)
      } else {
        return [...prev, user]
      }
    })
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es requerido",
        variant: "destructive",
      })
      return
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un miembro",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        participants: selectedUsers.map((user) => user._id),
        settings,
      }

      const newGroup = await groupsAPI.create(groupData)

      toast({
        title: "¡Grupo creado!",
        description: `El grupo "${groupName}" ha sido creado exitosamente`,
      })

      onGroupCreated(newGroup)
      handleClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error creando el grupo",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setGroupName("")
    setGroupDescription("")
    setSearchTerm("")
    setSelectedUsers([])
    setSettings({
      onlyAdminsCanMessage: false,
      onlyAdminsCanAddMembers: false,
      onlyAdminsCanEditInfo: true,
    })
    onClose()
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {step === 1 && "Información del Grupo"}
            {step === 2 && "Agregar Miembros"}
            {step === 3 && "Configuración"}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Indicador de pasos */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ${step > stepNumber ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Paso 1: Información del grupo */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del grupo *</label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej: Familia, Trabajo, Amigos..."
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{groupName.length}/100 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción (opcional)</label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe de qué trata este grupo..."
                  maxLength={500}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">{groupDescription.length}/500 caracteres</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Información</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Serás el administrador del grupo y podrás agregar miembros, cambiar configuraciones y gestionar el
                  grupo.
                </p>
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar miembros */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Buscar usuarios</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    placeholder="Buscar por nombre o email..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Usuarios seleccionados */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Miembros seleccionados ({selectedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg max-h-20 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                      >
                        <span>{user.name}</span>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="hover:bg-green-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de usuarios */}
              <div>
                <label className="block text-sm font-medium mb-2">Usuarios disponibles</label>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Cargando usuarios...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No se encontraron usuarios</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUsers.some((u) => u._id === user._id)
                      return (
                        <div
                          key={user._id}
                          className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? "bg-green-50" : ""
                          }`}
                          onClick={() => toggleUserSelection(user)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isSelected} readOnly />
                            <div className="relative">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-green-500 text-white text-xs">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {user.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Configuración */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Configuración del Grupo</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="onlyAdminsCanMessage"
                    checked={settings.onlyAdminsCanMessage}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, onlyAdminsCanMessage: !!checked }))}
                  />
                  <div className="flex-1">
                    <label htmlFor="onlyAdminsCanMessage" className="text-sm font-medium cursor-pointer">
                      Solo administradores pueden enviar mensajes
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Los miembros regulares no podrán enviar mensajes al grupo
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="onlyAdminsCanAddMembers"
                    checked={settings.onlyAdminsCanAddMembers}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, onlyAdminsCanAddMembers: !!checked }))
                    }
                  />
                  <div className="flex-1">
                    <label htmlFor="onlyAdminsCanAddMembers" className="text-sm font-medium cursor-pointer">
                      Solo administradores pueden agregar miembros
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Los miembros regulares no podrán invitar a nuevas personas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="onlyAdminsCanEditInfo"
                    checked={settings.onlyAdminsCanEditInfo}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, onlyAdminsCanEditInfo: !!checked }))
                    }
                  />
                  <div className="flex-1">
                    <label htmlFor="onlyAdminsCanEditInfo" className="text-sm font-medium cursor-pointer">
                      Solo administradores pueden editar información del grupo
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Controla quién puede cambiar el nombre, descripción y configuraciones
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-700">
                  💡 <strong>Tip:</strong> Puedes cambiar estas configuraciones más tarde desde la información del
                  grupo.
                </p>
              </div>

              {/* Resumen */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Resumen del grupo:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>
                    <strong>Nombre:</strong> {groupName}
                  </p>
                  {groupDescription && (
                    <p>
                      <strong>Descripción:</strong> {groupDescription}
                    </p>
                  )}
                  <p>
                    <strong>Miembros:</strong> {selectedUsers.length + 1} (incluyéndote)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={step === 1 ? handleClose : () => setStep(step - 1)}>
            {step === 1 ? "Cancelar" : "Anterior"}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !groupName.trim()}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleCreateGroup} disabled={isCreating || selectedUsers.length === 0}>
              {isCreating ? "Creando..." : "Crear Grupo"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
