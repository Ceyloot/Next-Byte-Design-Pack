import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tile, TileHeader, TileRow, TilePill, TileFooter, TileAction,
} from '@/components/ui/tile'
import {
  BackgroundGrid, BackgroundDots, BackgroundPlus,
} from '@/components/ui/background-patterns'
import { Input, Field } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectGroup, SelectLabel, SelectItem, SelectSeparator,
} from '@/components/ui/select'
import { Switch, SwitchField } from '@/components/ui/switch'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsLine, TabsLineTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toaster'
import {
  Zap, Shield, AlertTriangle, Server, Database,
  BarChart3, Users, Activity, Settings, Trash2, Plus,
  Mail, Lock, Search, Bell, CheckCircle2, Info, TriangleAlert,
} from 'lucide-react'

// ── motyw definicje ────────────────────────────────────────────────
const THEMES = [
  { key: null,              label: 'Ciemny',         price: 'domyślny', isDefault: true,  isLight: false },
  { key: 'dark-theme',     label: 'Ciemny (attr)',   price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'light-apple',    label: 'Jasny Apple',     price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'nextbyte-light', label: 'NB Jasny',        price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'future-theme',   label: 'Przyszły',        price: 'darmowy',  isDefault: false, isLight: true  },
  { key: 'lime-green',     label: 'Lime',            price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'refspace',       label: 'RefSpace',        price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'sloneczny',      label: 'Słoneczny',       price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'teczowy',        label: 'Tęczowy RGB',     price: 'darmowy',  isDefault: false, isLight: false },
  { key: 'aurora',         label: 'Aurora',          price: '150 Byte', isDefault: false, isLight: false },
  { key: 'fioletowy',      label: 'Fioletowy',       price: '150 Byte', isDefault: false, isLight: false },
  { key: 'nextbyte-v2',    label: 'NB Lekki',        price: '150 Byte', isDefault: false, isLight: false },
  { key: 'dragon-red',     label: 'Smoczy',          price: '150 Byte', isDefault: false, isLight: false },
  { key: 'snowy-white',    label: 'Śnieżny',         price: '150 Byte', isDefault: false, isLight: false },
  { key: 'luxury',         label: 'Luxury',          price: '500 Byte', isDefault: false, isLight: false },
] as const

type ThemeKey = (typeof THEMES)[number]['key']

