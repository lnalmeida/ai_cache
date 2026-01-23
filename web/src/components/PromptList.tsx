import { useEffect, useState } from 'react';
import { promptApiService } from '../services/promptService';
import { Prompt } from '../types/prompt';
import { PromptDetailDialog } from './dialogs/PromptDetailDialog';
import { SavePromptDialog } from './dialogs/SavePromptDialog';
import { Button } from './ui/button';

export const PromptList = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const fetchPrompts = async () => {
    try {
      const response = await promptApiService.getAllPrompts({ page: 1, pageSize: 20 });

      if (response.success && response.data) {
        setPrompts(response.data.items);
        setError(null);
      } else {
        setError(response.message || 'Falha ao buscar os prompts.');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchPrompts();
      setIsLoading(false);
    };

    initialFetch();
  }, []);

  const handleSaveSuccess = () => {
    // Este é o lugar ideal para adicionar um Toast de sucesso.
    fetchPrompts();
  };

  if (isLoading) {
    return <div>Carregando prompts...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cache de Prompts</h1>
        <Button onClick={() => setIsSaveDialogOpen(true)}>
          Adicionar Novo
        </Button>
      </div>
      {prompts.length === 0 ? (
        <p>Nenhum prompt encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {prompts.map((prompt) => (
            <li
              key={prompt.hash}
              onClick={() => setSelectedPrompt(prompt)}
              className="p-2 border rounded-md cursor-pointer hover:bg-muted"
            >
              <strong>{prompt.prompt}</strong>
            </li>
          ))}
        </ul>
      )}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={!!selectedPrompt}
        onOpenChange={(open) => !open && setSelectedPrompt(null)}
      />
      <SavePromptDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};