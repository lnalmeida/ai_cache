import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PWAInstallButton: React.FC = () => {
  // TODO: Implementar lógica de instalação PWA
  const handleInstall = () => {
    console.log('Install PWA');
  };

  return (
    <Button
      onClick={handleInstall}
      size="icon"
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg h-14 w-14"
    >
      <Download className="h-6 w-6" />
    </Button>
  );
};