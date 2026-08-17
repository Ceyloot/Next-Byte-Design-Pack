import React, { useState } from 'react'
import {
  Zap, Download, Trash2, Plus, ArrowRight, Sparkles,
  Settings, Copy, LogOut, Edit3, Star, Bell, Heart,
  ChevronDown, User, Shield, FileText, RefreshCw, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassButton, GlassBadge, GlassAlert, GlassChip, GlassAvatar, GlassAvatarGroup, GlassTooltip, GlassDropdown, GlassDropdownSelect } from '@/components/glass'
import { useGlass } from '@/lib/glass-context'
import { cn } from '@/lib/utils'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-4">{children}</p>
}

function Block({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  )
}

const DROPDOWN_ITEMS = [
  { key: 'edit',   label: 'Edytuj',       icon: <Edit3 className="h-4 w-4" /> },
  { key: 'copy',   label: 'Kopiuj link',  icon: <Copy className="h-4 w-4" /> },
  { key: 'share',  label: 'Udostępnij',   icon: <Send className="h-4 w-4" /> },
  { key: 'div1',   label: '',             divider: true },
  { key: 'delete', label: 'Usuń projekt', icon: <Trash2 className="h-4 w-4" />, danger: true },
]

const SELECT_OPTS = [
  { value: 'gpt4',   label: 'GPT-4o'        },
  { value: 'claude', label: 'Claude Sonnet' },
  { value: 'gemini', label: 'Gemini Flash'  },
  { value: 'llama',  label: 'Llama 3 70B'  },
]

const AVATARS = [
  { name: 'Anna Kowalska',   status: 'online'  as const },
  { name: 'Piotr Nowak',     status: 'busy'    as const },
  { name: 'Kasia Wiśniewska',status: 'away'    as const },
  { name: 'Marek Zieliński', status: 'offline' as const },
  { name: 'Ola Dąbrowska'                               },
  { name: 'Tom Mazur'                                   },
]

