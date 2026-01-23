import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-lg px-4 py-3 flex items-center gap-2 text-green-200 animate-in slide-in-from-top">
      <Check className="w-5 h-5" />
      {message}
    </div>
  );
};