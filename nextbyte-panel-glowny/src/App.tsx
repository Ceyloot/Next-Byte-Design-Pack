import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import { EncryptionProvider } from '@/contexts/EncryptionContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GlobalDialogsProvider } from '@/contexts/GlobalDialogsContext';
import { GlobalSidebarProvider } from '@/contexts/SidebarContext';
import { NavigationModeProvider } from '@/contexts/NavigationModeContext';
import { PanicModeProvider } from '@/contexts/PanicModeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { DefinicjeSzklaPlynnego } from '@/components/ui/szklo-plynne';
import { AppShell } from '@/components/AppShell';
import { UstawieniaWygladu } from '@/eksport/UstawieniaWygladu';
import { PozaEksportem } from '@/eksport/PozaEksportem';
import { ProbaMaterialu } from '@/eksport/ProbaMaterialu';

/**
 * Panel Główny platformy NextByte (`/panel-glowny`) razem z powłoką —
 * paskiem bocznym, nawigacją i tłem — w motywie ciemnym i jasnym.
 * Dostawcy w tej samej kolejności co `App.tsx` platformy, bez modułów,
 * których panel nie używa.
 */
const Dashboard = lazy(() => import('@/pages/Dashboard'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const Ladowanie = () => <div className="p-8 text-sm text-muted-foreground">Ładowanie…</div>;

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <EncryptionProvider>
              <SubscriptionProvider>
                <GlobalDialogsProvider>
                  <TooltipProvider>
                    <DefinicjeSzklaPlynnego />
                    <Toaster />
                    <Sonner />
                    <UstawieniaWygladu />
                    <GlobalSidebarProvider>
                      <NavigationModeProvider>
                        <PanicModeProvider>
                          <Routes>
                            {/* Podgląd materiału — POZA bramką, bo panel bez
                                konta się nie wyświetli, a materiał trzeba widzieć. */}
                            <Route path="/proba-materialu" element={<ProbaMaterialu />} />
                            <Route path="*" element={
                            <Routes>
                              <Route path="/" element={<Navigate to="/panel-glowny" replace />} />
                              <Route
                                path="/panel-glowny"
                                element={
                                  <AppShell>
                                    <Suspense fallback={<Ladowanie />}>
                                      <Dashboard />
                                    </Suspense>
                                  </AppShell>
                                }
                              />
                              {/* Reszta menu prowadzi do modułów spoza paczki. */}
                              <Route path="*" element={<AppShell><PozaEksportem /></AppShell>} />
                            </Routes>
                            } />
                          </Routes>
                        </PanicModeProvider>
                      </NavigationModeProvider>
                    </GlobalSidebarProvider>
                  </TooltipProvider>
                </GlobalDialogsProvider>
              </SubscriptionProvider>
            </EncryptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
