// components/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: string;
  presenceStatus: string;
}

export default function ProfileForm() {
  const router = useRouter();

  const { user, setUser, logout } = useAuthStore();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  const { data: profile, refetch } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile").then((res) => res.data),
  });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    const isChanged =
      username !== profile?.username ||
      email !== profile?.email ||
      bio !== profile?.bio ||
      profileImage !== null;
    setIsFormChanged(isChanged);
  }, [username, email, bio, profileImage, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => api.put("/profile", formData),
    onSuccess: (data) => {
      setUser(data.data);
      refetch();
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.error ||
          "An error occurred while updating your profile.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormChanged) {
      toast({
        title: "No Changes",
        description: "You haven't made any changes to your profile.",
      });
      return;
    }
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("bio", bio);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    updateProfileMutation.mutate(formData);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center mb-8">
        <Avatar className="w-32 h-32 border-4 border-gray-200 shadow-lg">
          <AvatarImage src={profile?.profileImage} alt={profile?.username} />
          <AvatarFallback className="bg-gray-200 text-gray-600 text-4xl">
            {profile?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center">
            <Icons.user className="mr-2 h-4 w-4" />
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-50 border-gray-300 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            <Icons.mail className="mr-2 h-4 w-4" />
            Email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border-gray-300 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center">
          <Icons.fileText className="mr-2 h-4 w-4" />
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="resize-none bg-gray-50 border-gray-300 focus:border-blue-500"
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profileImage" className="flex items-center">
          <Icons.image className="mr-2 h-4 w-4" />
          Profile Image
        </Label>
        <Input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          className="bg-gray-50 border-gray-300 focus:border-blue-500"
        />
      </div>
      <Separator className="my-8" />
      <div className="flex justify-between">
        <Button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700"
          disabled={!isFormChanged || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Icons.save className="mr-2 h-4 w-4" />
              Update Profile
            </>
          )}
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          <Icons.logOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </form>
  );
}
