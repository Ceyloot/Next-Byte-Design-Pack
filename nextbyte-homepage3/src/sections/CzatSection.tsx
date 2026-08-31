import React from 'react'
import {
  Sparkles, Bot, MoreHorizontal, Zap, Brain, Crown, Server, Rocket, FileText, Image as ImageIcon, Globe,
} from 'lucide-react'
import {
  GlassCard, GlassChatBubble, GlassChatTyping, GlassChatHeader,
  GlassChatInput, GlassChatThread, GlassBadge, GlassButton,
  GlassChatComposer, GlassModelPicker,
} from '@/components/glass'
import type { ComposerToggle, ModelPickerGroup, ModelPickerDetail, ModelPickerItem } from '@/components/glass'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="nb-etykieta mb-3">{children}</p>
}

type Msg = { id: number; role: 'user' | 'assistant' | 'system'; text: string; time: string }

const SEED: Msg[] = [
  { id: 1, role: 'system',    text: 'Rozmowa rozpoczęta · model GPT-4o',                                         time: '' },
  { id: 2, role: 'user',      text: 'Zaprojektuj mi paletę kolorów pod aplikację fintech.',                      time: '14:02' },
  { id: 3, role: 'assistant', text: 'Jasne. Zacznijmy od tego, czy aplikacja ma budzić zaufanie instytucjonalne, czy raczej sprawiać wrażenie nowoczesnego narzędzia dla młodszych użytkowników? To zmienia punkt wyjścia.', time: '14:02' },
  { id: 4, role: 'user',      text: 'Nowoczesne narzędzie, ale bez krzykliwości.',                               time: '14:03' },
  { id: 5, role: 'assistant', text: 'W takim razie proponuję granat jako bazę, jeden nasycony akcent (cyjan albo fiolet) i neutralną szarość na tła. Kolor semantyczny tylko tam, gdzie niesie znaczenie — saldo, alerty, statusy.', time: '14:03' },
]

const COMPOSER_TOGGLES: ComposerToggle[] = [
  { id: 'docs',   label: 'Dokumenty', icon: FileText },
  { id: 'images', label: 'Obrazy',    icon: ImageIcon },
  { id: 'web',    label: 'WEB',       icon: Globe, active: true },
]

const MODEL_GROUPS: ModelPickerGroup[] = [
  {
    label: 'NextByte',
    items: [
      { id: 'lokalny', name: 'Lokalny', description: 'Najpierw przetestuj połączenie', icon: Server, needsSetup: true },
      { id: 'szybki',  name: 'Szybki',  description: 'Błyskawiczne odpowiedzi do prostych zadań', icon: Zap, cost: 1 },
      { id: 'pro',     name: 'Pro',     description: 'Zaawansowane rozumowanie i analiza', icon: Sparkles, cost: 2 },
      { id: 'ultra',   name: 'Ultra',   description: 'Najwyższa jakość — szybkość i inteligencja', icon: Crown, cost: 2 },
    ],
  },
  {
    label: 'Inne modele',
    items: [
      { id: 'grok',  name: 'Grok 4.3',       description: 'xAI — agentic reasoning, 1M kontekst', icon: Rocket, cost: 2 },
      { id: 'gpt',   name: 'GPT-5.4',        description: 'OpenAI — uniwersalny model do zadań mieszanych', icon: Sparkles, cost: 2 },
      { id: 'opus',  name: 'Claude Opus 5',  description: 'Anthropic — długie konteksty i praca z kodem', icon: Crown, cost: 3 },
    ],
  },
]

const MODEL_DETAIL: ModelPickerDetail = {
  name: 'Pro',
  badge: 'NEXTBYTE',
  description: 'Gemini 3.1 Pro Preview — zaawansowane rozumowanie i analiza do bardziej złożonych zadań (2 Byte).',
  contextLabel: 'Kontekst: 1M tokenów',
  metrics: [
    { label: 'Inteligencja', value: 8 },
    { label: 'Szybkość',     value: 7 },
    { label: 'Kontekst',     value: 10 },
    { label: 'Koszt',        value: 9 },
  ],
  messageCost: 2,
  reasoningLevels: ['Niski', 'Średni', 'Wysoki'],
  activeReasoningLevel: 'Średni',
}

