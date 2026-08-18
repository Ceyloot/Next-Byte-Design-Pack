import React from 'react'
import { Sparkles, Zap, Camera, Brain, Database, Rocket } from 'lucide-react'
import {
  GlassCard, GlassContainer, GlassGrid, GlassBento, GlassMasonry,
  GlassSplit, GlassStack, GlassCluster, GlassAspectRatio,
  GlassDivider, GlassOrb, GlassNoise, GlassSpotlight,
  GlassMeshGradient, GlassAurora, GlassCornerDecor, GlassBorderGlow,
  GlassBadge, GlassButton,
} from '@/components/glass'
import { cn } from '@/lib/utils'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

/** Wypełniacz pokazujący granice slotu układu — bez treści, sam kształt. */
function Box({ children, className, h }: { children?: React.ReactNode; className?: string; h?: number }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl border border-dashed border-primary/25 bg-primary/[0.05] px-3 py-2 text-[11px] font-medium text-primary/70',
        className,
      )}
      style={h ? { height: h } : undefined}
    >
      {children}
    </div>
  )
}

export function UkladSection() {
  return (
    <div className="space-y-10">

      {/* CONTAINER */}
      <div className="space-y-4">
        <h3 id="container" className="text-sm font-semibold text-foreground/70">Container</h3>
        <SectionLabel>Cztery szerokości maksymalne + wariant pełnej szerokości (bleed)</SectionLabel>
        <div className="space-y-2">
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <GlassContainer key={s} size={s}>
              <Box>size=&quot;{s}&quot;</Box>
            </GlassContainer>
          ))}
          <GlassContainer bleed>
            <Box className="border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-400/80">bleed — pełna szerokość</Box>
          </GlassContainer>
        </div>
      </div>

      {/* GRID */}
      <div className="space-y-4">
        <h3 id="grid" className="text-sm font-semibold text-foreground/70">Grid</h3>
        <SectionLabel>1 / 2 / 3 / 4 / 6 kolumn — responsywne progi wbudowane</SectionLabel>
        {([2, 3, 4, 6] as const).map((c) => (
          <div key={c} className="space-y-1.5">
            <p className="font-mono text-[10px] text-foreground/35">cols={c}</p>
            <GlassGrid cols={c}>
              {Array.from({ length: c }).map((_, i) => <Box key={i} h={44}>{i + 1}</Box>)}
            </GlassGrid>
          </div>
        ))}
      </div>

      {/* BENTO */}
      <div className="space-y-4">
        <h3 id="bento" className="text-sm font-semibold text-foreground/70">Bento grid</h3>
        <SectionLabel>Nierówna siatka — kafelki o różnym span i rowspan</SectionLabel>
        <GlassBento
          tiles={[
            { span: 2, rows: 2, content: <Box className="h-full">span=2 · rows=2</Box> },
            { span: 2, content: <Box className="h-full">span=2</Box> },
            { span: 1, content: <Box className="h-full">span=1</Box> },
            { span: 1, content: <Box className="h-full">span=1</Box> },
            { span: 1, content: <Box className="h-full">span=1</Box> },
            { span: 3, content: <Box className="h-full">span=3</Box> },
          ]}
        />
      </div>

      {/* MASONRY */}
      <div className="space-y-4">
        <h3 id="masonry" className="text-sm font-semibold text-foreground/70">Masonry</h3>
        <SectionLabel>Kafelki o różnej wysokości płyną w dół kolumny — bez dziur</SectionLabel>
        <GlassMasonry cols={3}>
          {[90, 140, 70, 110, 160, 85, 120, 95, 130].map((h, i) => (
            <Box key={i} h={h}>{h}px</Box>
          ))}
        </GlassMasonry>
      </div>

      {/* SPLIT */}
      <div className="space-y-4">
        <h3 id="split" className="text-sm font-semibold text-foreground/70">Split</h3>
        <SectionLabel>Podział asymetryczny — 1/2, 1/3, 2/3, 1/4 · odwracalny na desktopie</SectionLabel>
        {(['1/2', '1/3', '2/3', '1/4'] as const).map((r) => (
          <div key={r} className="space-y-1.5">
            <p className="font-mono text-[10px] text-foreground/35">ratio=&quot;{r}&quot;</p>
            <GlassSplit ratio={r}>
              <Box h={48}>A</Box>
              <Box h={48}>B</Box>
            </GlassSplit>
          </div>
        ))}
        <p className="font-mono text-[10px] text-foreground/35">reverse — na desktopie B idzie pierwsze</p>
        <GlassSplit ratio="1/3" reverse>
          <Box h={48}>A</Box>
          <Box h={48} className="border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-400/80">B</Box>
        </GlassSplit>
      </div>

      {/* STACK + CLUSTER */}
      <div className="space-y-4">
        <h3 id="stack" className="text-sm font-semibold text-foreground/70">Stack i Cluster</h3>
        <SectionLabel>Stack — pionowo z odstępem; opcjonalnie z liniami rozdzielającymi</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard>
            <GlassStack space="sm">
              <Box>space=&quot;sm&quot;</Box><Box>drugi</Box><Box>trzeci</Box>
            </GlassStack>
          </GlassCard>
          <GlassCard>
            <GlassStack space="md" divide>
              <p className="pb-2 text-xs text-foreground/70">divide — linia między dziećmi</p>
              <p className="py-2 text-xs text-foreground/70">druga pozycja</p>
              <p className="pt-2 text-xs text-foreground/70">trzecia pozycja</p>
            </GlassStack>
          </GlassCard>
        </div>

        <SectionLabel>Cluster — poziomo, zawija się zamiast przepełniać</SectionLabel>
        <GlassCard>
          <GlassCluster>
            {['React', 'TypeScript', 'Tailwind', 'Vite', 'Supabase', 'Next.js', 'Framer', 'Zod', 'tRPC'].map((t) => (
              <GlassBadge key={t} size="sm">{t}</GlassBadge>
            ))}
          </GlassCluster>
        </GlassCard>
        <GlassCard>
          <GlassCluster justify="between">
            <span className="text-xs text-foreground/70">justify=&quot;between&quot;</span>
            <GlassCluster space="xs">
              <GlassButton size="sm" variant="ghost">Anuluj</GlassButton>
              <GlassButton size="sm">Zapisz</GlassButton>
            </GlassCluster>
          </GlassCluster>
        </GlassCard>
      </div>

      {/* ASPECT RATIO */}
      <div className="space-y-4">
        <h3 id="aspect" className="text-sm font-semibold text-foreground/70">Aspect ratio</h3>
        <SectionLabel>Stałe proporcje niezależne od treści</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(['16/9', '1/1', '4/3', '3/2', '21/9'] as const).map((r) => (
            <GlassAspectRatio key={r} ratio={r}>
              <Box className="h-full">{r}</Box>
            </GlassAspectRatio>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="space-y-4">
        <h3 id="divider" className="text-sm font-semibold text-foreground/70">Divider</h3>
        <SectionLabel>Cztery warianty linii · poziomo, pionowo i z etykietą</SectionLabel>
        <GlassCard className="space-y-5">
          {(['solid', 'dashed', 'dotted', 'gradient'] as const).map((v) => (
            <div key={v} className="space-y-1.5">
              <p className="font-mono text-[10px] text-foreground/35">variant=&quot;{v}&quot;</p>
              <GlassDivider variant={v} />
            </div>
          ))}
          <GlassDivider label="albo" />
          <GlassDivider variant="gradient" label="sekcja" />
          <div className="flex h-12 items-center gap-4">
            <span className="text-xs text-foreground/60">lewa</span>
            <GlassDivider orientation="vertical" />
            <span className="text-xs text-foreground/60">prawa</span>
          </div>
        </GlassCard>
      </div>

      {/* DEKORACJE TŁA */}
      <div className="space-y-4">
        <h3 id="dekoracje" className="text-sm font-semibold text-foreground/70">Dekoracje tła</h3>
        <SectionLabel>Orb, mesh, aurora, noise — warstwy pod treścią, wszystkie pointer-events-none</SectionLabel>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative h-40 overflow-hidden rounded-2xl border border-border">
            <GlassOrb size={220} style={{ top: -40, left: -30 }} />
            <GlassOrb size={180} color="hsl(270 65% 58%)" style={{ bottom: -50, right: -20 }} />
            <div className="relative flex h-full items-center justify-center text-xs font-semibold text-foreground/70">GlassOrb ×2</div>
          </div>

          <div className="relative h-40 overflow-hidden rounded-2xl border border-border">
            <GlassMeshGradient />
            <div className="relative flex h-full items-center justify-center text-xs font-semibold text-foreground/70">GlassMeshGradient</div>
          </div>

          <div className="relative h-40 overflow-hidden rounded-2xl border border-border">
            <GlassAurora />
            <div className="relative flex h-full items-center justify-center text-xs font-semibold text-foreground/70">GlassAurora</div>
          </div>

          <div className="relative h-40 overflow-hidden rounded-2xl border border-border bg-primary/[0.07]">
            <GlassNoise opacity={0.14} />
            <div className="relative flex h-full items-center justify-center text-xs font-semibold text-foreground/70">GlassNoise</div>
          </div>
        </div>

        <SectionLabel>Spotlight — poświata podąża za kursorem (najedź)</SectionLabel>
        <GlassSpotlight className="h-40 rounded-2xl border border-border">
          <div className="flex h-full items-center justify-center text-xs font-semibold text-foreground/60">
            Przesuń kursor po tym polu
          </div>
        </GlassSpotlight>

        <SectionLabel>Narożniki techniczne i świecąca krawędź</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative h-32 rounded-2xl border border-border">
            <GlassCornerDecor />
            <div className="flex h-full items-center justify-center text-[11px] text-foreground/60">CornerDecor</div>
          </div>
          <GlassBorderGlow>
            <div className="flex h-32 items-center justify-center rounded-2xl bg-card text-[11px] text-foreground/60">
              BorderGlow
            </div>
          </GlassBorderGlow>
          <GlassBorderGlow animated>
            <div className="flex h-32 items-center justify-center rounded-2xl bg-card text-[11px] text-foreground/60">
              BorderGlow animated
            </div>
          </GlassBorderGlow>
        </div>
      </div>

      {/* PRZYKŁAD ZŁOŻONY */}
      <div className="space-y-4">
        <h3 id="uklad-przyklad" className="text-sm font-semibold text-foreground/70">Przykład — bento dashboard</h3>
        <SectionLabel>Wszystkie prymitywy razem: bento + orb + cluster + divider</SectionLabel>
        <div className="relative overflow-hidden rounded-2xl p-4">
          <GlassOrb size={280} style={{ top: -80, right: -60 }} opacity={0.12} />
          <GlassBento
            tiles={[
              {
                span: 2, rows: 2,
                content: (
                  <GlassCard className="flex h-full flex-col justify-between">
                    <div>
                      <GlassBadge intent="primary" size="sm">GŁÓWNA</GlassBadge>
                      <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">2 847</p>
                      <p className="text-[11px] text-foreground/45">zapytań w tym tygodniu</p>
                    </div>
                    <GlassDivider variant="gradient" />
                    <GlassCluster space="xs">
                      {[Sparkles, Camera, Brain, Database].map((I, i) => (
                        <span key={i} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                          <I className="h-3.5 w-3.5" />
                        </span>
                      ))}
                    </GlassCluster>
                  </GlassCard>
                ),
              },
              { span: 2, content: <GlassCard className="flex h-full items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="text-xs text-foreground/70">Saldo 4 820 ⟠</span></GlassCard> },
              { span: 1, content: <GlassCard className="flex h-full items-center justify-center"><Rocket className="h-4 w-4 text-primary" /></GlassCard> },
              { span: 1, content: <GlassCard className="flex h-full items-center justify-center text-xs text-foreground/60">99.8%</GlassCard> },
            ]}
          />
        </div>
      </div>

    </div>
  )
}
