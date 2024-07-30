// components/ConversationList.tsx
import React from "react";
import Link from "next/link";
import { Conversation } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold">Conversations</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {conversations.map((conversation) => (
            <Link href={`/chat/${conversation.id}`} key={conversation.id}>
              <div className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage
                    src={
                      conversation.isGroup
                        ? conversation.groupProfile
                        : conversation.participants.find(
                            (p) => p.user.id !== conversation.id
                          )?.user.profileImage
                    }
                    alt={
                      conversation.name ||
                      conversation.participants.find(
                        (p) => p.user.id !== conversation.id
                      )?.user.username
                    }
                  />
                  <AvatarFallback>
                    {
                      (conversation.name ||
                        conversation.participants.find(
                          (p) => p.user.id !== conversation.id
                        )?.user.username)?.[0]
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-medium">
                    {conversation.isGroup
                      ? conversation.name
                      : conversation.participants.find(
                          (p) => p.user.id !== conversation.id
                        )?.user.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage?.content}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {conversation.lastMessage &&
                    new Date(
                      conversation.lastMessage.timestamp
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-2 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
          <Icons.plus className="mr-2" size={18} />
          New Conversation
        </button>
      </div>
    </div>
  );
}
