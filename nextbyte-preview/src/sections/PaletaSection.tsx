import React, { useState } from 'react'
import {
  Zap, Bell, Search, Settings, ChevronRight, Check, X, AlertCircle, Info,
  Star, Heart, Bookmark, Share2, Edit2, Trash2, Plus, Minus, ArrowRight,
  ArrowLeft, Upload, Download, Copy, Lock, Unlock, Eye, EyeOff, Camera,
  MessageSquare, Mail, Phone, User, Users, Calendar, Clock, FileText,
  Folder, Database, BarChart3, TrendingUp, Globe, Cpu, Shield, Sparkles,
} from 'lucide-react'
import { GlassKbd, SkipLink, LiveRegion, SrOnly, useReducedMotion } from '@/components/glass'

const CONTRACT_VARS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring',
  '--popover', '--popover-foreground',
  '--brand-primary', '--brand-primary-dark', '--brand-primary-light',
]

function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function ColorSwatch({ name, tick }: { name: string; tick: number }) {
  void tick
  const val = readVar(name)
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2">
      <div className="h-8 w-8 shrink-0 rounded-lg border border-border/30" style={{ background: `hsl(${val})` }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] font-semibold text-card-foreground">{name}</p>
        <p className="font-mono text-[9px] text-muted-foreground">{val || '—'}</p>
      </div>
    </div>
  )
}

export function PaletaSection() {
  const [tick] = useState(0)

  return (
    <div className="space-y-6">
      <h3 id="kolory" className="text-sm font-semibold text-foreground/70">22 zmienne kontraktu kolorystycznego</h3>
      <p className="text-xs text-foreground/50">
        Każdy motyw musi dostarczyć te zmienne w formacie HSL (bez <code>hsl()</code>).
        Tryb Normal/Glass nie zmienia palety — zawsze pokazuje aktualne wartości.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CONTRACT_VARS.map((v) => (
          <ColorSwatch key={v} name={v} tick={tick} />
        ))}
      </div>

      {/* ── TYPOGRAFIA ── */}
      <div id="typografia" className="space-y-6 pt-4">
        <h3 className="text-sm font-semibold text-foreground/70">Typografia</h3>
        <p className="text-xs text-foreground/50">Skale typograficzne używane w systemie. Wszystkie bazują na zmiennych CSS motywu.</p>

        <div className="space-y-3 max-w-2xl">
          {[
            { cls: 'text-4xl font-black',    label: 'text-4xl / font-black',    sample: 'NextByte Design' },
            { cls: 'text-3xl font-bold',      label: 'text-3xl / font-bold',     sample: 'Tytuł sekcji' },
            { cls: 'text-2xl font-semibold',  label: 'text-2xl / font-semibold', sample: 'Nagłówek karty' },
            { cls: 'text-xl font-semibold',   label: 'text-xl / font-semibold',  sample: 'Podtytuł' },
            { cls: 'text-base font-medium',   label: 'text-base / font-medium',  sample: 'Tekst podstawowy' },
            { cls: 'text-sm',                 label: 'text-sm',                  sample: 'Opis komponentu lub etykieta pola' },
            { cls: 'text-xs text-foreground/60', label: 'text-xs / muted',       sample: 'Podpis, hint, metadane, czas' },
            { cls: 'text-[10px] uppercase tracking-widest font-bold text-foreground/40', label: 'nb-etykieta / uppercase', sample: 'ETYKIETA SEKCJI' },
          ].map((row) => (
            <div key={row.label} className="flex items-baseline gap-4 border-b border-border/40 pb-3">
              <span className={`flex-1 ${row.cls}`}>{row.sample}</span>
              <code className="text-[10px] font-mono text-foreground/35 shrink-0">{row.label}</code>
            </div>
          ))}
        </div>

        <div className="max-w-2xl space-y-2 pt-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 mb-3">Fonty systemowe</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/60 p-3 space-y-1">
              <p className="text-xs text-foreground/50 font-mono">font-sans</p>
              <p className="text-sm font-medium">Inter / system-ui</p>
              <p className="text-xs text-foreground/40">Podstawowy interfejs</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3 space-y-1">
              <p className="text-xs text-foreground/50 font-mono">font-mono</p>
              <p className="text-sm font-mono">Geist Mono / monospace</p>
              <p className="text-xs text-foreground/40">Kod, tokeny, dane</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3 space-y-1">
              <p className="text-xs text-foreground/50 font-mono">nb-liczby</p>
              <p className="text-2xl font-extrabold nb-liczby tabular-nums">2 847</p>
              <p className="text-xs text-foreground/40">Metryki, cyfry w UI</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── IKONY ── */}
      <div id="ikony" className="space-y-4 pt-4">
        <h3 className="text-sm font-semibold text-foreground/70">Ikony</h3>
        <p className="text-xs text-foreground/50">
          System używa <strong className="text-foreground/70">Lucide React</strong> — spójny zestaw konturowych ikon w SVG.
          Rozmiary: <code className="text-[10px] bg-foreground/8 px-1 rounded">w-3 h-3</code> (tiny),
          <code className="text-[10px] bg-foreground/8 px-1 rounded">w-3.5 h-3.5</code> (sm),
          <code className="text-[10px] bg-foreground/8 px-1 rounded">w-4 h-4</code> (md),
          <code className="text-[10px] bg-foreground/8 px-1 rounded">w-5 h-5</code> (lg).
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {[
            Zap, Bell, Search, Settings, ChevronRight, Check, X, AlertCircle, Info, Star,
            Heart, Bookmark, Share2, Edit2, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Upload,
            Download, Copy, Lock, Unlock, Eye, EyeOff, Camera, MessageSquare, Mail, Phone,
            User, Users, Calendar, Clock, FileText, Folder, Database, BarChart3, TrendingUp,
            Globe, Cpu, Shield, Sparkles,
          ].map((Icon, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border/50 bg-card/40 hover:border-primary/40 hover:bg-primary/5 transition-colors group">
              <Icon className="w-4 h-4 text-foreground/60 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {(['w-3 h-3', 'w-3.5 h-3.5', 'w-4 h-4', 'w-5 h-5', 'w-6 h-6'] as const).map((sz) => (
            <div key={sz} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60">
              <Sparkles className={`${sz} text-primary`} />
              <code className="text-[10px] font-mono text-foreground/50">{sz}</code>
            </div>
          ))}
        </div>
      </div>

      {/* ── DOSTĘPNOŚĆ ── */}
      <A11ySection />
    </div>
  )
}

