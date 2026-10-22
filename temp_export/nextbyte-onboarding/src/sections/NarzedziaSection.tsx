import React from 'react'
import {
  FileText, Folder, Camera, MessageSquare, Database, Settings, Zap,
  Image as ImageIcon, Code2, Package,
} from 'lucide-react'
import {
  GlassCard, GlassList, GlassListItem, GlassBulletList, GlassKeyValue, GlassTagCloud,
  GlassTreeView, GlassKanbanBoard, GlassCodeBlock, GlassInlineCode, GlassJsonViewer,
  GlassLogView, GlassQrCode, GlassCountdown, GlassRelativeTime, GlassToc, GlassBackToTop,
  GlassBadge, GlassAvatar,
} from '@/components/glass'
import type { TreeNode, KanbanColumn, LogLine } from '@/components/glass'
import { TINT_1, TINT_2, TINT_3, TINT_4 } from '@/lib/chart-colors'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

const TREE: TreeNode[] = [
  {
    id: 'src', label: 'src', children: [
      {
        id: 'components', label: 'components', badge: '32', children: [
          { id: 'glass', label: 'glass', badge: '30', children: [
            { id: 'gc', label: 'GlassCard.tsx' },
            { id: 'gb', label: 'GlassButton.tsx' },
            { id: 'gt', label: 'GlassTable.tsx' },
          ]},
          { id: 'ui', label: 'ui', badge: '21' },
        ],
      },
      {
        id: 'sections', label: 'sections', badge: '16', children: [
          { id: 'preview', label: 'PreviewSection.tsx' },
          { id: 'dane', label: 'DaneSection.tsx' },
          { id: 'czat', label: 'CzatSection.tsx' },
        ],
      },
      { id: 'lib', label: 'lib', children: [
        { id: 'utils', label: 'utils.ts' },
        { id: 'colors', label: 'chart-colors.ts' },
      ]},
      { id: 'app', label: 'App.tsx' },
    ],
  },
  { id: 'public', label: 'public', children: [{ id: 'fav', label: 'favicon.svg', icon: ImageIcon }] },
  { id: 'pkg', label: 'package.json', icon: Code2 },
  { id: 'lock', label: 'package-lock.json', icon: Code2, disabled: true },
]

const SAMPLE_CODE = `import { GlassCard, GlassButton } from '@/components/glass'
import { useGlass } from '@/lib/glass-context'

export function Przyklad() {
  const { isGlass } = useGlass()

  return (
    <GlassCard radius="rounded-2xl" padding="p-6">
      <h3 className="text-sm font-bold">Karta w trybie {isGlass ? 'glass' : 'normal'}</h3>
      <p className="mt-1 text-xs text-foreground/50">
        Ten sam komponent, dwie powierzchnie.
      </p>
      <GlassButton className="mt-4">Akcja</GlassButton>
    </GlassCard>
  )
}`

const SAMPLE_JSON = {
  model: 'claude-sonnet-4',
  usage: { input_tokens: 1284, output_tokens: 3971, total: 5255 },
  settings: { temperature: 0.7, max_tokens: 8192, stream: true },
  tools: ['search', 'code_interpreter'],
  metadata: { session: 'ses_8f4c2a91', region: 'eu-central-1', cached: false },
}

const LOGS: LogLine[] = [
  { time: '09:41:02', level: 'info',    source: 'api',    message: 'POST /v1/messages — 200 OK (182 ms)' },
  { time: '09:41:04', level: 'debug',   source: 'cache',  message: 'prompt cache hit, ratio 0.84' },
  { time: '09:41:09', level: 'success', source: 'worker', message: 'zadanie #8411 zakończone w 4.2 s' },
  { time: '09:41:18', level: 'warn',    source: 'quota',  message: 'zużycie Byte przekroczyło 80% miesięcznej puli' },
  { time: '09:41:31', level: 'error',   source: 'worker', message: 'zadanie #8412 nieudane: upstream timeout' },
  { time: '09:41:33', level: 'info',    source: 'worker', message: 'ponawianie zadania #8412 (próba 2/3)' },
  { time: '09:41:40', level: 'success', source: 'worker', message: 'zadanie #8412 zakończone w 6.8 s' },
]

