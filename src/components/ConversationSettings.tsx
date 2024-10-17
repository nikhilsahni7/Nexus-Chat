// components/ConversationSettings.tsx
import { useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation, Participant } from "@/../types";
import api from "@/lib/api";

interface ConversationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  currentUserId: number;
}

export function ConversationSettings({
  isOpen,
  onClose,
  conversation,
  currentUserId,
}: ConversationSettingsProps) {
  const [name, setName] = useState(conversation?.name || "");
  const [newParticipant, setNewParticipant] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const updateConversationMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.put(`/conversations/${conversation.id}/profile`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"] as any);
      onClose();
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data: any) =>
      api.post(`/conversations/${conversation.id}/participants`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"] as any);
      setNewParticipant("");
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (participantId: number) =>
      api.delete(
        `/conversations/${conversation.id}/participants/${participantId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"] as any);
    },
  });

  const leaveConversationMutation = useMutation({
    mutationFn: () => api.post(`/conversations/${conversation.id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"] as any);
      onClose();
      router.push("/");
    },
  });

  const handleUpdateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    if (fileInputRef.current?.files?.[0]) {
      formData.append("groupProfile", fileInputRef.current.files[0]);
    }
    updateConversationMutation.mutate(formData);
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    addParticipantMutation.mutate({ username: newParticipant });
  };

  const handleRemoveParticipant = (participantId: number) => {
    removeParticipantMutation.mutate(participantId);
  };

  const handleLeaveConversation = () => {
    leaveConversationMutation.mutate();
  };

  const isAdmin = conversation?.participants.find(
    (p) => p.userId === currentUserId
  )?.isAdmin;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleUpdateConversation}>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Label htmlFor="group-profile">Group Profile Picture</Label>
            <Input
              id="group-profile"
              type="file"
              ref={fileInputRef}
              accept="image/*"
            />
            <Button
              type="submit"
              disabled={updateConversationMutation.isPending}
            >
              Update Group Profile
            </Button>
          </form>
          <div>
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={conversation?.inviteCode || ""}
              readOnly
            />
            <Button
              onClick={() =>
                navigator.clipboard.writeText(conversation.inviteCode || "")
              }
            >
              Copy Invite Code
            </Button>
          </div>
          <form onSubmit={handleAddParticipant}>
            <Label htmlFor="new-participant">Add Participant</Label>
            <Input
              id="new-participant"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder="Enter username"
              required
            />
            <Button type="submit" disabled={addParticipantMutation.isPending}>
              Add
            </Button>
          </form>
          <div>
            <h3 className="font-semibold mb-2">Participants</h3>
            {conversation?.participants.map((participant: Participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={participant.user.profileImage} />
                    <AvatarFallback>
                      {participant.user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{participant.user.username}</span>
                  {participant.isAdmin && (
                    <span className="ml-2 text-xs text-gray-500">(Admin)</span>
                  )}
                </div>
                <div>
                  <Button
                    onClick={() =>
                      router.push(`/profile/${participant.userId}`)
                    }
                    variant="ghost"
                    size="sm"
                  >
                    View Profile
                  </Button>
                  {isAdmin && participant.userId !== currentUserId && (
                    <Button
                      onClick={() =>
                        handleRemoveParticipant(participant.userId)
                      }
                      disabled={removeParticipantMutation.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleLeaveConversation} variant="destructive">
            Leave Group Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
