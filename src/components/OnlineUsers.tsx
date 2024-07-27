// components/chat/OnlineUsers.tsx
"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/../types";

interface OnlineUsersProps {
  socket: Socket | null;
}

export function OnlineUsers({ socket }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    if (socket) {
      socket.emit("getOnlineUsers");
      socket.on("onlineUsers", (users: User[]) => {
        setOnlineUsers(users);
      });
    }
    return () => {
      if (socket) {
        socket.off("onlineUsers");
      }
    };
  }, [socket]);

  const startPrivateChat = (username: string) => {
    socket?.emit("startPrivateChat", username);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Online Users</h2>
      <div className="space-y-4">
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startPrivateChat(user.username)}
            >
              Chat
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
