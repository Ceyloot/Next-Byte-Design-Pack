import React, { useState } from 'react'

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
    <div className="flex items-center gap-2 rounded-nb border border-border bg-card/60 p-2">
      <div className="h-8 w-8 shrink-0 rounded-nb-sm border border-border/30" style={{ background: `hsl(${val})` }} />
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
      <h3 className="text-sm font-semibold text-foreground/70">22 zmienne kontraktu kolorystycznego</h3>
      <p className="text-xs text-foreground/50">
        Każdy motyw musi dostarczyć te zmienne w formacie HSL (bez <code>hsl()</code>).
        Tryb Normal/Glass nie zmienia palety — zawsze pokazuje aktualne wartości.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {CONTRACT_VARS.map((v) => (
          <ColorSwatch key={v} name={v} tick={tick} />
        ))}
      </div>
    </div>
  )
}
