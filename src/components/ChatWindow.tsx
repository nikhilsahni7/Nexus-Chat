"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import api from "@/lib/api";
import { Message, User, Conversation } from "@/../types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ConversationSettings } from "./ConversationSettings";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

interface ChatWindowProps {
  socket: Socket | null;
  conversationId: string;
  conversation: Conversation;
}

export function ChatWindow({
  socket,
  conversationId,
  conversation,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      api.get(`/messages/${conversationId}`).then((res) => res.data),
    enabled: !!conversationId,
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: string) => {
      const formData = new FormData();
      formData.append("content", newMessage);
      if (file) {
        formData.append("file", file);
      }
      if (replyingTo) {
        formData.append("parentId", replyingTo.id.toString());
      }
      return api.post(`/messages/${conversationId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", conversationId] as any);
      setMessage("");
      setFile(null);
      setReplyingTo(null);
    },
    onError: (error: Error) => {
      console.error("Error sending message:", error);
    },
  });

  useEffect(() => {
    if (socket) {
      socket.on(
        "typingUpdate",
        ({ conversationId: typingConversationId, typingUsers: users }) => {
          if (typingConversationId === parseInt(conversationId)) {
            setTypingUsers(users.map((user: User) => user.username));
          }
        }
      );

      socket.on("newMessage", (newMessage: Message) => {
        if (newMessage.conversationId === parseInt(conversationId)) {
          queryClient.invalidateQueries(["messages", conversationId] as any);
        }
      });

      socket.on("messageUpdated", (updatedMessage: Message) => {
        if (updatedMessage.conversationId === parseInt(conversationId)) {
          queryClient.invalidateQueries(["messages", conversationId] as any);
        }
      });

      socket.on(
        "messageDeleted",
        ({ messageId, conversationId: deletedConversationId }) => {
          if (deletedConversationId === parseInt(conversationId)) {
            queryClient.invalidateQueries(["messages", conversationId] as any);
          }
        }
      );

      socket.on("messageReactionUpdate", (updatedMessage) => {
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return oldMessages;
            return oldMessages.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            );
          }
        );
      });

      socket.on("messageRead", ({ messageId, userId, username }) => {
        queryClient.setQueryData(
          ["messages", conversationId],
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return oldMessages;
            return oldMessages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    readBy: [
                      ...msg.readBy.filter((rb) => rb.userId !== userId),
                      { userId, user: { username } },
                    ],
                  }
                : msg
            );
          }
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("typingUpdate");
        socket.off("newMessage");
        socket.off("messageUpdated");
        socket.off("messageDeleted");
        socket.off("messageReactionUpdate");
        socket.off("messagesRead");
      }
    };
  }, [socket, conversationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { conversationId, isTyping: true });
      setTimeout(() => {
        setIsTyping(false);
        socket?.emit("typing", { conversationId, isTyping: false });
      }, 3000);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || file) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleReaction = (messageId: number, reaction: string) => {
    api.post(`/messages/${messageId}/react`, { reaction }).then(() => {
      queryClient.invalidateQueries(["messages", conversationId] as any);
    });
  };

  const handleDeleteMessage = (messageId: number) => {
    api.delete(`/messages/${messageId}`).then(() => {
      queryClient.invalidateQueries(["messages", conversationId] as any);
    });
  };

  const handleEditMessage = (messageId: number, newContent: string) => {
    api.put(`/messages/${messageId}`, { content: newContent }).then(() => {
      queryClient.invalidateQueries(["messages", conversationId] as any);
    });
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const markAsRead = async (messageId: number) => {
    try {
      await api.post(`/messages/${messageId}/read`);
      queryClient.invalidateQueries(["messages", conversationId] as any);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getChatName = () => {
    if (!conversation) return "Chat";
    if (conversation.isGroup) {
      return conversation.name || "Group Chat";
    } else {
      const otherParticipant = conversation.participants.find(
        (p) => p.user.id !== user?.id
      );
      return otherParticipant ? otherParticipant.user.username : "Chat";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl rounded-lg overflow-hidden animate-pulse">
        <div className="p-4 bg-gradient-to-r from-primary to-primary-dark">
          <div className="h-8 w-48 bg-white/20 rounded"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 text-black flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {messages?.length === 0 && (
            <p className="text-sm italic text-gray-600">
              Start a new conversation
            </p>
          )}
          {conversation?.isGroup ? (
            <Icons.users className="h-6 w-6 text-gray-600" />
          ) : (
            <Icons.user className="h-6 w-6 text-gray-600" />
          )}
          <h2 className="text-xl font-bold text-gray-800">{getChatName()}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage} alt={user?.username} />
                  <AvatarFallback>
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full">
                  <Icons.user className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <Icons.logOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setShowSettings(true)}
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:bg-gray-200"
          >
            <Icons.settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble
                message={msg}
                currentUser={user}
                onReaction={handleReaction}
                onDelete={handleDeleteMessage}
                onEdit={handleEditMessage}
                onReply={handleReply}
                markAsRead={markAsRead}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-100 animate-pulse">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
          typing...
        </div>
      )}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-200 flex justify-between items-center">
          <span className="text-sm">
            Replying to <strong>{replyingTo.sender.username}</strong>:{" "}
            {replyingTo.content.substring(0, 50)}
            {replyingTo.content.length > 50 ? "..." : ""}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
            <Icons.x className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="p-4 bg-white border-t border-gray-200">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            handleTyping();
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          className="mb-2 resize-none bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary"
        />
        <div className="flex items-center justify-between">
          <Button
            onClick={handleFileButtonClick}
            variant="outline"
            className="mr-2 bg-white hover:bg-gray-100 text-primary border-primary"
          >
            <Icons.image className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {file ? "File selected" : "Attach file"}
            </span>
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            className="bg-primary text-white hover:bg-primary-dark"
          >
            {sendMessageMutation.isPending ? (
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.send className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {user && (
        <ConversationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          conversation={conversation as Conversation}
          currentUserId={user.id}
        />
      )}
    </Card>
  );
}

interface MessageBubbleProps {
  message: Message;
  currentUser: User | null;
  onReaction: (messageId: number, reaction: string) => void;
  onDelete: (messageId: number) => void;
  onEdit: (messageId: number, newContent: string) => void;
  onReply: (message: Message) => void;
  markAsRead: (messageId: number) => void;
}

function MessageBubble({
  message,
  currentUser,
  onReaction,
  onDelete,
  onEdit,
  onReply,
  markAsRead,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = () => {
    onEdit(message.id, editedContent);
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (message.contentType) {
      case "IMAGE":
        return (
          <a href={message.content} target="_blank" rel="noopener noreferrer">
            <Image
              src={message.content}
              alt="Shared image"
              width={200}
              height={200}
              className="mt-2 rounded-lg cursor-pointer max-w-full h-auto"
            />
          </a>
        );
      case "VIDEO":
        return (
          <video
            src={message.content}
            controls
            className="mt-2 rounded-lg max-w-full"
            style={{ maxHeight: "300px" }}
          >
            Your browser does not support the video tag.
          </video>
        );
      case "FILE":
        return (
          <a
            href={message.content}
            download
            className="text-blue-500 hover:underline mt-2 block"
          >
            Download File
          </a>
        );
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  useEffect(() => {
    if (
      message.senderId !== currentUser?.id &&
      !message.readBy.some((rb) => rb.userId === currentUser?.id)
    ) {
      markAsRead(message.id);
    }
  }, [message, currentUser, markAsRead]);

  const renderReadReceipts = () => {
    const readBy = message.readBy.filter(
      (rb) => rb.userId !== message.senderId
    );
    if (readBy.length === 0) return null;

    return (
      <div className="flex items-center mt-1">
        <Icons.check className="h-3 w-3 text-blue-500 mr-1" />
        <span className="text-xs text-gray-500">
          Read by {readBy.map((rb) => rb?.user?.username).join(", ")}
        </span>
      </div>
    );
  };

  const isCurrentUserMessage = message.senderId === currentUser?.id;

  return (
    <div
      className={`flex ${
        isCurrentUserMessage ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[70%] rounded-lg p-3 shadow-md ${
          isCurrentUserMessage
            ? "bg-primary text-white"
            : "bg-white text-gray-800"
        }`}
      >
        <div className="flex items-center mb-1">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={message.sender.profileImage} />
            <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">
            {message.sender.username}
          </span>
          {message.updatedAt !== message.timestamp && (
            <Badge
              variant="outline"
              className={`ml-2 text-xs ${
                isCurrentUserMessage ? "bg-primary-dark" : "bg-gray-200"
              }`}
            >
              Edited
            </Badge>
          )}
        </div>
        {message.parent && (
          <div
            className={`text-xs italic mb-1 p-1 rounded ${
              isCurrentUserMessage
                ? "bg-primary-dark text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Replying to {message.parent.sender.username}:{" "}
            {message.parent.content.substring(0, 30)}
            {message.parent.content.length > 30 ? "..." : ""}
          </div>
        )}
        {isEditing ? (
          <div>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="mb-2 bg-white text-gray-800"
            />
            <Button onClick={handleEdit} size="sm" className="mr-2">
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        ) : (
          renderContent()
        )}
        <div
          className={`text-xs ${
            isCurrentUserMessage ? "text-primary-light" : "text-gray-500"
          } mt-1`}
        >
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </div>
        {renderReadReceipts()}
        <div className="flex mt-2 space-x-2 flex-wrap">
          <TooltipProvider>
            {["👍", "❤️", "😂", "😮", "😢", "😡"].map((reaction) => (
              <Tooltip key={reaction}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReaction(message.id, reaction)}
                    className={`text-xs hover:bg-gray-300 rounded px-1 ${
                      isCurrentUserMessage
                        ? "text-white hover:text-black"
                        : "text-black"
                    }`}
                  >
                    {reaction}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>React with {reaction}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onReply(message)}
                  className={`text-xs hover:bg-opacity-20 rounded px-1 ${
                    isCurrentUserMessage
                      ? "text-white hover:bg-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icons.reply className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reply</p>
              </TooltipContent>
            </Tooltip>
            {isCurrentUserMessage && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs hover:bg-white hover:bg-opacity-20 rounded px-1 text-white"
                    >
                      <Icons.edit className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onDelete(message.id)}
                      className="text-xs hover:bg-white hover:bg-opacity-20 rounded px-1 text-red-300"
                    >
                      <Icons.trash className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>

        {message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap">
            {message.reactions.map((reaction, index) => (
              <span
                key={index}
                className={`text-xs rounded px-1 mr-1 mt-1 ${
                  isCurrentUserMessage
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                {reaction.reaction} {reaction.user.username}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