export function CzatSection() {
  const [messages, setMessages] = React.useState<Msg[]>(SEED)
  const [typing, setTyping] = React.useState(false)
  const [toggles, setToggles] = React.useState(COMPOSER_TOGGLES)
  const [composerVal, setComposerVal] = React.useState('')
  const [activeModel, setActiveModel] = React.useState('szybki')
  const [reasoningLevel, setReasoningLevel] = React.useState('Średni')

  function send(text: string) {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text, time }])
    setTyping(true)
    // Symulacja odpowiedzi — sekcja ma pokazać pełny cykl wysyłki,
    // łącznie ze wskaźnikiem pisania, bez podpinania realnego API.
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'To demo biblioteki — odpowiedzi są symulowane. W realnej aplikacji w tym miejscu trafia strumień z modelu.',
        time,
      }])
    }, 1400)
  }

  return (
    <div className="space-y-10">

      {/* PEŁNY WĄTEK */}
      <div className="space-y-4">
        <h3 id="czat-watek" className="text-sm font-semibold text-foreground/70">Wątek czatu (pełny, interaktywny)</h3>
        <SectionLabel>Napisz wiadomość i wyślij Enterem — zobaczysz wskaźnik pisania i odpowiedź</SectionLabel>

        <GlassCard padding="p-0" className="max-w-2xl overflow-hidden">
          <GlassChatHeader
            title="NextByte AI"
            subtitle={typing ? 'pisze…' : 'GPT-4o · online'}
            online
            actions={<GlassBadge intent="primary" size="sm">4 820 ⟠</GlassBadge>}
          />

          <GlassChatThread maxHeight={400}>
            {messages.map((m) => (
              <GlassChatBubble
                key={m.id}
                role={m.role}
                time={m.time || undefined}
                status={m.role === 'user' ? 'read' : undefined}
                avatar={m.role === 'system' ? undefined : m.role === 'user' ? 'AB' : <Sparkles className="h-3.5 w-3.5 text-primary" />}
              >
                {m.text}
              </GlassChatBubble>
            ))}
            {typing && <GlassChatTyping avatar={<Sparkles className="h-3.5 w-3.5 text-primary" />} />}
          </GlassChatThread>

          <div className="p-3">
            <GlassChatInput
              onSend={send}
              placeholder="Zapytaj o cokolwiek…"
              suggestions={['Podsumuj rozmowę', 'Pokaż warianty', 'Wyjaśnij prościej']}
            />
          </div>
        </GlassCard>
      </div>

      {/* BĄBLE */}
      <div className="space-y-4">
        <h3 id="czat-babel" className="text-sm font-semibold text-foreground/70">Bąbel wiadomości (Bubble)</h3>

        <SectionLabel>Trzy role — wysłana, odebrana, systemowa</SectionLabel>
        <GlassCard className="max-w-lg space-y-3">
          <GlassChatBubble role="system">Rozmowa rozpoczęta · model GPT-4o</GlassChatBubble>
          <GlassChatBubble role="assistant" avatar={<Sparkles className="h-3.5 w-3.5 text-primary" />} time="14:02">
            Wiadomość odebrana. Bąbel asystenta trzyma się lewej krawędzi i ma ścięty róg od strony avatara.
          </GlassChatBubble>
          <GlassChatBubble role="user" avatar="AB" time="14:03" status="read">
            Wiadomość wysłana — prawa strona, akcent kolorystyczny, status doręczenia pod spodem.
          </GlassChatBubble>
        </GlassCard>

        <SectionLabel>Z nazwą autora — czat grupowy</SectionLabel>
        <GlassCard className="max-w-lg space-y-3">
          <GlassChatBubble role="assistant" avatar="AW" author="Anna Wiśniewska" time="12:41">
            W czacie grupowym nazwa autora siada nad bąblem, żeby dało się rozróżnić rozmówców.
          </GlassChatBubble>
          <GlassChatBubble role="assistant" avatar="MK" author="Michał Kowalski" time="12:43">
            Kolejna osoba, ten sam układ.
          </GlassChatBubble>
          <GlassChatBubble role="user" avatar="AB" author="Ty" time="12:45" status="delivered">
            Twoja wiadomość zawsze po prawej.
          </GlassChatBubble>
        </GlassCard>

        <SectionLabel>Statusy doręczenia — sending · sent · delivered · read</SectionLabel>
        <GlassCard className="max-w-lg space-y-3">
          {(['sending', 'sent', 'delivered', 'read'] as const).map((s) => (
            <GlassChatBubble key={s} role="user" time="14:05" status={s}>
              status=&quot;{s}&quot;
            </GlassChatBubble>
          ))}
        </GlassCard>
      </div>

      {/* WSKAŹNIK PISANIA */}
      <div className="space-y-4">
        <h3 id="czat-typing" className="text-sm font-semibold text-foreground/70">Wskaźnik pisania (Typing)</h3>
        <SectionLabel>Trzy kropki z przesuniętą fazą animacji · opcjonalny podpis</SectionLabel>
        <GlassCard className="max-w-lg space-y-3">
          <GlassChatTyping avatar={<Sparkles className="h-3.5 w-3.5 text-primary" />} />
          <GlassChatTyping avatar={<Bot className="h-3.5 w-3.5 text-primary" />} label="NextByte AI analizuje dokument…" />
        </GlassCard>
      </div>

      {/* NAGŁÓWEK */}
      <div className="space-y-4">
        <h3 id="czat-naglowek" className="text-sm font-semibold text-foreground/70">Nagłówek czatu (Header)</h3>
        <SectionLabel>Avatar ze wskaźnikiem obecności, tytuł, podtytuł i slot akcji</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <GlassCard padding="p-0" className="overflow-hidden">
            <GlassChatHeader title="NextByte AI" subtitle="GPT-4o · online" online />
          </GlassCard>
          <GlassCard padding="p-0" className="overflow-hidden">
            <GlassChatHeader
              title="Zespół Design"
              subtitle="4 uczestników"
              avatar="ZD"
              actions={
                <div className="flex items-center gap-1">
                  <GlassBadge intent="success" size="sm" dot>3 online</GlassBadge>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 hover:bg-foreground/[0.06] hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              }
            />
          </GlassCard>
        </div>
      </div>

      {/* PASEK WPROWADZANIA */}
      <div className="space-y-4">
        <h3 id="czat-input" className="text-sm font-semibold text-foreground/70">Pasek wprowadzania (Input)</h3>

        <SectionLabel>Podstawowy — przycisk wysyłki aktywuje się dopiero po wpisaniu treści</SectionLabel>
        <GlassCard className="max-w-lg">
          <GlassChatInput onSend={(t) => console.log(t)} />
        </GlassCard>

        <SectionLabel>Z sugestiami — klik wstawia i od razu wysyła</SectionLabel>
        <GlassCard className="max-w-lg">
          <GlassChatInput
            onSend={(t) => console.log(t)}
            suggestions={['Podsumuj', 'Przetłumacz', 'Popraw styl', 'Wypunktuj']}
          />
        </GlassCard>

        <SectionLabel>Zablokowany — np. gdy skończyły się Byte</SectionLabel>
        <GlassCard className="max-w-lg space-y-3">
          <GlassChatInput disabled placeholder="Brak środków — doładuj pakiet Byte" />
          <GlassButton size="sm" className="gap-1.5">Doładuj Byte</GlassButton>
        </GlassCard>
      </div>

      {/* PASEK CZATU (COMPOSER) */}
      <div className="space-y-4">
        <h3 id="czat-composer" className="text-sm font-semibold text-foreground/70">Pasek czatu (Composer)</h3>
        <SectionLabel>Pigułka modelu z neutralną obwódką, przełączniki źródeł z łukiem-podświetleniem, narzędzia, licznik tokenów i wysyłka</SectionLabel>
        <GlassChatComposer
          modelName="Szybki"
          modelIcon={Zap}
          modelCost={1}
          toggles={toggles}
          onToggle={(id) => setToggles((t) => t.map((x) => x.id === id ? { ...x, active: !x.active } : x))}
          value={composerVal}
          onChange={setComposerVal}
          placeholder="Szukaj w internecie..."
          tokenCount="4.2k"
          sendCost={2}
          onSend={() => setComposerVal('')}
        />

        <SectionLabel>Zablokowany — brak środków</SectionLabel>
        <GlassChatComposer
          modelName="Szybki"
          modelIcon={Zap}
          modelCost={1}
          placeholder="Doładuj Byte, żeby kontynuować..."
          disabled
        />
      </div>

      {/* WYBÓR MODELU */}
      <div className="space-y-4">
        <h3 id="czat-model-picker" className="text-sm font-semibold text-foreground/70">Wybór modelu (Model Picker)</h3>
        <SectionLabel>Lista pogrupowana po lewej, karta szczegółów z metrykami segmentowymi po prawej</SectionLabel>
        <GlassModelPicker
          groups={MODEL_GROUPS}
          activeId={activeModel}
          peekId="pro"
          onSelect={(item: ModelPickerItem) => setActiveModel(item.id)}
          detail={{ ...MODEL_DETAIL, activeReasoningLevel: reasoningLevel }}
          onReasoningLevelChange={setReasoningLevel}
        />
      </div>

    </div>
  )
}
