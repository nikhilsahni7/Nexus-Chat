"use client";

import { ChatLayout } from "@/components/ChatLayout";
import { useIsAuthenticated } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConversationPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return <ChatLayout />;
}
