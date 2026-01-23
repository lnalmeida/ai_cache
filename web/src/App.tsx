import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { useTheme } from "@/hooks/useTheme";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useOffline } from "@/hooks/useOffline";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { Toast } from "@/components/layout/Toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PWAInstallButton } from "@/components/layout/PWAInstallButton";
import { SearchBar } from "@/components/search/SearchBar";
import { ViewModeToggle } from "@/components/search/ViewModeToggle";
import { PromptCardsView } from "@/components/prompts/PromptCardsView";
import { PromptTableView } from "@/components/prompts/PromptTableView";
import { PromptDetailDialog } from "@/components/dialogs/PromptDetailDialog";
import { SavePromptDialog } from "@/components/dialogs/SavePromptDialog";
import { Prompt } from "@/types/prompt";
import { promptApiService } from "./services/promptService";


const AICacheContent: React.FC = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showToast, setShowToast] = useState(false);
  const isOffline = useOffline();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  const [prompts, setPrompts] = useState<Prompt[]>([]);


  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text, id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveSuccess = () => {
    fetchPrompts();
  };

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailDialog(true);
  };

  const handleRowClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailDialog(true);
  };

  const handleSearch = (query: string) => {
    fetchSearchedPrompts(query);
  }

  const fetchSearchedPrompts = async (query: string) => {
    try {
      if (!query || query.trim() === '') {
        await fetchPrompts();
        return;
      }
      const response = await promptApiService.searchPrompts({
        query,
        page: 1,
        pageSize: 20,
      
      });
      if (response.success && response.data) {
        setPrompts(response.data.items);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar prompts:", err);
    }
  }

  const fetchPrompts = async () => {
    try {
      const response = await promptApiService.getAllPrompts({
        page: 1,
        pageSize: 20,
      });

      if (response.success && response.data) {
        setPrompts(response.data.items);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar prompts:", err);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark"
          ? "dark bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950"
          : "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50"
        }`}
    >
      <OfflineBanner isOffline={isOffline} />
      <Toast show={showToast} message="Prompt copiado com sucesso!" />
      <ThemeToggle />
      <PWAInstallButton />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-bold bg-gradient-to-r ${theme === "dark"
                ? "from-purple-400 to-pink-400"
                : "from-purple-600 to-pink-600"
              } bg-clip-text text-transparent mb-3`}
          >
            AICache
          </h1>
          <p className="text-muted-foreground text-lg">
            Cache inteligente de prompts AI
          </p>
        </div>

        <SearchBar onSaveClick={() => setShowSaveDialog(true)} onSearch={handleSearch} />

        <ViewModeToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          promptsCount={prompts.length}
        />

        {viewMode === "cards" ? (
          <PromptCardsView
            prompts={prompts}
            onCopy={handleCopy}
            copiedId={copiedId}
            onCardClick={handleCardClick}
          />
        ) : (
          <PromptTableView
            prompts={prompts}
            onCopy={handleCopy}
            copiedId={copiedId}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <PromptDetailDialog
        prompt={selectedPrompt}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      <SavePromptDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AICacheContent />
    </ThemeProvider>
  );
};

export default App;
