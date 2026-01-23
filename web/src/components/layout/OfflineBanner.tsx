import React from 'react';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OfflineBannerProps {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-500/10 border-amber-500/20">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-amber-200">
        Modo offline ativo - Sincronizará quando voltar online
      </AlertDescription>
    </Alert>
  );
};
