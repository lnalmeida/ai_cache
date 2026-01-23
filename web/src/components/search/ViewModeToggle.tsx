import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  promptsCount: number;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  setViewMode,
  promptsCount,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-muted-foreground text-sm">
        {promptsCount} prompts encontrados
      </div>
      <div className="flex items-center gap-2 border rounded-lg p-1">
        <Button
          onClick={() => setViewMode('cards')}
          variant={viewMode === 'cards' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8"
        >
          <Grid className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setViewMode('table')}
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};