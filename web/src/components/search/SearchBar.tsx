
import React, { useState } from 'react';
import { Search, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSaveClick: () => void;
  onSearch?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSaveClick, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="mb-8 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="tailwind table responsive..."
              className="pl-14 pr-4 py-6 text-lg"
            />
          </div>
          <Button size="lg" className="px-8" onClick={handleSearch}>
            Buscar
          </Button>
          <Button
            onClick={onSaveClick}
            variant="secondary"
            size="lg"
            className="px-8 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Novo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};