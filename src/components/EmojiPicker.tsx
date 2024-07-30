// components/EmojiPicker.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <div className="bg-white border rounded-lg p-2 shadow-lg">
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
