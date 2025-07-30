"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { Conversation, Message, User } from "@/../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import { ConversationSettings } from "./ConversationSettings";

interface ChatWindowProps {
  socket: Socket | null;
  conversationId: string;
}

export function ChatWindow({ socket, conversationId }: ChatWindowProps) {
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

  const { data: conversation, isLoading: isConversationLoading } =
    useQuery<Conversation>({
      queryKey: ["conversation", conversationId],
      queryFn: () =>
        api.get(`/conversations/${conversationId}`).then((res) => res.data),
      enabled: !!conversationId,
    });

  const { data: messages, isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      api.get(`/messages/${conversationId}`).then((res) => res.data),
    enabled: !!conversationId && !!conversation,
  });

  const isLoading = isConversationLoading || isMessagesLoading;

  useEffect(() => {
    if (
      conversation &&
      !conversation.participants.some((p) => p.userId === user?.id)
    ) {
      router.push("/chat");
    }
  }, [conversation, user, router]);

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
        (p) => p.userId !== user?.id
      );
      return otherParticipant ? otherParticipant.user.username : "Chat";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-chat animate-pulse">
        <div className="p-6 bg-white shadow-sm border-b border-gray-100">
          <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (
    !conversation ||
    !conversation.participants.some((p) => p.userId === user?.id)
  ) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-gradient-chat">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.x className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            You don&apos;t have access to this conversation.
          </p>
          <Button
            onClick={() => router.push("/chat")}
            className="bg-gradient-primary text-white hover:shadow-lg"
          >
            Go back to conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-chat">
      {/* Chat Header */}
      <div className="p-4 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              {conversation?.isGroup ? (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Icons.users className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Icons.user className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getChatName()}
                </h2>
                <p className="text-sm text-gray-500">
                  {conversation?.isGroup ? "Group chat" : "Direct message"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
                align="end"
                className="w-56 bg-white border border-gray-100 shadow-lg rounded-xl"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="w-full">
                    <Icons.user className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
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
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Icons.settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
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

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span>
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </span>
          </div>
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Replying to{" "}
                <span className="font-semibold">
                  {replyingTo.sender.username}
                </span>
              </p>
              <p className="text-sm text-gray-500 truncate">
                {replyingTo.content.substring(0, 50)}
                {replyingTo.content.length > 50 ? "..." : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-end space-x-3">
          <Button
            onClick={handleFileButtonClick}
            variant="outline"
            size="icon"
            className="flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
          >
            <Icons.image className="h-5 w-5" />
          </Button>
          <div className="flex-1">
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
              className="resize-none bg-gray-50 border-gray-200 focus:border-pink-500 focus:ring-pink-500 rounded-xl min-h-[44px] max-h-32"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={
              sendMessageMutation.isPending || (!message.trim() && !file)
            }
            className="flex-shrink-0 bg-gradient-primary text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <Icons.loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Icons.send className="h-5 w-5" />
            )}
          </Button>
        </div>
        {file && (
          <div className="mt-3 flex items-center space-x-2">
            <Icons.file className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
        )}
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
    </div>
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
              className="mt-1 rounded-lg cursor-pointer max-w-full h-auto shadow-sm"
            />
          </a>
        );
      case "VIDEO":
        return (
          <video
            src={message.content}
            controls
            className="mt-1 rounded-lg max-w-full shadow-sm"
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
            className="text-pink-600 hover:text-pink-700 hover:underline mt-1 block"
          >
            Download File
          </a>
        );
      default:
        return <p className="break-words leading-relaxed">{message.content}</p>;
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
        <Icons.check className="h-3 w-3 text-white mr-1" />
        <span className="text-xs text-white/90">
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
      } mb-2`}
    >
      <div
        className={`max-w-[65%] rounded-2xl p-2.5 shadow-sm ${
          isCurrentUserMessage
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {message.parent && (
          <div
            className={`text-xs italic mb-1.5 p-1.5 rounded-md ${
              isCurrentUserMessage
                ? "bg-white/30 text-white"
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
              className="mb-2 bg-white text-gray-800 border-gray-200 rounded-lg text-sm"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleEdit}
                size="sm"
                className="bg-gradient-primary text-white text-xs"
              >
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                size="sm"
                variant="outline"
                className="border-gray-200 text-gray-700 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          renderContent()
        )}

        <div
          className={`text-xs mt-1 ${
            isCurrentUserMessage ? "text-white/90" : "text-gray-500"
          }`}
        >
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </div>

        {renderReadReceipts()}

        <div className="flex mt-1.5 space-x-1 flex-wrap">
          <TooltipProvider>
            {["👍", "❤️", "😂", "😮", "😢", "😡"].map((reaction) => (
              <Tooltip key={reaction}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReaction(message.id, reaction)}
                    className={`text-xs hover:bg-opacity-20 rounded px-1 py-0.5 transition-colors ${
                      isCurrentUserMessage
                        ? "text-white hover:bg-white/20"
                        : "text-gray-600 hover:bg-gray-200"
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
                  className={`text-xs hover:bg-opacity-20 rounded px-1 py-0.5 transition-colors ${
                    isCurrentUserMessage
                      ? "text-white hover:bg-white/20"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icons.reply className="h-3 w-3" />
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
                      className="text-xs hover:bg-white/20 rounded px-1 py-0.5 text-white transition-colors"
                    >
                      <Icons.edit className="h-3 w-3" />
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
                      className="text-xs hover:bg-white/20 rounded px-1 py-0.5 text-red-200 transition-colors"
                    >
                      <Icons.trash className="h-3 w-3" />
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
                className={`text-xs rounded px-1 py-0.5 mr-1 mt-1 ${
                  isCurrentUserMessage
                    ? "bg-white/30 text-white"
                    : "bg-gray-100 text-gray-700"
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
