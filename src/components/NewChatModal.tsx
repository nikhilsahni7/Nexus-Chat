// components/NewChatModal.tsx
"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const [isGroup, setIsGroup] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: (data: any) =>
      isGroup
        ? api.post("/conversations", data)
        : api.post("/conversations/private", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["conversations"] as any);
      router.push(`/chat/${data.data.id}`);
      onClose();
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
      // Handle error (e.g., show an error message to the user)
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGroup) {
      createChatMutation.mutate({ name, isGroup });
    } else {
      createChatMutation.mutate({ username });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="group-chat"
                checked={isGroup}
                onCheckedChange={setIsGroup}
              />
              <Label htmlFor="group-chat">Group Chat</Label>
            </div>
            {isGroup ? (
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" disabled={createChatMutation.isPending}>
              {createChatMutation.isPending ? "Creating..." : "Create Chat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
