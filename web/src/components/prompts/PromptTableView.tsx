import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Prompt } from '@/types/prompt';
import { formatDate } from '@/utils/fornatDate';


interface PromptTableViewProps {
  prompts: Prompt[];
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onRowClick: (prompt: Prompt) => void;
}

export const PromptTableView: React.FC<PromptTableViewProps> = ({
  prompts,
  onCopy,
  copiedId,
  onRowClick,
}) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="px-6 py-4 font-semibold">Prompt</th>
              <th className="px-6 py-4 font-semibold">Resposta</th>
              <th className="px-6 py-4 font-semibold">Tags</th>
              <th className="px-6 py-4 font-semibold">Tech Stack</th>
              <th className="px-6 py-4 font-semibold">Arquivo</th>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => (
              <tr
                key={prompt.id}
                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onRowClick(prompt)}
              >
                <td className="px-6 py-4 font-medium max-w-xs">
                  {prompt.prompt}
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm max-w-md">
                  <div className="line-clamp-2">{prompt.response}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {prompt.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="text-xs">
                    {prompt.fileName}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-muted-foreground text-sm">
                  {formatDate(prompt.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(prompt.prompt, prompt.id.toString());
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    {copiedId === prompt.id.toString() ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};