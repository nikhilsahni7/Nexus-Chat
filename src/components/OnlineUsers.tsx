// components/OnlineUsers.tsx
"use client";
import { User } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-500";
      case "AWAY":
        return "bg-yellow-500";
      case "BUSY":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "Online";
      case "AWAY":
        return "Away";
      case "BUSY":
        return "Busy";
      default:
        return "Offline";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
          <Badge
            variant="secondary"
            className="bg-gradient-secondary text-gray-700 border-0"
          >
            {onlineUsers.length} users
          </Badge>
        </div>
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {onlineUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.users className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No users online
            </h3>
            <p className="text-gray-600">
              Check back later to see who&apos;s available
            </p>
          </div>
        ) : (
          onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.profileImage}
                        alt={user.username}
                      />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                        user.presenceStatus || "OFFLINE"
                      )}`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {user.username}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.presenceStatus === "ONLINE"
                            ? "bg-green-100 text-green-700"
                            : user.presenceStatus === "AWAY"
                            ? "bg-yellow-100 text-yellow-700"
                            : user.presenceStatus === "BUSY"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getStatusText(user.presenceStatus || "OFFLINE")}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startPrivateChat(user.username)}
                  className="text-gray-600 hover:text-pink-600 hover:border-pink-300 transition-colors"
                >
                  <Icons.messageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-gray-600 hover:text-pink-600 hover:border-pink-300"
            >
              <Icons.users className="h-4 w-4 mr-1" />
              Group Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-gray-600 hover:text-pink-600 hover:border-pink-300"
            >
              <Icons.settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
