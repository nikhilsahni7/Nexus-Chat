// /profile/[id].tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertCircle, Calendar, File, Mail } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profileImage: string;
  bio: string;
  presenceStatus: string;
  lastActiveAt: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { id } = useParams();
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<UserProfile>({
    queryKey: ["profile", id],
    queryFn: () => api.get(`/profile/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  if (error) return <ErrorState />;

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto overflow-hidden shadow-xl">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          {isLoading ? (
            <Skeleton className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full" />
          ) : (
            <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage
                src={profile?.profileImage}
                alt={profile?.username}
              />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-4xl">
                {profile?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <CardContent className="pt-20 pb-12 px-8">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            profile && <ProfileContent profile={profile} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileContent({ profile }: { profile: UserProfile }) {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
        <Badge variant="outline" className="text-sm">
          {profile.presenceStatus}
        </Badge>
      </div>
      <div className="space-y-6">
        <ProfileItem icon={Mail} label="Email" value={profile.email} />
        <ProfileItem
          icon={File}
          label="Bio"
          value={profile.bio || "No bio available"}
        />
        <ProfileItem
          icon={Calendar}
          label="Member Since"
          value={new Date(profile.createdAt).toLocaleDateString()}
        />
        <ProfileItem
          icon={Activity}
          label="Last Active"
          value={new Date(profile.lastActiveAt).toLocaleString()}
        />
      </div>
    </>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
      <Icon className="mr-4 h-6 w-6 text-blue-500" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-5 w-24 mx-auto" />
      </div>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error loading profile</h2>
      <p className="text-gray-600">Please try again later.</p>
    </div>
  );
}
