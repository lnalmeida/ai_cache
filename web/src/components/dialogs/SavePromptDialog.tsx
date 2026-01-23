import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { promptApiService } from "@/services/promptService";
import { SavePromptDTO } from "@/types/prompt";

interface SavePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess: () => void;
}

export const SavePromptDialog: React.FC<SavePromptDialogProps> = ({
  open,
  onOpenChange,
  onSaveSuccess,
}) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [fileName, setFileName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog is closed
      setPrompt("");
      setResponse("");
      setFileName("");
      setTags([]);
      setTechStack([]);
      setError(null);
    }
  }, [open]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTech = (techToRemove: string) => {
    setTechStack(techStack.filter((tech) => tech !== techToRemove));
  };

  const handleSave = async () => {
    if (!prompt.trim() || !response.trim()) {
      toast.error("Preencha o prompt e a resposta");
      return;
    }

    setIsSaving(true);
    setError(null);

    const dto: SavePromptDTO = {
      prompt,
      response,
      fileName,
      tags: tags.join(","),
      techStack: techStack.join(","),
    };

    try {
      const result = await promptApiService.savePrompt(dto);
      if (result.success) {
        toast.success("Prompt salvo com sucesso!");

        onSaveSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(result.message || "Ocorreu um erro ao salvar o prompt.");
        setError(result.message || "Ocorreu um erro desconhecido.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
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
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite o prompt enviado para a AI..."
            />
          </div>

          {/* Response */}
          <div className="space-y-2">
            <Label htmlFor="response">Resposta da AI</Label>
            <Textarea
              id="response"
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
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
                  if (e.key === "Enter") {
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
                  if (e.key === "Enter") {
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
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Component.tsx"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
