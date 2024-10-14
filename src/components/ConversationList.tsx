// components/ConversationList.tsx
import { useState } from "react";
import Link from "next/link";
import { Conversation } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NewChatModal } from "./NewChatModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-2 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-2xl font-semibold">Group Chats</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
          {conversations.map((conversation) => (
            <Link href={`/chat/${conversation.id}`} key={conversation.id}>
              <div className="flex items-center p-2 sm:p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mr-2 sm:mr-3">
                  <AvatarImage
                    src={conversation.groupProfile}
                    alt={conversation.name}
                  />
                  <AvatarFallback>
                    {conversation.name?.[0] || "N"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {conversation.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {conversation.lastMessage?.content}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs text-gray-400">
                    {conversation.lastMessage &&
                      new Date(
                        conversation.lastMessage.timestamp
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                  {conversation.inviteCode && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 p-1 sm:p-2"
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(
                                conversation.inviteCode!
                              );
                            }}
                          >
                            <Icons.copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-black text-xs sm:text-sm">
                            Copy invite code: {conversation.inviteCode}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 sm:p-4 border-t border-gray-200">
        <Button
          className="w-full py-2 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors text-sm sm:text-base"
          onClick={() => setShowNewChatModal(true)}
        >
          <Icons.plus className="mr-2" size={16} />
          New Group Chat
        </Button>
      </div>
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
    </div>
  );
}