// ── Dostępność (a11y) ──────────────────────────────────────────────

function A11ySection() {
  const reduced = useReducedMotion()
  const [announce, setAnnounce] = React.useState('')

  return (
    <div id="a11y" className="space-y-6 pt-4">
      <h3 className="text-sm font-semibold text-foreground/70">Dostępność (a11y)</h3>
      <p className="text-xs text-foreground/50">
        Warstwa, bez której modal wypuszcza fokus na stronę pod spodem, a czytnik ekranu
        nie dowiaduje się o zmianach stanu. Wszystko wyeksportowane z <code className="rounded bg-foreground/8 px-1 text-[10px]">@/components/glass</code>.
      </p>

      {/* Skróty klawiszowe */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Legenda skrótów (GlassKbd)</p>
        <div className="flex flex-wrap gap-4">
          {[
            { keys: ['⌘', 'K'],    desc: 'Paleta poleceń' },
            { keys: ['⌘', 'Enter'], desc: 'Wyślij wiadomość' },
            { keys: ['Esc'],        desc: 'Zamknij nakładkę' },
            { keys: ['Tab'],        desc: 'Następny element' },
            { keys: ['Shift', 'Tab'], desc: 'Poprzedni element' },
          ].map((s) => (
            <div key={s.desc} className="flex items-center gap-2">
              <GlassKbd keys={s.keys} />
              <span className="text-[11px] text-foreground/50">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skip link */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Skip link (SkipLink)</p>
        <p className="text-xs text-foreground/50">
          Niewidoczny, dopóki nie dostanie fokusu. Kliknij poniższe pole i naciśnij Tab — link wyskoczy w lewym górnym rogu.
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
          <SkipLink href="#a11y">Przejdź do treści</SkipLink>
          <input
            placeholder="Kliknij tutaj, potem naciśnij Tab…"
            className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Live region */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Region ogłoszeń (LiveRegion)</p>
        <p className="text-xs text-foreground/50">
          Treść niewidoczna wizualnie, ale odczytywana przez czytnik przy każdej zmianie.
          <code className="ml-1 rounded bg-foreground/8 px-1 text-[10px]">polite</code> czeka na przerwę,
          <code className="ml-1 rounded bg-foreground/8 px-1 text-[10px]">assertive</code> przerywa — ten drugi tylko dla błędów.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {['Zapisano zmiany', 'Błąd połączenia', 'Wysłano wiadomość'].map((m) => (
            <button
              key={m}
              onClick={() => setAnnounce(`${m} · ${new Date().toLocaleTimeString('pl-PL')}`)}
              className="rounded-xl border border-border bg-card/60 px-3 py-1.5 text-[11px] font-medium text-foreground/70 transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Ogłoś: {m}
            </button>
          ))}
        </div>
        <LiveRegion message={announce} />
        {announce && (
          <p className="rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2 font-mono text-[10px] text-primary">
            aria-live=&quot;polite&quot; → {announce}
          </p>
        )}
      </div>

      {/* Reduced motion + sr-only */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">useReducedMotion</p>
          <p className="text-xs text-foreground/60">
            System zgłasza: <strong className={reduced ? 'text-amber-400' : 'text-emerald-400'}>
              {reduced ? 'ogranicz ruch' : 'animacje dozwolone'}
            </strong>
          </p>
          <p className="text-[10px] text-foreground/40">
            Czyta <code className="rounded bg-foreground/8 px-1">prefers-reduced-motion</code> i reaguje na zmianę bez przeładowania.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">SrOnly · useFocusTrap</p>
          <p className="text-xs text-foreground/60">
            Zapisz<SrOnly> zmiany w ustawieniach konta</SrOnly>
            <span className="ml-1 text-foreground/35">← przycisk widzi „Zapisz”, czytnik słyszy pełny opis</span>
          </p>
          <p className="text-[10px] text-foreground/40">
            <code className="rounded bg-foreground/8 px-1">useFocusTrap(open)</code> zamyka Tab w modalu i przywraca fokus po zamknięciu.
          </p>
        </div>
      </div>
    </div>
  )
}
