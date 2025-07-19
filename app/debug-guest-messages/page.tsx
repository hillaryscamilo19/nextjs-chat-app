"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugGuestMessagesPage() {
  const [conversationId, setConversationId] = useState("");
  const [guestToken, setGuestToken] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testGuestMessages = async () => {
    setIsLoading(true);
    setResult("🧪 Probando mensajes de invitado...\n");

    try {
      if (!conversationId.trim()) {
        setResult((prev) => prev + "❌ Ingresa un ID de conversación\n");
        return;
      }

      if (!guestToken.trim()) {
        setResult((prev) => prev + "❌ Ingresa un token de invitado\n");
        return;
      }

      // Test 1: Obtener mensajes
      setResult(
        (prev) =>
          prev + `\n📖 Obteniendo mensajes de conversación: ${conversationId}\n`
      );

      const messagesResponse = await fetch(
        `/api/messages/conversation/${conversationId}/guest`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Guest ${guestToken}`,
          },
        }
      );

      setResult(
        (prev) =>
          prev +
          `📊 Status: ${messagesResponse.status} ${messagesResponse.statusText}\n`
      );

      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        setResult(
          (prev) => prev + `✅ Mensajes obtenidos: ${messages.length}\n`
        );
        setResult(
          (prev) => prev + `📋 Datos: ${JSON.stringify(messages, null, 2)}\n`
        );
      } else {
        const errorData = await messagesResponse.json();
        setResult((prev) => prev + `❌ Error: ${errorData.error}\n`);
      }

      // Test 2: Enviar mensaje
      setResult((prev) => prev + `\n📤 Enviando mensaje de prueba...\n`);

      const sendResponse = await fetch("/api/messages/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Guest ${guestToken}`,
        },
        body: JSON.stringify({
          conversationId,
          content: `Mensaje de prueba - ${new Date().toLocaleTimeString()}`,
        }),
      });

      setResult(
        (prev) =>
          prev +
          `📊 Status: ${sendResponse.status} ${sendResponse.statusText}\n`
      );

      if (sendResponse.ok) {
        const sentMessage = await sendResponse.json();
        setResult((prev) => prev + `✅ Mensaje enviado: ${sentMessage._id}\n`);
      } else {
        const errorData = await sendResponse.json();
        setResult((prev) => prev + `❌ Error enviando: ${errorData.error}\n`);
      }
    } catch (error) {
      setResult((prev) => prev + `\n❌ Error general: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedGuestToken = localStorage.getItem("guestToken");
    const savedGuestUser = localStorage.getItem("guestUser");

    if (savedGuestToken) {
      setGuestToken(savedGuestToken);
      setResult("✅ Token de invitado cargado desde localStorage\n");
    }


    if (savedGuestUser) {
      try {
        const guestUser = JSON.parse(savedGuestUser);
        setResult((prev) => prev + `👤 Usuario invitado: ${guestUser.name}\n`);
      } catch (error) {
        setResult((prev) => prev + `❌ Error parseando usuario invitado\n`);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Debug de Mensajes de Invitado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ID de Conversación
                </label>
                <Input
                  value={conversationId}
                  onChange={(e) => setConversationId(e.target.value)}
                  placeholder="67a1b2c3d4e5f6789abcdef0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token de Invitado
                </label>
                <Input
                  value={guestToken}
                  onChange={(e) => setGuestToken(e.target.value)}
                  placeholder="Token del localStorage"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={loadFromLocalStorage} variant="outline">
                📱 Cargar desde localStorage
              </Button>
              <Button onClick={testGuestMessages} disabled={isLoading}>
                {isLoading ? "Probando..." : "🚀 Probar Mensajes"}
              </Button>
            </div>

            {result && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Resultado:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap font-mono max-h-96">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Únete a un chat como invitado desde un enlace de invitación
              </li>
              <li>
                Haz clic en "Cargar desde localStorage" para obtener tus datos
              </li>
              <li>
                Ingresa el ID de la conversación (puedes verlo en la URL o en
                los logs)
              </li>
              <li>
                Haz clic en "Probar Mensajes" para verificar la funcionalidad
              </li>
            </ol>
            <p className="mt-4">
              <strong>Rutas que se prueban:</strong>
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>GET /api/messages/conversation/[id]/guest</li>
              <li>POST /api/messages/guest</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
