import { Camera, MessageSquare, Terminal, Brain } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════
   AKTUALNOŚCI PLATFORMY — jedno źródło dla kafelka "NOWOŚCI" w panelu
   i dla lewej szyny na ekranie logowania/rejestracji.
   ═══════════════════════════════════════════════════════════════════════ */

export type Aktualnosc = {
  id: number
  /** Nazwa modułu i wersja — krótka etykieta nad tytułem */
  tag: string
  title: string
  desc: string
  linkText: string
  icon: React.ElementType
  /** Klasy gradientu dla dużej ikony w panelu */
  gradient: string
}

export const AKTUALNOSCI: Aktualnosc[] = [
  {
    id: 1,
    tag: 'Studio Zdęć v2.1',
    title: 'Grok Image — kosmiczny realizm',
    desc: 'Najmocniejsze odwzorowanie ludzi i fotorealizm. Twarze, skóra, światło — jak ze studia.',
    linkText: 'Otwórz Studio Zdęć',
    icon: Camera,
    gradient: 'from-primary/30 via-sky-600/25 to-blue-600/20',
  },
  {
    id: 2,
    tag: 'Chat AI v4.0',
    title: 'Model Chat AI 4.0 — superszybki kompilator',
    desc: 'O 300% szybsza generacja kodu i automatyczna synteza długich instrukcji.',
    linkText: 'Przejdź do Chat AI',
    icon: MessageSquare,
    gradient: 'from-cyan-500/30 via-blue-600/25 to-indigo-600/20',
  },
  {
    id: 3,
    tag: 'Prompty v3.0',
    title: 'PromptEx v3 — automatyczny optymalizator',
    desc: 'Błyskawiczne ulepszanie instrukcji w czasie rzeczywistym z analizą kontekstu.',
    linkText: 'Otwórz PromptEx',
    icon: Terminal,
    gradient: 'from-amber-500/30 via-orange-600/25 to-red-600/20',
  },
  {
    id: 4,
    tag: 'Pamięć AI',
    title: 'Byte Cloud — bezlimitowa pamięć AI',
    desc: 'Błyskawiczne zapisywanie sesji roboczych i natychmiastowe współdzielenie projektów.',
    linkText: 'Sprawdź Pamięć AI',
    icon: Brain,
    gradient: 'from-emerald-500/30 via-teal-600/25 to-cyan-600/20',
  },
]