const KANBAN_INIT: KanbanColumn[] = [
  {
    id: 'todo', title: 'Do zrobienia', accent: TINT_4, limit: 5,
    cards: [
      { id: 'k1', title: 'Migracja tokenów kolorów', description: 'Przenieść paletę do zmiennych CSS.', labels: [{ text: 'design', color: TINT_1 }], priority: 'medium', assignee: 'AW', comments: 3 },
      { id: 'k2', title: 'Audyt dostępności', labels: [{ text: 'a11y', color: TINT_3 }], priority: 'high', assignee: 'MK' },
      { id: 'k3', title: 'Dokumentacja komponentów', priority: 'low', attachments: 2 },
    ],
  },
  {
    id: 'doing', title: 'W trakcie', accent: TINT_2, limit: 2,
    cards: [
      { id: 'k4', title: 'Wykresy słupkowe', description: 'Warianty grouped i stacked.', labels: [{ text: 'dataviz', color: TINT_2 }], priority: 'high', assignee: 'TR', comments: 7 },
      { id: 'k5', title: 'Paleta poleceń ⌘K', priority: 'medium', assignee: 'AW', comments: 1 },
      { id: 'k6', title: 'Kanban board', description: 'Przeciąganie kart między kolumnami.', priority: 'medium', assignee: 'KN' },
    ],
  },
  {
    id: 'done', title: 'Gotowe', accent: TINT_1,
    cards: [
      { id: 'k7', title: 'Komponenty czatu', labels: [{ text: 'core', color: TINT_1 }], assignee: 'MK', comments: 12 },
      { id: 'k8', title: 'Kalendarz i date picker', assignee: 'TR', attachments: 1 },
    ],
  },
]

const TOC = [
  { id: 'listy',    label: 'Listy' },
  { id: 'keyvalue', label: 'Klucz-wartość', level: 2 as const },
  { id: 'chmura',   label: 'Chmura tagów', level: 2 as const },
  { id: 'drzewo',   label: 'Drzewo plików' },
  { id: 'kanban',   label: 'Tablica Kanban' },
  { id: 'kod',      label: 'Kod i dane' },
  { id: 'logi',     label: 'Podgląd logów', level: 2 as const },
  { id: 'qr',       label: 'Kod QR' },
  { id: 'czas',     label: 'Czas' },
]

