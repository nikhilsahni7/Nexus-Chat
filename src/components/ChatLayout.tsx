// components/ChatLayout.tsx
"use client";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { io, Socket } from "socket.io-client";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { OnlineUsers } from "./OnlineUsers";
import api from "@/lib/api";
import { Conversation, Message } from "@/../types";
import { useParams } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function ChatLayout() {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

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
    <div className="flex flex-col h-screen bg-gray-100 md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-md">
        <button
          onClick={toggleMenu}
          className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Nexus-Chat</h1>
        <button
          onClick={toggleUsers}
          className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <UsersIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Conversation List */}
      <div
        className={`w-full md:w-1/4 bg-white shadow-lg fixed inset-0 z-20 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={toggleMenu}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <ConversationList conversations={conversations || []} />
      </div>

      {/* Chat Window */}
      <div className="w-full md:w-1/2 border-x border-gray-200 flex-grow overflow-hidden">
        {conversationId ? (
          <ChatWindow
            socket={socket}
            conversationId={conversationId}
            conversation={
              conversations?.find(
                (c) => c.id === parseInt(conversationId)
              ) as Conversation
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500 text-lg">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>

      {/* Online Users */}
      <div
        className={`w-full md:w-1/4 bg-white shadow-lg fixed inset-0 z-20 transform ${
          isUsersOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex justify-between items-center p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
          <button
            onClick={toggleUsers}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <OnlineUsers socket={socket} />
      </div>
    </div>
  );
}
