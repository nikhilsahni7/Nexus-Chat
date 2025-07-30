// components/ChatLayout.tsx
"use client";
import { Conversation, Message } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Bars3Icon, UsersIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChatWindow } from "./ChatWindow";
import { ConversationList } from "./ConversationList";
import { OnlineUsers } from "./OnlineUsers";

export function ChatLayout() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get("/conversations").then((res) => res.data),
  });

  useEffect(() => {
    if (token) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
        if (conversations) {
          newSocket.emit(
            "joinConversations",
            conversations.map((c) => c.id)
          );
        }
      });

      newSocket.on("newMessage", (message: Message) => {
        queryClient.invalidateQueries([
          "messages",
          message.conversationId,
        ] as any);
        queryClient.invalidateQueries(["conversations"] as any);
      });

      newSocket.on("messageUpdated", (message: Message) => {
        queryClient.invalidateQueries([
          "messages",
          message.conversationId,
        ] as any);
      });

      newSocket.on(
        "messageDeleted",
        ({
          messageId,
          conversationId,
        }: {
          messageId: number;
          conversationId: number;
        }) => {
          queryClient.invalidateQueries(["messages", conversationId] as any);
        }
      );

      newSocket.on("newConversation", (conversation: Conversation) => {
        queryClient.invalidateQueries(["conversations"] as any);
      });

      newSocket.on("conversationUpdated", (conversation: Conversation) => {
        queryClient.invalidateQueries(["conversations"] as any);
      });

      newSocket.on(
        "participantAdded",
        (data: { conversationId: number; participant: any }) => {
          queryClient.invalidateQueries(["conversations"] as any);
        }
      );

      newSocket.on(
        "participantRemoved",
        (data: { conversationId: number; userId: number }) => {
          queryClient.invalidateQueries(["conversations"] as any);
        }
      );

      newSocket.on(
        "presenceUpdate",
        (data: { userId: number; status: string }) => {
          queryClient.invalidateQueries(["onlineUsers"] as any);
        }
      );

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, queryClient, conversations]);

  interface ConversationProps {
    id: number;
    name?: string;
    isGroup: boolean;
    lastMessage?: Message;
    participants: any;
    inviteCode?: string;
    groupProfile?: string;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUsers = () => setIsUsersOpen(!isUsersOpen);

  return (
    <div className="flex flex-col h-screen bg-gradient-chat">
      {/* Desktop header */}
      <div className="hidden md:flex justify-between items-center p-6 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/nexus-logo.png"
              alt="Nexus Chat"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <h1 className="text-2xl font-bold text-gray-900">Nexus Chat</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImage} alt={user?.username} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border border-gray-100 shadow-lg rounded-xl"
              align="end"
              forceMount
            >
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <Icons.user className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <Icons.logOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 md:flex-row">
        {/* Mobile header */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-100">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Image
              src="/nexus-logo.png"
              alt="Nexus Chat"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-lg font-bold text-gray-900">Nexus Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleUsers}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
            >
              <UsersIcon className="h-6 w-6" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.profileImage}
                      alt={user?.username}
                    />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white border border-gray-100 shadow-lg rounded-xl"
                align="end"
                forceMount
              >
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  <Icons.user className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <Icons.logOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white shadow-lg fixed inset-0 z-20 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col border-r border-gray-100`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              Conversations
            </h2>
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            <ConversationList conversations={conversations || []} />
          </div>
        </div>

        {/* Chat Window */}
        <div className="w-full md:flex-1 border-x border-gray-100 flex-grow overflow-hidden bg-gradient-chat">
          {conversationId ? (
            <ChatWindow socket={socket} conversationId={conversationId} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-chat">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.messageCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Nexus Chat
                </h2>
                <p className="text-gray-700 max-w-md mx-auto">
                  Select a conversation to start chatting with your team
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Online Users */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white shadow-lg fixed inset-0 z-20 transform ${
            isUsersOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-l border-gray-100`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <button
              onClick={toggleUsers}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <OnlineUsers socket={socket} />
        </div>
      </div>
    </div>
  );
}
