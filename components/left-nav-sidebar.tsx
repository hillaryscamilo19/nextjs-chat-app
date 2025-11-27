"use client";

import { MessageSquare, Phone, Settings, Star, Archive } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Usericon from "@/public/icono.png";
import Usericons from "@/public/iconoLetf.png";
import { Menu } from "lucide-react"; // Assuming this is the hamburger menu icon

interface LeftNavSidebarProps {
  currentUser: {
    name: string;
    avatar?: string;
  };
  unreadChatsCount?: number;
  unreadArchiveCount?: number;
}

export function LeftNavSidebar({
  currentUser,
  unreadChatsCount = 0,
  unreadArchiveCount = 0,
}: LeftNavSidebarProps) {
  return (
    <div className="flex flex-col items-center justify-between w-16 bg-zinc-950 text-gray-400 py-4 border-r border-zinc-800">
      {/* Top Section */}
      <div className="flex flex-col items-center gap-6">
        {/* WhatsApp Logo Placeholder */}
        <div className="text-green-500 text-3xl font-bold">
          <img src={Usericon.src} alt="User icon" />
        </div>

        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:bg-zinc-800 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Navigation Icons */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-green-500 hover:bg-zinc-800 hover:text-green-400"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
            {unreadChatsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                {unreadChatsCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800 hover:text-white"
          >
            <Phone className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800 hover:text-white"
          >
            <Settings className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-zinc-800 hover:text-white"
          >
            <Star className="h-6 w-6" />
          </Button>
          <div className="relative">
            {unreadArchiveCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                {unreadArchiveCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - User Avatar */}
      <Avatar className="w-10 h-10 border-2">
        <div className="text-green-500 text-3xl font-bold">
          <img src={Usericons.src} alt="User icon" />
        </div>
      </Avatar>
    </div>
  );
}
