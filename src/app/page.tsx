"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Is authenticated:", isAuthenticated);
      console.log("Current user:", useAuthStore.getState().user);
      console.log("Current token:", useAuthStore.getState().token);
      router.push("/chat");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, setIsLoading]);
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-black">
            Nexus Chat
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
            Connect, Collaborate, Communicate
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-black text-black hover:bg-gray-100"
            >
              <Link href="/login">
                <Icons.user className="mr-2 h-5 w-5" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-gray-800"
            >
              <Link href="/register">
                <Icons.userPlus className="mr-2 h-5 w-5" />
                Register
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Icons.messageCircle className="h-12 w-12 text-gray-700" />}
            title="Real-Time Super Fast Chat"
            description="Experience lightning-fast messaging with our advanced real-time chat system."
          />
          <FeatureCard
            icon={<Icons.users className="h-12 w-12 text-gray-700" />}
            title="Group Chats"
            description="Create and manage group chats with admin and participant features."
          />
          <FeatureCard
            icon={<Icons.image className="h-12 w-12 text-gray-700" />}
            title="Rich Media Support"
            description="Share text, images, videos, and files seamlessly in your conversations."
          />
          <FeatureCard
            icon={<Icons.search className="h-12 w-12 text-gray-700" />}
            title="Powerful Search"
            description="Easily find messages, contacts, and content within your chats."
          />
          <FeatureCard
            icon={<Icons.bell className="h-12 w-12 text-gray-700" />}
            title="Smart Notifications"
            description="Stay updated with customizable and intelligent notifications."
          />
          <FeatureCard
            icon={<Icons.shield className="h-12 w-12 text-gray-700" />}
            title="Secure Authentication"
            description="Your privacy and security are our top priorities with robust authentication."
          />
        </section>

        <Separator className="my-16" />

        <section className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-black">
            Advanced Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <FeatureItem icon={<Icons.edit />} text="Edit Messages" />
            <FeatureItem icon={<Icons.trash />} text="Delete Messages" />
            <FeatureItem icon={<Icons.reply />} text="Reply to Messages" />
            <FeatureItem icon={<Icons.circleDot />} text="Online Status" />
            <FeatureItem icon={<Icons.image />} text="Image Sharing" />
            <FeatureItem icon={<Icons.video />} text="Video Sharing" />
            <FeatureItem icon={<Icons.file />} text="File Sharing" />
            <FeatureItem icon={<Icons.userPlus />} text="Create Groups" />
          </div>
        </section>

        <footer className="text-center text-gray-500">
          <p>&copy; 2024 Nexus Chat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-col items-center">
        {icon}
        <CardTitle className="mt-4 text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-center">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ icon, text }: any) {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
        <span className="text-gray-700 text-2xl">{icon}</span>
        <Badge variant="secondary" className="mt-2">
          {text}
        </Badge>
      </CardContent>
    </Card>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 bg-gray-200 rounded-md w-24"></div>
          <div className="h-10 bg-gray-200 rounded-md w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-24 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