// ── 22 zmienne kontraktu ───────────────────────────────────────────
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

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// ── Próbka koloru ──────────────────────────────────────────────────
function ColorSwatch({ name, tick }: { name: string; tick: number }) {
  const val = readVar(name)
  void tick
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2">
      <div
        className="h-8 w-8 shrink-0 rounded-lg border border-border/30"
        style={{ background: `hsl(${val})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] font-semibold text-card-foreground">{name}</p>
        <p className="font-mono text-[9px] text-muted-foreground">{val || '—'}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 font-heading text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block font-mono text-[10px] text-muted-foreground">{children}</span>
}

// ── DIALOG / TOAST / TABS ──────────────────────────────────────────
function InteractiveSection() {
  return (
    <Section title="Dialog · AlertDialog · Toast · Tabs">
      <div className="space-y-8">

        {/* ── DIALOGI ─────────────────────────────────────────── */}
        <div>
          <Label>Dialog i AlertDialog</Label>
          <div className="flex flex-wrap gap-3">

            {/* Zwykły dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="nextbyte">Otwórz Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edytuj profil</DialogTitle>
                  <DialogDescription>
                    Wprowadź zmiany w swoim profilu. Kliknij Zapisz po zakończeniu.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <Field label="Nazwa użytkownika" htmlFor="d-name">
                    <Input id="d-name" defaultValue="arturbacik7" />
                  </Field>
                  <Field label="Adres e-mail" htmlFor="d-email">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="d-email" type="email" defaultValue="arturbacik7@gmail.com" className="pl-9" />
                    </div>
                  </Field>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Anuluj</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="nextbyte" onClick={() => toast.success('Profil zaktualizowany')}>
                      Zapisz zmiany
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* AlertDialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Usuń konto</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ta akcja jest nieodwracalna. Wszystkie dane zostaną trwale usunięte
                    z naszych serwerów i nie będzie możliwości ich odzyskania.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.error('Konto zostało usunięte')}>
                    Tak, usuń konto
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>

        {/* ── TOAST ───────────────────────────────────────────── */}
        <div>
          <Label>Toast (Sonner) — wszystkie typy</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Domyślny',   icon: Bell,           fn: () => toast('Operacja zakończona') },
              { label: 'Sukces',     icon: CheckCircle2,   fn: () => toast.success('Zapisano zmiany') },
              { label: 'Błąd',       icon: AlertTriangle,  fn: () => toast.error('Coś poszło nie tak') },
              { label: 'Ostrzeżenie',icon: TriangleAlert,  fn: () => toast.warning('Sesja wygaśnie za 5 min') },
              { label: 'Info',       icon: Info,           fn: () => toast.info('Nowa wersja dostępna') },
              {
                label: 'Z akcją',
                icon: Zap,
                fn: () => toast('Usunięto 3 pliki', {
                  action: { label: 'Cofnij', onClick: () => toast.success('Przywrócono') },
                }),
              },
            ].map(({ label, icon: Icon, fn }) => (
              <Button key={label} variant="outline" size="sm" onClick={fn}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* ── TABS ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div>
            <Label>Tabs — wariant pill (domyślny)</Label>
            <Tabs defaultValue="ogolne">
              <TabsList>
                <TabsTrigger value="ogolne">Ogólne</TabsTrigger>
                <TabsTrigger value="bezpieczenstwo">Bezpieczeństwo</TabsTrigger>
                <TabsTrigger value="powiadomienia">Powiadomienia</TabsTrigger>
                <TabsTrigger value="api" disabled>API (wkrótce)</TabsTrigger>
              </TabsList>
              <TabsContent value="ogolne">
                <Tile intencja="neutralna" elewacja="plaska">
                  <TileHeader ikona={Settings} tytul="Ustawienia ogólne" intencja="neutralna" />
                  <TileRow intencja="neutralna" poPrawej="PL">Język interfejsu</TileRow>
                  <TileRow intencja="neutralna" className="mt-1.5" poPrawej="UTC+1">Strefa czasowa</TileRow>
                </Tile>
              </TabsContent>
              <TabsContent value="bezpieczenstwo">
                <Tile intencja="krytyczna" elewacja="plaska">
                  <TileHeader ikona={Shield} tytul="Bezpieczeństwo" intencja="krytyczna" />
                  <TileRow intencja="akcent" poPrawej="Aktywne">2FA</TileRow>
                  <TileRow intencja="neutralna" className="mt-1.5" poPrawej="3">Aktywne sesje</TileRow>
                </Tile>
              </TabsContent>
              <TabsContent value="powiadomienia">
                <Tile intencja="akcent" elewacja="plaska">
                  <TileHeader ikona={Bell} tytul="Powiadomienia" intencja="akcent" />
                  <TileRow intencja="akcent" poPrawej="Włączone">E-mail</TileRow>
                  <TileRow intencja="neutralna" className="mt-1.5" poPrawej="Wyłączone">Push</TileRow>
                </Tile>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Label>Tabs — wariant line (underline)</Label>
            <Tabs defaultValue="wszystkie">
              <TabsLine>
                <TabsLineTrigger value="wszystkie">Wszystkie</TabsLineTrigger>
                <TabsLineTrigger value="aktywne">Aktywne</TabsLineTrigger>
                <TabsLineTrigger value="archiwum">Archiwum</TabsLineTrigger>
              </TabsLine>
              <TabsContent value="wszystkie">
                <div className="space-y-1.5 pt-1">
                  {['Projekt Alpha', 'Projekt Beta', 'Projekt Gamma'].map((p) => (
                    <TileRow key={p} intencja="neutralna" poPrawej="aktywny">{p}</TileRow>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="aktywne">
                <TileRow intencja="akcent" poPrawej="aktywny">Projekt Alpha</TileRow>
              </TabsContent>
              <TabsContent value="archiwum">
                <p className="py-4 text-center text-sm text-muted-foreground">Brak zarchiwizowanych projektów.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>
    </Section>
  )
}

// ── SEKCJA FORMULARZY ──────────────────────────────────────────────
function FormsSection() {
  const [switchStates, setSwitchStates] = useState({
    a: true, b: false, c: true, d: false,
  })

  return (
    <Section title="Formularze — Input · Select · Switch">
      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── INPUT ──────────────────────────────────────── */}
        <div className="space-y-5">
          <Label>Input — warianty i stany</Label>

          <Field label="Domyślny" hint="Podpowiedź pod polem" htmlFor="i-default">
            <Input id="i-default" placeholder="Wpisz wartość…" />
          </Field>

          <Field label="Z ikoną (prefix)" htmlFor="i-icon">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="i-icon" inputSize="default" placeholder="adres@email.pl" className="pl-9" />
            </div>
          </Field>

          <Field label="Hasło" htmlFor="i-pass">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="i-pass" type="password" placeholder="••••••••" className="pl-9" />
            </div>
          </Field>

          <Field label="Błąd walidacji" error="To pole jest wymagane." htmlFor="i-error">
            <Input id="i-error" variant="error" placeholder="Puste — błąd" />
          </Field>

          <Field label="Ghost" hint="Bez ramki — wbudowany w tło" htmlFor="i-ghost">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="i-ghost" variant="ghost" placeholder="Szukaj…" className="pl-9" />
            </div>
          </Field>

          <Field label="Wyłączony" htmlFor="i-disabled">
            <Input id="i-disabled" disabled defaultValue="Nie można edytować" />
          </Field>

          <Label>Rozmiary</Label>
          <div className="space-y-2">
            {(['sm', 'default', 'lg'] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <Input inputSize={s} placeholder={`inputSize="${s}"`} />
                <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SELECT ─────────────────────────────────────── */}
        <div className="space-y-5">
          <Label>Select — warianty i stany</Label>

          <Field label="Domyślny" htmlFor="s-default">
            <Select>
              <SelectTrigger id="s-default">
                <SelectValue placeholder="Wybierz opcję…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Darmowe motywy</SelectLabel>
                  <SelectItem value="dark">Ciemny (domyślny)</SelectItem>
                  <SelectItem value="light-apple">Jasny Apple</SelectItem>
                  <SelectItem value="lime">Lime</SelectItem>
                  <SelectItem value="refspace">RefSpace</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>150 Byte</SelectLabel>
                  <SelectItem value="aurora">Aurora</SelectItem>
                  <SelectItem value="fioletowy">Fioletowy</SelectItem>
                  <SelectItem value="dragon">Smoczy</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>500 Byte</SelectLabel>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Z wybraną wartością">
            <Select defaultValue="aurora">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aurora">Aurora</SelectItem>
                <SelectItem value="fioletowy">Fioletowy</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Stan błędu" error="Musisz wybrać jeden wariant.">
            <Select>
              <SelectTrigger error>
                <SelectValue placeholder="Wybierz…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Opcja A</SelectItem>
                <SelectItem value="b">Opcja B</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Wyłączony">
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Zablokowany" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">Opcja</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Label>Rozmiary trigera</Label>
          <div className="space-y-2">
            {(['sm', 'default', 'lg'] as const).map(s => (
              <div key={s} className="flex items-center gap-2">
                <Select>
                  <SelectTrigger triggerSize={s}>
                    <SelectValue placeholder={`triggerSize="${s}"`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Opcja A</SelectItem>
                    <SelectItem value="b">Opcja B</SelectItem>
                  </SelectContent>
                </Select>
                <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SWITCH ─────────────────────────────────────── */}
        <div className="space-y-5">
          <Label>Switch — warianty i stany</Label>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <SwitchField
              label="Powiadomienia e-mail"
              description="Otrzymuj raporty i alerty na skrzynkę."
              checked={switchStates.a}
              onCheckedChange={v => setSwitchStates(s => ({ ...s, a: v }))}
            />
            <SwitchField
              label="Tryb ciemny"
              description="Automatycznie według systemu operacyjnego."
              checked={switchStates.b}
              onCheckedChange={v => setSwitchStates(s => ({ ...s, b: v }))}
            />
            <SwitchField
              label="Analityka użycia"
              description="Pomaga nam poprawiać platformę."
              checked={switchStates.c}
              onCheckedChange={v => setSwitchStates(s => ({ ...s, c: v }))}
            />
            <SwitchField
              label="Marketing (wyłączony)"
              description="Dostępne po weryfikacji konta."
              checked={switchStates.d}
              onCheckedChange={v => setSwitchStates(s => ({ ...s, d: v }))}
              disabled
            />
          </div>

          <Label>Rozmiary (switchSize)</Label>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            {(['sm', 'default', 'lg'] as const).map(sz => (
              <SwitchField
                key={sz}
                switchSize={sz}
                label={`switchSize="${sz}"`}
                checked
              />
            ))}
          </div>

          <Label>Użycie bez wrappera</Label>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <Switch defaultChecked />
            <span className="text-sm text-foreground">Samodzielny Switch</span>
          </div>
        </div>

      </div>
    </Section>
  )
}

// ── APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (activeTheme === null) {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
    // Force palette re-read after CSS variable cascade settles
    const id = requestAnimationFrame(() => setTick((n) => n + 1))
    return () => cancelAnimationFrame(id)
  }, [activeTheme])

  const SIZES = ['sm', 'default', 'lg', 'xl', 'icon'] as const
  const VARIANTS = ['nextbyte', 'glass', 'outline', 'ghost', 'destructive', 'secondary', 'link'] as const

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ── 1. PASEK MOTYWÓW ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-2xl px-4 py-2">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Motyw — kliknij by przełączyć
          </p>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map((t) => {
              const isActive = activeTheme === t.key
              return (
                <button
                  key={String(t.key)}
                  onClick={() => setActiveTheme(t.key)}
                  className={[
                    'inline-flex flex-col items-start rounded-lg border px-2.5 py-1.5 transition-all duration-150',
                    isActive
                      ? 'border-primary/70 bg-primary/10 ring-1 ring-primary/40'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/40',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-card-foreground">{t.label}</span>
                    {t.isDefault && (
                      <span className="rounded-full bg-primary/20 px-1 py-px font-mono text-[8px] font-bold text-primary">
                        DEFAULT
                      </span>
                    )}
                    {t.isLight && (
                      <span className="rounded-full bg-accent/50 px-1 py-px font-mono text-[8px] font-bold text-accent-foreground">
                        JASNY ☀
                      </span>
                    )}
                  </span>
                  <span className="mt-px font-mono text-[9px] text-muted-foreground">{t.price}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-8">

        {/* ── 2. PALETA ZMIENNYCH ─────────────────────────────────────── */}
        <Section title="Paleta aktywnego motywu — 22 zmienne kontraktu">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {CONTRACT_VARS.map((v) => (
              <ColorSwatch key={v} name={v} tick={tick} />
            ))}
          </div>
        </Section>

        {/* ── 3. PRZYCISKI ─────────────────────────────────────────────── */}
        <Section title="Przyciski — wszystkie warianty × rozmiary">
          <div className="space-y-4">
            {VARIANTS.map((variant) => (
              <div key={variant}>
                <Label>variant=&quot;{variant}&quot;{variant === 'nextbyte' ? ' (domyślny)' : ''}</Label>
                <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
                  {SIZES.map((size) => (
                    <div key={size} className="flex flex-col items-center gap-1">
                      <Button variant={variant} size={size}>
                        {size === 'icon' ? <Zap /> : size}
                      </Button>
                      <span className="font-mono text-[9px] text-muted-foreground">{size}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center gap-1">
                    <Button variant={variant} size="default" disabled>
                      disabled
                    </Button>
                    <span className="font-mono text-[9px] text-muted-foreground">disabled</span>
                  </div>
                </div>
                {variant === 'nextbyte' && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Hover: animowany gradient (conic) w kolorze motywu obraca się po obwódce.
                  </p>
                )}
                {variant === 'glass' && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Hover: efekt szkła — pasmo światła + poświata primary, lekkie uniesienie translateY(-1px).
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. KAFELKI ───────────────────────────────────────────────── */}
        <Section title="Kafelki — intencje × elewacje × zwarty/normalny">
          {(['neutralna', 'akcent', 'krytyczna'] as const).map((intencja) => (
            <div key={intencja} className="mb-8">
              <Label>intencja=&quot;{intencja}&quot;</Label>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(['plaska', 'uniesiona'] as const).map((elewacja) =>
                  ([false, true] as const).map((zwarty) => (
                    <Tile
                      key={`${elewacja}-${String(zwarty)}`}
                      intencja={intencja}
                      elewacja={elewacja}
                      zwarty={zwarty}
                      interaktywny={elewacja === 'uniesiona'}
                    >
                      <TileHeader
                        ikona={
                          intencja === 'neutralna' ? Server :
                          intencja === 'akcent' ? Zap :
                          AlertTriangle
                        }
                        tytul={`${elewacja}${zwarty ? ' · zwarty' : ''}`}
                        podtytul="podtytuł i opis"
                        intencja={intencja}
                        poPrawej={<TilePill intencja={intencja}>42</TilePill>}
                      />
                      <TileRow
                        ikona={Database}
                        intencja={intencja}
                        poPrawej="v2.4"
                      >
                        Wiersz z ikoną i wartością
                      </TileRow>
                      <TileRow intencja="neutralna" className="mt-1.5">
                        Neutralny wiersz bez ikony
                      </TileRow>
                      <TileFooter>
                        <TileAction rodzaj="glowna" ikona={Plus}>Główna</TileAction>
                        <TileAction rodzaj="wtorna" ikona={Settings}>Wtórna</TileAction>
                        <TileAction rodzaj="cicha">Cicha</TileAction>
                        <TileAction
                          rodzaj="usun"
                          ikona={Trash2}
                          samaIkona
                          aria-label="Usuń"
                        />
                      </TileFooter>
                    </Tile>
                  ))
                )}
              </div>
            </div>
          ))}
        </Section>

        {/* ── 5. SIATKA 2×2 ────────────────────────────────────────────── */}
        <Section title="Siatka 2×2 — wyrównywanie wysokości (h-full + items-stretch)">
          <div className="grid grid-cols-2 items-stretch gap-4">
            <Tile intencja="akcent" elewacja="uniesiona" interaktywny className="h-full">
              <TileHeader
                ikona={BarChart3}
                tytul="Analityka"
                podtytul="ostatnie 30 dni"
                intencja="akcent"
                poPrawej={<TilePill intencja="akcent">+18%</TilePill>}
              />
              <TileRow intencja="akcent" poPrawej="4 091">Sesje użytkowników</TileRow>
              <TileRow intencja="neutralna" className="mt-1.5" poPrawej="73%">Retencja</TileRow>
              <TileRow intencja="neutralna" className="mt-1.5" poPrawej="2:34">Śr. czas sesji</TileRow>
              <TileFooter>
                <TileAction rodzaj="glowna">Szczegóły</TileAction>
                <TileAction rodzaj="cicha">Eksport CSV</TileAction>
              </TileFooter>
            </Tile>

            <Tile intencja="neutralna" elewacja="uniesiona" interaktywny className="h-full">
              <TileHeader
                ikona={Users}
                tytul="Użytkownicy"
                intencja="neutralna"
                poPrawej={<TilePill intencja="neutralna">1 204</TilePill>}
              />
              <TileRow intencja="neutralna" poPrawej="Online">Aktywni teraz</TileRow>
              <TileFooter>
                <TileAction rodzaj="wtorna" ikona={Plus}>Dodaj użytkownika</TileAction>
              </TileFooter>
            </Tile>

            <Tile intencja="krytyczna" elewacja="wyzej" className="h-full">
              <TileHeader
                ikona={Shield}
                tytul="Alerty bezpieczeństwa"
                podtytul="wymagają uwagi"
                intencja="krytyczna"
                poPrawej={<TilePill intencja="krytyczna">3</TilePill>}
              />
              <TileRow intencja="krytyczna" poPrawej="KRYTYCZNY">Nieautoryzowany dostęp</TileRow>
              <TileRow intencja="krytyczna" className="mt-1.5" poPrawej="WYSOKI">Podejrzane logowania</TileRow>
              <TileRow intencja="neutralna" className="mt-1.5" poPrawej="NISKI">Stare hasła</TileRow>
              <TileFooter>
                <TileAction rodzaj="usun" ikona={Trash2}>Wyczyść wszystkie</TileAction>
                <TileAction rodzaj="cicha">Ignoruj</TileAction>
              </TileFooter>
            </Tile>

            <Tile intencja="neutralna" elewacja="plaska" className="h-full">
              <TileHeader
                ikona={Activity}
                tytul="Status systemu"
                podtytul="wszystkie usługi działają"
                intencja="akcent"
                poPrawej={<TilePill intencja="akcent">OK</TilePill>}
              />
              <TileRow intencja="akcent" poPrawej="99.9%">API Gateway</TileRow>
              <TileRow intencja="akcent" className="mt-1.5" poPrawej="99.7%">Baza danych</TileRow>
              <TileRow intencja="neutralna" className="mt-1.5" poPrawej="—">CDN</TileRow>
              <TileRow intencja="neutralna" className="mt-1.5" poPrawej="12ms">Latencja P95</TileRow>
              <TileFooter>
                <TileAction rodzaj="wtorna">Historia</TileAction>
              </TileFooter>
            </Tile>
          </div>
        </Section>

        {/* ── 6. WZORY TŁA ─────────────────────────────────────────────── */}
        <Section title="Wzory tła — BackgroundGrid · BackgroundDots · BackgroundPlus">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <Label>BackgroundGrid</Label>
              {[{ size: 20, opacity: 0.2 }, { size: 40, opacity: 0.3 }, { size: 60, opacity: 0.5 }].map(({ size, opacity }) => (
                <div key={size} className="relative h-24 overflow-hidden rounded-xl border border-border bg-card">
                  <BackgroundGrid patternSize={size} patternOpacity={opacity} fade={false} />
                  <span className="absolute bottom-2 left-2 font-mono text-[9px] text-muted-foreground">
                    size={size} opacity={opacity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Label>BackgroundDots</Label>
              {[{ size: 12, opacity: 0.4 }, { size: 20, opacity: 0.5 }, { size: 32, opacity: 0.6 }].map(({ size, opacity }) => (
                <div key={size} className="relative h-24 overflow-hidden rounded-xl border border-border bg-card">
                  <BackgroundDots patternSize={size} patternOpacity={opacity} fade={false} />
                  <span className="absolute bottom-2 left-2 font-mono text-[9px] text-muted-foreground">
                    size={size} opacity={opacity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Label>BackgroundPlus</Label>
              {[{ size: 30, opacity: 0.3 }, { size: 60, opacity: 0.4 }, { size: 90, opacity: 0.5 }].map(({ size, opacity }) => (
                <div key={size} className="relative h-24 overflow-hidden rounded-xl border border-border bg-card">
                  <BackgroundPlus patternSize={size} patternOpacity={opacity} fade={false} />
                  <span className="absolute bottom-2 left-2 font-mono text-[9px] text-muted-foreground">
                    size={size} opacity={opacity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── DIALOG / TOAST / TABS ────────────────────────────────────── */}
        <InteractiveSection />

        {/* ── FORMULARZE ───────────────────────────────────────────────── */}
        <FormsSection />

        {/* ── 7. SKALE ─────────────────────────────────────────────────── */}
        <Section title="Skale — cienie · promienie · typografia · odstępy">

          <div className="mb-8">
            <Label>Cienie — 3 stopnie ELEWACJA z tile.tsx</Label>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'plaska\nshadow-none', cls: 'shadow-none' },
                {
                  label: 'uniesiona',
                  cls: 'shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.06)]',
                },
                {
                  label: 'wyzej',
                  cls: 'shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.1)]',
                },
              ].map(({ label, cls }) => (
                <div key={label} className={`rounded-2xl border border-border bg-card p-6 ${cls}`}>
                  <p className="whitespace-pre font-mono text-xs text-card-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Label>Promienie (border-radius)</Label>
            <div className="flex flex-wrap gap-5">
              {[
                { label: 'rounded-sm', cls: 'rounded-sm' },
                { label: 'rounded-md', cls: 'rounded-md' },
                { label: 'rounded-lg\n(--radius)', cls: 'rounded-lg' },
                { label: 'rounded-xl', cls: 'rounded-xl' },
                { label: 'rounded-2xl', cls: 'rounded-2xl' },
                { label: 'rounded-full', cls: 'rounded-full' },
              ].map(({ label, cls }) => (
                <div key={cls} className="flex flex-col items-center gap-1.5">
                  <div className={`h-16 w-16 border border-border bg-card ${cls}`} />
                  <span className="whitespace-pre-wrap text-center font-mono text-[9px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Label>Typografia</Label>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
              {[
                { cls: 'text-4xl font-heading font-bold',      label: 'font-heading text-4xl font-bold' },
                { cls: 'text-2xl font-heading font-semibold',  label: 'font-heading text-2xl font-semibold' },
                { cls: 'text-xl font-heading font-medium',     label: 'font-heading text-xl font-medium' },
                { cls: 'text-base font-sans',                  label: 'font-sans text-base' },
                { cls: 'text-sm font-sans font-medium',        label: 'font-sans text-sm font-medium' },
                { cls: 'text-xs text-muted-foreground',        label: 'text-xs text-muted-foreground' },
                { cls: 'font-mono text-sm text-primary',       label: 'font-mono text-sm text-primary' },
              ].map(({ cls, label }) => (
                <div key={label} className="flex items-baseline gap-4">
                  <span className={`flex-1 text-card-foreground ${cls}`}>NextByte Platform</span>
                  <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Odstępy Tailwind (szerokość = n × 4px)</Label>
            <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-card p-6">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="border border-primary/40 bg-primary/20"
                    style={{ width: n * 4, height: 24 }}
                  />
                  <span className="font-mono text-[8px] text-muted-foreground">p-{n}</span>
                </div>
              ))}
            </div>
          </div>

        </Section>

      </div>
    </div>
  )
}
