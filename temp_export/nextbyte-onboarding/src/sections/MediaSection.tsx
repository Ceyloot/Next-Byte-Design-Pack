import React from 'react'
import { Camera, Brain, Rocket, Database, Sparkles, Terminal, Music, Video } from 'lucide-react'
import {
  GlassCard, GlassGallery, GlassLightbox, GlassCarousel, GlassImageCompare,
  GlassVideoPlayer, GlassAudioPlayer, GlassAspectRatio,
} from '@/components/glass'
import type { GalleryItem } from '@/components/glass'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const GALLERY: GalleryItem[] = [
  { id: '1', title: 'Portret studyjny',   caption: 'Grok Image · 2048×2048', icon: Camera,  gradient: 'from-primary/35 via-sky-600/25 to-blue-700/20' },
  { id: '2', title: 'Wnętrze loftu',      caption: 'Grok Image · 1920×1080', icon: Sparkles, gradient: 'from-amber-500/35 via-orange-600/25 to-red-700/20' },
  { id: '3', title: 'Krajobraz górski',   caption: 'Flux · 2560×1440',       icon: Rocket,  gradient: 'from-emerald-500/35 via-teal-600/25 to-cyan-700/20' },
  { id: '4', title: 'Produkt na białym',  caption: 'Grok Image · 1024×1024', icon: Database, gradient: 'from-purple-500/35 via-violet-600/25 to-indigo-700/20' },
  { id: '5', title: 'Makieta aplikacji',  caption: 'Figma export',           icon: Terminal, gradient: 'from-cyan-500/35 via-blue-600/25 to-indigo-700/20' },
  { id: '6', title: 'Wizualizacja 3D',    caption: 'Blender · 4K',           icon: Brain,   gradient: 'from-rose-500/35 via-pink-600/25 to-fuchsia-700/20' },
]

const SLIDES: GalleryItem[] = [
  { id: 's1', title: 'Grok Image — kosmiczny realizm', caption: 'Fotorealizm twarzy, skóry i światła', icon: Camera,  gradient: 'from-primary/40 via-sky-600/30 to-blue-700/25' },
  { id: 's2', title: 'Chat AI 4.0',                    caption: 'O 300% szybsza generacja kodu',       icon: Brain,   gradient: 'from-cyan-500/40 via-blue-600/30 to-indigo-700/25' },
  { id: 's3', title: 'PromptEx v3',                    caption: 'Optymalizator instrukcji w locie',    icon: Terminal, gradient: 'from-amber-500/40 via-orange-600/30 to-red-700/25' },
  { id: 's4', title: 'Byte Cloud',                     caption: 'Bezlimitowa pamięć sesji roboczych',  icon: Database, gradient: 'from-emerald-500/40 via-teal-600/30 to-cyan-700/25' },
]

