import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SavePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SavePromptDialog: React.FC<SavePromptDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [tags, setTags] = useState<string[]>(['exemplo']);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setTechStack(techStack.filter((tech) => tech !== techToRemove));
  };

  const handleSave = () => {
    // TODO: Implementar lógica de salvar
    console.log('Saving prompt...');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Novo Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt Completo</Label>
            <Textarea
              id="prompt"
              rows={4}
              placeholder="Digite o prompt enviado para a AI..."
            />
          </div>

          {/* Response */}
          <div className="space-y-2">
            <Label htmlFor="response">Resposta da AI</Label>
            <Textarea
              id="response"
              rows={6}
              placeholder="Cole a resposta completa da AI..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Adicione uma tag e pressione Enter"
              />
              <Button onClick={addTag} size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="default" className="gap-2">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-white"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label htmlFor="techstack">Tech Stack</Label>
            <div className="flex items-center gap-2">
              <Input
                id="techstack"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Adicione uma tecnologia e pressione Enter"
              />
              <Button onClick={addTech} size="icon">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="outline" className="gap-2">
                  {tech}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTech(tech)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="filename">Nome do Arquivo</Label>
            <Input id="filename" placeholder="Component.tsx" />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};