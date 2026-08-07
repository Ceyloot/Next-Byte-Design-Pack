import React from 'react'
import { Zap, Download, Trash2, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">{children}</p>
}

function DemoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function AkcjeSection() {
  return (
    <div className="space-y-10">

      {/* PRZYCISKI */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Przyciski</h3>

        <DemoBlock label="Warianty">
          <Button variant="nextbyte"><Sparkles className="h-4 w-4" />Główny</Button>
          <Button variant="default">Domyślny</Button>
          <Button variant="outline">Obwódka</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive"><Trash2 className="h-4 w-4" />Usuń</Button>
          <Button variant="default" disabled>Wyłączony</Button>
        </DemoBlock>

        <DemoBlock label="Z ikonami">
          <Button variant="outline"><Download className="h-4 w-4" />Pobierz</Button>
          <Button variant="nextbyte"><Plus className="h-4 w-4" />Nowy projekt</Button>
          <Button variant="default">Zapisz<ArrowRight className="h-4 w-4" /></Button>
          <Button variant="ghost"><Trash2 className="h-4 w-4" />Usuń</Button>
        </DemoBlock>

        <DemoBlock label="Rozmiary">
          {(['sm', 'default', 'lg'] as const).map((s) => (
            <Button key={s} variant="nextbyte" size={s}>Rozmiar {s}</Button>
          ))}
        </DemoBlock>

        <DemoBlock label="Icon">
          <Button variant="default" size="icon"><Zap className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
          <Button variant="nextbyte" size="icon"><Sparkles className="h-4 w-4" /></Button>
        </DemoBlock>
      </div>

      {/* BADGE */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Znaczniki (Badge)</h3>

        <DemoBlock label="Intencje">
          <Badge intent="neutral">Neutralny</Badge>
          <Badge intent="primary">Primary</Badge>
          <Badge intent="success">Sukces</Badge>
          <Badge intent="warning">Uwaga</Badge>
          <Badge intent="danger">Błąd</Badge>
        </DemoBlock>

        <DemoBlock label="Z punktem statusu">
          <Badge intent="success" dot>Online</Badge>
          <Badge intent="warning" dot>Degraded</Badge>
          <Badge intent="danger" dot>Offline</Badge>
          <Badge intent="primary" dot>Beta</Badge>
        </DemoBlock>

        <DemoBlock label="Rozmiary">
          <Badge size="sm" intent="primary">Mały</Badge>
          <Badge intent="primary">Domyślny</Badge>
        </DemoBlock>
      </div>

    </div>
  )
}
