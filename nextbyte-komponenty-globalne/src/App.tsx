import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConfirmProvider } from '@/components/ui/confirm-provider';
import { DefinicjeSzklaPlynnego } from '@/components/ui/szklo-plynne';
import { PlynnyKursorGlobalny } from '@/components/ui/plynny-kursor-globalny';
import { AuthProvider } from '@/contexts/AuthContext';
import { useKomponentyGlobalne } from '@/hooks/useKomponentyGlobalne';
import { BibliotekaTab } from '@/components/management/biblioteka/BibliotekaTab';
import { nalozMotyw, motywZPamieci, type NazwaMotywu } from '@/eksport/motyw';

const queryClient = new QueryClient();

/**
 * Strona startowa paczki = Zarząd → „Biblioteka komponentów NextByte"
 * (ten sam `BibliotekaTab`), bez reszty Panelu Zarządu, z przełącznikiem motywu.
 * Korzeń montuje to samo co platforma: definicje szkła, karetkę, tosty, potwierdzenia.
 */
const PrzelacznikMotywu: React.FC<{ motyw: NazwaMotywu; zmien: (m: NazwaMotywu) => void }> = ({ motyw, zmien }) => {
  const jasny = motyw === 'nextbyte-light';
  return (
    <button
      type="button"
      onClick={() => zmien(jasny ? 'dark-theme' : 'nextbyte-light')}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-muted"
      aria-label={jasny ? 'Włącz ciemny motyw' : 'Włącz jasny motyw'}
    >
      {jasny ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {jasny ? 'Ciemny' : 'Jasny'}
    </button>
  );
};

const Strona: React.FC = () => {
  useKomponentyGlobalne();
  const [motyw, setMotyw] = useState<NazwaMotywu>(motywZPamieci);
  useEffect(() => { nalozMotyw(motyw); }, [motyw]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">NextByte — komponenty globalne</p>
            <p className="truncate text-xs text-muted-foreground">Biblioteka z Panelu Zarządu, bez backendu</p>
          </div>
          <div className="ml-auto">
            <PrzelacznikMotywu motyw={motyw} zmien={setMotyw} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <BibliotekaTab />
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <TooltipProvider>
            <DefinicjeSzklaPlynnego />
            <Toaster />
            <Sonner />
            <PlynnyKursorGlobalny />
            <Strona />
          </TooltipProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
