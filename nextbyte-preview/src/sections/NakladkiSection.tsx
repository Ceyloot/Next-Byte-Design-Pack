import React, { useState } from 'react'
import { Sparkles, ArrowRight, AlertTriangle, Info, Copy, Settings, PanelRight, PanelLeft, PanelBottom, PanelTop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassModal, GlassButton, GlassInput, GlassSearch, GlassBadge, GlassStat, GlassTooltip, GlassDrawer, GlassSkeletonForm } from '@/components/glass'
import type { DrawerSide } from '@/components/glass/GlassDrawer'
import { toast } from '@/components/ui/toaster'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

export function NakladkiSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [drawer, setDrawer] = useState<DrawerSide | null>(null)

  return (
    <div className="space-y-10">

      {/* DIALOG / MODAL */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Dialog / Modal</h3>
        <SectionLabel>Okna dialogowe z różną zawartością</SectionLabel>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" onClick={() => setModalOpen(true)}>
            <Info className="h-4 w-4" /> Informacje
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <AlertTriangle className="h-4 w-4" /> Potwierdź akcję
          </Button>
          <Button variant="nextbyte" onClick={() => setModelOpen(true)}>
            <Sparkles className="h-4 w-4" /> Wybór modelu
          </Button>
        </div>

        {/* Glass modals */}
        <GlassModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Informacje o projekcie"
          description="Szczegóły konfiguracji i statusu projektu."
          footer={
            <GlassButton onClick={() => setModalOpen(false)}>Zamknij</GlassButton>
          }
        >
          <div className="space-y-3 text-sm text-foreground/70">
            <div className="flex justify-between"><span>Wersja</span><strong className="text-foreground">2.4.1</strong></div>
            <div className="flex justify-between"><span>Status</span><GlassBadge intent="success" dot size="sm">Aktywny</GlassBadge></div>
            <div className="flex justify-between"><span>Ostatnia aktualizacja</span><strong className="text-foreground">dzisiaj 14:32</strong></div>
          </div>
        </GlassModal>

        <GlassModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Potwierdź usunięcie"
          description="Ta operacja jest nieodwracalna. Wszystkie dane zostaną trwale usunięte."
          footer={
            <>
              <GlassButton variant="ghost" onClick={() => setConfirmOpen(false)}>Anuluj</GlassButton>
              <GlassButton onClick={() => { setConfirmOpen(false); toast.error('Usunięto') }}>
                Usuń <AlertTriangle className="h-4 w-4" />
              </GlassButton>
            </>
          }
        >
          <GlassBadge intent="danger" size="sm" dot>Nieodwracalna operacja</GlassBadge>
        </GlassModal>

        <GlassModal
          open={modelOpen}
          onClose={() => setModelOpen(false)}
          title="Konfiguracja modelu AI"
          description="Wybierz model i ustaw parametry generowania."
          width="max-w-lg"
          footer={
            <>
              <GlassButton variant="ghost" onClick={() => setModelOpen(false)}>Anuluj</GlassButton>
              <GlassButton onClick={() => { setModelOpen(false); toast.success('Zapisano konfigurację') }}>
                Zapisz <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </>
          }
        >
          <div className="space-y-4">
            <GlassInput iconLeft={<Sparkles className="h-4 w-4" />} placeholder="Nazwa konfiguracji..." />
            <GlassSearch placeholder="Szukaj modelu..." />
            <div className="flex flex-wrap gap-2">
              {['GPT-4o', 'Claude 4', 'Gemini Flash', 'Llama 70B'].map((m) => (
                <GlassBadge key={m} intent="primary" className="cursor-pointer">{m}</GlassBadge>
              ))}
            </div>
            <GlassStat label="Koszt / 1M tokenów" value="$5.00" delta="-12%" trend="down" subtext="GPT-4o Input" />
          </div>
        </GlassModal>
      </div>

      {/* TOASTY */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Toast / Powiadomienia</h3>
        <SectionLabel>Typy powiadomień</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Sukces',   fn: () => toast.success('Operacja zakończona pomyślnie') },
            { label: 'Błąd',    fn: () => toast.error('Wystąpił błąd połączenia') },
            { label: 'Info',    fn: () => toast.info('Nowa wersja API jest dostępna') },
            { label: 'Uwaga',   fn: () => toast.warning('Przekroczono 80% limitu tokenów') },
          ].map(({ label, fn }) => (
            <Button key={label} variant="outline" onClick={fn}>{label}</Button>
          ))}
        </div>
      </div>

      {/* TOOLTIP */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Tooltip</h3>
        <SectionLabel>Cztery kierunki — najedź kursorem</SectionLabel>
        <div className="flex flex-wrap items-center gap-6 py-6">
          <GlassTooltip content="Góra — top" side="top">
            <GlassButton variant="outline" size="sm">Top</GlassButton>
          </GlassTooltip>
          <GlassTooltip content="Dół — bottom" side="bottom">
            <GlassButton variant="outline" size="sm">Bottom</GlassButton>
          </GlassTooltip>
          <GlassTooltip content="Lewo — left" side="left">
            <GlassButton variant="outline" size="sm">Left</GlassButton>
          </GlassTooltip>
          <GlassTooltip content="Prawo — right" side="right">
            <GlassButton variant="outline" size="sm">Right</GlassButton>
          </GlassTooltip>
          <GlassTooltip content="Kopiuj do schowka" side="top">
            <GlassButton variant="ghost" size="icon"><Copy className="h-4 w-4" /></GlassButton>
          </GlassTooltip>
          <GlassTooltip content="Ustawienia projektu" side="top">
            <GlassButton variant="ghost" size="icon"><Settings className="h-4 w-4" /></GlassButton>
          </GlassTooltip>
        </div>
      </div>

      {/* DRAWER */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/70">Szuflada (Drawer)</h3>
        <SectionLabel>Cztery kierunki — dolna z uchwytem · Glass / Normal automatycznie</SectionLabel>
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
              Zamkniesz ją klawiszem Escape, kliknięciem w tło lub krzyżykiem.
            </p>
            <GlassSkeletonForm fields={3} />
          </div>
        </GlassDrawer>
      </div>

    </div>
  )
}
