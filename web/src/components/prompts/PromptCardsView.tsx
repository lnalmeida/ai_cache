import React from "react";
import { PromptCard } from "./PromptCard";
import { Prompt } from "@/types/prompt";
interface PromptCardsViewProps {
  prompts: Prompt[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onCardClick: (prompt: Prompt) => void;
}
export const PromptCardsView: React.FC<PromptCardsViewProps> = ({
  prompts,
  onCopy,
  copiedId,
  onCardClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCopy={onCopy}
          copiedId={copiedId}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};
