"use client";

import { NewChatModal } from "@/components/NewChatModal";
import { useIsAuthenticated } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewChatPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
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

  return (
    <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  );
}
