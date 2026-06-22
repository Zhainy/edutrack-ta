import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/shared/ui/toast';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      {children}
      <Toaster />
    </BrowserRouter>
  );
}
