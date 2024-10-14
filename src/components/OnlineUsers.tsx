// components/OnlineUsers.tsx
"use client";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/../types";
import api from "@/lib/api";

interface OnlineUsersProps {
  socket: Socket | null;
}

export function OnlineUsers({ socket }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await api.get("/profile/online");
        setOnlineUsers(response.data);
      } catch (error) {
        console.error("Error fetching online users:", error);
      }
    };

    fetchOnlineUsers();

    if (socket) {
      socket.on("presenceUpdate", ({ userId, status }) => {
        setOnlineUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, presenceStatus: status } : user
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("presenceUpdate");
      }
    };
  }, [socket]);

  const startPrivateChat = (username: string) => {
    socket?.emit("startPrivateChat", username);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4"> Users List</h2>
      <div className="space-y-4">
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-medium">{user.username}</span>
                <span
                  className={`ml-2 inline-block w-2 h-2 rounded-full ${
                    user.presenceStatus === "ONLINE"
                      ? "bg-green-500"
                      : user.presenceStatus === "AWAY"
                      ? "bg-yellow-500"
                      : user.presenceStatus === "BUSY"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                ></span>
              </div>
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
