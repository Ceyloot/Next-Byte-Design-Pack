import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Code, Copy, Check, X, Terminal, FileCode, Layers, Sparkles } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export interface CodeSnippet {
  id: string
  title: string
  category: string
  description?: string
  tsx: string
  css?: string
  importPath?: string
}

export const PRESET_SNIPPETS: CodeSnippet[] = [
  {
    id: 'button',
    title: 'Przyciski (Button & GlassButton)',
    category: 'Akcje',
    description: 'Przyciski wspierające 8 wariantów z pełną obsługą trybu Liquid Glass oraz motywów HSL.',
    importPath: "import { Button } from '@/components/ui/button'\nimport { GlassButton } from '@/components/glass'",
    tsx: `<div className="flex flex-wrap items-center gap-3">
  {/* Standardowy Przycisk NextByte */}
  <Button variant="nextbyte"><Sparkles className="h-4 w-4 mr-2" />Akcja NextByte</Button>
  <Button variant="glass">Glass</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  
  {/* Adaptacyjny Przycisk Szkła (GlassButton) */}
  <GlassButton variant="primary">Primary Glass</GlassButton>
  <GlassButton variant="danger">Danger Glass</GlassButton>
</div>`,
    css: `.nb-glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`
  },
  {
    id: 'tile',
    title: 'Kafelek (Tile)',
    category: 'Karty',
    description: 'Elastyczny kontener kafelkowy z intencjami (neutralna, akcent, krytyczna), elewacją i wierszami.',
    importPath: "import { Tile, TileHeader, TileRow, TilePill, TileAction } from '@/components/Tile'",
    tsx: `<Tile intencja="akcent" elewacja="sm">
  <TileHeader 
    tytul="Wskaźnik Wydajności" 
    podtytul="Aktualne obciążenie węzłów" 
    status="Aktywny"
  />
  <TileRow label="Przepustowość" wartosc="1.4 GB/s" />
  <TileRow label="Opóźnienie" wartosc="12 ms" pillText="Optymalne" pillVariant="sukces" />
  <div className="mt-4 flex gap-2">
    <TileAction wariant="glowna">Zarządzaj</TileAction>
    <TileAction wariant="cicha">Logi</TileAction>
  </div>
</Tile>`,
  },
  {
    id: 'glass-card',
    title: 'Karta Szklana (GlassCard)',
    category: 'Karty',
    description: 'Karta z efektem rozmycia szkła, poświatą przy najechaniu i krawędzią refleksyjną.',
    importPath: "import { GlassCard } from '@/components/glass'",
    tsx: `<GlassCard className="p-6 space-y-4 hover:border-primary/50 transition-all">
  <div className="flex items-center justify-between">
    <h4 className="font-semibold text-foreground">Analiza Sieciowa</h4>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">LIVE</span>
  </div>
  <p className="text-xs text-muted-foreground">
    Automatyczny monitoring ruchu pakietowego z filtrowaniem HSL.
  </p>
</GlassCard>`,
  },
  {
    id: 'backgrounds',
    title: 'Wzory Tła (Background Grid / Dots / Plus)',
    category: 'Dekoracje',
    description: 'Wzory svg dla zaawansowanych teł technicznych.',
    importPath: "import { BackgroundGrid, BackgroundDots, BackgroundPlus } from '@/components/ui/background-patterns'",
    tsx: `<div className="relative h-48 w-full rounded-xl overflow-hidden border border-border">
  <BackgroundGrid opacity={0.15} size={32} />
  <div className="relative z-10 p-6">
    <h3 className="text-lg font-bold">Tło z siatką techniczną</h3>
  </div>
</div>`,
  },
  {
    id: 'theme-vars',
    title: 'Kontrakt 22 Zmiennych CSS (Motywy)',
    category: 'Motywy',
    description: 'Wszystkie zmienne kontraktu HSL do wklejenia w Twój plik CSS.',
    importPath: "/* Importuj motywy.css lub wklej do index.css */",
    tsx: `/* Przykład motywu ciemnego */
:root {
  --background: 0 0% 2%;
  --foreground: 0 0% 96%;
  --card: 0 0% 3%;
  --card-foreground: 0 0% 96%;
  --popover: 0 0% 4%;
  --popover-foreground: 0 0% 96%;
  --primary: 204 91% 70%;
  --primary-foreground: 0 0% 2%;
  --secondary: 0 0% 9%;
  --secondary-foreground: 0 0% 96%;
  --accent: 0 0% 12%;
  --accent-foreground: 0 0% 96%;
  --muted: 0 0% 10%;
  --muted-foreground: 0 0% 67%;
  --border: 0 0% 10%;
  --input: 0 0% 12%;
  --ring: 204 91% 70%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --brand-primary: 204 91% 70%;
  --brand-primary-light: 204 91% 85%;
  --brand-primary-dark: 204 91% 55%;
}`,
    css: `/* Tailwind configuration */
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
  border: 'hsl(var(--border))',
}`
  }
]

