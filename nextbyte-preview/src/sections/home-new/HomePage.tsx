import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ArrowRight, Play, Check, ChevronDown, Sparkles, Coins, Shield,
  Zap, CircleCheck, Minus, Quote,
  Brain, Camera, NotebookPen, Workflow, Cpu, Calendar, Rocket,
  Users, Star, Clock, Lock, Layers, Gauge, CpuIcon, Activity, FileText,
  KeyRound, Mic, Bot, Repeat, CheckCircle2,
} from 'lucide-react'
import {
  Section, Eyebrow, GlowButton, GhostButton,
  Panel, IconTile, StepNumber, Stars, Glow,
  HairLine, AKCENT, akcentTlo, AnimStyles, FadeIn,
} from './shared'
import {
  MODULY, KROKI, POROWNANIE, PLANY, OPINIE, FAQ, LOGOTYPY,
  TECH_PARTNERZY, WARTOSCI_FILARY, STATY,
} from './data'
import type { HomePage as HomePageId } from './types'

// Real photorealistic studio image assets
import interiorImg from '@/assets/studio/interior.jpg'
import carImg from '@/assets/studio/car.jpg'
import landscapeImg from '@/assets/studio/landscape.jpg'
import animalImg from '@/assets/studio/animal.jpg'

/* ------------------------------------------------------------------
   1. SCREEN 2 INSPIRATION: 3D CONCENTRIC LAYERED ARCH SPHERE
   ------------------------------------------------------------------ */
