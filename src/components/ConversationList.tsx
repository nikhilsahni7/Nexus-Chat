"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useSearchParams } from "next/navigation";
import { Conversation } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface ConversationListProps {
  conversations?: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button onClick={() => router.push("/chat/new")} className="w-full">
          <Icons.plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations?.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/chat/${conversation.id}`}
            className={`block p-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              conversation.id === parseInt(conversationId as string)
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }`}
          >
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={
                    conversation.isGroup
                      ? conversation.groupProfile
                      : conversation.participants.find(
                          (p) => p.user.id !== user?.id
                        )?.user.profileImage
                  }
                  alt={
                    conversation.isGroup
                      ? conversation.name
                      : conversation.participants.find(
                          (p) => p.user.id !== user?.id
                        )?.user.username
                  }
                />
                <AvatarFallback>
                  {(conversation.isGroup
                    ? conversation.name
                    : conversation.participants.find(
                        (p) => p.user.id !== user?.id
                      )?.user.username)?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {conversation.isGroup
                    ? conversation.name
                    : conversation.participants.find(
                        (p) => p.user.id !== user?.id
                      )?.user.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {conversation.lastMessage?.content}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
