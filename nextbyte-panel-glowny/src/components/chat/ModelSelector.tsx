import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ListaWyboru, ListaPrzycisk, ListaTresc, ListaPozycja, ListaGrupa } from '@/components/ui/lista-wyboru';
import { BASE_BYTE_COST } from '@/lib/chat-ai/byteCost';
import { Crown } from 'lucide-react';
import { ZNAKI_MODELI } from './logotypy-modeli';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useLocalAIConfig } from '@/hooks/useLocalAIConfig';
import { useModelConfig } from '@/lib/chat-ai/modelConfig';
import { PanelSzczegolowModelu } from './ModelHoverCard';
import { useChatModelMetadata } from '@/hooks/useChatModelMetadata';

export type SpeedMode = 'fast' | 'pro' | 'ultra' | 'gemini31pro' | 'gpt54' | 'sonnet46' | 'opus47' | 'grok43' | 'local';
export type ImageModel = 'image-fast' | 'image-pro';
/**
 * JEDNO ŹRÓDŁO CENY OBRAZU (07.09.2026). Ta sama liczba stoi na chipie modelu
 * i na przycisku „Wyślij" — zmierzone: chip pokazywał ⟠3, przycisk „Wyślij ·
 * 1 ⟠", a pobranie brało 3. Zasada platformy: cena pokazana = cena pobrana,
 * z tego samego miejsca. Pobranie w `useChatAI` liczy 3/4 tak samo.
 */
export const KOSZT_OBRAZU: Record<ImageModel, number> = { 'image-fast': 3, 'image-pro': 4 };

// Models that don't support Google Search grounding (routed via Runware)
// Local AI nie korzysta z grounding / web search / NextByte tools.
export const MODELS_WITHOUT_SEARCH: SpeedMode[] = ['local'];

interface ModelSelectorProps {
  /* Zgłasza otwarcie/zamknięcie listy modeli. Michał: „jak 1 otwarte
     2gie się chowa" — dwa menu w tym samym pasku mogły stać otwarte
     naraz i zasłaniać się nawzajem. Rodzic (`ChatHomePanel`) używa tego,
     żeby zamknąć menu trybu, gdy otwiera się lista modeli. */
  onOpenChange?: (otwarte: boolean) => void;
  selectedMode: SpeedMode;
  onModeChange: (mode: SpeedMode) => void;
  isMobile?: boolean;
  disabled?: boolean;
  // Image mode props
  isImageMode?: boolean;
  imageModel?: ImageModel;
  onImageModelChange?: (model: ImageModel) => void;
}


