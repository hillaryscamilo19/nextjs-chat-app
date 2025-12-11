"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Video, Mic, MicOff } from "lucide-react";
import { callsAPI } from "@/lib/api";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, User } from "@/app/page";

interface CallSystemProps {
  conversation: Conversation;
  currentUser: User;
  onCallActive?: (isActive: boolean) => void;
}

export function CallSystem({
  conversation,
  currentUser,
  onCallActive,
}: CallSystemProps) {
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: any) => {
      if (
        data.conversation === conversation.id &&
        data.initiator._id !== currentUser.id
      ) {
        setActiveCall(data);
        setIsRinging(true);
        toast({
          title: "Llamada entrante",
          description: `${data.initiator.name} te está llamando`,
        });
      }
    };

    const handleCallEnded = (data: any) => {
      if (data.conversation === conversation.id) {
        setActiveCall(null);
        setIsRinging(false);
        setCallDuration(0);
        onCallActive?.(false);
      }
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, conversation.id, currentUser.id, toast, onCallActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && activeCall.status === "ongoing") {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const startCall = async (type: "audio" | "video") => {
    try {
      const call = await callsAPI.createCall(conversation._id, type);
      setActiveCall(call);
      onCallActive?.(true);

      if (socket) {
        socket.emit("initiateCall", {
          conversation: conversation.id,
          call,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error iniciando llamada",
        variant: "destructive",
      });
    }
  };

  const acceptCall = async () => {
    try {
      const updatedCall = await callsAPI.joinCall(activeCall._id);
      setActiveCall(updatedCall);
      setIsRinging(false);
      onCallActive?.(true);

      if (socket) {
        socket.emit("acceptCall", {
          conversation: conversation.id,
          call: updatedCall,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const declineCall = async () => {
    try {
      await callsAPI.declineCall(activeCall._id);
      setActiveCall(null);
      setIsRinging(false);

      if (socket) {
        socket.emit("declineCall", {
          conversation: conversation.id,
        });
      }
    } catch (error) {
      console.error("Error declining call:", error);
    }
  };

  const endCall = async () => {
    try {
      await callsAPI.endCall(activeCall._id);
      setActiveCall(null);
      setCallDuration(0);
      onCallActive?.(false);

      if (socket) {
        socket.emit("endCall", {
          conversation: conversation.id,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCallDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const otherUser = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );

  if (isRinging && activeCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full mx-4">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarFallback className="bg-blue-500 text-white text-3xl">
              {(otherUser?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-semibold mb-2">{otherUser?.name}</h3>
          <p className="text-gray-500 mb-6">
            {activeCall.type === "video"
              ? "Videollamada entrante"
              : "Llamada entrante"}
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={declineCall}
              size="lg"
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={acceptCall}
              size="lg"
              className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (activeCall?.status === "ongoing") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full mx-4">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarFallback className="bg-blue-500 text-white text-3xl">
              {(otherUser?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-semibold mb-2">{otherUser?.name}</h3>
          <p className="text-2xl font-mono font-semibold text-blue-500 mb-6">
            {formatCallDuration(callDuration)}
          </p>

          <div className="flex gap-3 justify-center mb-4">
            <Button
              onClick={() => setIsMicOn(!isMicOn)}
              size="lg"
              variant={isMicOn ? "default" : "destructive"}
              className="rounded-full w-14 h-14"
            >
              {isMicOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            {activeCall.type === "video" && (
              <Button
                onClick={() => setIsVideoOn(!isVideoOn)}
                size="lg"
                variant={isVideoOn ? "default" : "secondary"}
                className="rounded-full w-14 h-14"
              >
                <Video className="h-5 w-5" />
              </Button>
            )}
          </div>

          <Button
            onClick={endCall}
            size="lg"
            className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            Terminar llamada
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => startCall("audio")}
        size="sm"
        className="bg-green-500 hover:bg-green-600 rounded-full"
        title="Llamada de audio"
      >
        <Phone className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => startCall("video")}
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 rounded-full"
        title="Videollamada"
      >
        <Video className="h-4 w-4" />
      </Button>
    </div>
  );
}