function LayeredArchSphereGraphic() {
  return (
    <div className="relative mx-auto flex h-[320px] w-full max-w-[340px] items-center justify-center overflow-hidden rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-[0_0_80px_-20px_hsl(var(--primary)/0.3)]">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25)_0%,transparent_70%)] animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      
      <div className="relative flex flex-col items-center gap-1.5 py-6">
        {[
          { w: 120, h: 12, opacity: 0.9, glow: true },
          { w: 160, h: 14, opacity: 0.85, glow: false },
          { w: 195, h: 16, opacity: 0.8, glow: false },
          { w: 220, h: 18, opacity: 0.75, glow: false },
          { w: 240, h: 20, opacity: 0.7, glow: false },
          { w: 250, h: 22, opacity: 0.65, glow: false },
          { w: 255, h: 24, opacity: 0.6, glow: false },
          { w: 250, h: 22, opacity: 0.5, glow: false },
          { w: 235, h: 18, opacity: 0.4, glow: false },
          { w: 170, h: 10, opacity: 0.2, glow: false },
        ].map((slice, idx) => (
          <div
            key={idx}
            className="rounded-full transition-all duration-500 hover:scale-105"
            style={{
              width: slice.w,
              height: slice.h,
              background: `linear-gradient(90deg, transparent 5%, hsl(var(--primary)/${slice.opacity}) 50%, transparent 95%)`,
              boxShadow: slice.glow ? '0 0 25px hsl(var(--primary))' : `0 0 10px hsl(var(--primary)/${slice.opacity * 0.4})`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/50 bg-background/80 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.6)] backdrop-blur-md transition-transform hover:scale-110">
          <Sparkles className="h-6 w-6" />
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   2. SCREEN 2 INSPIRATION: GIANT ATMOSPHERIC HEMISPHERE ARCH
   ------------------------------------------------------------------ */
function HemisphereArchSection() {
  return (
    <div className="relative py-20 text-center font-sans">
      {/* Płynna, miękka kopuła świetlna — zero ostrych odcięć */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -top-12 -translate-x-1/2 w-full max-w-5xl h-[380px] flex items-center justify-center overflow-visible"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 60%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 60%, black 30%, transparent 80%)',
        }}
      >
        {/* Wewnętrzny miękki glow */}
        <div
          className="absolute w-[800px] h-[340px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25)_0%,hsl(var(--primary)/0.05)_50%,transparent_75%)] blur-2xl"
        />
        
        {/* Płynny łuk wektorowy SVG z gradientem wygaszania na krawędziach */}
        <svg
          viewBox="0 0 1000 350"
          className="relative w-full h-full opacity-70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="archGlow" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="25%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
              <stop offset="75%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 50 330 C 200 60, 800 60, 950 330"
            stroke="url(#archGlow)"
            strokeWidth="1.75"
            filter="url(#softGlow)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4">
        <Eyebrow icon={Activity} className="mb-4 font-mono text-[10px] tracking-[3px] uppercase">
          Wydajność bez kompromisów
        </Eyebrow>

        <h2 className="font-heading text-[clamp(32px,5vw,56px)] font-light leading-[1.08] tracking-[-2px] text-foreground mb-4">
          Inteligentna analityka i modele AI<br />
          <span className="text-primary font-normal drop-shadow-[0_0_36px_hsl(var(--primary)/0.45)]">
            w czasie rzeczywistym.
          </span>
        </h2>

        <p className="mx-auto max-w-xl text-[15.5px] leading-relaxed text-foreground/60 mb-12 font-light">
          Jeden pulpit sterowania z natychmiastowym przełączaniem kontekstu, historią sesji i bezpośrednim dostępem do najnowszych modeli.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Activity, title: 'Dane w czasie rzeczywistym', desc: 'Bez opóźnień, z natychmiastowym strumieniowaniem odpowiedzi.' },
            { icon: Sparkles, title: 'Rekomendacje AI', desc: 'Precyzyjny dobór modelu pod konkretne zadanie biznesowe.' },
            { icon: Layers, title: 'Automatyczne notatki', desc: 'Kontekst rozmów automatycznie trafia do bazy wiedzy.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group flex flex-col items-center rounded-2xl border border-foreground/[0.08] bg-card/60 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:bg-card/90 hover:shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.25)]"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-landing text-[16px] font-bold text-foreground mb-1.5">
                  {item.title}
                </h3>
                <p className="text-center text-[12.5px] leading-relaxed text-foreground/50">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   3. HERO COMMAND APP MOCKUP (AUTHENTIC NEXTBYTE PLATFORM LIVE DEMO)
   ------------------------------------------------------------------ */
/* ------------------------------------------------------------------
   2.5. KANBAN TASKS VIEW (REAL HTML5 DRAG & DROP & UNIVERSAL TASKS)
   ------------------------------------------------------------------ */
function KanbanTasksView({
  tasks,
  setTasks,
  moveTask,
}: {
  tasks: { [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }
  setTasks: React.Dispatch<React.SetStateAction<{ [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }>>
  moveTask: (fromCol: string, toCol: string, taskId: string) => void
}) {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [sprintDropdownOpen, setSprintDropdownOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('Wszystkie zadania')
  const [selectedSprint, setSelectedSprint] = useState('Sprint 42 (Bieżący)')
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const addNewTask = () => {
    const id = Date.now().toString()
    setTasks(prev => ({
      ...prev,
      todo: [
        {
          id,
          title: `Nowe zadanie z asystenta AI #${prev.todo.length + 1}`,
          tag: 'Normalny',
          tagColor: 'bg-primary/15 text-primary border-primary/30',
          author: 'Artur B.',
        },
        ...prev.todo,
      ],
    }))
  }

  const changePriority = (colId: string, taskId: string, tag: string, tagColor: string) => {
    setTasks(prev => ({
      ...prev,
      [colId]: prev[colId].map(t => (t.id === taskId ? { ...t, tag, tagColor } : t)),
    }))
    setActiveCardMenuId(null)
  }

  const deleteTask = (colId: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [colId]: prev[colId].filter(t => t.id !== taskId),
    }))
    setActiveCardMenuId(null)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceCol: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('sourceCol', sourceCol)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  const handleDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = e.dataTransfer.getData('taskId')
    const sourceCol = e.dataTransfer.getData('sourceCol')
    if (taskId && sourceCol && sourceCol !== targetCol) {
      moveTask(sourceCol, targetCol, taskId)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
      {/* Kanban Interactive Toolbar & Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* DROPDOWN 1: FILTR ZADAŃ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setFilterDropdownOpen(!filterDropdownOpen)
                setSprintDropdownOpen(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-sm"
            >
              <span className="text-primary font-bold">⚡ Widok:</span>
              <span>{selectedFilter}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                  filterDropdownOpen && 'rotate-180 text-primary'
                )}
              />
            </button>

            {filterDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                {['Wszystkie zadania', 'Tylko z Chat AI', 'Pilne priorytety', 'Studio Grafiki'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(opt)
                      setFilterDropdownOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      selectedFilter === opt
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                    )}
                  >
                    <span>{opt}</span>
                    {selectedFilter === opt && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DROPDOWN 2: SPRINT & PROJEKTY */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setSprintDropdownOpen(!sprintDropdownOpen)
                setFilterDropdownOpen(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 hover:border-primary/40 transition-all shadow-sm"
            >
              <span className="text-muted-foreground">Sprint:</span>
              <span>{selectedSprint}</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                  sprintDropdownOpen && 'rotate-180 text-primary'
                )}
              />
            </button>

            {sprintDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                {['Sprint 42 (Bieżący)', 'Sprint 43 (Planowany)', 'Kampania B2B NextByte', 'Archiwum'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSprint(s)
                      setSprintDropdownOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      selectedSprint === s
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                    )}
                  >
                    <span>{s}</span>
                    {selectedSprint === s && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Button */}
        <button
          type="button"
          onClick={addNewTask}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary hover:bg-primary/25 transition-all shadow-sm active:scale-95"
        >
          <span>+ Nowe zadanie</span>
        </button>
      </div>

      {/* 4 Kanban Columns with HTML5 Drag & Drop Support */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-1">
        {[
          { id: 'todo', title: 'Do zrobienia', count: tasks.todo.length, nextCol: 'inProgress' },
          { id: 'inProgress', title: 'W trakcie', count: tasks.inProgress.length, nextCol: 'review' },
          { id: 'review', title: 'Do sprawdzenia', count: tasks.review.length, nextCol: 'done' },
          { id: 'done', title: 'Gotowe', count: tasks.done.length, nextCol: 'todo' },
        ].map(col => {
          const isOver = dragOverCol === col.id
          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
              className={cn(
                'flex flex-col rounded-xl border p-3 min-h-[190px] relative transition-all duration-200',
                isOver
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.25)] scale-[1.01]'
                  : 'border-primary/20 bg-card/50'
              )}
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2">
                <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full', col.id === 'done' ? 'bg-emerald-400' : col.id === 'inProgress' ? 'bg-primary' : 'bg-foreground/40')} />
                  {col.title}
                </span>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.2 text-[10px] font-mono text-primary font-bold">
                  {col.count}
                </span>
              </div>

              <div className="flex-1 space-y-2">
                {tasks[col.id]?.map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={e => handleDragStart(e, t.id, col.id)}
                    className="group relative rounded-xl border border-border/40 bg-card/90 p-3 transition-all hover:border-primary/50 hover:bg-card shadow-sm cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="text-[12px] font-medium text-foreground leading-snug">{t.title}</p>

                      {/* Action Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            setActiveCardMenuId(activeCardMenuId === t.id ? null : t.id)
                          }}
                          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors"
                        >
                          ···
                        </button>

                        {/* DROPDOWN: CARD CONTEXT ACTIONS */}
                        {activeCardMenuId === t.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                            <p className="px-2 py-1 text-[9.5px] font-mono uppercase text-muted-foreground/60 border-b border-border/20">
                              Przenieś kolumnę:
                            </p>
                            {[
                              { id: 'todo', name: 'Do zrobienia' },
                              { id: 'inProgress', name: 'W trakcie' },
                              { id: 'review', name: 'Do sprawdzenia' },
                              { id: 'done', name: 'Gotowe' },
                            ]
                              .filter(c => c.id !== col.id)
                              .map(target => (
                                <button
                                  key={target.id}
                                  type="button"
                                  onClick={() => {
                                    moveTask(col.id, target.id, t.id)
                                    setActiveCardMenuId(null)
                                  }}
                                  className="w-full text-left px-2 py-1 text-[11px] text-foreground/80 hover:bg-primary/15 hover:text-primary rounded-md transition-colors"
                                >
                                  ↓ {target.name}
                                </button>
                              ))}

                            <p className="px-2 pt-2 pb-1 text-[9.5px] font-mono uppercase text-muted-foreground/60 border-t border-border/20 mt-1">
                              Priorytet:
                            </p>
                            <div className="flex gap-1 px-1">
                              <button
                                type="button"
                                onClick={() =>
                                  changePriority(
                                    col.id,
                                    t.id,
                                    'Pilny',
                                    'bg-destructive/15 text-destructive border-destructive/30'
                                  )
                                }
                                className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
                              >
                                Pilny
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  changePriority(
                                    col.id,
                                    t.id,
                                    'Normalny',
                                    'bg-primary/15 text-primary border-primary/30'
                                  )
                                }
                                className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                              >
                                Normalny
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteTask(col.id, t.id)}
                              className="w-full text-left px-2 py-1 mt-1 text-[10.5px] text-destructive hover:bg-destructive/15 rounded-md transition-colors"
                            >
                              Usuń zadanie
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-foreground/[0.04] mt-1">
                      <span className={cn('rounded-full border px-2 py-0.2 text-[9.5px] font-bold', t.tagColor)}>
                        {t.tag}
                      </span>
                      <span className="text-[9.5px] font-mono text-muted-foreground">
                        {t.author}
                      </span>
                    </div>
                  </div>
                ))}

                {tasks[col.id]?.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-7 text-[11.5px] text-muted-foreground/40 border border-dashed border-border/20 rounded-xl">
                    <span className="text-sm opacity-40 mb-1">◻</span>
                    <span>Upuść zadanie tutaj</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Drag & Drop Helper */}
      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="text-primary font-bold">📸 Drag &amp; Drop:</span>
          <span>Chwyć dowolną kartę i przeciągnij ją pomiędzy kolumnami lub kliknij menu ··· aby zmienić stan.</span>
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
   3. HERO COMMAND APP MOCKUP (AUTHENTIC NEXTBYTE PLATFORM LIVE DEMO)
   ------------------------------------------------------------------ */
function HeroAppMockup() {
  const [activeTab, setActiveTab] = useState<'chat' | 'studio' | 'tasks'>('chat')
  const [selectedModel, setSelectedModel] = useState('gpt5')
  const [promptInput, setPromptInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [bytesUsed, setBytesUsed] = useState(74)
  const [studioSubTab, setStudioSubTab] = useState('gpt2')
  const [webSearchEnabled, setWebSearchEnabled] = useState(true)
  const [docsModeEnabled, setDocsModeEnabled] = useState(false)
  const [imagesModeEnabled, setImagesModeEnabled] = useState(false)

  // Universal realistic Kanban tasks
  const [tasks, setTasks] = useState<{ [col: string]: Array<{ id: string; title: string; tag: string; tagColor: string; author: string }> }>({
    todo: [
      {
        id: '1',
        title: 'Przygotować brief pod nową kampanię B2B w LinkedIn',
        tag: 'Normalny',
        tagColor: 'bg-primary/15 text-primary border-primary/30',
        author: 'Artur B.',
      },
      {
        id: '2',
        title: 'Research modeli LLM pod analizę dokumentacji prawnej',
        tag: 'Ważny',
        tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        author: 'AI Agent',
      },
    ],
    inProgress: [
      {
        id: '3',
        title: 'Generowanie 4 wariantów grafik 4K w Studio Zdjęć',
        tag: 'Pilny',
        tagColor: 'bg-destructive/15 text-destructive border-destructive/30',
        author: 'Studio AI',
      },
    ],
    review: [
      {
        id: '4',
        title: 'Audyt bezpieczeństwa danych i zgodności RODO',
        tag: 'Review',
        tagColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        author: 'Zarząd',
      },
    ],
    done: [
      {
        id: '5',
        title: 'Wdrożenie zintegrowanego ekosystemu NextByte',
        tag: 'Gotowe',
        tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        author: 'NextByte Team',
      },
    ],
  })

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string; details?: string[] }>>([
    {
      role: 'user',
      text: 'Stwórz opis oferty oraz przygotuj wariant grafiki do nowej kampanii produktowej.',
      time: '10:02',
    },
    {
      role: 'assistant',
      text: 'Przygotowano kompletny zestaw materiałów w 0,8 s:',
      time: '10:02',
      details: [
        '1. Zwięzły opis zoptymalizowany pod konwersję B2B.',
        '2. Wygenerowano 4 warianty grafik wysokiej rozdzielczości 4K w Studio Zdjęć.',
        '✓ Zapisano w Notatkach AI  ·  ✓ Zadanie przeniesione do Kanban',
      ],
    },
  ])

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

  const MODELS = [
    { id: 'gpt5', name: 'GPT-5', vendor: 'OpenAI', cost: 4, hint: '256k', tag: 'Flagship' },
    { id: 'claude-sonnet', name: 'Claude Sonnet 4', vendor: 'Anthropic', cost: 3, hint: '200k', tag: 'Kod & Logika' },
    { id: 'gemini-flash', name: 'Gemini 2.5 Flash', vendor: 'Google', cost: 1, hint: '1M tok', tag: 'Długi kontekst' },
    { id: 'grok4', name: 'Grok 4', vendor: 'xAI', cost: 3, hint: '128k', tag: 'Live Web' },
    { id: 'llama', name: 'Llama 4 Scout', vendor: 'Meta', cost: 0, hint: 'Offline / Ollama', tag: 'Bezpłatny' },
    { id: 'mistral', name: 'Mistral Large 3', vendor: 'Mistral', cost: 2, hint: '128k', tag: 'EU / RODO' },
  ]

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]


  const handleSend = (customPrompt?: string) => {
    const textToSend = customPrompt || promptInput
    if (!textToSend.trim() || isGenerating) return

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: textToSend, time: userTime }])
    setPromptInput('')
    setIsGenerating(true)

    // Deduct byte
    setBytesUsed(prev => prev + currentModel.cost)

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `[${currentModel.name}] Odpowiedź wygenerowana dla zapytania:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: [
            `· Opracowano trafną analizę dla "${textToSend.slice(0, 42)}...".`,
            `· Wynik zsynchronizowany z modułami Zadania i Notatki.`,
            `✓ Zużyto: ${currentModel.cost} Byte  ·  ✓ Tokeny: ~1.4k tok`,
          ],
        },
      ])
      setIsGenerating(false)
    }, 800)
  }

  const moveTask = (fromCol: string, toCol: string, taskId: string) => {
    const item = tasks[fromCol]?.find(t => t.id === taskId)
    if (!item) return
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
      [toCol]: [item, ...prev[toCol]],
    }))
  }

  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl font-sans text-foreground text-left">
      {/* Ambient glow behind workspace */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-b from-primary/30 via-primary/8 to-transparent opacity-80 blur-3xl"
      />

      <Panel glow className="relative overflow-hidden rounded-2xl border-primary/30 bg-card/95 shadow-[0_25px_90px_-20px_hsl(var(--primary)/0.4)]">
        {/* NextByte Real Top Navigation Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/70" />
              <span className="h-3 w-3 rounded-full bg-amber-500/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            </div>

            <div className="flex items-center gap-2 pl-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold text-xs shadow-sm">
                NB
              </span>
              <span className="font-heading font-semibold text-[13.5px] text-foreground tracking-tight">
                NextByte
              </span>
            </div>

            <span className="hidden sm:inline-block font-mono text-[11px] text-foreground/40 pl-2">
              nextbyte.space/{activeTab === 'chat' ? 'chat-ai' : activeTab === 'studio' ? 'studio-zdjec' : 'zadania'}
            </span>
          </div>

          {/* Module Switcher Pills (Real NextByte Tab Bar) */}
          <div className="flex rounded-full border border-primary/20 bg-background/50 p-1 backdrop-blur-md">
            {[
              { id: 'chat', label: 'Chat AI', icon: Brain },
              { id: 'studio', label: 'Studio Zdjęć', icon: Camera },
              { id: 'tasks', label: 'Zadania Kanban', icon: Layers },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all duration-200',
                    active
                      ? 'bg-primary text-background font-semibold shadow-md'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/[0.04]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

        </div>

        {/* Workspace Body */}
        <div className="min-h-[420px] bg-background/80 flex flex-col justify-between">
          {/* =========================================================================
              VIEW 1: REAL NEXTBYTE CHAT AI
              ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
              {/* Message Feed */}
              <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start gap-2.5 w-full',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border',
                          msg.role === 'user'
                            ? 'border-primary/40 bg-primary/20 text-primary'
                            : 'border-foreground/15 bg-card text-foreground'
                        )}
                      >
                        {msg.role === 'user' ? 'AB' : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      </span>
                    </div>

                    {/* Content Box */}
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[78%] flex flex-col',
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-sm font-sans',
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-card/60 border border-primary/40 text-foreground/95 shadow-[0_4px_20px_-6px_hsl(var(--primary)/0.2)]'
                            : 'rounded-tl-sm bg-card/70 border border-foreground/[0.08] text-foreground/90 font-light'
                        )}
                      >
                        <p>{msg.text}</p>
                        {msg.details && (
                          <div className="mt-2.5 space-y-1 text-[12px] text-foreground/75 pt-2 border-t border-foreground/[0.06]">
                            {msg.details.map((d, di) => (
                              <p key={di} className="leading-snug">
                                {d}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 px-1 pt-1 font-mono">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex items-center gap-2 text-primary font-mono text-[11px] animate-pulse py-1 pl-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{currentModel.name} odpowiada...</span>
                  </div>
                )}
              </div>

              {/* Real NextByte Chat Input Box */}
              <div className="mt-4 rounded-[1.5rem] border border-border/60 bg-card/70 p-2 shadow-xl focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] transition-all">
                {/* Top Toolbar: Streamlined Model Search Dropdown & Modifiers */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1.5 border-b border-border/20">
                  {/* MODEL SEARCH DROPDOWN TRIGGER */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[11.5px] font-medium text-foreground hover:bg-primary/25 hover:border-primary/60 transition-all shadow-sm group"
                    >
                      <Zap className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-foreground">{currentModel.name}</span>
                      <span className="font-mono text-[10px] text-primary/90 font-bold bg-primary/20 px-1.5 py-0.2 rounded-full">
                        ★ {currentModel.cost}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 text-muted-foreground transition-transform',
                          modelDropdownOpen && 'rotate-180 text-primary'
                        )}
                      />
                    </button>

                    {/* MODEL DROPDOWN — otwiera się W GÓRĘ */}
                    {modelDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-2 w-56 rounded-xl border border-primary/30 bg-card/98 p-1.5 shadow-2xl backdrop-blur-2xl z-50 font-sans">
                        {MODELS.map(m => {
                          const isSelected = selectedModel === m.id
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false) }}
                              className={cn(
                                'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-all',
                                isSelected
                                  ? 'bg-primary/15 text-primary'
                                  : 'text-foreground/75 hover:bg-foreground/[0.06] hover:text-foreground'
                              )}
                            >
                              <div>
                                <p className="text-[11.5px] font-semibold leading-tight">{m.name}</p>
                                <p className="text-[9.5px] text-muted-foreground font-mono">{m.vendor}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={cn('font-mono text-[10px] font-bold', m.cost === 0 ? 'text-emerald-400' : 'text-primary')}>
                                  {m.cost === 0 ? 'Free' : `★ ${m.cost}`}
                                </span>
                                {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modifiers (Dokumenty, Obrazy, WEB) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDocsModeEnabled(!docsModeEnabled)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all',
                        docsModeEnabled
                          ? 'border-primary/40 bg-primary/15 text-primary'
                          : 'border-border/20 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <FileText className="h-3 w-3" />
                      <span>Dokumenty</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagesModeEnabled(!imagesModeEnabled)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all',
                        imagesModeEnabled
                          ? 'border-primary/40 bg-primary/15 text-primary'
                          : 'border-border/20 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Camera className="h-3 w-3" />
                      <span>Obrazy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-all',
                        webSearchEnabled
                          ? 'border-primary/40 bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-bold shadow-sm'
                          : 'border-border/20 text-muted-foreground'
                      )}
                    >
                      <span>🌐 WEB</span>
                    </button>
                  </div>
                </div>

                {/* Input Textarea */}
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center px-2 py-1.5 gap-2"
                >
                  <input
                    type="text"
                    value={promptInput}
                    onChange={e => setPromptInput(e.target.value)}
                    placeholder="Wpisz zapytanie do AI... (np. Napisz post na LinkedIn, stwórz grafikę, zrób zadanie)"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none font-sans"
                  />

                  {/* Token counter & Send Button */}
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground/70">
                      <Layers className="h-3 w-3" />
                      ~1.8k tok
                    </span>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary px-3.5 py-1.5 text-[12px] font-bold text-background shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <span>Wyślij</span>
                      <span className="font-mono text-[10px]">· {currentModel.cost} ★</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: REAL NEXTBYTE STUDIO ZDJĘÓ†
              ========================================================================= */}
          {activeTab === 'studio' && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
              {/* Studio Sub-Navigation — silniki generowania */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'gpt2', label: 'GPT Image 2.0' },
                    { id: 'gemini', label: 'Gemini Imagen 3' },
                    { id: 'grok', label: 'Grok Imagine' },
                    { id: 'nb-pro', label: 'Nano Banana Pro' },
                    { id: 'nb2', label: 'Nano Banana 2' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setStudioSubTab(sub.id)}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11.5px] font-medium transition-all',
                        studioSubTab === sub.id
                          ? 'border border-primary/40 bg-primary/15 text-primary font-semibold shadow-sm'
                          : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                      )}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span>Wielkość: 75%</span>
                  <span className="h-3 w-px bg-border" />
                  <span className="text-primary font-bold">
                    Silnik: {
                      studioSubTab === 'gpt2' ? 'GPT Image 2.0' :
                      studioSubTab === 'gemini' ? 'Gemini Imagen 3' :
                      studioSubTab === 'grok' ? 'Grok Imagine' :
                      studioSubTab === 'nb-pro' ? 'Nano Banana Pro' :
                      'Nano Banana 2'
                    }
                  </span>
                </div>
              </div>

              {/* Photorealistic AI Generated Image Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                {[
                  {
                    title: 'Luksusowy Penthouse',
                    desc: 'Wnętrze · Warm Ambient 4K',
                    ratio: '16:9 4K',
                    image: interiorImg,
                    tag: 'Flux 1.1 Pro',
                  },
                  {
                    title: 'Hypercar Studio Render',
                    desc: 'Motoryzacja · Raytracing',
                    ratio: '16:9 4K',
                    image: carImg,
                    tag: 'Flux Pro',
                  },
                  {
                    title: 'Fiordy o Złotej Godzinie',
                    desc: 'Krajobraz · NatGeo Quality',
                    ratio: '16:9 4K',
                    image: landscapeImg,
                    tag: 'Ultra Realizm',
                  },
                  {
                    title: 'Irbis Śnieżny w Tatrach',
                    desc: 'Zwierzę · Hyper-detail Fur',
                    ratio: '16:9 4K',
                    image: animalImg,
                    tag: 'Ultra HD',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative h-36 sm:h-40 rounded-2xl border border-foreground/[0.15] bg-card overflow-hidden transition-all hover:border-primary/80 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)] cursor-pointer"
                  >
                    {/* Real Generated Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 transition-opacity group-hover:opacity-80" />

                    {/* Top Badges */}
                    <div className="relative z-10 flex items-center justify-between p-2.5">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 font-mono text-[9.5px] font-bold text-primary backdrop-blur-md border border-primary/30 shadow-sm">
                        {item.tag}
                      </span>
                      <span className="rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-white/70 backdrop-blur-sm">
                        {item.ratio}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Studio Bottom Generation Bar */}
              <div className="rounded-2xl border border-border/60 bg-card/80 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Camera className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    defaultValue="Wizualizacja nowoczesnego bolidu wyścigowego w jakości 4K..."
                    className="flex-1 bg-transparent text-[12.5px] text-foreground outline-none font-sans"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-lg border border-border/40 px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
                    Auto · 2K
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSend('Wygeneruj nową serię grafik w jakości 4K (-4 Byte)')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-background shadow-md transition-all hover:brightness-110"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generuj (★ 4)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: REAL NEXTBYTE ZADANIA (KANBAN WITH DRAG & DROP)
              ========================================================================= */}
          {activeTab === 'tasks' && (
            <KanbanTasksView tasks={tasks} setTasks={setTasks} moveTask={moveTask} />
          )}
        </div>
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------------------
   4. KARTA MODUŁU
   ------------------------------------------------------------------ */
function ModuleCard({ mod, large, delay = 0 }: { mod: (typeof MODULY)[number]; large?: boolean; delay?: number }) {
  const Icon = mod.icon
  return (
    <FadeIn delay={delay}>
      <Panel hover className={cn('group flex h-full flex-col p-6 font-landing', large && 'lg:p-8')}>
        <Icon
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 opacity-[0.04] transition-opacity duration-700 group-hover:opacity-[0.09]"
          style={{ width: large ? 190 : 140, height: large ? 190 : 140, color: mod.color }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, ${akcentTlo(mod.color, 70)}, transparent)` }}
        />
        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="transition-transform duration-300 group-hover:scale-110">
              <IconTile icon={Icon} color={mod.color} size={large ? 'lg' : 'md'} />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: mod.color }}>
              {mod.tag}
            </span>
          </div>
          <h3 className={cn('mb-2.5 font-landing font-bold leading-snug tracking-tight text-foreground', large ? 'text-xl' : 'text-[17px]')}>
            {mod.title}
          </h3>
          <p className={cn('leading-relaxed text-foreground/55 font-landing', large ? 'text-[14px]' : 'text-[13px]')}>
            {mod.lead}
          </p>
          {large && (
            <ul className="mt-5 space-y-2">
              {mod.bullets.slice(0, 3).map((b, bi) => (
                <li key={b} className="flex items-start gap-2 text-[12.5px] text-foreground/65 font-landing">
                  <Check className="mt-[3px] h-3.5 w-3.5 shrink-0" style={{ color: mod.color }} />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Visual 4K Gallery Preview for Studio Card in Bento */}
          {mod.id === 'studio' && (
            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-foreground/[0.08] bg-black/40 p-2">
              {[
                { img: interiorImg, title: 'Wnętrze' },
                { img: carImg, title: 'Hypercar' },
                { img: landscapeImg, title: 'Krajobraz' },
                { img: animalImg, title: 'Irbis 4K' },
              ].map((pic, pi) => (
                <div key={pi} className="group/pic relative h-16 rounded-lg overflow-hidden border border-foreground/[0.1] shadow-sm">
                  <img src={pic.img} alt={pic.title} className="h-full w-full object-cover transition-transform duration-300 group-hover/pic:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[8.5px] font-mono text-white/80 leading-none">{pic.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-auto pt-6 space-y-2.5">
            {mod.metryki.map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-[10px] text-foreground/40">{m.label}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div className="h-full rounded-full" style={{ width: '100%', background: mod.color, opacity: 0.75 }} />
                </div>
                <span className="shrink-0 font-mono text-[10px] font-bold" style={{ color: mod.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </FadeIn>
  )
}

/* ------------------------------------------------------------------
   5. FAQ ROW
   ------------------------------------------------------------------ */
function FaqRow({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border transition-all duration-300 font-landing', open ? 'border-primary/30 bg-primary/[0.04]' : 'border-foreground/[0.07] bg-card/50 hover:border-foreground/[0.15]')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className={cn('flex-1 font-landing text-[14.5px] font-semibold transition-colors', open ? 'text-foreground' : 'text-foreground/80')}>{q}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-300', open ? 'rotate-180 text-primary' : 'text-foreground/40')} />
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-foreground/60 font-landing">{a}</p>
        </div>
      </div>
    </div>
  )
}

function SecRule({ label }: { label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-5 bg-foreground/[0.18]" />
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-foreground/40">{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------
   MAIN HOMEPAGE COMPONENT (AUTHENTIC NEXTBYTE.SPACE SOURCE OF TRUTH)
   ------------------------------------------------------------------ */
export function HomePage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const glowne = MODULY.filter(m => m.id === 'chat' || m.id === 'studio')
  const reszta = MODULY.filter(m => m.id !== 'chat' && m.id !== 'studio')

  const EKOSYSTEM = [
    { icon: Brain, color: AKCENT.chat, label: 'Chat AI', sub: '10+ modeli', dim: false },
    { icon: Camera, color: AKCENT.studio, label: 'Studio Zdjęć', sub: 'Generatywne AI', dim: false },
    { icon: Rocket, color: AKCENT.auto, label: 'Studio Wideo', sub: 'Klipy & Animacje', dim: false },
    { icon: NotebookPen, color: AKCENT.notes, label: 'Notatki AI', sub: 'Baza wiedzy', dim: false },
    { icon: Calendar, color: AKCENT.notes, label: 'Kalendarz', sub: 'Harmonogram', dim: false },
    { icon: Cpu, color: AKCENT.local, label: 'Modele lokalne', sub: 'Offline / RODO', dim: false },
  ]

  return (
    <div className="flex w-full flex-col font-landing text-foreground">
      <AnimStyles />

      {/* ══════════ HERO SECTION ══════════ */}
      <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(215 10% 30% / .22) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 80%)',
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-180px] -translate-x-1/2"
          style={{
            width: 1100,
            height: 550,
            borderRadius: '50%',
            background: 'radial-gradient(circle, hsl(204 91% 70% / 0.18) 0%, hsl(240 80% 70% / 0.06) 45%, transparent 75%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center pt-8">
          <h1 className="font-heading text-[clamp(40px,6.6vw,84px)] tracking-[-2px] leading-[1.02] mb-7 font-light">
            <span className="text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.45)] block font-normal">NextByte.</span>
            <span className="text-foreground block font-light">Twoja przewaga w AI.</span>
          </h1>

          <p className="mt-2 max-w-2xl font-sans text-[clamp(14.5px,1.15vw,16.5px)] leading-[1.65] text-foreground/70 mb-10 font-light">
            Platforma AI po polsku — chat z najlepszymi modelami, notatki, kalendarz i narzędzia twórcy w jednym miejscu. Bez przeskakiwania między appkami.
          </p>

          <div className="mt-2 flex flex-col items-center gap-3.5 sm:flex-row">
            <GlowButton onClick={() => onNavigate('strona-glowna')}>ZACZNIJ ZA DARMO</GlowButton>
            <GhostButton icon={Play} onClick={() => onNavigate('cennik')}>SPRAWDŹ, CZY TO DLA CIEBIE</GhostButton>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-6">
            {['Bez karty kredytowej', 'Anulujesz w każdej chwili', 'Dane na serwerach w UE'].map(t => (
              <span key={t} className="flex items-center gap-1.5 font-landing text-[12px] text-foreground/50">
                <CircleCheck className="h-4 w-4 text-emerald-400/90" />
                {t}
              </span>
            ))}
          </div>

          <HeroAppMockup />
        </div>
      </section>

      {/* ══════════ TELEMETRIA & PARTNERZY ══════════ */}
      <div className="border-y border-foreground/[0.08] bg-card/40 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid grid-cols-1 divide-y divide-foreground/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              <div className="flex flex-col gap-2 px-6 py-5">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-primary/70">
                  // NAPĘDZAJĄ NAS
                </p>
                <div className="flex flex-wrap gap-x-3.5 gap-y-1">
                  {TECH_PARTNERZY.slice(0, 6).map(l => (
                    <span key={l} className="font-mono text-[11px] font-medium text-foreground/50 hover:text-primary transition-colors cursor-default">
                      <span className="text-primary/70 mr-1">◆</span>{l}
                    </span>
                  ))}
                </div>
              </div>
              {STATY.slice(0, 3).map(({ icon: Icon, value, label, sub }) => (
                <div key={label} className="flex items-center gap-3.5 px-6 py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </span>
                  <div>
                    <p className="font-heading text-[22px] font-bold text-primary leading-none">
                      {value}
                    </p>
                    <p className="mt-1 text-[11.5px] font-semibold text-foreground/90 font-sans">{label}</p>
                    <p className="text-[10px] text-foreground/45 font-sans font-light">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ══════════ SEKCJA: MANIFEST ══════════ */}
      <Section className="pb-20 pt-24">
        <FadeIn>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary">
                // MANIFEST
              </div>
              
              <div className="space-y-2">
                <p className="font-heading text-[clamp(24px,3.5vw,36px)] font-light leading-[1.2] tracking-[-1px] text-foreground/75">
                  Osobne appki do AI, notatek i kalendarza męczą.
                </p>
                <p className="font-heading text-[clamp(24px,3.5vw,36px)] font-light leading-[1.2] tracking-[-1px] text-foreground/75">
                  Płacisz za pięć subskrypcji, używasz jednej.
                </p>
                <p className="font-heading text-[clamp(24px,3.5vw,36px)] font-normal leading-[1.2] tracking-[-1px] text-primary drop-shadow-[0_0_20px_rgba(105,179,240,0.35)]">
                  NextByte łączy to w jedną platformę.
                </p>
              </div>

              <p className="font-sans text-[15px] text-foreground/65 leading-relaxed max-w-lg font-light pt-2">
                Chat AI z najlepszymi modelami (Gemini 3 Pro, GPT-5, Claude, Grok), notatki z AI, kalendarz, generowanie grafik i wideo, własne agenty. Jedna subskrypcja, jedno logowanie, polski interfejs.
              </p>

              <div className="space-y-3.5 pt-2">
                {WARTOSCI_FILARY.map((item, idx) => (
                  <div key={item.tag} className="flex items-start gap-3.5 rounded-xl border border-foreground/[0.08] bg-card/40 p-4 transition-all hover:border-primary/40">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 font-mono text-[11px] font-bold text-primary">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-mono text-[10.5px] uppercase font-bold text-primary tracking-[1.5px] mb-1">{item.tag}</h4>
                      <h5 className="font-heading text-[14.5px] font-semibold text-foreground">{item.title}</h5>
                      <p className="font-sans text-[13px] text-foreground/55 mt-0.5 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <LayeredArchSphereGraphic />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ SEKCJA: GIANT HEMISPHERE ARCH ══════════ */}
      <Section className="pb-24 pt-8">
        <FadeIn>
          <HemisphereArchSection />
        </FadeIn>
      </Section>

      {/* ══════════ EKOSYSTEM PŁYTEK ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <SecRule label="Pełny ekosystem" />
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] tracking-[-2px] text-foreground mb-3">
            Kompletny ekosystem.<br />
            <span className="text-primary font-normal">Wszystko w jednej puli.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-10 font-light">
            Wszystko współpracuje ze sobą. Pomysł z Chatu trafia jako zadanie do tablicy Kanban, brief generuje grafikę 4K w Studio, a harmonogram synchronizuje się w Kalendarzu.
          </p>
        </FadeIn>
        <FadeIn delay={80}>
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-foreground/[0.07] px-8 py-6">
              <h3 className="font-heading text-[22px] font-normal tracking-[-1px] text-foreground">
                Moduły platformy{' '}
                <span className="text-foreground/45 font-light text-[18px]">
                  - wszystkie w jednej subskrypcji
                </span>
              </h3>
              <GhostButton size="md" onClick={() => onNavigate('cennik')}>Zobacz wszystko ↓</GhostButton>
            </div>
            <div className="grid grid-cols-2 divide-x divide-foreground/[0.06] sm:grid-cols-3 lg:grid-cols-6">
              {EKOSYSTEM.map((e) => {
                const Icon = e.icon
                return (
                  <div
                    key={e.label}
                    className={cn(
                      'group flex flex-col items-center gap-2.5 px-4 py-7 text-center transition-all',
                      e.dim ? 'opacity-35' : 'hover:bg-primary/[0.04] cursor-pointer',
                    )}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="text-center font-sans">
                      <span className="block text-[12.5px] font-medium text-foreground">{e.label}</span>
                      <span className="block text-[10.5px] text-foreground/40 font-light">{e.sub}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ MODUŁY BENTO (7 MODUŁÓW NEXTBYTE) ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
            // PLATFORMA / MODUŁY
          </div>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Jedno logowanie. <span className="text-primary font-normal">Cały stack AI.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-12 font-light">
            Notatki zasilają rozmowy, rozmowy uruchamiają automatyzacje i zadania, wszystko rozlicza się z tej samej puli Byte.
          </p>
        </FadeIn>
        <div className="grid gap-4 lg:grid-cols-2">
          {glowne.map((m, i) => (
            <ModuleCard key={m.id} mod={m} large delay={i * 100} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {reszta.map((m, i) => (
            <ModuleCard key={m.id} mod={m} delay={i * 80} />
          ))}
        </div>
      </Section>

      {/* ══════════ LOKALNY AI & BEZPIECZEŃSTWO ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-16 border-primary/30">
            <Glow className="right-[-100px] top-[-80px]" size={480} opacity={0.12} />
            <div className="relative z-10 font-sans">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
                // LOKALNIE / PRYWATNE ŚRODOWISKO
              </div>
              <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 max-w-2xl tracking-[-2px]">
                Lokalny AI. <span className="text-primary font-normal">Zero tokenów na zewnątrz.</span>
              </h2>
              <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-2xl mb-8 font-light">
                LM Studio, Ollama albo Twój własny serwer OpenAI-compatible — NextByte gada z <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">localhost</span>, nigdy przez nasze API.
              </p>

              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mb-10 pb-6 border-b border-foreground/[0.08] font-mono uppercase text-xs">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">0 Byte</span>
                  <span className="text-foreground/45">Koszt / wiadomość</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">0 B</span>
                  <span className="text-foreground/45">Dane wychodzące</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">brak</span>
                  <span className="text-foreground/45">Wymagana sieć</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-10">
                {[
                  { tag: '// 01', title: '100% prywatność', desc: 'Dane nie opuszczają Twojej maszyny — ani jednego bajtu do chmury. Zgodne z RODO.' },
                  { tag: '// 02', title: '0 Byte / wiadomość', desc: 'Model lokalny nie korzysta z naszego API. Koszt każdej wiadomości po Twojej stronie: zero.' },
                  { tag: '// 03', title: 'Działa bez internetu', desc: 'Pełna funkcjonalność offline — w pociągu, za granicą, w sieci korporacyjnej bez wyjścia na zewnątrz.' },
                ].map((item, i) => (
                  <FadeIn key={item.title} delay={i * 100}>
                    <div className="rounded-xl border border-foreground/[0.08] bg-card/50 p-4">
                      <span className="font-mono text-[10px] text-primary font-bold">{item.tag}</span>
                      <h3 className="font-heading text-[16px] font-semibold text-foreground mt-1">{item.title}</h3>
                      <p className="font-sans text-[13px] text-foreground/50 mt-1 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] text-primary mb-3 tracking-[2px]">// DLA KOGO</p>
                  <ul className="space-y-2 font-sans text-[13.5px] text-foreground/65 font-light">
                    <li className="flex gap-2"><span className="text-primary mt-0.5">—</span><span><span className="text-foreground font-medium">Firmy i korporacje</span> — kontrakty i dane nie opuszczają wewnętrznej infrastruktury.</span></li>
                    <li className="flex gap-2"><span className="text-primary mt-0.5">—</span><span><span className="text-foreground font-medium">Prawnicy i notariusze</span> — tajemnica zawodowa bez kompromisów.</span></li>
                    <li className="flex gap-2"><span className="text-primary mt-0.5">—</span><span><span className="text-foreground font-medium">Służba zdrowia</span> — zgodność z RODO i HIPAA przy pracy z dokumentacją medyczną.</span></li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-primary mb-3 tracking-[2px]">// JAK ZACZĄĆ</p>
                  <ol className="space-y-2 font-sans text-[13.5px] text-foreground/65 font-light">
                    <li className="flex gap-2"><span className="text-primary font-bold">1.</span><span>Pobierz runner — <span className="font-mono text-foreground bg-foreground/[0.06] px-1 rounded">LM Studio</span> lub <span className="font-mono text-foreground bg-foreground/[0.06] px-1 rounded">Ollama</span></span></li>
                    <li className="flex gap-2"><span className="text-primary font-bold">2.</span><span>Załaduj model — Llama, Qwen, Mistral lub dowolny GGUF</span></li>
                    <li className="flex gap-2"><span className="text-primary font-bold">3.</span><span>Wklej adres lokalny w ustawieniach NextByte, kliknij <span className="text-foreground font-medium">Testuj</span></span></li>
                  </ol>
                </div>
              </div>
            </div>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ JAK TO DZIAŁA — 3 KROKI ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-16">
            <Glow className="right-[-100px] top-[-80px]" size={480} opacity={0.09} />
            <div className="relative z-10 font-sans">
              <SecRule label="Jak to działa" />
              <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-12 max-w-xl tracking-[-2px]">
                Od rejestracji do pierwszego wyniku — <span className="text-primary font-normal">trzy proste kroki.</span>
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    title: '1. Zakładasz konto za 0 zł',
                    desc: 'Rejestracja w 30 sekund bez podawania karty kredytowej. Dostęp do platformy i modeli lokalnych jest natychmiastowy.',
                    icon: KeyRound,
                  },
                  {
                    title: '2. Wybierasz zadanie i model',
                    desc: 'Chat AI, Studio grafik 4K, baza Notatek lub automatyzacja. Dobierasz model dopasowany do bieżącego zadania.',
                    icon: Layers,
                  },
                  {
                    title: '3. Płacisz tylko za zużycie',
                    desc: 'Każda akcja ma jawny, przejrzysty koszt w Byte. Niewykorzystana pula przechodzi na kolejny miesiąc — bez strat.',
                    icon: Gauge,
                  },
                ].map((k, i) => (
                  <FadeIn key={k.title} delay={i * 120}>
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <StepNumber n={i + 1} />
                      </div>
                      <h3 className="font-heading text-[17px] font-semibold text-foreground">{k.title}</h3>
                      <p className="font-sans text-[13.5px] leading-relaxed text-foreground/60 font-light">{k.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ PORÓWNANIE ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <SecRule label="Porównanie" />
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-3 tracking-[-2px]">
            Jedno narzędzie zamiast <span className="text-primary font-normal">czterech subskrypcji.</span>
          </h2>
          <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-lg mb-12 font-light">
            Zestawienie funkcji, które w innych narzędziach wymagają osobnych planów w obcych walutach i generują chaos faktur.
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm font-sans">
              <thead>
                <tr className="border-b border-foreground/[0.07]">
                  <th className="px-5 py-5 text-left text-[12px] font-medium text-foreground/40 font-mono">Funkcja</th>
                  {POROWNANIE.kolumny.map((k, i) => (
                    <th key={k} className="px-4 py-5 text-center">
                      {i === 0 ? (
                        <span className="inline-flex flex-col items-center gap-1">
                          <span className="font-heading text-[14px] font-semibold text-primary">{k}</span>
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase text-primary">
                            Polecany
                          </span>
                        </span>
                      ) : (
                        <span className="font-heading text-[12.5px] font-medium text-foreground/40">{k}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POROWNANIE.wiersze.map((r, ri) => (
                  <tr
                    key={r.f}
                    className={cn(
                      'border-b border-foreground/[0.04] last:border-b-0 transition-colors hover:bg-foreground/[0.02]',
                      ri % 2 === 0 && 'bg-foreground/[0.008]',
                    )}
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium text-foreground/70 font-sans">{r.f}</td>
                    {r.v.map((v, vi) => (
                      <td key={vi} className={cn('px-4 py-3.5 text-center', vi === 0 && 'bg-primary/[0.035]')}>
                        {v === true ? (
                          <CircleCheck className="mx-auto h-[18px] w-[18px] text-emerald-400" />
                        ) : v === false ? (
                          <Minus className="mx-auto h-4 w-4 text-foreground/15" />
                        ) : (
                          <span className={cn('font-sans text-[12.5px] font-semibold', vi === 0 ? 'text-primary' : 'text-foreground/50')}>
                            {v}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ BEZPIECZEŃSTWO DANYCH ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <Panel className="relative overflow-hidden p-8 sm:p-12 lg:p-16 border-foreground/[0.08]">
            <Glow className="left-[-80px] bottom-[-80px]" size={400} opacity={0.07} />
            <div className="relative z-10">
              <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
                // PRYWATNOŚĆ & BEZPIECZEŃSTWO
              </div>
              <h2 className="font-heading text-[clamp(28px,4vw,46px)] font-light leading-[1.1] text-foreground mb-3 tracking-[-2px] max-w-2xl">
                Twoje dane nie wychodzą <span className="text-primary font-normal">nigdzie na zewnątrz.</span>
              </h2>
              <p className="font-sans text-[15px] text-foreground/55 leading-relaxed max-w-xl mb-10 font-light">
                Żaden gigant nie trenuje swoich modeli na Twoich rozmowach, dokumentach ani zapytaniach. To nie jest obietnica regulaminowa — to architektura.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { num: '01', title: 'Serwery w UE', desc: 'Wszystkie dane przetwarzane wyłącznie w centrach danych Unii Europejskiej. Pełna zgodność z RODO.' },
                  { num: '02', title: 'Zero trenowania', desc: 'Twoje rozmowy, pliki i kody nigdy nie są wykorzystywane do trenowania żadnych publicznych modeli AI.' },
                  { num: '03', title: 'Lokalny tryb', desc: 'Ollama / LM Studio — wrażliwe dane w ogóle nie opuszczają Twojego urządzenia ani sieci firmowej.' },
                  { num: '04', title: 'Jawna polityka', desc: 'Bez ukrytych klauzul. Rezygnujesz jednym kliknięciem, dane usuwamy na żądanie w 30 dni.' },
                ].map((item) => (
                  <div key={item.num} className="rounded-xl border border-foreground/[0.07] bg-card/50 p-5">
                    <span className="font-mono text-[10px] text-primary/60 font-bold">// {item.num}</span>
                    <h3 className="font-heading text-[15px] font-semibold text-foreground mt-1.5 mb-2">{item.title}</h3>
                    <p className="font-sans text-[12.5px] text-foreground/50 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </FadeIn>
      </Section>

      {/* ══════════ OPINIE / Z POLA ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
            // OPINIE / Z POLA
          </div>
          <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-light leading-[1.06] text-foreground mb-12 tracking-[-2px]">
            Co mówią osoby, które <span className="text-primary font-normal">przestały żonglować narzędziami.</span>
          </h2>
        </FadeIn>
        <div className="grid gap-4 lg:grid-cols-3">
          {OPINIE.map((o, i) => (
            <FadeIn key={o.imie} delay={i * 100}>
              <div
                className={cn(
                  'group flex h-full flex-col rounded-2xl border p-6 backdrop-blur-xl transition-all hover:-translate-y-1 font-sans',
                  i === 1
                    ? 'border-primary/40 bg-card/80 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)]'
                    : 'border-foreground/[0.08] bg-card/60 hover:border-foreground/[0.18]',
                )}
              >
                <div className="mb-2 font-mono text-[10px] tracking-[2.5px] text-primary/70">
                  // {o.id}
                </div>
                <p className="flex-1 font-sans text-[14px] leading-relaxed text-foreground/85 mb-5 font-light">
                  {o.tekst}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.06]">
                  <div className="font-sans">
                    <p className="text-[13px] font-semibold text-foreground">{o.imie}</p>
                    <p className="text-[11px] text-foreground/45 font-light">{o.rola}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[9px] text-primary">
                    {o.metryka}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* ══════════ PRICING TEASER (ZACZNIJ ZA DARMO, SKALUJ KIEDY CHCESZ) ══════════ */}
      <Section className="pb-20">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/80 p-10 sm:p-14 shadow-[0_0_80px_-20px_hsl(var(--primary)/0.3)] font-sans">
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center justify-between">
              <div className="space-y-4 max-w-xl">
                <Eyebrow icon={Coins}>Elastyczny Cennik</Eyebrow>
                <h2 className="font-heading text-3xl sm:text-4xl font-light text-foreground tracking-[-1.5px]">
                  Zacznij za darmo.<br />
                  <span className="text-primary font-normal">Skaluj kiedy chcesz.</span>
                </h2>
                <p className="font-sans text-[14.5px] leading-relaxed text-foreground/60 font-light">
                  Darmowy plan bez limitu czasu. Płacisz tylko za zużyte Byte — nie za nieużywane, sztywne subskrypcje. Przejdź do pełnego kalkulatora i porównaj plany.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 shrink-0">
                <GlowButton onClick={() => onNavigate('cennik')}>Zobacz pełny cennik ↓</GlowButton>
                <p className="font-sans text-[11.5px] text-foreground/45 font-light">Bez karty kredytowej · Anulujesz w każdej chwili</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ FAQ / ODPOWIEDZI ══════════ */}
      <Section className="pb-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <FadeIn className="lg:sticky lg:top-32 lg:self-start">
            <div className="font-mono uppercase text-[11px] tracking-[3px] text-primary mb-2">
              // FAQ / ODPOWIEDZI
            </div>
            <h2 className="font-heading text-[2.2rem] font-light leading-[1.06] text-foreground mb-4 tracking-[-1.5px]">
              Częste pytania.
            </h2>
            <p className="font-sans text-[14px] text-foreground/55 leading-relaxed mb-7 font-light">
              Nie ma tu odpowiedzi na Twoje pytanie? Napisz do nas — odpowiadamy w ciągu jednego dnia.
            </p>
            <GhostButton size="md" onClick={() => onNavigate('cennik')}>Skontaktuj się z nami</GhostButton>
          </FadeIn>
          <FadeIn delay={120} className="space-y-2.5">
            {FAQ.map((f, i) => (
              <FaqRow key={f.q} q={f.q} a={f.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </FadeIn>
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section className="pb-28">
        <HairLine className="mb-16" />
        <FadeIn>
          <div className="text-center flex flex-col items-center font-sans">
            <h2
              className="font-heading font-normal leading-[1.04] tracking-[-1.6px] text-primary drop-shadow-[0_0_32px_rgba(105,179,240,0.35)] mb-2"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)' }}
            >
              Przestań gonić AI.
            </h2>
            <h2
              className="font-heading font-light leading-[1.04] tracking-[-1.6px] text-foreground mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)' }}
            >
              Zacznij go używać.
            </h2>
            <p className="font-sans text-[16.5px] text-foreground/70 max-w-xl leading-relaxed mb-8 font-light">
              Dołącz do NextByte i dostawaj konkret zamiast szumu. Bez spamu, bez korpo-gadki — możesz wyjść jednym kliknięciem.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <GlowButton onClick={() => onNavigate('strona-glowna')}>[ DOŁĄCZAM DO NEXTBYTE ]</GlowButton>
              <GhostButton onClick={() => onNavigate('b2b')}>[ UMÓW DEMO DLA FIRMY ]</GhostButton>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