interface CodeExporterModalProps {
  isOpen: boolean
  onClose: () => void
  initialSnippetId?: string
  customSnippet?: CodeSnippet
}

export function CodeExporterModal({ isOpen, onClose, initialSnippetId = 'button', customSnippet }: CodeExporterModalProps) {
  const [selectedId, setSelectedId] = useState<string>(initialSnippetId)
  const [activeTab, setActiveTab] = useState<'tsx' | 'imports' | 'css'>('tsx')
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  const currentSnippet = customSnippet || PRESET_SNIPPETS.find(s => s.id === selectedId) || PRESET_SNIPPETS[0]

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`Skopiowano ${label} do schowka!`)
    setTimeout(() => setCopied(false), 2000)
  }

  const getActiveCode = () => {
    if (activeTab === 'imports') return currentSnippet.importPath || '// Brak dodatkowych importów'
    if (activeTab === 'css') return currentSnippet.css || `/* Używa standardowych klas Tailwinda & zmiennych HSL */`
    return currentSnippet.tsx
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl h-[540px] max-h-[85vh] min-h-[360px] bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Kopiarka Kodu i Eksport TSX
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono border border-primary/20">
                  NextByte UI
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">Kopiuj czysty kod gotowy do wklejenia w React / Tailwind</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Sidebar Selectors */}
          {!customSnippet && (
            <div className="w-full md:w-64 border-r border-border/60 bg-card/50 p-3 space-y-1 overflow-y-auto shrink-0 min-h-0">
              <div className="px-2 py-1.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                Komponenty & Motywy
              </div>
              {PRESET_SNIPPETS.map(snippet => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedId(snippet.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between',
                    selectedId === snippet.id
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  )}
                >
                  <span className="truncate">{snippet.title}</span>
                  <span className="text-[9px] opacity-70 border border-current/20 px-1.5 py-0.2 rounded shrink-0">
                    {snippet.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col p-4 bg-background/80 overflow-hidden min-h-0 min-w-0">
            {/* Component Meta info */}
            <div className="mb-3 shrink-0">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> {currentSnippet.title}
              </h4>
              {currentSnippet.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{currentSnippet.description}</p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('tsx')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
                    activeTab === 'tsx' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FileCode className="h-3.5 w-3.5" /> TSX Component
                </button>

                <button
                  onClick={() => setActiveTab('imports')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
                    activeTab === 'imports' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Terminal className="h-3.5 w-3.5" /> Importy
                </button>

                {currentSnippet.css && (
                  <button
                    onClick={() => setActiveTab('css')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors',
                      activeTab === 'css' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Layers className="h-3.5 w-3.5" /> CSS / Tailwind
                  </button>
                )}
              </div>

              <button
                onClick={() => handleCopy(getActiveCode(), activeTab.toUpperCase())}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 transition-all shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj Kod'}
              </button>
            </div>

            {/* Code Box */}
            <div className="flex-1 mt-3 bg-zinc-950/90 border border-border/80 rounded-xl p-4 overflow-auto font-mono text-xs text-zinc-100 leading-relaxed shadow-inner min-h-0">
              <pre className="m-0">
                <code>{getActiveCode()}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>💡 Wszystkie komponenty spełniają kontrakt 22 zmiennych HSL.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold text-xs transition-colors"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export function CodeCopyButton({ snippetId, className, label = 'Kod TSX' }: { snippetId: string; className?: string; label?: string }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm',
          'border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60',
          className
        )}
        title="Otwórz podgląd kodu TSX"
      >
        <Code className="h-3.5 w-3.5" />
        <span>{label}</span>
      </button>

      <CodeExporterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialSnippetId={snippetId}
      />
    </>
  )
}