export function MediaSection() {
  const [lightbox, setLightbox] = React.useState<number | null>(null)

  return (
    <div className="space-y-10">

      {/* GALERIA */}
      <div className="space-y-4">
        <h3 id="galeria" className="text-sm font-semibold text-foreground/70">Galeria</h3>
        <SectionLabel>Siatka równa — kliknij kafelek, żeby otworzyć lightbox</SectionLabel>
        <GlassGallery items={GALLERY} cols={3} onOpen={setLightbox} />

        <SectionLabel>Siatka 4 kolumny</SectionLabel>
        <GlassGallery items={GALLERY} cols={4} onOpen={setLightbox} />

        <SectionLabel>Masonry — nierówne wysokości</SectionLabel>
        <GlassGallery items={GALLERY} cols={3} masonry onOpen={setLightbox} />

        <GlassLightbox
          items={GALLERY}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndexChange={setLightbox}
        />
      </div>

      {/* LIGHTBOX */}
      <div className="space-y-4">
        <h3 id="lightbox" className="text-sm font-semibold text-foreground/70">Lightbox</h3>
        <SectionLabel>Nakładka pełnoekranowa · strzałki ←/→ przewijają, Esc zamyka</SectionLabel>
        <GlassCard className="flex flex-wrap items-center gap-3">
          {GALLERY.slice(0, 4).map((g, i) => (
            <button
              key={g.id}
              onClick={() => setLightbox(i)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
            >
              Otwórz „{g.title}”
            </button>
          ))}
        </GlassCard>
      </div>

      {/* KARUZELA */}
      <div className="space-y-4">
        <h3 id="karuzela" className="text-sm font-semibold text-foreground/70">Karuzela</h3>
        <SectionLabel>Ręczna — strzałki i kropki nawigacyjne</SectionLabel>
        <GlassCarousel items={SLIDES} className="max-w-2xl" />

        <SectionLabel>Automatyczna — zatrzymuje się po najechaniu kursorem</SectionLabel>
        <GlassCarousel items={SLIDES} autoPlay interval={3000} className="max-w-2xl" />
      </div>

      {/* PORÓWNYWARKA */}
      <div className="space-y-4">
        <h3 id="porownywarka" className="text-sm font-semibold text-foreground/70">Porównywarka obrazów</h3>
        <SectionLabel>Przeciągnij uchwyt w lewo/prawo — przed vs po</SectionLabel>
        <GlassImageCompare
          before={{ id: 'b', icon: Camera, gradient: 'from-neutral-600/40 via-neutral-700/30 to-neutral-800/25' }}
          after={{ id: 'a', icon: Sparkles, gradient: 'from-primary/40 via-sky-600/30 to-blue-700/25' }}
          className="max-w-2xl"
        />
        <SectionLabel>Własne etykiety — np. jakość generacji</SectionLabel>
        <GlassImageCompare
          before={{ id: 'b2', icon: Camera, gradient: 'from-amber-700/30 via-orange-800/25 to-red-900/20' }}
          after={{ id: 'a2', icon: Camera, gradient: 'from-emerald-500/40 via-teal-600/30 to-cyan-700/25' }}
          labelBefore="Fast"
          labelAfter="Enhancer 2×"
          className="max-w-2xl"
        />
      </div>

      {/* ODTWARZACZ WIDEO */}
      <div className="space-y-4">
        <h3 id="wideo" className="text-sm font-semibold text-foreground/70">Odtwarzacz wideo</h3>
        <SectionLabel>Pełny transport — play/pauza, ±10 s, scrub, głośność · sterowanie chowa się w trakcie odtwarzania</SectionLabel>
        <GlassVideoPlayer title="Wprowadzenie do PromptEx" duration={754} className="max-w-2xl" />

        <SectionLabel>Z własnym plakatem i inną długością</SectionLabel>
        <GlassVideoPlayer
          title="Studio Zdjęć — kadry 3D"
          duration={192}
          poster={
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/30 via-teal-700/25 to-cyan-800/20">
              <Video className="h-8 w-8 text-white/50" />
            </div>
          }
          className="max-w-2xl"
        />
      </div>

      {/* ODTWARZACZ AUDIO */}
      <div className="space-y-4">
        <h3 id="audio" className="text-sm font-semibold text-foreground/70">Odtwarzacz audio</h3>
        <SectionLabel>Z waveformem — kliknij falę, żeby przeskoczyć</SectionLabel>
        <div className="max-w-xl space-y-3">
          <GlassAudioPlayer title="AI w małej firmie" artist="Podcast NextByte · odc. 12" duration={2280} />
          <GlassAudioPlayer title="Jak pisać prompty" artist="Akademia Premium" duration={914} />
        </div>

        <SectionLabel>Bez waveformu — zwykły pasek postępu</SectionLabel>
        <GlassAudioPlayer
          title="Notatka głosowa 2026-08-18"
          artist="Nagranie własne"
          duration={128}
          showWaveform={false}
          className="max-w-xl"
        />
      </div>

      {/* ASPECT RATIO W MEDIACH */}
      <div className="space-y-4">
        <h3 id="media-proporcje" className="text-sm font-semibold text-foreground/70">Proporcje w mediach</h3>
        <SectionLabel>Ten sam kafelek w pięciu proporcjach</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(['16/9', '1/1', '4/3', '3/2', '21/9'] as const).map((r) => (
            <div key={r} className="space-y-1.5">
              <GlassAspectRatio ratio={r} className="rounded-xl">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/30 via-sky-600/20 to-blue-700/15">
                  <Music className="h-5 w-5 text-white/50" />
                </div>
              </GlassAspectRatio>
              <p className="text-center font-mono text-[10px] text-foreground/35">{r}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
