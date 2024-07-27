"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/ui/icons";
import api from "@/lib/api";
import { Message, User } from "@/../types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      api.get(`/messages/${conversationId}`).then((res) => res.data),
    enabled: !!conversationId,
  });

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
    onError: (error) => {
      console.error("Error sending message:", error);
      // Handle error (e.g., show an error message to the user)
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

      socket.on("messageReactionUpdate", ({ messageId, reactions }) => {
        queryClient.invalidateQueries(["messages", conversationId] as any);
      });
    }

    return () => {
      if (socket) {
        socket.off("typingUpdate");
        socket.off("newMessage");
        socket.off("messageUpdated");
        socket.off("messageDeleted");
        socket.off("messageReactionUpdate");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={user}
            onReaction={handleReaction}
            onDelete={handleDeleteMessage}
            onEdit={handleEditMessage}
            onReply={handleReply}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
          typing...
        </div>
      )}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-100 flex justify-between items-center">
          <span>
            Replying to {replyingTo.sender.username}:{" "}
            {replyingTo.content.substring(0, 50)}
            {replyingTo.content.length > 50 ? "..." : ""}
          </span>
          <button onClick={() => setReplyingTo(null)}>
            <Icons.x className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="p-4 border-t">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type a message..."
          className="mb-2"
        />
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <Button
          onClick={handleSendMessage}
          disabled={sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>
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
}

function MessageBubble({
  message,
  currentUser,
  onReaction,
  onDelete,
  onEdit,
  onReply,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleEdit = () => {
    onEdit(message.id, editedContent);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex ${
        message.senderId === currentUser?.id ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] ${
          message.senderId === currentUser?.id
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        } rounded-lg p-3`}
      >
        <div className="flex items-center mb-1">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={message.sender.profileImage} />
            <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">
            {message.sender.username}
          </span>
        </div>
        {message.parent && (
          <div className="text-xs italic mb-1">
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
              className="mb-2"
            />
            <Button onClick={handleEdit} size="sm">
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              size="sm"
              variant="outline"
              className="ml-2"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
        {message.contentType === "IMAGE" && (
          <Image
            src={message.content}
            alt="Shared image"
            width={200}
            height={200}
            className="mt-2 rounded-lg"
          />
        )}
        {message.contentType === "FILE" && (
          <a
            href={message.content}
            download
            className="text-blue-500 hover:underline mt-2 block"
          >
            Download File
          </a>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </div>
        <div className="flex mt-2 space-x-2">
          {["👍", "❤️", "😂", "😮", "😢", "😡"].map((reaction) => (
            <button
              key={reaction}
              onClick={() => onReaction(message.id, reaction)}
              className="text-xs hover:bg-gray-300 rounded px-1"
            >
              {reaction}
            </button>
          ))}
          <button
            onClick={() => onReply(message)}
            className="text-xs hover:bg-gray-300 rounded px-1"
          >
            Reply
          </button>
          {message.senderId === currentUser?.id && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs hover:bg-gray-300 rounded px-1"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(message.id)}
                className="text-xs hover:bg-gray-300 rounded px-1 text-red-500"
              >
                Delete
              </button>
            </>
          )}
        </div>
        {message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap">
            {message.reactions.map((reaction) => (
              <span
                key={reaction.id}
                className="text-xs bg-gray-100 rounded px-1 mr-1 mt-1"
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
