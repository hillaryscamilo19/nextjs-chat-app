"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Bell, Lock, Palette, HardDrive, LogOut } from "lucide-react"
import { settingsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
}

export function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
    },
    privacy: {
      lastSeenVisible: true,
      onlineStatusVisible: true,
      readReceiptsEnabled: true,
      allowCalls: "everyone",
    },
    appearance: {
      theme: "auto",
      fontSize: "medium",
    },
    storage: {
      autoDownloadMedia: false,
      mediaRetentionDays: 30,
    },
  })

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const data = await settingsAPI.getSettings()
      setSettings(data)
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await settingsAPI.updateSettings(settings)
      toast({
        title: "Configuración guardada",
        description: "Tus preferencias han sido actualizadas",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error guardando configuración",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Configuración</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Cargando configuración...</p>
            </div>
          ) : (
            <Tabs defaultValue="notifications" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificaciones
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Privacidad
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Apariencia
                </TabsTrigger>
                <TabsTrigger value="storage" className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Almacenamiento
                </TabsTrigger>
              </TabsList>

              {/* Notificaciones */}
              <TabsContent value="notifications" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="notificationsEnabled"
                      checked={settings.notifications.enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, enabled: !!checked },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="notificationsEnabled" className="text-sm font-medium cursor-pointer">
                        Habilitar notificaciones
                      </label>
                      <p className="text-xs text-gray-500">Recibe alertas de nuevos mensajes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="soundEnabled"
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, sound: !!checked },
                        }))
                      }
                      disabled={!settings.notifications.enabled}
                    />
                    <div className="flex-1">
                      <label htmlFor="soundEnabled" className="text-sm font-medium cursor-pointer">
                        Sonido de notificación
                      </label>
                      <p className="text-xs text-gray-500">Reproduce sonido al recibir mensajes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="vibrationEnabled"
                      checked={settings.notifications.vibration}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, vibration: !!checked },
                        }))
                      }
                      disabled={!settings.notifications.enabled}
                    />
                    <div className="flex-1">
                      <label htmlFor="vibrationEnabled" className="text-sm font-medium cursor-pointer">
                        Vibración
                      </label>
                      <p className="text-xs text-gray-500">Vibra cuando recibes mensajes (móvil)</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Privacidad */}
              <TabsContent value="privacy" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="lastSeenVisible"
                      checked={settings.privacy.lastSeenVisible}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, lastSeenVisible: !!checked },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="lastSeenVisible" className="text-sm font-medium cursor-pointer">
                        Mostrar "Último visto"
                      </label>
                      <p className="text-xs text-gray-500">Otros pueden ver cuándo fue tu última conexión</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="onlineStatusVisible"
                      checked={settings.privacy.onlineStatusVisible}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, onlineStatusVisible: !!checked },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="onlineStatusVisible" className="text-sm font-medium cursor-pointer">
                        Mostrar estado "En línea"
                      </label>
                      <p className="text-xs text-gray-500">Otros verán si estás conectado ahora</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="readReceiptsEnabled"
                      checked={settings.privacy.readReceiptsEnabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          privacy: { ...prev.privacy, readReceiptsEnabled: !!checked },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="readReceiptsEnabled" className="text-sm font-medium cursor-pointer">
                        Confirmación de lectura
                      </label>
                      <p className="text-xs text-gray-500">Otros verán cuando lees sus mensajes</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium block mb-2">Permitir llamadas de</label>
                    <div className="space-y-2">
                      {["everyone", "contacts", "nobody"].map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={option}
                            name="allowCalls"
                            value={option}
                            checked={settings.privacy.allowCalls === option}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                privacy: { ...prev.privacy, allowCalls: e.target.value },
                              }))
                            }
                            className="h-4 w-4"
                          />
                          <label htmlFor={option} className="ml-2 text-sm cursor-pointer">
                            {option === "everyone" && "Todos"}
                            {option === "contacts" && "Solo contactos"}
                            {option === "nobody" && "Nadie"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Apariencia */}
              <TabsContent value="appearance" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Tema</label>
                    <div className="space-y-2">
                      {["light", "dark", "auto"].map((theme) => (
                        <div key={theme} className="flex items-center">
                          <input
                            type="radio"
                            id={`theme-${theme}`}
                            name="theme"
                            value={theme}
                            checked={settings.appearance.theme === theme}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, theme: e.target.value },
                              }))
                            }
                            className="h-4 w-4"
                          />
                          <label htmlFor={`theme-${theme}`} className="ml-2 text-sm cursor-pointer">
                            {theme === "light" && "Claro"}
                            {theme === "dark" && "Oscuro"}
                            {theme === "auto" && "Automático"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Tamaño de texto</label>
                    <div className="space-y-2">
                      {["small", "medium", "large"].map((size) => (
                        <div key={size} className="flex items-center">
                          <input
                            type="radio"
                            id={`fontSize-${size}`}
                            name="fontSize"
                            value={size}
                            checked={settings.appearance.fontSize === size}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, fontSize: e.target.value },
                              }))
                            }
                            className="h-4 w-4"
                          />
                          <label htmlFor={`fontSize-${size}`} className="ml-2 text-sm cursor-pointer">
                            {size === "small" && "Pequeño"}
                            {size === "medium" && "Medio"}
                            {size === "large" && "Grande"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Almacenamiento */}
              <TabsContent value="storage" className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="autoDownloadMedia"
                      checked={settings.storage.autoDownloadMedia}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, autoDownloadMedia: !!checked },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="autoDownloadMedia" className="text-sm font-medium cursor-pointer">
                        Descargar media automáticamente
                      </label>
                      <p className="text-xs text-gray-500">Descargas automáticas solo en WiFi</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Retención de media (días)</label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.storage.mediaRetentionDays}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          storage: { ...prev.storage, mediaRetentionDays: Number.parseInt(e.target.value) },
                        }))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Elimina automáticamente media más antigua que este período
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between gap-2">
          <Button variant="outline" onClick={onLogout} className="text-red-600 bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
