import React, { useMemo } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ListaCecha } from '@/components/ui/lista-wyboru';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import type { SpeedMode } from './ModelSelector';
import { useChatModelMetadata, type ChatModelMetadata } from '@/hooks/useChatModelMetadata';
import { useChatModelConfigurations } from '@/hooks/useChatModelConfigurations';
import { useModelConfig, type ReasoningLevel } from '@/lib/chat-ai/modelConfig';

interface Props {
  speedMode: SpeedMode;
  children: React.ReactNode;
  /** side hover-card. Domyślnie 'right' — obok dropdown row. */
  side?: 'right' | 'left' | 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Kiedy user kliknie ustawienie w hover-cardzie — auto-switch na ten model. */
  onSelectModel?: (mode: SpeedMode) => void;
  /** Aktualnie aktywny model (żeby nie switchować gdy ten sam). */
  activeSpeedMode?: SpeedMode;
}


const PROVIDER_LABEL: Record<string, string> = {
  openai: 'OpenAI',
  google: 'Google',
  anthropic: 'Anthropic',
  xai: 'xAI',
  nextbyte: 'NextByte',
};

const REASONING_LABEL: Record<ReasoningLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/*
  SUFIT SKALI PRZY „WYSOKIM" — to zachowanie, nie usterka.

  Pro i Ultra to TEN SAM model (`google/gemini-3.1-pro-preview`); różni je
  wyłącznie budżet myślenia, a ten steruje się właśnie tym przełącznikiem:
    Pro   niski 1 024 · średni 4 096 · wysoki 8 192
    Ultra niski 4 096 · średni 16 384 · wysoki 24 576
  Przy „Wysokim" obie pozycje pokazują inteligencję 10, bo skala kończy się
  na dziesiątce — a nie dlatego, że są sobie równe. Różnica jest wtedy
  widoczna w SZYBKOŚCI (Pro 5, Ultra 2), bo trzykrotnie większe myślenie
  trwa dłużej. Przy „Średnim", czyli domyślnym, bazy różnią się wprost: 9 i 10.
*/
const REASONING_DELTA: Record<ReasoningLevel, number> = { low: -2, medium: 0, high: 2 };

function clamp(v: number) {
  return Math.max(1, Math.min(10, Math.round(v)));
}

/**
 * Wskaźnik cechy modelu = `ListaCecha` Z BIBLIOTEKI.
 *
 * Michał: „te statystyki że 8/10 to weź z panelu biblioteki komponentów
 * co mamy to wyliczane wygląd, czemu nie korzystasz z niej? po to ją
 * robiliśmy". Miał rację i to był mój trzeci podejście do tego samego
 * kształtu w tym pliku: najpierw dziesięć kolorowych klocków animowanych
 * framer-motion, potem mój własny cienki tor — a `ListaCecha` leżała
 * w `lista-wyboru.tsx` od początku, opisana wprost jako „pasek segmentowy
 * do karty szczegółów", w tej samej gramatyce co `Postep` w Panelu Zarządu.
 *
 * Skala biblioteki to 8 segmentów, dane modeli są w skali 1–10 — stąd
 * przeliczenie, a nie podmiana danych. `zIlu={10}` zachowuje oryginalną
 * ziarnistość ocen zamiast zaokrąglać je w dół do ósemek.
 */
/* Eksportowany, bo używa go też `VideoModelPicker` — jeden adapter skali
   1–10 na komponent biblioteki, a nie dwa. */
export function MetricBar({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return <ListaCecha nazwa={label} wartosc={value} zIlu={10} className={hint ? 'cursor-help' : undefined} />;
}

interface SegmentedProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  ariaLabel: string;
}

