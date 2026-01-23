import React, { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useOffline } from '@/hooks/useOffline';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { Toast } from '@/components/layout/Toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PWAInstallButton } from '@/components/layout/PWAInstallButton';
import { SearchBar } from '@/components/search/SearchBar';
import { ViewModeToggle } from '@/components/search/ViewModeToggle';
import { PromptCardsView } from '@/components/prompts/PromptCardsView';
import { PromptTableView } from '@/components/prompts/PromptTableView';
import { PromptDetailDialog } from '@/components/dialogs/PromptDetailDialog';
import { SavePromptDialog } from '@/components/dialogs/SavePromptDialog';
import { Prompt } from '@/types/prompt';

// Mock data
const mockPrompts: Prompt[] = [
  {
    id: 1,
    prompt: "Create responsive table with Tailwind CSS",
    response: `import React from 'react';

const ResponsiveTable = () => {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;`,
    tags: ["tailwind", "responsive", "table"],
    techStack: ["React", "TypeScript", "Vite"],
    fileName: "Table.tsx",
    createdAt: "2026-01-19T10:30:00",
    hash: "a1b2c3d4"
  },
  {
    id: 2,
    prompt: "Build dark theme toggle with context API",
    response: `import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};`,
    tags: ["react", "dark-theme", "context"],
    techStack: ["React", "JavaScript"],
    fileName: "ThemeContext.js",
    createdAt: "2026-01-18T15:45:00",
    hash: "e5f6g7h8"
  },
  {
    id: 3,
    prompt: "Implement infinite scroll with React hooks",
    response: `import React, { useState, useEffect, useRef, useCallback } from 'react';

const fetchPosts = async (page) => {
  const response = await fetch(\`/api/posts?page=\${page}\`);
  return response.json();
};

const InfiniteScrollList = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const loadMoreRef = useRef();

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const data = await fetchPosts(page);
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadPosts, hasMore, loading]);

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="p-4 border rounded">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
      <div ref={loadMoreRef} className="py-4">
        {loading && <div>Loading more...</div>}
      </div>
    </div>
  );
};

export default InfiniteScrollList;`,
    tags: ["react", "infinite-scroll", "pagination"],
    techStack: ["React", "TypeScript"],
    fileName: "InfiniteList.tsx",
    createdAt: "2026-01-17T09:20:00",
    hash: "i9j0k1l2"
  }
];

const AICacheContent: React.FC = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showToast, setShowToast] = useState(false);
  const isOffline = useOffline();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text, id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCardClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailDialog(true);
  };

  const handleRowClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailDialog(true);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'dark bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950'
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50'
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
            className={`text-5xl font-bold bg-gradient-to-r ${
              theme === 'dark'
                ? 'from-purple-400 to-pink-400'
                : 'from-purple-600 to-pink-600'
            } bg-clip-text text-transparent mb-3`}
          >
            AICache
          </h1>
          <p className="text-muted-foreground text-lg">
            Cache inteligente de prompts AI · Busca em 5ms
          </p>
        </div>

        <SearchBar onSaveClick={() => setShowSaveDialog(true)} />

        <ViewModeToggle
          viewMode={viewMode}
          setViewMode={setViewMode}
          promptsCount={mockPrompts.length}
        />

        {viewMode === 'cards' ? (
          <PromptCardsView
            prompts={mockPrompts}
            onCopy={handleCopy}
            copiedId={copiedId}
            onCardClick={handleCardClick}
          />
        ) : (
          <PromptTableView
            prompts={mockPrompts}
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

      <SavePromptDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} />
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