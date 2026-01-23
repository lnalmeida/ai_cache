import React, { useState } from 'react';
import { Copy, Check, Calendar, Hash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Prompt } from '@/types/prompt';
import { formatDate } from '@/utils/fornatDate';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PromptDetailDialog: React.FC<PromptDetailDialogProps> = ({
  prompt,
  open,
  onOpenChange,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (!prompt) return null;

  // Safely handle tags and techStack, which might be strings from the API or arrays from mock data.
  const tagList = Array.isArray(prompt.tags)
    ? prompt.tags
    : typeof prompt.tags === 'string' && prompt.tags
    ? prompt.tags.split(',').map(tag => tag.trim())
    : [];

  const techStackList = Array.isArray(prompt.techStack)
    ? prompt.techStack
    : typeof prompt.techStack === 'string' && prompt.techStack
    ? prompt.techStack.split(',').map(tech => tech.trim())
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <DialogTitle className="text-2xl mb-2">{prompt.prompt}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {tagList.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
                {techStackList.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata Section */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{prompt.fileName}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(prompt.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <code className="text-xs">{prompt.hash}</code>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Prompt Original</Label>
              <Button
                onClick={() => handleCopy(prompt.prompt, 'prompt')}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                {copiedSection === 'prompt' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm whitespace-pre-wrap">{prompt.prompt}</p>
            </div>
          </div>

          {/* Response/Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Resposta da AI</Label>
              <Button
                onClick={() => handleCopy(prompt.response, 'response')}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                {copiedSection === 'response' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código
                  </>
                )}
              </Button>
            </div>
            <div className="bg-slate-900 rounded-lg border overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  {prompt.fileName}
                </span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="overflow-auto max-h-[500px]">
                <pre className="p-4 text-sm text-slate-100 font-mono min-w-max">
                  <code className="block">{prompt.response}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="default">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};