export function AkcjeSection() {
  const { isGlass } = useGlass()
  const [chips, setChips] = useState(['React', 'TypeScript', 'Tailwind', 'Vite', 'NextByte'])
  const [selectedModel, setSelectedModel] = useState<string>('claude')
  const [alerts, setAlerts] = useState({ info: true, success: true, warning: true, danger: true })

  return (
    <div className="space-y-14">

      {/* ═══ PRZYCISKI GLASS ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Przyciski (Button)</h3>

        <Block label="Warianty glass — Glass / Normal automatycznie">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton variant="primary"><Sparkles className="h-4 w-4" />Primary</GlassButton>
            <GlassButton variant="solid">Solid</GlassButton>
            <GlassButton variant="outline">Outline</GlassButton>
            <GlassButton variant="ghost">Ghost</GlassButton>
            <GlassButton variant="success"><Zap className="h-4 w-4" />Sukces</GlassButton>
            <GlassButton variant="danger"><Trash2 className="h-4 w-4" />Usuń</GlassButton>
            <GlassButton variant="solid" disabled>Wyłączony</GlassButton>
          </div>
        </Block>

        <Block label="Z ikonami">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton variant="primary"><Plus className="h-4 w-4" />Nowy projekt</GlassButton>
            <GlassButton variant="outline"><Download className="h-4 w-4" />Pobierz</GlassButton>
            <GlassButton variant="solid">Zapisz<ArrowRight className="h-4 w-4" /></GlassButton>
            <GlassButton variant="ghost"><RefreshCw className="h-4 w-4" />Odśwież</GlassButton>
          </div>
        </Block>

        <Block label="Rozmiary">
          <div className="flex flex-wrap items-end gap-3">
            <GlassButton variant="primary" size="sm"><Sparkles className="h-3.5 w-3.5" />Mały sm</GlassButton>
            <GlassButton variant="primary" size="default">Domyślny</GlassButton>
            <GlassButton variant="primary" size="lg">Duży lg</GlassButton>
          </div>
        </Block>

        <Block label="Ikona (square)">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton variant="primary"  size="icon"><Sparkles className="h-4 w-4" /></GlassButton>
            <GlassButton variant="solid"    size="icon"><Settings  className="h-4 w-4" /></GlassButton>
            <GlassButton variant="outline"  size="icon"><Download  className="h-4 w-4" /></GlassButton>
            <GlassButton variant="ghost"    size="icon"><Bell      className="h-4 w-4" /></GlassButton>
            <GlassButton variant="danger"   size="icon"><Trash2    className="h-4 w-4" /></GlassButton>
            <GlassButton variant="success"  size="icon"><Zap       className="h-4 w-4" /></GlassButton>
          </div>
        </Block>

        <Block label="Przycisk platformy NextByte (Button z animowaną obwódką)">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="nextbyte"><Sparkles className="h-4 w-4" />Główny</Button>
            <Button variant="default">Standardowy</Button>
            <Button variant="outline">Obwódka</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive"><Trash2 className="h-4 w-4" />Usuń</Button>
          </div>
        </Block>
      </section>

      {/* ═══ BADGE ═══════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Znaczniki (Badge)</h3>

        <Block label="Intencje">
          <div className="flex flex-wrap items-center gap-3">
            <GlassBadge intent="neutral">Neutralny</GlassBadge>
            <GlassBadge intent="primary">Primary</GlassBadge>
            <GlassBadge intent="success">Sukces</GlassBadge>
            <GlassBadge intent="warning">Uwaga</GlassBadge>
            <GlassBadge intent="danger">Błąd</GlassBadge>
          </div>
        </Block>

        <Block label="Z punktem statusu">
          <div className="flex flex-wrap items-center gap-3">
            <GlassBadge intent="success" dot>Online</GlassBadge>
            <GlassBadge intent="warning" dot>Degraded</GlassBadge>
            <GlassBadge intent="danger"  dot>Offline</GlassBadge>
            <GlassBadge intent="primary" dot>Beta</GlassBadge>
            <GlassBadge intent="neutral" dot>Pending</GlassBadge>
          </div>
        </Block>

        <Block label="Rozmiary">
          <div className="flex flex-wrap items-center gap-3">
            <GlassBadge size="sm" intent="primary">Mały</GlassBadge>
            <GlassBadge intent="primary">Domyślny</GlassBadge>
          </div>
        </Block>
      </section>

      {/* ═══ CHIP / TAG ══════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Chip / Tag</h3>

        <Block label="Kolory">
          <div className="flex flex-wrap gap-2">
            <GlassChip color="default">Default</GlassChip>
            <GlassChip color="primary">Primary</GlassChip>
            <GlassChip color="success">Sukces</GlassChip>
            <GlassChip color="warning">Uwaga</GlassChip>
            <GlassChip color="danger">Błąd</GlassChip>
            <GlassChip color="purple">Purple</GlassChip>
            <GlassChip color="cyan">Cyan</GlassChip>
          </div>
        </Block>

        <Block label="Usuwalne — kliknij ✕ aby usunąć tag">
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <GlassChip
                key={chip}
                color="primary"
                onRemove={() => setChips((prev) => prev.filter((c) => c !== chip))}
              >
                {chip}
              </GlassChip>
            ))}
            {chips.length === 0 && (
              <button
                className="text-xs text-foreground/40 hover:text-foreground/70"
                onClick={() => setChips(['React', 'TypeScript', 'Tailwind', 'Vite', 'NextByte'])}
              >
                + Przywróć
              </button>
            )}
          </div>
        </Block>

        <Block label="Rozmiary">
          <div className="flex flex-wrap items-center gap-2">
            <GlassChip size="sm" color="primary">Mały sm</GlassChip>
            <GlassChip size="default" color="primary">Domyślny</GlassChip>
          </div>
        </Block>
      </section>

      {/* ═══ AVATAR ══════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Avatar</h3>

        <Block label="Rozmiary">
          <div className="flex flex-wrap items-end gap-4">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-2">
                <GlassAvatar name="Anna Kowalska" size={sz} status="online" />
                <span className="font-mono text-[10px] text-foreground/40">{sz}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block label="Statusy">
          <div className="flex flex-wrap items-center gap-4">
            <GlassAvatar name="Anna K." status="online"  size="lg" />
            <GlassAvatar name="Piotr N."  status="busy"   size="lg" />
            <GlassAvatar name="Kasia W." status="away"   size="lg" />
            <GlassAvatar name="Marek Z." status="offline" size="lg" />
          </div>
        </Block>

        <Block label="Grupa awatarów — stos ze zliczaniem nadmiaru">
          <GlassAvatarGroup avatars={AVATARS} max={4} size="md" />
        </Block>
      </section>

      {/* ═══ TOOLTIP ══════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Tooltip</h3>

        <Block label="Kierunki — najedź na przycisk">
          <div className="flex flex-wrap items-center gap-6 py-8">
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
          </div>
        </Block>
      </section>

      {/* ═══ DROPDOWN ════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Dropdown</h3>

        <Block label="Menu kontekstowe i select — kliknij aby otworzyć">
          <div className="flex flex-wrap items-start gap-6">

            {/* Dropdown menu */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground/45">Menu akcji</span>
              <GlassDropdown
                trigger={
                  <GlassButton variant="solid" className="gap-2">
                    <Settings className="h-4 w-4" />Opcje
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </GlassButton>
                }
                items={DROPDOWN_ITEMS}
              />
            </div>

            {/* Dropdown select */}
            <div className="flex flex-col gap-1.5 w-52">
              <span className="text-xs font-medium text-foreground/45">Wybór modelu</span>
              <GlassDropdownSelect
                options={SELECT_OPTS}
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>

            {/* Dropdown z avatarem */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground/45">Menu użytkownika</span>
              <GlassDropdown
                trigger={
                  <div className={cn(
                    'flex items-center gap-2.5 cursor-pointer rounded-xl border px-3 py-2 transition-all',
                    isGlass ? 'nb-szklo' : 'border-border bg-muted/30 hover:bg-muted/50',
                  )}>
                    <GlassAvatar name="Anna Kowalska" size="sm" status="online" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Anna K.</p>
                      <p className="text-[10px] text-foreground/50">Pro</p>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-foreground/40 ml-1" />
                  </div>
                }
                items={[
                  { key: 'profile',  label: 'Profil',        icon: <User    className="h-4 w-4" /> },
                  { key: 'settings', label: 'Ustawienia',    icon: <Settings className="h-4 w-4" /> },
                  { key: 'billing',  label: 'Subskrypcja',   icon: <Star    className="h-4 w-4" /> },
                  { key: 'div',      label: '', divider: true },
                  { key: 'logout',   label: 'Wyloguj się',   icon: <LogOut  className="h-4 w-4" />, danger: true },
                ]}
                align="left"
              />
            </div>
          </div>
        </Block>
      </section>

      {/* ═══ ALERT / BANNER ══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h3 className="text-sm font-semibold text-foreground/70">Alert / Banner</h3>

        <Block label="Intencje — kliknij ✕ aby zamknąć">
          <div className="flex flex-col gap-3 max-w-2xl">
            {alerts.info && (
              <GlassAlert
                intent="info"
                title="Nowa wersja API dostępna"
                onClose={() => setAlerts((a) => ({ ...a, info: false }))}
              >
                Zaktualizuj integrację do wersji v3.2 aby skorzystać z nowych możliwości modeli.
              </GlassAlert>
            )}
            {alerts.success && (
              <GlassAlert
                intent="success"
                title="Projekt opublikowany"
                onClose={() => setAlerts((a) => ({ ...a, success: false }))}
              >
                Twój projekt jest teraz dostępny publicznie pod adresem nextbyte.app/projekt-x.
              </GlassAlert>
            )}
            {alerts.warning && (
              <GlassAlert
                intent="warning"
                title="Zbliżasz się do limitu tokenów"
                onClose={() => setAlerts((a) => ({ ...a, warning: false }))}
              >
                Wykorzystano 85% miesięcznego limitu. Rozważ upgrade planu lub zoptymalizuj prompty.
              </GlassAlert>
            )}
            {alerts.danger && (
              <GlassAlert
                intent="danger"
                title="Błąd połączenia z bazą danych"
                onClose={() => setAlerts((a) => ({ ...a, danger: false }))}
              >
                Nie udało się nawiązać połączenia z klastrem. Sprawdź konfigurację CONNECTION_STRING.
              </GlassAlert>
            )}
            {!Object.values(alerts).some(Boolean) && (
              <button
                className="text-xs text-foreground/40 hover:text-foreground/70 text-left"
                onClick={() => setAlerts({ info: true, success: true, warning: true, danger: true })}
              >
                + Przywróć alerty
              </button>
            )}
          </div>
        </Block>

        <Block label="Bez tytułu — sam opis">
          <div className="flex flex-col gap-3 max-w-2xl">
            <GlassAlert intent="info">Weryfikacja email wymagana przed pierwszym eksportem danych.</GlassAlert>
            <GlassAlert intent="success">Zmiany zapisane automatycznie.</GlassAlert>
          </div>
        </Block>
      </section>

    </div>
  )
}
