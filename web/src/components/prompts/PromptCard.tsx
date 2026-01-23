
import React from 'react';
import { Copy, Check, Calendar, Hash } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';
import { formatDate } from '@/utils/fornatDate';

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onCardClick: (prompt: Prompt) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onCopy,
  copiedId,
  onCardClick,
}) => {
  return (
    <Card
      className="group hover:shadow-xl transition-all cursor-pointer"
      onClick={() => onCardClick(prompt)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg flex-1 group-hover:text-primary transition-colors">
            {prompt.prompt}
          </h3>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(prompt.prompt, prompt.id.toString());
            }}
            variant="ghost"
            size="icon"
            className="ml-2 h-8 w-8"
          >
            {copiedId === prompt.id.toString() ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {prompt.response}
        </p>

        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {prompt.techStack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Badge variant="secondary">{prompt.fileName}</Badge>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(prompt.createdAt)}
          </span>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCopy(prompt.hash, `hash-${prompt.id}`);
          }}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="Copiar hash"
        >
          <Hash className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};