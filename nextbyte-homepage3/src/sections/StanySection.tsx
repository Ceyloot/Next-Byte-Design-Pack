import React, { useState } from 'react'
import {
  PanelRight, PanelLeft, PanelBottom, PanelTop,
  Shield, Zap, CreditCard, RefreshCw, Plus,
} from 'lucide-react'
import {
  GlassSkeleton, GlassSkeletonText, GlassSkeletonAvatar, GlassSkeletonListItem,
  GlassSkeletonCard, GlassSkeletonTable, GlassSkeletonForm, GlassSkeletonImage,
  GlassSpinner, GlassSpinnerDots, GlassSpinnerBar, GlassLoadingOverlay,
  GlassEmpty, GlassAccordion, GlassAccordionItem, GlassCollapsible,
  GlassDrawer, GlassButton, GlassBadge, GlassCard, GlassAlert,
} from '@/components/glass'
import type { DrawerSide } from '@/components/glass/GlassDrawer'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

export function StanySection() {
  const [drawer, setDrawer]   = useState<DrawerSide | null>(null)
  const [overlay, setOverlay] = useState(false)

  return (
    <div className="space-y-10">

      {/* ── SPINNERY ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 id="ladowanie" className="text-sm font-semibold text-foreground/70">Wskaźniki ładowania</h3>
        <SectionLabel>Pierścień · kropki · pasek nieokreślony</SectionLabel>

        <GlassCard className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <div className="flex items-center gap-4">
            <GlassSpinner size="sm" />
            <GlassSpinner size="md" />
            <GlassSpinner size="lg" />
          </div>
          <GlassSpinner size="md" label="Generowanie…" />
          <div className="flex items-center gap-5">
            <GlassSpinnerDots size="sm" />
            <GlassSpinnerDots size="md" />
            <GlassSpinnerDots size="lg" />
          </div>
        </GlassCard>

        <div className="space-y-2">
          <SectionLabel>Pasek nieokreślony</SectionLabel>
          <GlassSpinnerBar className="rounded-full" />
        </div>

        {/* Nakładka — demonstrowana w kontenerze, nie na całym oknie */}
        <div className="relative min-h-[140px] overflow-hidden rounded-2xl">
          <GlassSkeletonCard image={false} />
          {overlay && <GlassLoadingOverlay fullScreen={false} label="Wczytywanie danych…" />}
        </div>
        <GlassButton size="sm" variant="outline" onClick={() => setOverlay(v => !v)}>
          <RefreshCw className="h-3.5 w-3.5" />
          {overlay ? 'Ukryj nakładkę' : 'Pokaż nakładkę ładowania'}
        </GlassButton>
      </div>

      {/* ── SZKIELETY ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 id="szkielet" className="text-sm font-semibold text-foreground/70">Szkielety (Skeleton)</h3>
        <SectionLabel>Zastępują treść na czas wczytywania</SectionLabel>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <SectionLabel>Tekst</SectionLabel>
            <GlassCard className="space-y-4">
              <GlassSkeletonText lines={1} />
              <GlassSkeletonText lines={3} />
            </GlassCard>
          </div>

          <div className="space-y-3">
            <SectionLabel>Avatar + lista</SectionLabel>
            <GlassCard className="space-y-4">
              <GlassSkeletonListItem />
              <GlassSkeletonListItem />
              <GlassSkeletonListItem />
            </GlassCard>
          </div>

          <div className="space-y-3">
            <SectionLabel>Obraz i avatary</SectionLabel>
            <GlassCard className="space-y-4">
              <GlassSkeletonImage aspect="aspect-[16/7]" />
              <div className="flex items-center gap-2">
                <GlassSkeletonAvatar size="xs" />
                <GlassSkeletonAvatar size="sm" />
                <GlassSkeletonAvatar size="md" />
                <GlassSkeletonAvatar size="lg" />
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionLabel>Karta</SectionLabel>
            <GlassSkeletonCard />
          </div>
          <div className="space-y-3">
            <SectionLabel>Formularz</SectionLabel>
            <GlassCard><GlassSkeletonForm fields={3} /></GlassCard>
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel>Tabela</SectionLabel>
          <GlassSkeletonTable rows={4} cols={4} />
        </div>
      </div>

      {/* ── BŁĘDY ───────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 id="blad" className="text-sm font-semibold text-foreground/70">Stany błędu (Error state)</h3>
        <SectionLabel>GlassAlert — warianty błędu, ostrzeżenia i informacji</SectionLabel>

        <div className="space-y-3 max-w-xl">
          <GlassAlert variant="error" title="Błąd krytyczny" description="Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie." />
          <GlassAlert variant="warning" title="Przekroczono limit" description="Zużyto 90% miesięcznej puli Byte. Rozważ doładowanie konta." />
          <GlassAlert variant="info" title="Zaplanowana przerwa techniczna" description="Serwis będzie niedostępny 20.08 w godz. 02:00–04:00." />
          <GlassAlert variant="success" title="Operacja zakończona" description="Dane zostały pomyślnie zsynchronizowane z bazą." />
        </div>

        <SectionLabel>GlassEmpty — wariant błędu z akcją</SectionLabel>
        <GlassEmpty
          variant="blad"
          title="Nie udało się załadować danych"
          desc="Serwer zwrócił błąd 503. Odśwież stronę lub skontaktuj się z pomocą techniczną."
          action={<GlassButton size="sm" variant="ghost"><RefreshCw className="h-3.5 w-3.5" />Spróbuj ponownie</GlassButton>}
        />
      </div>

      {/* ── STANY PUSTE ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 id="pusty-widok" className="text-sm font-semibold text-foreground/70">Stany puste (Empty state)</h3>
        <SectionLabel>Cztery warianty · z akcją i bez</SectionLabel>

        <div className="grid gap-4 md:grid-cols-2">
          <GlassEmpty variant="ogolny" />
          <GlassEmpty variant="brak-wynikow" />
          <GlassEmpty variant="brak-danych" compact />
          <GlassEmpty variant="blad" compact />
        </div>

        <div className="space-y-3">
          <SectionLabel>Z wezwaniem do działania</SectionLabel>
          <GlassEmpty
            variant="ogolny"
            title="Nie masz jeszcze projektów"
            desc="Utwórz pierwszy projekt, żeby zacząć korzystać z modeli i śledzić zużycie tokenów."
            action={<GlassButton size="sm"><Plus className="h-3.5 w-3.5" />Nowy projekt</GlassButton>}
          />
        </div>
      </div>

      {/* ── AKORDEON ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Akordeon</h3>
        <SectionLabel>Pojedynczy otwarty — klasyczne FAQ</SectionLabel>

        <GlassAccordion defaultOpen={['a']}>
          <GlassAccordionItem
            value="a"
            title="Jak liczone są tokeny?"
            icon={<Zap className="h-4 w-4" />}
          >
            Token to fragment tekstu — średnio około czterech znaków. Naliczamy zarówno tokeny
            wejściowe, jak i wygenerowane przez model. Bieżące zużycie widzisz w panelu rozliczeń.
          </GlassAccordionItem>

          <GlassAccordionItem
            value="b"
            title="Czy moje dane trafiają do trenowania modeli?"
            icon={<Shield className="h-4 w-4" />}
            badge={<GlassBadge intent="success" size="sm">Nie</GlassBadge>}
          >
            Nie. Treść rozmów nie jest wykorzystywana do trenowania. Dane przechowujemy wyłącznie
            przez czas potrzebny na obsługę zapytania i historii konwersacji.
          </GlassAccordionItem>

          <GlassAccordionItem
            value="c"
            title="Jak zmienić plan?"
            icon={<CreditCard className="h-4 w-4" />}
          >
            Plan zmienisz w każdej chwili w ustawieniach rozliczeń. Zmiana na wyższy działa od razu,
            na niższy — od kolejnego okresu rozliczeniowego.
          </GlassAccordionItem>

          <GlassAccordionItem value="d" title="Pozycja wyłączona" disabled>
            Ta treść jest niedostępna.
          </GlassAccordionItem>
        </GlassAccordion>

        <div className="space-y-3">
          <SectionLabel>Wiele otwartych naraz</SectionLabel>
          <GlassAccordion multiple defaultOpen={['x', 'y']}>
            <GlassAccordionItem value="x" title="Limity zapytań">
              60 zapytań na minutę w planie darmowym, 600 w Pro.
            </GlassAccordionItem>
            <GlassAccordionItem value="y" title="Obsługiwane formaty">
              PDF, DOCX, XLSX, CSV, TXT, PNG i JPG — do 25 MB na plik.
            </GlassAccordionItem>
          </GlassAccordion>
        </div>

        <div className="space-y-3">
          <SectionLabel>Sekcja zwijana (bez ramki)</SectionLabel>
          <GlassCard>
            <GlassCollapsible title="Ustawienia zaawansowane" defaultOpen>
              <p className="text-xs leading-relaxed text-foreground/60">
                Temperatura, top-p oraz limit tokenów wyjściowych. Zmieniaj tylko wtedy, gdy wiesz,
                jak wpływają na odpowiedzi modelu.
              </p>
            </GlassCollapsible>
          </GlassCard>
        </div>
      </div>

      {/* ── SZUFLADY ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Szuflada (Drawer)</h3>
        <SectionLabel>Cztery kierunki · dolna z uchwytem</SectionLabel>

        <div className="flex flex-wrap gap-2.5">
          <GlassButton size="sm" variant="outline" onClick={() => setDrawer('right')}>
            <PanelRight className="h-3.5 w-3.5" />Prawa
          </GlassButton>
          <GlassButton size="sm" variant="outline" onClick={() => setDrawer('left')}>
            <PanelLeft className="h-3.5 w-3.5" />Lewa
          </GlassButton>
          <GlassButton size="sm" variant="outline" onClick={() => setDrawer('bottom')}>
            <PanelBottom className="h-3.5 w-3.5" />Dolna
          </GlassButton>
          <GlassButton size="sm" variant="outline" onClick={() => setDrawer('top')}>
            <PanelTop className="h-3.5 w-3.5" />Górna
          </GlassButton>
        </div>

        <GlassDrawer
          open={drawer !== null}
          onClose={() => setDrawer(null)}
          side={drawer ?? 'right'}
          title="Ustawienia modelu"
          desc="Zmiany zapisują się automatycznie"
          footer={
            <div className="flex justify-end gap-2">
              <GlassButton size="sm" variant="ghost" onClick={() => setDrawer(null)}>Anuluj</GlassButton>
              <GlassButton size="sm" onClick={() => setDrawer(null)}>Zapisz</GlassButton>
            </div>
          }
        >
          <div className="space-y-4 py-2">
            <p className="text-xs leading-relaxed text-foreground/60">
              Szuflada wjeżdża z krawędzi {drawer === 'left' ? 'lewej' : drawer === 'bottom' ? 'dolnej' : drawer === 'top' ? 'górnej' : 'prawej'}.
              Zamkniesz ją klawiszem Escape, kliknięciem w tło albo krzyżykiem.
            </p>
            <GlassSkeletonForm fields={2} />
          </div>
        </GlassDrawer>
      </div>

    </div>
  )
}
