import React, { createContext, useContext, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Code, Copy, Check, Eye, Sparkles, Terminal, FileCode, Layers, X, MousePointer } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

export interface ComponentInspectData {
  title: string
  category?: string
  description?: string
  tsx: string
  css?: string
  importPath?: string
  previewNode?: React.ReactNode
}

interface Position {
  x: number
  y: number
}

interface InspectContextType {
  openContextMenu: (e: React.MouseEvent, data: ComponentInspectData) => void
  openInspectorModal: (data: ComponentInspectData) => void
}

const InspectContext = createContext<InspectContextType | null>(null)

export function useInspector() {
  const ctx = useContext(InspectContext)
  if (!ctx) {
    throw new Error('useInspector must be used within an InspectorProvider')
  }
  return ctx
}

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [contextMenuPos, setContextMenuPos] = useState<Position | null>(null)
  const [inspectData, setInspectData] = useState<ComponentInspectData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'tsx' | 'imports' | 'css'>('preview')
  const [copied, setCopied] = useState(false)

  // Zamknij menu kontekstowe po kliknięciu poza nim
  useEffect(() => {
    const handleClick = () => setContextMenuPos(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Globalny interceptor prawego przycisku myszy — blokuje domyślne menu przeglądarki i pokazuje customowe menu
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Jeśli kliknięto wewnątrz elementu z własnym Inspectable, zostaw (Inspectable załatwi e.stopPropagation)
      if (target.closest('.nb-inspectable')) return

      // W przeciwnym razie zapobiegamy otwarciu domyślnego menu przeglądarki i generujemy menu inteligentne
      e.preventDefault()

      // Wyciągamy nagłówek lub nazwę najbliższego elementu
      const cardParent = target.closest('.bg-card, .nb-glass, button, section')
      const heading = cardParent?.querySelector('h1, h2, h3, h4, p, span')?.textContent?.slice(0, 30) || 'Komponent UI'

      const outerHTML = cardParent?.outerHTML || target.outerHTML || '<div>Komponent</div>'
      const cleanTsx = outerHTML.length > 400 ? outerHTML.slice(0, 400) + '\n  /* ... */\n</div>' : outerHTML

      setInspectData({
        title: heading,
        category: 'Wyryty Element',
        description: 'Auto-wykryty komponent ze struktury DOM.',
        tsx: cleanTsx,
        importPath: "import { GlassCard, Button } from '@/components/glass'",
        css: `/* Zmienne CSS aktualnego motywu HSL */\n--background: var(--background);\n--primary: var(--primary);`,
      })
      setContextMenuPos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('contextmenu', handleGlobalContextMenu)
    return () => window.removeEventListener('contextmenu', handleGlobalContextMenu)
  }, [])

  const openContextMenu = (e: React.MouseEvent, data: ComponentInspectData) => {
    e.preventDefault()
    e.stopPropagation()
    setInspectData(data)
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }

  const openInspectorModal = (data: ComponentInspectData) => {
    setInspectData(data)
    setContextMenuPos(null)
    setModalOpen(true)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Skopiowano ${label} do schowka!`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <InspectContext.Provider value={{ openContextMenu, openInspectorModal }}>
      {children}

      {/* ── CONTEXT MENU PORTAL ── */}
      {contextMenuPos && inspectData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] min-w-[230px] bg-card/95 border border-border/80 rounded-xl shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 text-xs"
          style={{
            left: Math.min(contextMenuPos.x, window.innerWidth - 250),
            top: Math.min(contextMenuPos.y, window.innerHeight - 220),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/50 font-semibold text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{inspectData.title}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              NextByte
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {/* Action 1: Fast Copy TSX */}
            <button
              onClick={() => {
                handleCopy(inspectData.tsx, 'kod TSX')
                setContextMenuPos(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors text-left font-medium"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Kopiuj kod TSX</span>
            </button>

            {/* Action 2: Open Modal with Live Preview */}
            <button
              onClick={() => {
                setContextMenuPos(null)
                setModalOpen(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors text-left font-medium"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-400" />
              <span>Podgląd i Inspekcja Komponentu</span>
            </button>

            {/* Action 3: Copy Imports */}
            {inspectData.importPath && (
              <button
                onClick={() => {
                  handleCopy(inspectData.importPath!, 'importy')
                  setContextMenuPos(null)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors text-left font-medium"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Kopiuj importy</span>
              </button>
            )}

            {/* Action 4: Copy HSL Vars */}
            <button
              onClick={() => {
                const hslVars = `--primary: ${getComputedStyle(document.documentElement).getPropertyValue('--primary')};\n--background: ${getComputedStyle(document.documentElement).getPropertyValue('--background')};`
                handleCopy(hslVars, 'zmienne HSL motywu')
                setContextMenuPos(null)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-primary/20 hover:text-primary transition-colors text-left font-medium"
            >
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Kopiuj zmienne HSL</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── INSPECTOR MODAL PORTAL ── */}
      {modalOpen && inspectData && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[580px] max-h-[85vh] min-h-[380px] bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[100000]"
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
                    {inspectData.title}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono border border-primary/20">
                      {inspectData.category || 'Komponent'}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Podgląd na żywo oraz kod źródłowy komponentu</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-border/50 bg-card/40 shrink-0">
              <div className="flex items-center gap-1">
                {inspectData.previewNode && (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      activeTab === 'preview' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" /> Podgląd Live
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('tsx')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    activeTab === 'tsx' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FileCode className="h-3.5 w-3.5" /> Kod TSX
                </button>
                <button
                  onClick={() => setActiveTab('imports')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    activeTab === 'imports' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Terminal className="h-3.5 w-3.5" /> Importy
                </button>
                {inspectData.css && (
                  <button
                    onClick={() => setActiveTab('css')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      activeTab === 'css' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Layers className="h-3.5 w-3.5" /> CSS / HSL
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  const text = activeTab === 'imports' ? inspectData.importPath || '' : activeTab === 'css' ? inspectData.css || '' : inspectData.tsx
                  handleCopy(text, activeTab.toUpperCase())
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:bg-primary/90 transition-all shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj Aktywny Kod'}
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 bg-background/80 overflow-auto min-h-0">
              {activeTab === 'preview' && inspectData.previewNode ? (
                <div className="h-full flex items-center justify-center p-8 border border-dashed border-border/80 rounded-xl bg-card/40 overflow-auto">
                  {inspectData.previewNode}
                </div>
              ) : (
                <div className="h-full bg-zinc-950/90 border border-border/80 rounded-xl p-4 overflow-auto font-mono text-xs text-zinc-100 leading-relaxed shadow-inner">
                  <pre className="m-0">
                    <code>
                      {activeTab === 'imports'
                        ? inspectData.importPath || '// Brak dodatkowych importów'
                        : activeTab === 'css'
                        ? inspectData.css || '/* Zmienne CSS HSL z motywy.css */'
                        : inspectData.tsx}
                    </code>
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border/60 bg-muted/10 flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5">
                <MousePointer className="h-3.5 w-3.5 text-primary" />Kliknij prawym przyciskiem myszy na dowolny wskaźnik, aby otworzyć podręczne menu.
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground font-semibold text-xs transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </InspectContext.Provider>
  )
}

/**
 * Inspectable Component Wrapper
 * Wrap any component in <Inspectable> to enable right-click inspect & copy functionality!
 */
export function Inspectable({
  title,
  category,
  description,
  tsx,
  css,
  importPath,
  children,
  className,
}: {
  title: string
  category?: string
  description?: string
  tsx: string
  css?: string
  importPath?: string
  children: React.ReactNode
  className?: string
}) {
  const { openContextMenu } = useInspector()

  return (
    <div
      onContextMenu={(e) =>
        openContextMenu(e, {
          title,
          category,
          description,
          tsx,
          css,
          importPath,
          previewNode: children,
        })
      }
      className={cn(
        'nb-inspectable group relative transition-all rounded-lg hover:ring-1 hover:ring-primary/40 hover:ring-dashed cursor-context-menu',
        className
      )}
      title="Kliknij prawym przyciskiem myszy, aby skopiować kod"
    >
      {children}
      <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-sans pointer-events-none z-10 shadow-sm">
        Prawy przycisk = Kod
      </span>
    </div>
  )
}
