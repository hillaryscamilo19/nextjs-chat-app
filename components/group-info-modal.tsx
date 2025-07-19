"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Users,
  Settings,
  Crown,
  Shield,
  UserMinus,
  UserPlus,
  Edit3,
  Save,
  LogOut,
} from "lucide-react";
import { groupsAPI, usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  type: string;
  participants: User[];
  admins: User[];
  createdBy: User;
  settings: {
    onlyAdminsCanMessage: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanEditInfo: boolean;
  };
}

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  currentUser: User;
  onGroupUpdated: (group: Group) => void;
}

export function GroupInfoModal({
  isOpen,
  onClose,
  group,
  currentUser,
  onGroupUpdated,
}: GroupInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [editedDescription, setEditedDescription] = useState(
    group.description || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const { toast } = useToast();

  const isCreator = group.createdBy._id === currentUser._id;
  const isAdmin =
    (Array.isArray(group.admins) &&
      group.admins.some((admin) => admin._id === currentUser._id)) ||
    isCreator;

  const canEditInfo =
    isAdmin && (group.settings.onlyAdminsCanEditInfo ? isAdmin : true);
  const canAddMembers =
    isAdmin && (group.settings.onlyAdminsCanAddMembers ? isAdmin : true);

  useEffect(() => {
    setEditedName(group.name);
    setEditedDescription(group.description || "");
  }, [group]);

  const handleSaveInfo = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es requerido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await groupsAPI.update(group._id, {
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
      });

      onGroupUpdated(updatedGroup);
      setIsEditing(false);

      toast({
        title: "Información actualizada",
        description: "La información del grupo ha sido actualizada",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error actualizando la información",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (
      !window.confirm("¿Estás seguro de que quieres remover a este miembro?")
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await groupsAPI.removeMember(group._id, userId);

      // Actualizar el grupo localmente
      const updatedGroup = {
        ...group,
        participants: group.participants.filter((p) => p._id !== userId),
        admins: group.admins.filter((a) => a._id !== userId),
      };
      onGroupUpdated(updatedGroup);

      toast({
        title: "Miembro removido",
        description: "El miembro ha sido removido del grupo",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error removiendo miembro",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    setIsLoading(true);
    try {
      await groupsAPI.updateAdmin(group._id, userId, makeAdmin);

      // Actualizar el grupo localmente
      const updatedGroup = {
        ...group,
        admins: makeAdmin
          ? [...group.admins, group.participants.find((p) => p._id === userId)!]
          : group.admins.filter((a) => a._id !== userId),
      };
      onGroupUpdated(updatedGroup);

      toast({
        title: makeAdmin ? "Administrador agregado" : "Administrador removido",
        description: `El usuario ${
          makeAdmin ? "ahora es" : "ya no es"
        } administrador`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error cambiando permisos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("¿Estás seguro de que quieres salir del grupo?")) {
      return;
    }

    setIsLoading(true);
    try {
      await groupsAPI.leave(group._id);

      toast({
        title: "Has salido del grupo",
        description: "Ya no eres miembro de este grupo",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error saliendo del grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    setIsLoading(true);
    try {
      const users = await usersAPI.getAll();
      // Filtrar usuarios que ya están en el grupo
      const participantIds = group.participants.map((p) => p._id);
      setAvailableUsers(
        users.filter((user) => !participantIds.includes(user._id))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un usuario",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await groupsAPI.addMembers(
        group._id,
        selectedUsers.map((u) => u._id)
      );

      onGroupUpdated(updatedGroup);
      setShowAddMembers(false);
      setSelectedUsers([]);

      toast({
        title: "Miembros agregados",
        description: `${selectedUsers.length} miembro(s) agregado(s) al grupo`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error agregando miembros",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Información del Grupo</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Información básica */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-green-500 text-white text-xl">
                  {group.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Nombre del grupo"
                      maxLength={100}
                    />
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Descripción del grupo"
                      maxLength={500}
                      rows={2}
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{group.name}</h3>
                    {group.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Creado por {group.createdBy.name}
                    </p>
                  </div>
                )}
              </div>
              {canEditInfo && (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSaveInfo}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.participants.length} miembros</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>{group.admins?.length ?? 0} administradores</span>
              </div>
            </div>
          </div>

          {/* Miembros */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Miembros ({group.participants.length})
              </h4>
              {canAddMembers && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddMembers(true);
                    loadAvailableUsers();
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {group.participants.map((member) => {
                const isMemberAdmin =
                  group.admins?.some((admin) => admin._id === member._id) ??
                  false;

                const isMemberCreator = group.createdBy._id === member._id;
                const isCurrentUser = member._id === currentUser._id;

                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-500 text-white">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {member.name}
                          {isCurrentUser && " (Tú)"}
                        </p>
                        {isMemberCreator && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Creador
                          </Badge>
                        )}
                        {isMemberAdmin && !isMemberCreator && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>

                    {/* Acciones para admins */}
                    {isCreator && !isCurrentUser && !isMemberCreator && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleToggleAdmin(member._id, !isMemberAdmin)
                          }
                          title={isMemberAdmin ? "Quitar admin" : "Hacer admin"}
                        >
                          <Shield
                            className={`h-4 w-4 ${
                              isMemberAdmin
                                ? "text-orange-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member._id)}
                          title="Remover del grupo"
                          className="text-red-500 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Configuraciones */}
          <div className="p-4 border-t">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              Configuración del Grupo
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Solo admins pueden enviar mensajes</span>
                <Badge
                  variant={
                    group.settings?.onlyAdminsCanMessage
                      ? "default"
                      : "secondary"
                  }
                >
                  {group.settings?.onlyAdminsCanMessage
                    ? "Activado"
                    : "Desactivado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Solo admins pueden agregar miembros</span>
                <Badge
                  variant={
                    group.settings?.onlyAdminsCanAddMembers
                      ? "default"
                      : "secondary"
                  }
                >
                  {group.settings?.onlyAdminsCanAddMembers
                    ? "Activado"
                    : "Desactivado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Solo admins pueden editar información</span>
                <Badge
                  variant={
                    group.settings?.onlyAdminsCanEditInfo
                      ? "default"
                      : "secondary"
                  }
                >
                  {group.settings?.onlyAdminsCanEditInfo
                    ? "Activado"
                    : "Desactivado"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          <div>
            {!isCreator && (
              <Button
                variant="outline"
                onClick={handleLeaveGroup}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir del Grupo
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      {/* Modal para agregar miembros */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Agregar Miembros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMembers(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando usuarios</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay usuarios disponibles para agregar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUsers.some(
                      (u) => u._id === user._id
                    );
                    return (
                      <div
                        key={user._id}
                        className={`p-3 rounded-lg cursor-pointer border ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUsers((prev) =>
                              prev.filter((u) => u._id !== user._id)
                            );
                          } else {
                            setSelectedUsers((prev) => [...prev, user]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-500 text-white text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowAddMembers(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || isLoading}
              >
                Agregar ({selectedUsers.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
