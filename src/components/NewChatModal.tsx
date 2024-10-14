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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState<string>("");
  const [inviteCode, setInviteCode] = useState("");
  const [useInviteCode, setUseInviteCode] = useState(false); // Toggle for invite code
  const [groupProfile, setGroupProfile] = useState<File | null>(null);
  const [groupProfilePreview, setGroupProfilePreview] = useState<string | null>(
    null
  );
  const router = useRouter();
  const queryClient = useQueryClient();

  const createChatMutation = useMutation({
    mutationFn: (data: FormData) => api.post("/conversations", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["conversations"] as any);
      router.push(`/chat/${data.data.id}`);
      onClose();
      toast({
        title: "Success",
        description: "Group chat created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to create group chat",
        variant: "destructive",
      });
    },
  });

  const joinByInviteMutation = useMutation({
    mutationFn: (data: any) => api.post("/conversations/join-by-invite", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["conversations"] as any);
      router.push(`/chat/${data.data.id}`);
      onClose();
      toast({
        title: "Success",
        description: "Joined group chat successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error joining chat:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to join group chat",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useInviteCode) {
      joinByInviteMutation.mutate({ inviteCode });
    } else {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("participantIds", participants);
      if (groupProfile) {
        formData.append("groupProfile", groupProfile);
      }
      createChatMutation.mutate(formData);
    }
  };

  const handleGroupProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupProfile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {useInviteCode ? "Join a Group Chat" : "Start a New Group Chat"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toggle-invite-code">Join with Invite Code?</Label>
            <Input
              type="checkbox"
              id="toggle-invite-code"
              checked={useInviteCode}
              onChange={(e) => setUseInviteCode(e.target.checked)}
            />
          </div>

          {useInviteCode ? (
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code..."
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="participants">
                  Participants (Enter user IDs)
                </Label>
                <Input
                  id="participants"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="Enter user IDs separated by commas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-profile">Group Profile Image</Label>
                <Input
                  id="group-profile"
                  type="file"
                  accept="image/*"
                  onChange={handleGroupProfileChange}
                />
                {groupProfilePreview && (
                  <Avatar className="w-20 h-20 mx-auto mt-2">
                    <AvatarImage
                      src={groupProfilePreview}
                      alt="Group profile preview"
                    />
                    <AvatarFallback>GP</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={
              createChatMutation.isPending || joinByInviteMutation.isPending
            }
          >
            {createChatMutation.isPending || joinByInviteMutation.isPending
              ? "Processing..."
              : useInviteCode
              ? "Join Chat"
              : "Create Chat"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