export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedMode,
  onModeChange,
  isMobile = false,
  disabled = false,
  isImageMode = false,
  imageModel = 'image-pro',
  onOpenChange,
}) => {
  const autoIsMobile = useIsMobile();
  const effectiveMobile = isMobile || autoIsMobile;
  /*
    MARTWY PROP `isUltimateSubscriber` USUNIĘTY — 02.09.2026.

    Był deklarowany w czterech komponentach i przekazywany przez trzy poziomy
    w dół, a NIGDZIE nie użyty w logice. Liczył się tak:
    `['ultimate','premium'].includes(tier)` — czyli po dodaniu planu Lite
    odciąłby go, mimo że nazywa się „ultimate" i tak naprawdę nie bramkował
    niczego. Mina, która wybuchłaby przy pierwszej próbie użycia.

    O dostępie do modeli decyduje `isSubscribed` — flaga „czy płaci",
    a nie nazwa planu. Dzięki temu Lite widzi te same modele co Premium,
    zgodnie z tym, co obiecuje karta.
  */
  const { isSubscribed } = useSubscriptionContext();
  const { config: localAIConfig, hasAccess: hasLocalAIAccess } = useLocalAIConfig();
  const navigate = useNavigate();
  // „Lokalny" jest na liście ZAWSZE — także gdy nie jest skonfigurowany, wyłączony
  // albo rozłączony. Ukrywanie go przy `enabled === false` sprawiało, że funkcja nie
  // istniała dla nikogo, kto jej jeszcze nie ustawił — czyli nie miał skąd się o niej
  // dowiedzieć. Stan pokazuje badge (OK / Nieprzetestowane / Błąd), a klik przy
  // niegotowym serwerze przenosi prosto do ustawień → zakładka Lokalny AI (patrz onClick).
  const showLocalOption = hasLocalAIAccess;
  const localStatus: 'ok' | 'untested' | 'error' =
    localAIConfig.lastTestOk && localAIConfig.defaultModel
      ? 'ok'
      : localAIConfig.lastTestAt
        ? 'error'
        : 'untested';
  const localReady = localStatus === 'ok';

  // ALL hooks MUST be called before any conditional return
  const [isOpen, _setIsOpen] = useState(false);
  const setIsOpen = React.useCallback((v: boolean | ((p: boolean) => boolean)) => {
    _setIsOpen((biezacy) => {
      const nowy = typeof v === 'function' ? v(biezacy) : v;
      if (nowy !== biezacy) onOpenChange?.(nowy);
      return nowy;
    });
  }, [onOpenChange]);
  /* Radix pozycjonuje panel, pilnuje krawędzi ekranu i zamyka go przy
     kliknięciu poza — więc trzy efekty, które robiły to ręcznie
     (pomiar `getBoundingClientRect`, przewinięcie do dołu, nasłuch
     `mousedown` z omijaniem portali), zniknęły razem z `createPortal`.
     ~60 linii utrzymywanych tylko po to, żeby odtworzyć zachowanie,
     które komponent z biblioteki ma z pudełka. */
  const { config: selectedConfig } = useModelConfig(selectedMode);
  const { data: daneModeli } = useChatModelMetadata();

  /*
    ── ZNAK DOSTAWCY ZAMIAST IKONY Z BIBLIOTEKI (09.09.2026) ─────────────────
    Michał: „fajnie jak byś tutaj utworzył grafiki tych modeli zamiast ikon,
    to jak by ich loga".

    Wcześniej lista miała DWIE korony (Ultra i Opus), iskierkę, rakietę
    i procesor — komplet ikon, z których żadna nie mówiła, czyj to model.
    Znaki mieszkają w `logotypy-modeli.tsx`, a tutaj bierze się je z mapy po
    `speed_mode`, żeby nie przepisywać ich przy każdym wpisie listy: wpisów
    jest dziewięć, a rozjazd między listą a zwiniętym przyciskiem byłby
    kwestią czasu.
  */
  const znakModelu = (id: SpeedMode) => {
    const Znak = ZNAKI_MODELI[id];
    return Znak ? <Znak /> : undefined;
  };

  /*
    ── SONNET I OPUS TO JEDEN WPIS „CLAUDE 5" (09.09.2026) ───────────────────
    Michał: „jak jest claude sonet i opus to daj po prostu claude 5 i po
    najechaniu tak jak w gpt i się pokazują 2 możliwości do wyboru
    z domyślną sonnet".

    To ta sama zasada, którą zastosowaliśmy przy GPT-5.6: lista wymienia
    RODZINĘ, a wariant wybiera się w karcie po najechaniu. Dwa osobne wiersze
    dla jednej rodziny każą człowiekowi rozstrzygać różnicę Sonnet/Opus,
    zanim w ogóle zobaczy, czym się różnią.

    RÓŻNICA WOBEC GPT, KTÓRA MA ZNACZENIE: u GPT wariant wybiera
    `config.reasoning` przy jednym `speed_mode`, tutaj wariant JEST osobnym
    `speed_mode` (`sonnet46` / `opus47`). Oba klucze zostają — siedzą
    w zapisanych rozmowach i w localStorage ludzi. Zmienia się wyłącznie to,
    jak lista je pokazuje.
  */
  const wariantClaude: SpeedMode = selectedMode === 'opus47' ? 'opus47' : 'sonnet46';



  // Standard AI modes
  //
  // ⚠️ AUDYT 1.3 — DUPLIKAT MODELU USUNIĘTY Z LISTY WYBORU (tylko prezentacja).
  // `pro` i `gemini31pro` prowadzą do TEGO SAMEGO modelu `google/gemini-3.1-pro-preview`
  // (chat-ai/index.ts — gałęzie `speed_mode === 'gemini31pro'` i `speed_mode === 'pro'`),
  // ale mają różny koszt Byte (2 vs 1). Interfejs oferował więc ten sam model dwa razy
  // w dwóch cenach. Kanoniczny jest `pro`: jest w grupie głównej, jest odblokowany,
  // jest wartością domyślną hooka useChatAI i włącza `proThinkingMode` tak samo.
  //
  // ⛔ CELOWO NIE ZMIENIONO: cen, marż, `byte_cost` ani mapowania w edge function.
  // Wpis `gemini31pro` żyje dalej w typie SpeedMode, w cenniku i w backendzie, więc
  // rozmowy zapisane wcześniej z `settings.speed_mode = 'gemini31pro'` działają bez zmian.
  // Aby przywrócić go w UI — przenieś wpis `legacyGemini31Pro` z warunku poniżej na stałe do listy.
  //
  // Rozmowy zapisane wcześniej z `gemini31pro` nadal muszą pokazywać PRAWDZIWĄ nazwę
  // wybranego trybu — inaczej selektor pokazywałby pierwszy model z listy (Grok),
  // czyli podmienialiśmy jedno ciche kłamstwo na drugie. Dlatego wpis pojawia się
  // w liście wyłącznie wtedy, gdy jest aktualnie wybrany.
  const legacyGemini31Pro = {
    id: 'gemini31pro' as SpeedMode,
    label: 'Gemini 3.1',
    shortLabel: 'Gemini 3.1',
    description: 'Google — stabilne rozumowanie (tryb archiwalny = Pro)',
    cost: 2,
    group: 'other' as const,
  };

  /* KOLEJNOŚĆ SEKCJI = kolejność tablicy (nagłówki grup wstawiają się przy
     zmianie `group`). NextByte STOI PIERWSZE — decyzja Michała 18.08: lista
     otwiera się od góry, więc na wierzchu mają być NASZE modele, a dostawcy
     zewnętrzni pod nimi. */
  const modes = [
    ...(showLocalOption ? [{
      id: 'local' as SpeedMode,
      label: 'Lokalny',
      shortLabel: localReady
        ? `🖥️ ${localAIConfig.defaultModel.length > 14 ? localAIConfig.defaultModel.slice(0, 14) + '…' : localAIConfig.defaultModel}`
        : '🖥️ Lokalny',
      description: localReady
        ? `Twój serwer (${localAIConfig.preset}) — ${localAIConfig.privacyMode === 'private' ? 'tryb prywatny' : 'tryb sync'}`
        : localStatus === 'error'
          ? 'Połączenie nieudane — kliknij, aby skonfigurować'
          : 'Włączone — kliknij, aby przetestować i wybrać model',
      cost: 0,
      group: 'main' as const,
      localStatus,
      localReady,
    }] : []),
    { id: 'fast' as SpeedMode, label: 'Szybki', shortLabel: 'Szybki', description: 'Błyskawiczne odpowiedzi do prostych zadań', cost: BASE_BYTE_COST.fast, group: 'main' as const },
    { id: 'pro' as SpeedMode, label: 'Pro', shortLabel: 'Pro', description: 'Zaawansowane rozumowanie i analiza', cost: BASE_BYTE_COST.pro, group: 'main' as const },
    /* Ultra prowadzi od 09.09.2026 do Claude Opus 5 (wcześniej Gemini 3.1 Pro
       z większym budżetem myślenia — czyli to samo co Pro, tylko drożej).
       Opis mówi o GŁĘBI, nie o szybkości: Opus myśli długo i tak ma być. */
    { id: 'ultra' as SpeedMode, label: 'Ultra', shortLabel: 'Ultra', description: 'Najgłębsze rozumowanie — do trudnych zadań', cost: BASE_BYTE_COST.opus47, group: 'main' as const },
    ...(selectedMode === 'gemini31pro' ? [legacyGemini31Pro] : []),
    { id: 'grok43' as SpeedMode, label: 'Grok 4.3', shortLabel: 'Grok 4.3', description: 'xAI — agentic reasoning, 1M kontekst', cost: 2, group: 'other' as const },
    /* Klucz `gpt54` ZOSTAJE — siedzi w zapisanych rozmowach i ustawieniach
       ludzi. Etykieta mówi prawdę o modelu: tryb kieruje na rodzinę GPT-5.6,
       gdzie poziom rozumowania wybiera wariant (Luna/Terra/Sol). */
    { id: 'gpt54' as SpeedMode, label: 'GPT-5.6', shortLabel: 'GPT-5.6', description: 'OpenAI — Terra (domyślna), Luna albo Sol', cost: 4, group: 'other' as const },
    {
      id: wariantClaude,
      /*
        ── TOŻSAMOŚĆ WIERSZA ≠ TOŻSAMOŚĆ MODELU (10.09.2026) ─────────────────
        Michał: „tu się nie zmienia przy wyborze" — panel boczny pokazywał stare
        szczegóły po przełączeniu wariantu Sonnet ↔ Opus.

        Powód: `id` tego wiersza JEST wariantem (`sonnet46` albo `opus47`), a szło
        jednocześnie jako `key` dla Reacta. Przełączenie wariantu zmieniało klucz,
        więc React NISZCZYŁ wiersz i tworzył nowy — a `ListaPozycja` bierze swoją
        tożsamość z `useId()`, czyli nowa instancja dostawała NOWY identyfikator.
        Kanał podglądu trzymał w `pokazywanyId` ten stary, więc warunek
        „pokazywany jest TEN wiersz" przestawał być prawdziwy i mechanizm
        odświeżania panelu — napisany dokładnie na ten przypadek — milczał.

        Wiersz reprezentuje RODZINĘ, nie wariant, więc jego klucz ma być stały.
        Wariant zmienia `kluczSzczegolow` i to on odświeża panel — tak jak
        opisuje to `lista-wyboru.tsx`.
      */
      kluczWiersza: 'claude5',
      label: 'Claude 5',
      shortLabel: 'Claude',
      description: 'Anthropic — Sonnet (domyślny) albo Opus',
      cost: BASE_BYTE_COST.opus47,
      group: 'other' as const,
    },
  ];

  // --- IMAGE MODE RENDERING ---
  if (isImageMode) {
    /* OBRAZY TYLKO NA PRO (07.09.2026). Michał: „generowanie obrazów daj
       tylko pro po prostu bez wyboru". Lista Szybki/Pro znika — zostaje
       statyczna plakietka z modelem i ceną (ta sama liczba, co na
       przycisku „Wyślij”, z `KOSZT_OBRAZU`). Tryb „Szybki” nadal istnieje
       po stronie edge (stare klienty), ale front go już nie wysyła. */
    return (
      <div
        aria-label={`Model obrazu: Pro, koszt ${KOSZT_OBRAZU[imageModel]} Byte`}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background/40 px-3 text-[14px] text-card-foreground sm:h-9',
          disabled && 'opacity-50',
        )}
      >
        <Crown className="h-4 w-4 shrink-0 text-primary" />
        <span>Pro</span>
        <span className="tabular-nums text-muted-foreground">⟠ {KOSZT_OBRAZU[imageModel]}</span>
      </div>
    );
  }

  // --- STANDARD AI MODE — Glassmorphic popover ---
  const currentMode = modes.find(m => m.id === selectedMode) || modes[0];
  /* Przy GPT-5.6 przełącznik wybiera WARIANT MODELU, więc odznaka ma pokazywać
     jego nazwę, a nie „High"/„Low" — inaczej chip mówi o poziomie myślenia,
     którego ten model nie ma. Terra (domyślna) zostaje bez odznaki, tak samo
     jak „Średni" w pozostałych trybach. */
  const wariantowyWybor = selectedMode === 'gpt54';
  const NAZWY_WARIANTOW: Record<string, string> = { low: 'Luna', medium: 'Terra', high: 'Sol' };
  /* Odznaka mówi już tylko o WARIANCIE (Luna/Sol) — poziom rozumowania zniknął
     z karty 09.09.2026, więc poza GPT nie ma czego pokazywać. Bez tego warunku
     odznaka „High" wisiałaby na modelu, przy którym nikt nie może jej zmienić:
     zapisany w localStorage stan sprzed usunięcia przełącznika. */
  const showReasoningBadge = wariantowyWybor && selectedConfig.reasoning !== 'medium';
  /*
    Odznaka wariantu Claude'a rządzi się tą samą zasadą co Luna/Sol przy GPT:
    DOMYŚLNY wariant nie dostaje odznaki, bo odznaka przy każdym stanie
    przestaje cokolwiek wyróżniać. Sonnet jest domyślny, więc odzywa się
    tylko Opus — inaczej zwinięty przycisk mówiłby „Claude" i nie wiadomo,
    który, a to jest różnica 2,5× w cenie.
  */
  const odznakaOpus = selectedMode === 'opus47';


  /*
    ══════════════════════════════════════════════════════════════════════
     WYBÓR MODELU NA KOMPONENCIE Z BIBLIOTEKI (04.08.2026)
    ══════════════════════════════════════════════════════════════════════

    Michał, po zobaczeniu menu trybu obok menu modeli: „ma wyglądać wybór
    modeli jak w bibliotece komponentów".

    Wcześniej dałem tu tylko KLASY z `lista-wyboru` i to nie wystarczyło —
    i słusznie, bo `ListaPozycja` to nie jest sam styl. Niesie monogram
    dostawcy, sztabkę aktywnego wyboru, opis w drugiej linii, meta po
    prawej i panel szczegółów, który sam mierzy, po której stronie się
    mieści. Klasy dały wspólny kolor, nie wspólną strukturę.

    Cała logika ZOSTAJE: dzienny limit trybu darmowego, blokada „wkrótce",
    status Lokalnego AI i przeniesienie do ustawień, gdy nie jest gotowy.
    Zmieniło się to, CO rysuje wiersz — nie to, kiedy wolno go kliknąć.

    Ręczne pozycjonowanie przez `createPortal` + `getBoundingClientRect`
    znika: Radix ustawia panel sam i sam pilnuje, żeby nie wyszedł poza
    ekran. To było ~60 linii kodu utrzymywanego tylko po to.
  */
  return (
    <ListaWyboru open={isOpen} onOpenChange={setIsOpen}>
      <ListaPrzycisk
        znak={znakModelu(currentMode.id)}
        zwarty
        disabled={disabled}
        poPrawej={
          /* Trzy niezależne znaczniki, nie jeden z trzech. W oryginale
             stały obok siebie i tak zostaje: odznaka rozumowania mówi
             CO robi model, koszt ILE kosztuje wywołanie, licznik ILE
             zostało dziś za darmo. Wcześniej ścisnąłem je w łańcuch
             warunków i licznik zjadał koszt. */
          <>
            {odznakaOpus && (
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                Opus
              </span>
            )}
            {showReasoningBadge && (
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                <span>
                  {wariantowyWybor
                    ? NAZWY_WARIANTOW[selectedConfig.reasoning]
                    : (selectedConfig.reasoning === 'high' ? 'High' : 'Low')}
                </span>
              </span>
            )}
            {/*
              CENA ZNIKA Z WYBORU MODELU — decyzja Michała z 01.09.2026.

              Stała cena per model przestała istnieć: od zniesienia stawki
              bazowej Byte wynikają WYŁĄCZNIE z realnego zużycia konkretnej
              wiadomości (wejście + wyjście + kontekst). Plakietka „⟠ 2" przy
              modelu podawała więc liczbę, która nie ma już żadnego pokrycia —
              ta sama rozmowa Ultra mogła kosztować 2 albo 9 Byte zależnie od
              tego, ile do niej dopięto.

              Jedyne miejsce z ceną to teraz przycisk „Wyślij", bo tylko on zna
              treść, kontekst i załączniki tej konkretnej wiadomości.
            */}
          </>
        }
        className={cn('rounded-full px-3', effectiveMobile && 'h-8 text-[13px]')}
      >
        {currentMode.shortLabel}
      </ListaPrzycisk>

      {/* `odGory`: lista modeli zaczyna od pierwszego dostawcy, nie od miejsca
          zaznaczenia (zgłoszenie Michała — otwierała się „od dołu") */}
      <ListaTresc side={effectiveMobile ? 'bottom' : 'top'} align="start" odGory>
        {modes.map((mode, index) => {
          const isSelected = selectedMode === mode.id;
          /* Limit 10 darmowych zapytań zdjęty 06.08.2026 — „Szybki" jest
             modelem PŁATNYM (1 Byte + kontekst), więc nie ma czego limitować.
             Wcześniej wyczerpany licznik wyszarzał tę pozycję, mimo że po
             drugiej stronie nic nie było pobierane. Szczegóły: useChatAI. */
          const isDisabled = false;
          const prevGroup = index > 0 ? modes[index - 1]?.group : null;
          const noweGrupa = mode.group !== prevGroup;

          const opis = mode.id === 'local' && localStatus !== 'ok'
              ? (localStatus === 'error'
                  ? 'Połączenie nieudane — sprawdź konfigurację'
                  : 'Najpierw przetestuj połączenie')
              : mode.description;

          /* SZCZEGÓŁY MODELU PO NAJECHANIU — Michał: „brakuje menu po najechaniu".
             Moja regresja: przepisując listę na komponent z biblioteki wyrzuciłem
             `ModelHoverCard` i nie podpiąłem tego, co go zastępuje. `ListaPozycja`
             ma `szczegoly` i robi obie rzeczy naraz — na desktopie kartę z boku
             po najechaniu, na telefonie przycisk rozwijający ją w wierszu (czyli
             bez wybierania modelu tylko po to, żeby o nim poczytać).
             Treść jest ta sama co wcześniej: metryki, poziom rozumowania,
             tryb szybki — tylko bez drugiego HoverCarda dookoła. */
          const metaModelu = daneModeli?.[mode.id];

          const pozycja = (
            <ListaPozycja
              /* Klucz wiersza, NIE modelu — patrz komentarz przy `kluczWiersza`. */
              key={'kluczWiersza' in mode ? mode.kluczWiersza : mode.id}
              // Kotwica spotlightu onboardingu: przy otwartej liście dziura
              // przenosi się na TĘ pozycję („każe wybrać szybki" z tablicy).
              {...(mode.id === 'fast' ? { 'data-rezyseria': 'model-szybki' } : {})}
              znak={znakModelu(mode.id)}
              nazwa={mode.label}
              opis={opis}
              /* Wiersz „Claude 5" pokazuje raz Sonneta, raz Opusa — panel
                 boczny musi wiedzieć, że treść się zmieniła. Szczegóły przy
                 `kluczSzczegolow` w bibliotece. */
              kluczSzczegolow={mode.id}
              szczegoly={metaModelu ? (
                <PanelSzczegolowModelu
                  meta={metaModelu}
                  onSelectModel={onModeChange}
                  activeSpeedMode={selectedMode}
                />
              ) : undefined}
              /* Bez ceny — patrz komentarz przy przycisku wyboru modelu. */
              znacznik={
                mode.id === 'local' ? (
                  <span className={cn(
                    'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold',
                    localStatus === 'ok' && 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
                    localStatus === 'untested' && 'border-amber-500/30 bg-amber-500/15 text-amber-400',
                    localStatus === 'error' && 'border-destructive/30 bg-destructive/15 text-destructive',
                  )}>
                    {localStatus === 'ok' ? 'OK' : localStatus === 'untested' ? 'SKONFIGURUJ' : 'BŁĄD'}
                  </span>
                ) : undefined
              }
              wybrana={isSelected}
              disabled={isDisabled}
              onWybor={() => {
                if (isDisabled) return;
                /* Lokalny AI bez działającego połączenia nie jest wyborem,
                   tylko zaproszeniem do konfiguracji — dlatego zamiast go
                   ustawić, przenosimy do ustawień. */
                if (mode.id === 'local' && localStatus !== 'ok') {
                  toast.error(
                    localStatus === 'error'
                      ? 'Połączenie z lokalnym serwerem nieudane — sprawdź konfigurację.'
                      : 'Najpierw przetestuj połączenie i wybierz domyślny model.',
                  );
                  /* `tab=ai`, nie `tab=local-ai`: po scaleniu ośmiu zakładek
                     w pięć Lokalny AI mieszka razem z Asystentem. Stara nazwa
                     dalej działa przez mapowanie w Ustawieniach, ale link ma
                     wskazywać na to, co istnieje, a nie liczyć na przekierowanie. */
                  navigate('/ustawienia?tab=ai');
                  return;
                }
                onModeChange(mode.id);
                setIsOpen(false);
              }}
            />
          );

          /* `ListaGrupa` JEST nagłówkiem (`Menu.Label`), nie pojemnikiem na
             pozycje. Wsadziłem w nią pierwszy wiersz grupy — i wiersz przejął
             styl etykiety: „Grok 4.3" wyszedł wersalikami z rozstrzeloną
             spacją, tak samo „Lokalny", a pozostałe cztery modele wyglądały
             normalnie. Nagłówek stoi więc OBOK pozycji, nie nad nią w drzewie,
             a jego wygląd bierze się z biblioteki — mój własny <span> z
             wersalikami tylko podrabiał to, co komponent już umie. */
          return noweGrupa ? (
            <React.Fragment key={`grupa-${mode.group}`}>
              <ListaGrupa>{mode.group === 'other' ? 'Inne modele' : 'NextByte'}</ListaGrupa>
              {pozycja}
            </React.Fragment>
          ) : pozycja;
        })}
      </ListaTresc>
    </ListaWyboru>
  );
};
