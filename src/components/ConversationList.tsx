import { Conversation } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { NewChatModal } from "./NewChatModal";

interface ConversationListProps {
  conversations: Conversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
          <Badge
            variant="secondary"
            className="bg-gradient-secondary text-gray-700 border-0"
          >
            {conversations.length} chats
          </Badge>
        </div>
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      {/* Scrollable Area for Conversations */}
      <ScrollArea className="flex-grow p-4 space-y-2 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.messageCircle className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start a new conversation to begin chatting
            </p>
            <Button
              onClick={() => setShowNewChatModal(true)}
              className="bg-gradient-primary text-white hover:shadow-lg"
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              Create New Chat
            </Button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/chat/${conversation.id}`}>
                <div className="flex items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 group">
                  <div className="relative">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={conversation.groupProfile}
                        alt={conversation.name}
                      />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {conversation.name?.[0] || "N"}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.participants?.length > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-pink-600 transition-colors">
                        {conversation.name || "Unnamed Chat"}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2">
                        {conversation.lastMessage &&
                          new Date(
                            conversation.lastMessage.timestamp
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || "No messages yet"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        {conversation.isGroup && (
                          <Icons.users className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {conversation.participants?.length || 0} participants
                        </span>
                      </div>
                      {conversation.inviteCode && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(
                                    conversation.inviteCode!
                                  );
                                }}
                              >
                                <Icons.copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Copy invite code: {conversation.inviteCode}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </ScrollArea>

      {/* Button Section */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <Button
          className="w-full py-3 bg-gradient-primary text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all duration-300 font-semibold"
          onClick={() => setShowNewChatModal(true)}
        >
          <Icons.plus className="mr-2 h-5 w-5" />
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