function Segmented({ value, options, onChange, ariaLabel }: SegmentedProps) {
  /*
    PRZEŁĄCZNIK Z MATERIAŁU PLATFORMY (04.08.2026).
    Michał: „ogarnij wygląd wyboru reasoning effort".

    Było: aktywna opcja dostawała `bg-background`, czyli PEŁNY kolor tła
    aplikacji — na szklanym panelu wychodził z tego nieprzezroczysty
    prostokąt, ten sam błąd co przy czarnym polu czatu. Do tego kolorowa
    poświata dookoła i wysokość 22 px, czyli poniżej progu dotyku.

    Jest: pigułka z akcentem, ten sam gradient co pozycja wybrana na
    liście, i 32 px wysokości — palcem da się trafić.
  */
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-border/40 bg-foreground/[0.04] p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onChange(o.value);
            }}
            className={cn(
              'h-8 rounded-lg text-[11px] font-medium transition-colors duration-200',
              active
                ? 'border border-primary/30 bg-primary/15 text-primary'
                : 'border border-transparent text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface PanelProps {
  meta: ChatModelMetadata;
  onSelectModel?: (mode: SpeedMode) => void;
  activeSpeedMode?: SpeedMode;
}

/**
 * Zawartość karty szczegółów modelu — metryki, poziom rozumowania, tryb szybki.
 *
 * Wyeksportowana 04.08.2026, bo `ListaPozycja` z biblioteki ma własny `szczegoly`:
 * na desktopie pokazuje kartę z boku po najechaniu, na telefonie daje przycisk
 * rozwijający ją w miejscu. To ta sama funkcja co `ModelHoverCard`, tylko
 * bez drugiego zestawu HoverCard/Popover dookoła.
 */
export function PanelSzczegolowModelu({ meta, onSelectModel, activeSpeedMode }: PanelProps) {
  const { config, setReasoning } = useModelConfig(meta.speed_mode);
  const { data: configurations } = useChatModelConfigurations();

  const ensureActive = () => {
    if (onSelectModel && activeSpeedMode !== meta.speed_mode) {
      onSelectModel(meta.speed_mode);
    }
  };
  const handleReasoning = (v: ReasoningLevel) => {
    setReasoning(v);
    ensureActive();
  };

  const adjustedIntelligence = useMemo(
    () =>
      meta.supports_reasoning
        ? clamp(meta.intelligence + REASONING_DELTA[config.reasoning])
        : meta.intelligence,
    [meta, config.reasoning],
  );
  /*
    POZIOM ROZUMOWANIA RUSZA OBIE WARTOŚCI, NIE JEDNĄ (04.08.2026).

    Inteligencja od zawsze rosła z poziomem rozumowania (`REASONING_DELTA`),
    ale szybkość reagowała WYŁĄCZNIE na tryb szybki. Efekt: przełączenie na
    „Wysoki" podnosiło inteligencję i zostawiało szybkość bez zmian — czyli
    panel obiecywał lepszą odpowiedź za darmo, choć więcej myślenia zawsze
    kosztuje czas. To ta sama niespójność, którą Michał wyłapał między Pro
    a Ultra, tylko na poziomie ustawienia zamiast modelu.

    Delta jest LUSTRZANA: `high` +2 do inteligencji i −2 do szybkości,
    `low` odwrotnie. Jedna tabela `REASONING_DELTA`, dwa znaki.
  */
  /* Tryb `gpt54` prowadzi do rodziny GPT-5.6, gdzie przełącznik wybiera MODEL
     (Luna/Terra/Sol), a nie głębokość myślenia jednego modelu. */
  const wariantowyWybor = meta.speed_mode === 'gpt54';

  /*
    ── CLAUDE 5: WARIANT TO OSOBNY MODEL, NIE USTAWIENIE ─────────────────────
    Michał, 09.09.2026: „jak jest claude sonet i opus to daj po prostu claude 5
    i po najechaniu tak jak w gpt i się pokazują 2 możliwości do wyboru
    z domyślną sonnet".

    Wygląda jak przełącznik GPT-5.6, ale działa INACZEJ i to jest tu jedyna
    rzecz, na którą trzeba uważać. U GPT wariant siedzi w `config.reasoning`
    przy jednym `speed_mode`; u Claude'a wariant JEST `speed_mode`
    (`sonnet46` / `opus47`), bo to dwie osobne pozycje w cenniku i dwa osobne
    wiersze w `chat_ai_model_metadata`. Dlatego ten przełącznik woła
    `onSelectModel`, a nie `setReasoning` — pomyłka dałaby wybór wariantu,
    który zmienia napis i nic poza tym.

    Skutek uboczny, który jest zaletą: po przełączeniu karta przeładowuje się
    metrykami DRUGIEGO modelu (inteligencja, szybkość, koszt), bo `meta`
    przychodzi z wiersza wskazanego przez `speed_mode`. Człowiek widzi więc
    różnicę, zanim wybierze.
  */
  const wariantClaude = meta.speed_mode === 'sonnet46' || meta.speed_mode === 'opus47';

  const adjustedSpeed = useMemo(
    () => {
      const zRozumowania = meta.supports_reasoning ? -REASONING_DELTA[config.reasoning] : 0;
      return clamp(meta.speed + zRozumowania);
    },
    [meta, config.reasoning],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {/*
        SZEROKOŚĆ OD RODZICA, NIE NA SZTYWNO (04.08.2026).
        Michał, ze zrzutem i zaznaczonym paskiem po prawej: „jak tu wychodzi
        przecież" — „2 Byte" ucięte w połowie, „Wysoki" ucięty, kreski
        wskaźników wychodzące poza panel.

        Było `w-[280px] p-3`. Ta liczba pochodziła z czasów, gdy treść żyła
        we własnym `HoverCard` dopasowanym do niej. Teraz siedzi w panelu
        `ListaTresc`, który ma `w-72` (288 px) i `p-4`, czyli 256 px w środku
        — treść była o 24 px za szeroka i wychodziła poza krawędź.

        `w-full min-w-0` bierze szerokość od rodzica, więc jedno miejsce
        decyduje o rozmiarze. `min-w-0` jest konieczne, bo bez niego
        elementy siatki nie dają się ścisnąć poniżej swojej treści.
        Własne `p-3` znika — panel ma już `p-4`, dwa marginesy naraz to
        był podwójny odstęp.
      */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{meta.display_name}</span>
          <span className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold shrink-0">
            {PROVIDER_LABEL[meta.provider] ?? meta.provider}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">{meta.description}</p>
        {meta.context_window && (
          <p className="text-[10px] text-muted-foreground/70">Kontekst: {meta.context_window}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <MetricBar label="Inteligencja" value={adjustedIntelligence} />
        <MetricBar label="Szybkość" value={adjustedSpeed} />
        <MetricBar label="Kontekst" value={meta.context} hint="Rozmiar okna kontekstu" />
        {/*
          KOSZT BEZ `invert` — to była nieprawda na ekranie, nie kosmetyka.

          Skala w bazie jest ustawiona „wyżej = taniej" i liczona wprost
          z ceny w Byte (0→10, 1→9, 2→8, 3→7, 4→6, 23→1). Czyli ta sama
          orientacja co inteligencja i szybkość — im więcej, tym lepiej
          dla użytkownika.

          `invert` odwracał to DRUGI RAZ: Opus (najdroższy model na
          platformie, 23 Byte) rysował się jako 8 z 10 kresek na zielono,
          a tryb darmowy (koszt 10) jako pusty czerwony pasek. Wskaźnik
          pokazywał odwrotność prawdy dla każdego modelu.
        */}
        <MetricBar label="Koszt" value={meta.cost} hint="Wyżej = taniej w Byte" />
      </div>

      {/*
        BLOK „KOSZT WIADOMOŚCI" USUNIĘTY — decyzja Michała z 01.09.2026.

        Pokazywał stałą cenę modelu (i przekreśloną cenę bazową przy dopłacie
        za tryb myślenia). Od zniesienia stawki bazowej taka liczba nie
        istnieje: cena wiadomości wynika z jej własnego zużycia, więc karta
        modelu nie ma jak jej znać — nie wie ani co człowiek napisał, ani co
        dopiął do rozmowy.

        Pasek „Koszt" wyżej ZOSTAJE, bo to nie cena, tylko wskaźnik relatywnej
        drogości modelu ze skali w bazie („wyżej = taniej"). On dalej pomaga
        wybrać między Szybkim a Opusem, nie obiecując konkretnej kwoty.
      */}


      {(wariantowyWybor || wariantClaude) && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            Konfiguracja
          </span>
          {wariantClaude && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-foreground/80">Wariant modelu</span>
              <Segmented
                value={meta.speed_mode}
                onChange={(v) => onSelectModel?.(v as SpeedMode)}
                ariaLabel="Wariant modelu Claude"
                options={[
                  { value: 'sonnet46', label: 'Sonnet' },
                  { value: 'opus47', label: 'Opus' },
                ]}
              />
              <span className="text-[10px] leading-snug text-muted-foreground/70">
                Sonnet — codzienna praca i kod (domyślny) · Opus — najtrudniejsze zadania, drożej
              </span>
            </div>
          )}
          {/*
            ── POZIOM ROZUMOWANIA ZDJĘTY Z KARTY (09.09.2026) ─────────────────
            Michał: „zbędnie poziomy rozumowania komplikują użytkownikowi —
            i to w każdym modelu te opcje do wywalenia".

            Ma rację i warto zapisać, dlaczego. „Niski / Średni / Wysoki" to
            pytanie, na które nikt nie umie odpowiedzieć przed wysłaniem
            wiadomości: nie wiadomo, ile myślenia wymaga pytanie, którego się
            jeszcze nie zadało. Ustawienie zmieniało koszt i czas, a obietnica
            („lepsza odpowiedź") była niesprawdzalna — więc trzy czwarte ludzi
            zostawiało „Średni" i płaciło uwagą za wybór, którego nie dokonało.
            Sensowną głębokość dobiera teraz edge z modelu i kontekstu
            (`reasoningEffort` w `chat-ai/index.ts`), i robi to lepiej, bo zna
            długość wejścia.

            ZOSTAJE natomiast WARIANT MODELU — i to nie jest wyjątek od tej
            zasady, tylko inna rzecz. Luna/Terra/Sol i Sonnet/Opus to osobne
            modele o cenach różniących się wielokrotnie. To wybór PRODUKTU,
            nie ustawienie jego czułości.
          */}
          {wariantowyWybor && (
            <div className="flex flex-col gap-1">
              {/* Rodzina GPT-5.6 nie ma konfigurowalnego `reasoning_effort` —
                  OpenAI rozbiło ją na trzy osobne modele, a `config.reasoning`
                  jedzie do edge wyłącznie po to, żeby wskazać, który. */}
              <span className="text-[11px] text-foreground/80">Wariant modelu</span>
              <Segmented
                value={config.reasoning}
                onChange={(v) => handleReasoning(v as ReasoningLevel)}
                ariaLabel="Wariant modelu"
                options={[
                  { value: 'low', label: 'Luna' },
                  { value: 'medium', label: 'Terra' },
                  { value: 'high', label: 'Sol' },
                ]}
              />
              <span className="text-[10px] leading-snug text-muted-foreground/70">
                Luna — tania i szybka · Terra — zbalansowana (domyślna) · Sol — flagowa
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Match ModelSelector popup: same bg / blur / primary-tinted border + top glow-rim,
// so the hover card reads as a lateral extension of the picker.
export const GLASS_CONTENT =
  'relative z-[140] p-0 rounded-2xl border border-primary/20 dark:border-primary/25 nb-szklo-menu shadow-[0_8px_40px_-4px_hsl(var(--primary)/0.18),0_0_0_1px_hsl(var(--primary)/0.08)] dark:shadow-[0_8px_40px_-4px_rgba(0,0,0,0.7),0_0_0_1px_hsl(var(--primary)/0.12),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden after:absolute after:inset-x-4 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/50 after:to-transparent';

/**
 * Hover: desktop → HoverCard obok wiersza modelu.
 * Mobile: dodaje ikonę „ⓘ" po prawej wewnątrz `children`, otwierającą Popover.
 * Obsługuje sytuację, gdy nie ma metadanych (fallback: nic nie robi, pokazuje children).
 */
export const ModelHoverCard: React.FC<Props> = ({ speedMode, children, side = 'right', align = 'start', onSelectModel, activeSpeedMode }) => {
  const isMobile = useIsMobile();
  const { data } = useChatModelMetadata();
  const meta = data?.[speedMode];

  if (!meta) return <>{children}</>;

  if (isMobile) {
    return (
      <div className="relative flex items-stretch">
        <div className="flex-1 min-w-0">{children}</div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 self-center mx-1 p-1 rounded-md text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label={`Szczegóły modelu ${meta.display_name}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className={cn(GLASS_CONTENT, 'w-auto')}>
            <PanelSzczegolowModelu meta={meta} onSelectModel={onSelectModel} activeSpeedMode={activeSpeedMode} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <HoverCard openDelay={80} closeDelay={180}>
      <HoverCardTrigger asChild>
        <div className="block w-full">{children}</div>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} sideOffset={4} className={cn(GLASS_CONTENT, 'w-auto')}>
        <PanelSzczegolowModelu meta={meta} onSelectModel={onSelectModel} activeSpeedMode={activeSpeedMode} />
      </HoverCardContent>
    </HoverCard>
  );
};