export function NarzedziaSection() {
  const [board, setBoard] = React.useState(KANBAN_INIT)
  const [sel, setSel] = React.useState('gt')

  const deadline = React.useMemo(() => new Date(Date.now() + 3 * 86400000 + 4 * 3600000 + 12 * 60000), [])
  const past = React.useMemo(() => new Date(Date.now() - 8 * 60000), [])
  const older = React.useMemo(() => new Date(Date.now() - 3 * 86400000), [])

  return (
    <div className="space-y-10">

      {/* LISTY */}
      <div className="space-y-4">
        <h3 id="listy" className="text-sm font-semibold text-foreground/70">Listy</h3>
        <SectionLabel>Lista z pozycjami — strefa lewa, treść, strefa prawa, chevron</SectionLabel>
        <GlassList className="max-w-lg">
          <GlassListItem
            leading={<GlassAvatar initials="AW" size="sm" />}
            title="Anna Wiśniewska" description="anna@example.com"
            trailing={<GlassBadge intent="primary" size="sm">Ultimate</GlassBadge>}
            chevron onClick={() => {}}
          />
          <GlassListItem
            leading={<GlassAvatar initials="MK" size="sm" />}
            title="Michał Kowalski" description="michal@example.com"
            trailing={<GlassBadge size="sm">Premium</GlassBadge>}
            chevron onClick={() => {}}
          />
          <GlassListItem
            leading={<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary"><Zap className="h-4 w-4" /></span>}
            title="Doładowanie Byte" description="Pakiet 1500 ⟠"
            trailing={<span className="font-mono text-xs text-foreground/60">269 zł</span>}
            active
          />
          <GlassListItem title="Pozycja zablokowana" description="niedostępna w tym planie" disabled />
        </GlassList>

        <SectionLabel>Listy punktowane — kropka, ptaszek, numeracja</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <GlassBulletList items={['Pierwsza pozycja', 'Druga pozycja', 'Trzecia pozycja']} />
          </GlassCard>
          <GlassCard>
            <GlassBulletList check items={['Bez limitu wiadomości', 'Wszystkie modele AI', 'Wsparcie priorytetowe']} />
          </GlassCard>
          <GlassCard>
            <GlassBulletList ordered items={['Załóż konto', 'Doładuj Byte', 'Zacznij tworzyć']} />
          </GlassCard>
        </div>
      </div>

      {/* KEY-VALUE */}
      <div className="space-y-4">
        <h3 id="keyvalue" className="text-sm font-semibold text-foreground/70">Pary klucz-wartość</h3>
        <SectionLabel>Układ w wierszu i w kolumnie · pola techniczne z kopiowaniem</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard>
            <GlassKeyValue
              rows={[
                { key: 'Model',        value: 'Claude Sonnet 4' },
                { key: 'Kontekst',     value: '200 000 tokenów' },
                { key: 'Sesja',        value: 'ses_8f4c2a91', mono: true, copyable: 'ses_8f4c2a91' },
                { key: 'Region',       value: 'eu-central-1', mono: true },
                { key: 'Koszt',        value: '5 255 ⟠' },
              ]}
            />
          </GlassCard>
          <GlassCard>
            <GlassKeyValue
              layout="stack"
              rows={[
                { key: 'Endpoint', value: 'POST /v1/messages', mono: true, copyable: 'POST /v1/messages' },
                { key: 'Nagłówek autoryzacji', value: 'Bearer nb_live_8f4c…3c50', mono: true },
                { key: 'Odpowiedź', value: '200 OK · 182 ms' },
              ]}
            />
          </GlassCard>
        </div>
      </div>

      {/* CHMURA TAGÓW */}
      <div className="space-y-4">
        <h3 id="chmura" className="text-sm font-semibold text-foreground/70">Chmura tagów</h3>
        <SectionLabel>Waga 1–5 steruje rozmiarem i intensywnością</SectionLabel>
        <GlassCard>
          <GlassTagCloud
            tags={[
              { label: 'AI Chat', weight: 5 }, { label: 'Studio Zdjęć', weight: 4 },
              { label: 'Prompty', weight: 4 }, { label: 'Kalendarz', weight: 3 },
              { label: 'Notatki', weight: 3 }, { label: 'Baza Danych', weight: 2 },
              { label: 'Zadania', weight: 3 }, { label: 'Deep Research', weight: 2 },
              { label: 'Akademia', weight: 1 }, { label: 'Pętle AI', weight: 2 },
              { label: 'Enhancer', weight: 1 }, { label: 'Lokalny AI', weight: 1 },
            ]}
          />
        </GlassCard>
      </div>

      {/* DRZEWO */}
      <div className="space-y-4">
        <h3 id="drzewo" className="text-sm font-semibold text-foreground/70">Drzewo plików</h3>
        <SectionLabel>Rozwijane gałęzie z kreskami prowadzącymi · folder/plik dobierany automatycznie</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard padding="p-2">
            <GlassTreeView
              nodes={TREE}
              defaultExpanded={['src', 'components']}
              selectedId={sel}
              onSelect={(n) => setSel(n.id)}
            />
          </GlassCard>
          <GlassCard padding="p-2">
            <SectionLabel>Bez kresek prowadzących</SectionLabel>
            <GlassTreeView nodes={TREE} defaultExpanded={['src']} showGuides={false} />
          </GlassCard>
        </div>
      </div>

      {/* KANBAN */}
      <div className="space-y-4">
        <h3 id="kanban" className="text-sm font-semibold text-foreground/70">Tablica Kanban</h3>
        <SectionLabel>Przeciągnij kartę między kolumnami · licznik zapala się po przekroczeniu limitu WIP</SectionLabel>
        <GlassKanbanBoard columns={board} onChange={setBoard} onAddCard={() => {}} />
      </div>

      {/* KOD */}
      <div className="space-y-4">
        <h3 id="kod" className="text-sm font-semibold text-foreground/70">Kod i dane</h3>
        <SectionLabel>Blok kodu z nazwą pliku, numeracją i podświetleniem linii</SectionLabel>
        <GlassCodeBlock
          code={SAMPLE_CODE}
          filename="Przyklad.tsx"
          language="tsx"
          highlight={[5, 8]}
          className="max-w-2xl"
        />

        <SectionLabel>Zwijany — pokazuje pierwsze 6 linii</SectionLabel>
        <GlassCodeBlock code={SAMPLE_CODE} filename="Przyklad.tsx" language="tsx" maxLines={6} className="max-w-2xl" />

        <SectionLabel>Kod w tekście (inline)</SectionLabel>
        <GlassCard className="max-w-2xl">
          <p className="text-xs leading-relaxed text-foreground/70">
            Hook <GlassInlineCode>useGlass()</GlassInlineCode> zwraca <GlassInlineCode>isGlass</GlassInlineCode>,
            na podstawie którego komponent wybiera klasę <GlassInlineCode>nb-szklo</GlassInlineCode> albo
            {' '}<GlassInlineCode>nb-tafla</GlassInlineCode>.
          </p>
        </GlassCard>

        <SectionLabel>Podgląd JSON — zwijane gałęzie, kolory wg typu</SectionLabel>
        <GlassJsonViewer data={SAMPLE_JSON} className="max-w-2xl" />
      </div>

      {/* LOGI */}
      <div className="space-y-4">
        <h3 id="logi" className="text-sm font-semibold text-foreground/70">Podgląd logów</h3>
        <SectionLabel>Pięć poziomów · monospace, czas i źródło w osobnych kolumnach</SectionLabel>
        <GlassLogView lines={LOGS} className="max-w-2xl" />
        <SectionLabel>Filtr — tylko ostrzeżenia i błędy</SectionLabel>
        <GlassLogView lines={LOGS} levels={['warn', 'error']} className="max-w-2xl" />
      </div>

      {/* QR */}
      <div className="space-y-4">
        <h3 id="qr" className="text-sm font-semibold text-foreground/70">Kod QR</h3>
        <SectionLabel>Generowany lokalnie — bez zależności i bez zapytań sieciowych</SectionLabel>
        <GlassCard className="flex flex-wrap items-start gap-6">
          <GlassQrCode value="https://nextbyte.pl" label="nextbyte.pl" />
          <GlassQrCode value="https://nextbyte.pl/cennik" label="Cennik" size={120} />
          <GlassQrCode value="nb_live_8f4c2a91" label="Token sesji" size={100} />
        </GlassCard>
      </div>

      {/* CZAS */}
      <div className="space-y-4">
        <h3 id="czas" className="text-sm font-semibold text-foreground/70">Czas</h3>
        <SectionLabel>Odliczanie do terminu — pełne i kompaktowe</SectionLabel>
        <GlassCard className="flex flex-wrap items-center gap-6">
          <GlassCountdown to={deadline} />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-foreground/40">wariant compact</span>
            <GlassCountdown to={deadline} compact />
          </div>
        </GlassCard>

        <SectionLabel>Czas względny — odświeża się sam, pełna data w tooltipie</SectionLabel>
        <GlassCard className="max-w-md">
          <GlassKeyValue
            rows={[
              { key: 'Ostatnia aktywność', value: <GlassRelativeTime date={past} /> },
              { key: 'Wdrożenie',          value: <GlassRelativeTime date={older} /> },
              { key: 'Koniec promocji',    value: <GlassRelativeTime date={deadline} /> },
            ]}
          />
        </GlassCard>
      </div>

      {/* SPIS TREŚCI */}
      <div className="space-y-4">
        <h3 id="spis" className="text-sm font-semibold text-foreground/70">Spis treści i powrót na górę</h3>
        <SectionLabel>Aktywna pozycja podświetla się przy przewijaniu (IntersectionObserver)</SectionLabel>
        <GlassToc entries={TOC} className="max-w-xs" />
        <p className="text-xs text-foreground/45">
          Przycisk powrotu na górę pojawia się w prawym dolnym rogu po przewinięciu strony.
        </p>
        <GlassBackToTop />
      </div>

    </div>
  )
}
