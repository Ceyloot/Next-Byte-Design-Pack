import React from 'react'
import {
  Download, Trash2, Zap, Camera, GitCommit, AlertTriangle, CheckCircle2, Users,
} from 'lucide-react'
import {
  GlassCard, GlassFilterBar, GlassBulkActionBar, GlassSettingsSection,
  GlassDangerZone, GlassApiKey, GlassUsageBar, GlassNotificationCenter,
  GlassToggle, GlassButton, GlassBadge, GlassCombobox, GlassTable, GlassKeyValue,
} from '@/components/glass'
import type { FilterChip, NotificationItem, GlassTableColumn, ComboOption } from '@/components/glass'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

type UserRow = { name: string; email: string; role: string; status: string; plan: string }

const USERS: UserRow[] = [
  { name: 'Anna Wiśniewska',  email: 'anna@example.com',    role: 'admin',     status: 'active',   plan: 'Ultimate' },
  { name: 'Michał Kowalski',  email: 'michal@example.com',  role: 'moderator', status: 'active',   plan: 'Premium'  },
  { name: 'Tomasz Rybak',     email: 'tomasz@example.com',  role: 'user',      status: 'pending',  plan: 'Premium'  },
  { name: 'Karolina Nowak',   email: 'karolina@example.com', role: 'user',     status: 'active',   plan: 'Free'     },
  { name: 'Piotr Zieliński',  email: 'piotr@example.com',   role: 'user',      status: 'inactive', plan: 'Free'     },
]

const ROLE_INTENT: Record<string, 'primary' | 'warning' | 'neutral'> = {
  admin: 'primary', moderator: 'warning', user: 'neutral',
}
const STATUS_INTENT: Record<string, 'success' | 'warning' | 'neutral'> = {
  active: 'success', pending: 'warning', inactive: 'neutral',
}

const USER_COLS: GlassTableColumn<UserRow>[] = [
  { key: 'name',  header: 'Użytkownik', sortable: true },
  { key: 'email', header: 'E-mail',     sortable: true },
  {
    key: 'role', header: 'Rola',
    render: (v) => <GlassBadge intent={ROLE_INTENT[String(v)]} size="sm">{String(v)}</GlassBadge>,
  },
  {
    key: 'status', header: 'Status',
    render: (v) => <GlassBadge intent={STATUS_INTENT[String(v)]} size="sm" dot>{String(v)}</GlassBadge>,
  },
  { key: 'plan', header: 'Plan', align: 'right', sortable: true },
]

const NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Nowa rejestracja',        description: 'karolina@example.com dołączyła do platformy', time: '2 min temu',  intent: 'success', icon: Users },
  { id: '2', title: 'Przekroczono 80% limitu', description: 'Zużycie Byte w tym miesiącu: 3 890 / 4 820',  time: '18 min temu', intent: 'warning', icon: Zap },
  { id: '3', title: 'Wdrożono v4.0.1',         description: 'Poprawki wydajności panelu statystyk',        time: '1 godz. temu', intent: 'info',   icon: GitCommit, read: true },
  { id: '4', title: 'Błąd generacji obrazu',   description: 'Zadanie #8412 zakończone niepowodzeniem',     time: '3 godz. temu', intent: 'error',  icon: Camera,   read: true },
  { id: '5', title: 'Audyt zakończony',        description: '0 podatności krytycznych',                    time: 'wczoraj',      intent: 'success', icon: CheckCircle2, read: true },
]

const PLAN_OPTIONS: ComboOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
  { value: 'ultimate', label: 'Ultimate' },
]

