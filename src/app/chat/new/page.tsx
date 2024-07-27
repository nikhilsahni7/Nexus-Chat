"use client";

import { useState } from "react";
import { NewChatModal } from "@/components/NewChatModal";

export default function NewChatPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  );
}

// Path: src/app/chat/new/page.tsx
