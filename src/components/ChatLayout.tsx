// components/ChatLayout.tsx
"use client";
// components/ChatLayout.tsx
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

export function ChatLayout() {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const params = useParams();
  const conversationId = params?.conversationId as string;

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

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <ConversationList conversations={conversations || []} />
      </div>
      <div className="w-1/2">
        <ChatWindow socket={socket} conversationId={conversationId} />
      </div>
      <div className="w-1/4 border-l">
        <OnlineUsers socket={socket} />
      </div>
    </div>
  );
}