export function AdminSection() {
  const [query, setQuery] = React.useState('')
  const [chips, setChips] = React.useState<FilterChip[]>([
    { id: 'role', label: 'Rola', value: 'admin' },
    { id: 'plan', label: 'Plan', value: 'Ultimate' },
  ])
  const [selected, setSelected] = React.useState(3)
  const [notifs, setNotifs] = React.useState(NOTIFICATIONS)
  const [plan, setPlan] = React.useState('premium')

  return (
    <div className="space-y-10">

      {/* PASEK FILTRÓW */}
      <div className="space-y-4">
        <h3 id="admin-filtry" className="text-sm font-semibold text-foreground/70">Pasek filtrów</h3>
        <SectionLabel>Szukanie + aktywne filtry jako zdejmowalne pigułki</SectionLabel>
        <GlassCard>
          <GlassFilterBar
            query={query}
            onQueryChange={setQuery}
            chips={chips}
            onRemoveChip={(id) => setChips((c) => c.filter((x) => x.id !== id))}
            onClearAll={() => setChips([])}
            placeholder="Szukaj użytkownika…"
            actions={<GlassButton size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Eksport</GlassButton>}
          />
        </GlassCard>
      </div>

      {/* AKCJE MASOWE */}
      <div className="space-y-4">
        <h3 id="admin-masowe" className="text-sm font-semibold text-foreground/70">Akcje masowe</h3>
        <SectionLabel>Pojawia się dopiero, gdy coś jest zaznaczone</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          {[0, 1, 3, 12].map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selected === n ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-foreground/55 hover:text-foreground'
              }`}
            >
              zaznacz {n}
            </button>
          ))}
        </div>
        <GlassBulkActionBar count={selected} onClear={() => setSelected(0)} />

        <SectionLabel>Własny zestaw akcji</SectionLabel>
        <GlassBulkActionBar
          count={5}
          actions={
            <>
              <GlassButton size="sm" variant="ghost" className="gap-1"><Download className="h-3 w-3" />CSV</GlassButton>
              <GlassButton size="sm" variant="ghost" className="gap-1"><Zap className="h-3 w-3" />Doładuj</GlassButton>
              <GlassButton size="sm" variant="danger" className="gap-1"><Trash2 className="h-3 w-3" />Usuń</GlassButton>
            </>
          }
        />
      </div>

      {/* TABELA CRUD */}
      <div className="space-y-4">
        <h3 id="admin-tabela" className="text-sm font-semibold text-foreground/70">Tabela zarządzania</h3>
        <SectionLabel>Role i statusy jako odznaki · sortowanie po kliknięciu nagłówka</SectionLabel>
        <GlassTable columns={USER_COLS} data={USERS} caption="Użytkownicy platformy" />
      </div>

      {/* USTAWIENIA */}
      <div className="space-y-4">
        <h3 id="admin-ustawienia" className="text-sm font-semibold text-foreground/70">Sekcje ustawień</h3>
        <SectionLabel>Opis po lewej, kontrolki po prawej — układ typowy dla stron konta</SectionLabel>
        <div className="space-y-3">
          <GlassSettingsSection
            title="Powiadomienia"
            description="Zdecyduj, o czym chcesz być informowany i jakim kanałem."
          >
            <GlassToggle defaultChecked label="Powiadomienia e-mail" description="Podsumowanie raz w tygodniu" />
            <GlassToggle label="Powiadomienia push" description="Alerty w czasie rzeczywistym" />
            <GlassToggle defaultChecked label="Alerty o limitach" description="Gdy zużyjesz 80% puli Byte" />
          </GlassSettingsSection>

          <GlassSettingsSection
            title="Plan i rozliczenia"
            description="Zmiana planu wchodzi w życie od następnego okresu rozliczeniowego."
          >
            <GlassCombobox options={PLAN_OPTIONS} value={plan} onChange={(v) => setPlan(v as string)} />
            <GlassUsageBar label="Zużycie Byte" used={3890} total={4820} unit="⟠" />
            <GlassUsageBar label="Magazyn plików" used={10600} total={100000} unit="MB" />
            <GlassUsageBar label="Zapytania API" used={94200} total={100000} />
          </GlassSettingsSection>
        </div>
      </div>

      {/* KLUCZE API */}
      <div className="space-y-4">
        <h3 id="admin-klucze" className="text-sm font-semibold text-foreground/70">Klucze API</h3>
        <SectionLabel>Domyślnie zamaskowane — widoczny prefiks i 4 ostatnie znaki</SectionLabel>
        <div className="max-w-xl space-y-2">
          <GlassApiKey
            label="Klucz produkcyjny"
            value="nb_live_8f4c2a91d7e35b06c8a14f2d9e7b3c50"
            createdAt="12.08.2026"
            onRegenerate={() => {}}
          />
          <GlassApiKey
            label="Klucz testowy"
            value="nb_test_2b91e4f70c8d3a65b1f9e2c47d8a3061"
            createdAt="03.07.2026"
            onRegenerate={() => {}}
          />
        </div>
      </div>

      {/* PASKI ZUŻYCIA */}
      <div className="space-y-4">
        <h3 id="admin-zuzycie" className="text-sm font-semibold text-foreground/70">Paski zużycia / limitów</h3>
        <SectionLabel>Kolor zmienia się po przekroczeniu progu ostrzegawczego i limitu</SectionLabel>
        <GlassCard className="max-w-xl space-y-4">
          <GlassUsageBar label="Poniżej progu"    used={2100}  total={10000} unit="⟠" />
          <GlassUsageBar label="Powyżej 80%"      used={8600}  total={10000} unit="⟠" />
          <GlassUsageBar label="Limit wyczerpany" used={10000} total={10000} unit="⟠" />
          <GlassUsageBar label="Własny próg (50%)" used={5400} total={10000} unit="⟠" warnAt={50} />
        </GlassCard>
      </div>

      {/* CENTRUM POWIADOMIEŃ */}
      <div className="space-y-4">
        <h3 id="admin-powiadomienia" className="text-sm font-semibold text-foreground/70">Centrum powiadomień</h3>
        <SectionLabel>Nieprzeczytane wyróżnione tłem · licznik w nagłówku</SectionLabel>
        <div className="flex flex-wrap items-start gap-4">
          <GlassNotificationCenter
            items={notifs}
            onMarkAllRead={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
          />
          <GlassNotificationCenter items={[]} className="max-w-xs" />
        </div>
      </div>

      {/* SZCZEGÓŁY / KEY-VALUE */}
      <div className="space-y-4">
        <h3 id="admin-szczegoly" className="text-sm font-semibold text-foreground/70">Panel szczegółów</h3>
        <SectionLabel>Pary klucz-wartość · pola techniczne monospace z kopiowaniem</SectionLabel>
        <GlassCard className="max-w-md">
          <GlassKeyValue
            rows={[
              { key: 'Identyfikator',   value: 'usr_8f4c2a91d7e3', mono: true, copyable: 'usr_8f4c2a91d7e3' },
              { key: 'E-mail',          value: 'anna@example.com' },
              { key: 'Plan',            value: 'Ultimate' },
              { key: 'Zarejestrowany',  value: '12.03.2024' },
              { key: 'Ostatnie logowanie', value: 'dziś, 09:41' },
              { key: 'Adres IP',        value: '81.219.44.107', mono: true, copyable: '81.219.44.107' },
            ]}
          />
        </GlassCard>
      </div>

      {/* STREFA NIEBEZPIECZNA */}
      <div className="space-y-4">
        <h3 id="admin-danger" className="text-sm font-semibold text-foreground/70">Strefa niebezpieczna</h3>
        <SectionLabel>Operacje nieodwracalne — wizualnie odseparowane od reszty ustawień</SectionLabel>
        <GlassDangerZone
          className="max-w-2xl"
          items={[
            {
              label: 'Wyczyść historię rozmów',
              description: 'Usuwa wszystkie wątki Chat AI. Tej operacji nie da się cofnąć.',
              action: 'Wyczyść',
            },
            {
              label: 'Przenieś własność konta',
              description: 'Przekazuje konto i całą pulę Byte innemu użytkownikowi.',
              action: 'Przenieś',
            },
            {
              label: 'Usuń konto',
              description: 'Trwale usuwa konto, projekty i niewykorzystane Byte. Bez możliwości przywrócenia.',
              action: 'Usuń konto',
            },
          ]}
        />
      </div>

      {/* ALERT SYSTEMOWY */}
      <div className="space-y-4">
        <h3 id="admin-system" className="text-sm font-semibold text-foreground/70">Alert systemowy</h3>
        <SectionLabel>Pasek stanu usługi nad treścią panelu</SectionLabel>
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="flex-1 text-xs text-foreground/75">
            <strong className="text-amber-400">Wydajność obniżona</strong> — generowanie obrazów działa wolniej niż zwykle. Pracujemy nad tym.
          </p>
          <GlassBadge intent="warning" size="sm">OD 09:12</GlassBadge>
        </div>
      </div>

    </div>
  )
}
