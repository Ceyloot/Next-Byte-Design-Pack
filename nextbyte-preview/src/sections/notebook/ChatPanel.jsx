import znakNextbyte from '@/assets/nextbyte-mark.png';
import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Library, ArrowRight, Send, User, Sparkles, Trash2, Loader2, MessageSquare, Plus, BarChart, FileText, HelpCircle, Mic, Square, Paperclip, X, Image as ImageIcon, File as FileIcon, Headphones, Presentation, ClipboardList, Layers, CircleHelp, Table2, BookOpen, Download, Globe, ChevronDown, Phone, Wand2, Zap, Edit3, RefreshCw, ArrowDown, FileUp, Type, Video as Youtube } from 'lucide-react';
import { isSlideDeck, parseSlideDeck, exportToPptx } from './utils/pptxExport';
import MarkdownRenderer from './MarkdownRenderer';
import { ToolContentRenderer } from './ToolRenderers';
import { isTabularKind } from './utils/tableFormat';
import { transcribeAudio } from './utils/geminiApi';
import { useToast } from './Toast';
import { estimateTokens, fmtTokens } from './utils/usageTracker';
import { GlassSpinner, GlassTooltip, GlassBadge, GlassModelSearch, DEFAULT_MODELS } from '@/components/glass';


function decodeHtml(str) {
  if (!str) return str;
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function parseTimeStrToSeconds(timeStr) {
  if (timeStr == null) return undefined;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.some(isNaN)) return undefined;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return undefined;
}

const AI_TOOLS = [
  { id: 'audio', label: 'Podcast audio', icon: Headphones, color: 'text-purple-400',
    prompt: `Na podstawie moich źródeł wygeneruj skrypt rozmowy audio z dwoma osobami (PREZENTER 1 i PREZENTER 2).

ZASADY BRZMIENIA — tekst trafi do syntezatora mowy:
- Wstęp naturalny jak między znajomymi: nie "cześć wszystkim, dzisiaj omówimy" — zamiast tego coś jak "Słuchaj, mam do ciebie pytanie o..." albo "Wiesz co, właśnie mi coś nie daje spokoju..." albo "No dobra, to mi powiedz bo nie rozumiem jednej rzeczy..."
- Mów jak ludzie gadają, nie jak lektor. Potoczna polszczyzna.
- Zdania krótkie, myśli często dokańczane przez drugą osobę
- Naturalne wejścia i reakcje: "o kurczę...", "właśnie!", "serio?", "no tak ale...", "dobra dobra ale poczekaj...", "o, to ciekawe bo ja myślałem że..."
- Reaguj emocjonalnie — zaskoczenie, entuzjazm, wątpliwości, śmiech
- Koniec naturalny — nie podsumowanie jak w szkole, po prostu rozmowa stopniowo się urywa. ZAWSZE kończ pełnymi, sensownymi zdaniami, nigdy nie ucinaj wypowiedzi ani słów w połowie.
- ZERO oznaczeń źródeł, tytułów materiałów, nawiasów z cytatami

JĘZYK I PORÓWNANIA — to jest kluczowe:
- Używaj DOWOLNYCH porównań, metafor i analogii spoza źródła. Fakty muszą być ze źródła, ale słowa i obrazy mogą być z całego świata.
- Jeśli coś jest śliskie — powiedz "jakbyś jechał na desce na lodzie z kółkami od wózka sklepowego". Jeśli coś przyspiesza lawinowo — "jak te filmiki z kotami co się kręcą". Absurd jest OK jeśli pomaga.
- Nie trzymaj się terminologii źródła gdy jest nudna — zamień ją na obrazowy odpowiednik. Słowniki nie uczą, skojarzenia uczą.
- Analogie mogą być z życia codziennego, z popkultury, z żartów, z dzieciństwa — cokolwiek co sprawia że "kliknie".

PREZENTER 1 zna temat głębiej i tłumaczy. PREZENTER 2 jest szczerze ciekawy, czasem się myli i koryguje w trakcie.

Format: "PREZENTER 1: tekst" i "PREZENTER 2: tekst" (każda kwestia od nowej linii)
DŁUGOŚĆ — BEZWZGLĘDNY LIMIT: 15-25 wymian. Każda kwestia MAKSYMALNIE 60 słów. Łączna liczba słów: około 1200. NIE MOŻESZ przekroczyć tych limitów.` },

  { id: 'slides', label: 'Prezentacja', icon: Presentation, color: 'text-amber-400',
    prompt: `Stwórz prezentację slajdową z moich źródeł.

Format KAŻDEGO slajdu:

## Slajd N: Tytuł Slajdu

- Punkt 1 (krótko, max 10 słów)
- Punkt 2
- Punkt 3

*Notatki prelegenta: Tutaj rozwinięcie tego co mówić przy slajdzie — 2-3 zdania.*

Wymagania:
- Slajd 1: Tytułowy (tytuł prezentacji + krótki podtytuł)
- Slajdy 2-9: Treść merytoryczna (max 4 punkty na slajd)
- Slajd ostatni: Podsumowanie — 3 kluczowe wnioski
- Max 10 slajdów
- Każdy punkt musi być krótki i konkretny
- Notatki prelegenta pod KAŻDYM slajdem w kursywie` },

  { id: 'report', label: 'Raport', icon: ClipboardList, color: 'text-cyan-400',
    prompt: `Wygeneruj profesjonalny raport na podstawie moich źródeł.

Struktura raportu:

## Streszczenie

Krótkie podsumowanie (3-4 zdania) — o czym są źródła i jakie wnioski z nich płyną.

## Źródła i metodologia

Lista analizowanych źródeł, ich typy i zakres tematyczny.

## Kluczowe odkrycia

Główne wnioski z analizy, pogrupowane tematycznie. Każdy wniosek poparty cytatem ze źródła.

## Analiza szczegółowa

Głębsza analiza najważniejszych tematów. Porównania między źródłami jeśli to zasadne.

## Rekomendacje

Konkretne wskazówki i zalecenia wynikające z analizy.

Pisz formalnym, ale przystępnym językiem. Unikaj żargonu.` },

  { id: 'flashcards', label: 'Fiszki', icon: Layers, color: 'text-orange-400',
    prompt: `Wygeneruj 10-15 fiszek do nauki na podstawie moich źródeł.

Format KAŻDEJ fiszki (WAŻNE — puste linie MIĘDZY każdą sekcją):

### Fiszka N

PYTANIE: [pytanie testujące zrozumienie, nie zapamiętywanie]

ODPOWIEDŹ: [zwięzła odpowiedź, 1-3 zdania]

Wymagania:
- Pytania muszą testować ZROZUMIENIE koncepcji, nie proste fakty
- Mieszaj typy pytań: "dlaczego?", "jaka jest różnica?", "kiedy stosować?", "co się stanie jeśli?"
- Odpowiedzi muszą być konkretne i pełne
- Fiszki powinny pokrywać najważniejsze tematy ze źródeł
- Rosnąca trudność (łatwe → średnie → trudne)` },

  { id: 'quiz', label: 'Quiz', icon: CircleHelp, color: 'text-pink-400',
    prompt: `Stwórz quiz z 10 pytań testowych na podstawie moich źródeł.

Format KAŻDEGO pytania (WAŻNE — puste linie MIĘDZY sekcjami):

### Pytanie N

[treść pytania]

- A) opcja pierwsza
- B) opcja druga
- C) opcja trzecia
- D) opcja czwarta

Poprawna odpowiedź: [litera]) [pełna treść odpowiedzi]. Wyjaśnienie: [dlaczego ta odpowiedź jest poprawna, 1-2 zdania]

Wymagania:
- Pytania testują zrozumienie materiału, nie zapamiętywanie detali
- Każda opcja musi być wiarygodna (nie oczywiste bzdury)
- Mix trudności: 4 łatwe, 4 średnie, 2 trudne
- Każde pytanie musi mieć dokładnie 4 opcje (A-D) jako listę
- Na końcu quizu dodaj sekcję ## Wyniki z podsumowaniem progów punktowych` },

  { id: 'infographic', label: 'Infografika', icon: BarChart, color: 'text-rose-400',
    prompt: `Stwórz tekstową infografikę podsumowującą moje źródła.

Użyj tego formatu:
- Nagłówki sekcji z odpowiednim emoji jako ikoną (np. ## 🎯 Cel główny)
- Kluczowe liczby i statystyki wyróżnione (jeśli są w źródłach)
- Krótkie, uderzające fakty w formie bullet points (max 8 słów każdy)
- Porównania i kontrasty jeśli źródła je oferują
- Na końcu: cytat podsumowujący lub kluczowy wniosek

Format ma być:
- Zwięzły (max 200 słów)
- Skanowany wzrokiem (nagłówki + krótkie punkty)
- Atrakcyjny wizualnie (emoji jako separatory sekcji)` },

  { id: 'table', label: 'Tabela danych', icon: Table2, color: 'text-teal-400',
    prompt: `Wyodrębnij najważniejsze informacje z moich źródeł i przedstaw je w tabelach Markdown.

Wymagania:
- Dobierz kolumny do treści (np. Temat | Opis | Źródło, Parametr | Wartość | Uwagi, Krok | Działanie | Rezultat)
- Jeśli jest wiele tematów, stwórz osobną tabelę dla każdego z nagłówkiem ## przed tabelą
- Dane muszą być konkretne i precyzyjne
- Max 15 wierszy na tabelę (jeśli więcej, rozbij na kilka)
- Każda tabela musi mieć minimum 3 kolumny
- Jeśli któraś tabela zawiera dane LICZBOWE (statystyki, wartości, procenty, porównania ilościowe), KONIECZNIE dodaj po niej blok wykresu w formacie:
\`\`\`chart
{"type":"bar","title":"Tytuł wykresu","labels":["etykieta1","etykieta2"],"datasets":[{"label":"Seria","data":[wartość1,wartość2]}]}
\`\`\`
Użyj type "bar" dla porównań, "line" dla trendów w czasie, "pie" dla udziałów procentowych (max 6 kategorii).` },

  { id: 'glossary', label: 'Słownik pojęć', icon: BookOpen, color: 'text-indigo-400',
    prompt: `Stwórz słownik pojęć (glossary) na podstawie moich źródeł.

Format słownika:

## [Litera alfabetu, np. A]

- **Termin / Akronim**: Definicja terminu (1-3 zdania). Jeśli dotyczy, podaj też kontekst lub przykład użycia ze źródła.

Wymagania:
- Wyodrębnij tylko kluczowe, trudne pojęcia, definicje naukowe, techniczne terminy, akronimy lub specyficzny żargon występujący w źródłach.
- Posortuj słownik alfabetycznie.
- Pisz zrozumiałym językiem, wyjaśniając skomplikowane koncepty w prosty sposób.` },

  { id: 'chart', label: 'Wykres', icon: BarChart, color: 'text-sky-400',
    prompt: `Przeanalizuj moje źródła i wygeneruj wykresy dla wszystkich danych liczbowych, statystyk, porównań i trendów jakie w nich znajdziesz.

Dla KAŻDEGO zbioru danych zwróć blok w formacie:

\`\`\`chart
{"type":"bar","title":"Tytuł wykresu","labels":["etykieta1","etykieta2","etykieta3"],"datasets":[{"label":"Nazwa serii","data":[wartość1,wartość2,wartość3]}]}
\`\`\`

Zasady:
- type "bar" — porównania między kategoriami
- type "line" — trendy w czasie (oś X to okresy: lata, miesiące, rundy itp.)
- type "pie" — udziały procentowe (max 6 kategorii, wartości muszą sumować się do 100)
- Wiele serii w datasets gdy porównujesz kilka grup (np. dwa produkty, dwa okresy)
- Każdy blok \`\`\`chart musi zawierać WYŁĄCZNIE poprawny JSON — żadnego tekstu poza blokiem
- Przed każdym blokiem napisz jedno zdanie co wykres przedstawia
- Jeśli źródła nie zawierają żadnych danych liczbowych — napisz o tym wprost` },

  { id: 'faq', label: 'FAQ', icon: HelpCircle, color: 'text-emerald-400',
    prompt: `Wygeneruj listę FAQ (Najczęściej zadawane pytania i odpowiedzi) na podstawie moich źródeł.

Struktura FAQ:

## Pytanie N: [treść pytania]

**Odpowiedź:** [wyczerpująca, ale zwięzła odpowiedź na pytanie na podstawie źródeł, 2-4 zdania]

Wymagania:
- Stwórz 8-10 pytań, które najbardziej prawdopodobnie zadałby czytelnik lub które mogą pojawić się na egzaminie.
- Unikaj pytań oczywistych; skup się na kluczowych zagadnieniach, niuansach lub często mylonych pojęciach ze źródeł.
- Każde pytanie oznacz nagłówkiem ##.` },
];

const MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash', name: 'Szybki (Gemini 2.5 Flash)', badge: '10/10' },
  { id: 'gemini-2.5-pro', name: 'Precyzyjny (Gemini 2.5 Pro)', badge: '5/5' },
  { id: 'claude-3.5-sonnet', name: 'Głęboki (Claude 3.5)', badge: 'PRO' },
];

function ChatPanel({ projectName, projectDate, messages, onSendMessage, onClearChat, onOpenAddSource, sources = [], hasSources, presetData, isGeneratingPresets, isAiLoading, onSeekToVideo, apiKeys, prefillInput, onToggleObjectsOpen, isObjectsOpen, onStudioGenerate, onModelSelectChange }) {
  const toast = useToast();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [respondedSearches, setRespondedSearches] = useState({});
  const [autoWebSearch, setAutoWebSearch] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => apiKeys?.model || 'gemini-2.5-pro');
  const [searchNotes, setSearchNotes] = useState(true);
  const [searchTranscripts, setSearchTranscripts] = useState(true);

  const activeModelMeta = useMemo(() => {
    return DEFAULT_MODELS.find(m => m.id === selectedModel) || DEFAULT_MODELS[1] || DEFAULT_MODELS[0];
  }, [selectedModel]);

  const currentModelConfig = useMemo(() => {
    return MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0];
  }, [selectedModel]);


  const estimatedTotalTokens = useMemo(() => {
    let totalChars = 0;
    sources.forEach(src => {
      if (src.type === 'youtube' && Array.isArray(src.transcript)) {
        totalChars += src.transcript.reduce((acc, t) => acc + (t.text?.length || 0), 0);
      } else {
        totalChars += (src.rawText?.length || 0);
      }
    });
    messages.forEach(m => {
      totalChars += (m.content?.length || 0);
    });
    totalChars += (input?.length || 0);
    attachments.forEach(att => {
      totalChars += (att.text?.length || att.size || 0);
    });

    if (totalChars === 0) return 0;
    return Math.round(totalChars / 3.8);
  }, [sources, messages, input, attachments]);

  const handleSearchTrigger = (msgIdx) => {
    setRespondedSearches(prev => ({ ...prev, [messages[msgIdx].id || msgIdx]: 'yes' }));
    let userQuestion = "";
    for (let k = msgIdx - 1; k >= 0; k--) {
      if (messages[k].role === 'user') {
        userQuestion = messages[k].content;
        break;
      }
    }
    if (!userQuestion) return;
    onSendMessage(userQuestion, undefined, undefined, { enableSearch: true });
  };

  const handleDeclineSearch = (msgIdx) => {
    setRespondedSearches(prev => ({ ...prev, [messages[msgIdx].id || msgIdx]: 'no' }));
  };

  const [activePopup, setActivePopup] = useState(null);
  const [popupMeasuredH, setPopupMeasuredH] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const showScrollBottom = !isAtBottom && messages.length > 0;
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [audioLevels, setAudioLevels] = useState(Array(48).fill(0.05));
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const popupRef = useRef(null);
  const chatContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    setAudioLevels(Array(9).fill(0.08));
    const mr = mediaRecorderRef.current;
    if (!mr) return;
    mediaRecorderRef.current = null;
    setIsListening(false);
    try { mr.stop(); } catch (_) {}
  }, []);

  const toggleListening = useCallback(async () => {
    if (isTranscribing) return;

    if (isListening) {
      stopListening();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});

      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        
        if (!apiKeys?.gemini) {
          toast.warning('Dodaj klucz Gemini API w Ustawieniach, żeby korzystać z nagrywania.', { title: 'Brak klucza API' });
          return;
        }
        if (chunks.length === 0) {
          toast.error('Brak nagranych danych audio. Spróbuj ponownie.');
          return;
        }
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        if (blob.size < 500) {
          toast.warning('Nagranie było za krótkie — przytrzymaj przycisk dłużej i mów wyraźniej.', { title: 'Zbyt krótkie nagranie' });
          return;
        }
        
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(apiKeys.gemini, blob, apiKeys.model);
          if (text && text.trim()) {
            setInput(prev => prev ? prev.trim() + ' ' + text.trim() : text.trim());
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        } catch (e) {
          console.warn('Transcription error:', e);
          toast.error(e.message, { title: 'Błąd transkrypcji' });
        } finally {
          setIsTranscribing(false);
        }
      };

      mr.start(100);
      mediaRecorderRef.current = mr;
      setIsListening(true);

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        src.connect(analyser);
        analyserRef.current = analyser;
        const BARS = 48;
        const tick = () => {
          if (!analyserRef.current) return;
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          const step = Math.floor(data.length / BARS);
          const levels = Array.from({ length: BARS }, (_, i) => {
            const slice = data.slice(i * step, (i + 1) * step);
            return slice.reduce((s, v) => s + v, 0) / slice.length / 255;
          });
          setAudioLevels(levels);
          animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
      } catch (_) {}
    } catch (e) {
      console.warn('Microphone error:', e.message);
      toast.error('Zezwól na dostęp do mikrofonu w przeglądarce i spróbuj ponownie.', { title: 'Brak dostępu do mikrofonu' });
    }
  }, [isListening, isTranscribing, stopListening, apiKeys, onSendMessage, toast]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
      const mr = mediaRecorderRef.current;
      if (mr) { mediaRecorderRef.current = null; try { mr.stop(); } catch (_) {} }
    };
  }, []);

  const [pendingHiddenContext, setPendingHiddenContext] = useState(null);

  useEffect(() => {
    if (!prefillInput?.text) return;
    setInput(prefillInput.text);
    if (prefillInput.hiddenContext) setPendingHiddenContext(prefillInput.hiddenContext);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [prefillInput?.ts]);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  }, []);

  useEffect(() => {
    const lastIsUser = messages[messages.length - 1]?.role === 'user';
    if (lastIsUser || isAtBottom) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isAiLoading]);

  // Handle click outside to close citation popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activePopup && popupRef.current && !popupRef.current.contains(e.target)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopup]);

  // Auto web search: when AI can't answer and autoWebSearch is ON, re-send the last user question with search enabled
  useEffect(() => {
    if (!autoWebSearch || isAiLoading) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'model') return;
    if (!lastMsg.content?.includes('Nie znalazłem tych informacji w udostępnionych materiałach')) return;
    const msgKey = lastMsg.id || (messages.length - 1);
    if (respondedSearches[msgKey]) return;
    // find last user message
    let userQuestion = '';
    for (let k = messages.length - 2; k >= 0; k--) {
      if (messages[k].role === 'user') { userQuestion = messages[k].content; break; }
    }
    if (!userQuestion) return;
    setRespondedSearches(prev => ({ ...prev, [msgKey]: 'auto' }));
    onSendMessage(userQuestion, undefined, undefined, { enableSearch: true });
  }, [messages, autoWebSearch, isAiLoading]);

  // Measure real popup height after mount so we can position it precisely above the badge
  useLayoutEffect(() => {
    if (!activePopup) { setPopupMeasuredH(null); return; }
    if (popupRef.current) {
      const h = popupRef.current.getBoundingClientRect().height;
      if (h && h !== popupMeasuredH) setPopupMeasuredH(h);
    }
  }, [activePopup, popupMeasuredH]);

  const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 20 MB per file
  const MAX_ATTACHMENTS = 6;
  // Gemini akceptuje: obrazy, PDF, audio, pliki tekstowe. Bardziej egzotyczne
  // formaty (docx, xlsx) obsługujemy jako dodane źródło, nie inline.
  const ACCEPTED_INLINE_MIME = /^(image\/(png|jpe?g|webp|gif|heic|heif)|application\/pdf|text\/|audio\/)/i;

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const commaIdx = String(dataUrl).indexOf(',');
      resolve(commaIdx >= 0 ? String(dataUrl).slice(commaIdx + 1) : String(dataUrl));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const readFileAsText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(file);
  });

  const addFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []).filter(Boolean);
    if (files.length === 0) return;

    const slotsLeft = MAX_ATTACHMENTS - attachments.length;
    if (slotsLeft <= 0) {
      toast.warning(`Możesz dodać maksymalnie ${MAX_ATTACHMENTS} załączników do jednej wiadomości.`);
      return;
    }

    const accepted = [];
    for (const file of files.slice(0, slotsLeft)) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`„${file.name}" jest za duży (limit 20 MB).`);
        continue;
      }
      const mime = file.type || 'application/octet-stream';
      const isText = mime.startsWith('text/') || /\.(txt|md|csv|json|log)$/i.test(file.name);
      if (!ACCEPTED_INLINE_MIME.test(mime) && !isText) {
        toast.warning(`Format „${file.name}" nie jest obsługiwany inline. Dodaj go jako źródło.`);
        continue;
      }

      try {
        if (mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('audio/')) {
          const [data, previewUrl] = await Promise.all([
            readFileAsBase64(file),
            mime.startsWith('image/')
              ? new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); })
              : Promise.resolve(null),
          ]);
          accepted.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name || 'załącznik',
            mimeType: mime,
            size: file.size,
            data,
            previewUrl,
          });
        } else {
          const text = await readFileAsText(file);
          accepted.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name || 'załącznik.txt',
            mimeType: 'text/plain',
            size: file.size,
            text,
          });
        }
      } catch (err) {
        toast.error(`Nie udało się odczytać „${file.name}": ${err.message || err}`);
      }
    }
    if (accepted.length > 0) setAttachments(prev => [...prev, ...accepted]);
  }, [attachments.length, toast]);

  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a.id !== id));

  const handlePaste = useCallback(async (e) => {
    if (!e.clipboardData) return;
    const files = Array.from(e.clipboardData.files || []);
    if (files.length > 0) {
      e.preventDefault();
      await addFiles(files);
    }
  }, [addFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) await addFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isAiLoading) return;

    const originalText = input.trim() || (attachments.length > 0 ? 'Przeanalizuj załączony materiał.' : '');
    const hidden = pendingHiddenContext || undefined;
    const attsToSend = attachments;
    setPendingHiddenContext(null);
    setAttachments([]);
    stopListening();
    onSendMessage(originalText, hidden, attsToSend);
    setInput('');
    setIsAtBottom(true);
    setTimeout(scrollToBottom, 100);
  };

  const handlePreset = (displayText, hiddenPrompt) => {
    if (isAiLoading) return;
    onSendMessage(displayText, hiddenPrompt);
  };

  const handleCitationClick = (citation, pos) => {
    const isUseless = citation.quote?.includes('Brak dokładnych danych') && !citation.timeStr && !citation.timeSeconds;
    if (isUseless) return;

    if (activePopup?.citation?.quote === citation.quote && activePopup?.num === pos.num) {
      setActivePopup(null);
      return;
    }
    // Trzymamy raw viewport coords i używamy position:fixed — unikamy clippingu przez overflow:hidden rodziców
    setActivePopup({ citation, num: pos.num, x: pos.x, y: pos.y });
  };

  const isEmpty = messages.length === 0;

  return (
    <div ref={chatContainerRef} className={`flex flex-col h-full relative overflow-hidden ${isEmpty ? 'justify-center' : ''}`}>
      {/* Citation Popup — constrained within chat panel */}
      {activePopup && (() => {
        const matchedSource = sources.find(s => s.id === activePopup.citation.sourceId || s.videoId === activePopup.citation.sourceId)
          || (activePopup.citation.sourceTitle
            ? sources.find(s => s.title.toLowerCase().includes(activePopup.citation.sourceTitle.toLowerCase())
                || activePopup.citation.sourceTitle.toLowerCase().includes(s.title.toLowerCase().slice(0, 10)))
            : null);
        const isYoutube = matchedSource?.type === 'youtube';

        const getFullTableRow = () => {
          if (!matchedSource) return null;
          if (!isTabularKind(matchedSource.fileKind)) return null;

          const timeStr = activePopup.citation.timeStr || '';
          const quote = activePopup.citation.quote || '';
          const rowMatch = timeStr.match(/[Ww]iersz\s+(\d+)/) || quote.match(/[Ww]iersz\s+(\d+)/);
          if (!rowMatch) return null;

          const rowNum = rowMatch[1];
          const linePrefix = `Wiersz ${rowNum}:`;
          const lines = (matchedSource.rawText || '').split('\n');
          return lines.find(line => line.trim().startsWith(linePrefix)) || null;
        };

        const renderCitationQuote = (quote) => {
          if (!quote || !quote.trim() || quote === '?' || quote.toLowerCase().includes('nie przekazało')) return null;
          const fullRowText = getFullTableRow() || quote;
          const isTableRow = fullRowText.includes('|') && /^[Ww]iersz\s+\d+:/.test(fullRowText);
          
          if (isTableRow) {
            const rowHeaderMatch = fullRowText.match(/^([Ww]iersz\s+\d+):\s*(.*)/);
            if (rowHeaderMatch) {
              const rowName = rowHeaderMatch[1];
              const fieldsStr = rowHeaderMatch[2];
              const fields = fieldsStr.split('|').map(f => {
                const colonIdx = f.indexOf(':');
                if (colonIdx !== -1) {
                  return {
                    label: f.slice(0, colonIdx).trim(),
                    value: f.slice(colonIdx + 1).trim()
                  };
                }
                return { label: '', value: f.trim() };
              }).filter(f => f.label || f.value);

              return (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block">
                    {rowName}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs border border-foreground/5 rounded-lg bg-background/30 p-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {fields.map((f, idx) => (
                      <React.Fragment key={idx}>
                        <div className="font-medium text-muted-foreground break-words pr-1">{f.label || `Pole ${idx + 1}`}</div>
                        <div className="text-foreground font-semibold break-all">{f.value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            }
          }

          return (
            <div className="relative">
              <span className="text-primary/20 text-3xl font-serif absolute -top-2 -left-1">"</span>
              <p className="text-sm text-foreground/90 italic relative z-10 pl-3 leading-relaxed">
                {quote}
              </p>
            </div>
          );
        };

        const popupW = Math.min(320, window.innerWidth - 32);
        const popupH = popupMeasuredH ?? 0;
        const popupLeft = Math.max(8, Math.min(activePopup.x - popupW / 2, window.innerWidth - popupW - 8));
        const badgeTop = activePopup.top ?? activePopup.y;
        const badgeBottom = activePopup.bottom ?? activePopup.y;
        const scrollBottom = scrollContainerRef.current?.getBoundingClientRect().bottom ?? window.innerHeight;
        const scrollTop = scrollContainerRef.current?.getBoundingClientRect().top ?? 0;
        const spaceBelow = scrollBottom - badgeBottom - 8;
        const placeAbove = popupH > spaceBelow;
        const rawTop = placeAbove ? badgeTop - popupH - 8 : badgeBottom + 8;
        const clampMin = Math.max(8, scrollTop + 8);
        const clampMax = scrollBottom - popupH - 8;
        const popupTop = popupMeasuredH == null
          ? -9999
          : Math.max(clampMin, Math.min(rawTop, clampMax));

        return ReactDOM.createPortal(
          <div
            ref={popupRef}
            style={{
               position: 'fixed',
               left: popupLeft,
               top: popupTop,
               width: popupW,
               zIndex: 9999
            }}
            className={`bg-card border border-primary/20 shadow-xl shadow-black/40 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2`}
          >
            <div className="px-4 py-3 border-b border-foreground/5 bg-background/50 flex justify-between items-start gap-2">
               <div className="flex-1">
                 <span className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1 block">Źródło [{activePopup.num}]</span>
                 <h4 className="text-sm font-semibold text-foreground leading-snug break-words">{decodeHtml(matchedSource?.title || activePopup.citation.sourceTitle)}</h4>
                 {(() => {
                   const ts = activePopup.citation.timeStr;
                   if (!ts || ts === '?') return null;
                   const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ts);
                   if (isUuid) return null;
                   const isTime = /^\d{1,2}:\d{2}(:\d{2})?$/.test(ts);
                   const isRow = /^[Ww]iersz\s+\d+/.test(ts);
                   const label = isTime ? 'Czas' : isRow ? 'Lokalizacja' : 'Fragment';
                   return (
                     <span className="text-xs text-muted-foreground mt-0.5 inline-block">{label}: {ts}</span>
                   );
                 })()}
               </div>
               <button onClick={() => setActivePopup(null)} aria-label="Zamknij podgląd cytatu" className="text-muted-foreground hover:text-foreground">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>
            {(() => {
               const quoteEl = renderCitationQuote(activePopup.citation.quote);
               const effectiveSecs = parseTimeStrToSeconds(activePopup.citation.timeStr)
                 ?? (activePopup.citation.timeSeconds !== undefined ? Number(activePopup.citation.timeSeconds) : undefined);
               const seekId = matchedSource?.videoId || activePopup.citation.sourceId;
               const showPlay = isYoutube && seekId && effectiveSecs !== undefined;
               const webUrl = matchedSource?.fileKind === 'web' ? matchedSource.url : null;
               if (!quoteEl && !showPlay && !webUrl) return null;
               return (
                 <div className="p-4 bg-card/50">
                   {quoteEl}
                   {showPlay && (
                     <button
                       onClick={() => { if (onSeekToVideo) onSeekToVideo(seekId, effectiveSecs); setActivePopup(null); }}
                       className={`${quoteEl ? 'mt-4' : ''} w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-colors text-xs font-semibold`}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                       Odtwórz od tego momentu
                     </button>
                   )}
                   {webUrl && (
                     <a
                       href={webUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className={`${quoteEl ? 'mt-4' : ''} w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-colors text-xs font-semibold`}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                       Otwórz źródło
                     </a>
                   )}
                   <button
                     onClick={() => {
                       const q = activePopup.citation.quote;
                       setInput(q ? `Wyjaśnij dokładniej ten fragment: "${q}"` : 'Wyjaśnij dokładniej ten fragment.');
                       setActivePopup(null);
                       setTimeout(() => inputRef.current?.focus(), 50);
                     }}
                     className={`${(quoteEl || showPlay || webUrl) ? 'mt-2' : ''} w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-foreground/10 hover:border-primary/40 hover:bg-primary/5 text-foreground/80 hover:text-primary transition-colors text-xs font-semibold`}
                   >
                     <MessageSquare size={12} />
                     Zapytaj dokładnie o to
                   </button>
                 </div>
               );
             })()}
          </div>,
          document.body
        );
      })()}

      {/* Messages or empty state — mask-image rozmywa dolną krawędź, żeby ostatnia
          wiadomość nie ucinała się ostro o pływający composer poniżej. */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        /* Pusty czat: obszar nie rośnie, więc powitanie i pole wpisywania
           stają razem pośrodku — układ Chat AI. Z wiadomościami wraca lista
           na całą wysokość i pole przy dolnej krawędzi. */
        className={isEmpty ? 'relative max-h-[60%] flex-none overflow-y-auto custom-scrollbar' : 'flex-1 overflow-y-auto custom-scrollbar relative pt-2'}
        style={isEmpty ? undefined : {
          WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 56px), transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black calc(100% - 56px), transparent 100%)',
        }}
      >
        {isEmpty ? (
          <div className="mx-auto w-full max-w-4xl px-6 pb-6 pt-2">
            {/* NAGŁÓWEK JAK W GEMINI NOTEBOOK — ikona notatnika, duży lekki
                tytuł, obok pigułka ze źródłami. Kolumna wyrównana do lewej,
                wyśrodkowana na stronie; materiał i akcent z NextByte. */}
            <span className="nbb">
              <span className="nb-nav-ikona-akt inline-flex h-9 w-9 items-center justify-center rounded-xl text-primary">
                <Library size={17} strokeWidth={1.75} />
              </span>
            </span>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <h1 className="min-w-0 max-w-full text-[40px] font-normal leading-[1.15] tracking-tight text-foreground">
                {projectName || 'Notatnik'}
              </h1>
              <button
                type="button"
                onClick={onOpenAddSource}
                title={hasSources ? 'Dodaj kolejne źródło' : 'Dodaj pierwsze źródło'}
                className="nbb nb-ikona-kafel group inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 transition-all duration-300 hover:!border-primary/40"
              >
                <span className="flex -space-x-1.5">
                  {(sources.length ? sources.slice(0, 3) : [0]).map((_, k) => (
                    <span key={k} className="flex h-5 w-4 items-center justify-center rounded-[4px] border border-primary/40 bg-primary/25 text-primary">
                      <FileText size={10} />
                    </span>
                  ))}
                </span>
                <span className="text-[14px] font-medium text-foreground">Źródła: {sources.length}</span>
              </button>
            </div>
            {!hasSources ? (
              /* Jedno zadanie pustego notatnika: przyjąć pierwszy materiał.
                 Wiersz w materiale paska zamiast wielkiego plusa na środku. */
              <div className="nbb mt-6 max-w-md">
                <button
                  type="button"
                  onClick={onOpenAddSource}
                  className="nb-ikona-kafel group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-300 hover:!border-primary/40"
                >
                  <span className="nb-nav-ikona-akt flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary transition-transform duration-200 group-hover:scale-105">
                    <Plus size={18} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-foreground">Dodaj pierwsze źródło</span>
                    <span className="block text-[12.5px] text-foreground/55">PDF, link, film z YouTube albo wklejony tekst</span>
                  </span>
                  <span className="text-[12px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Dodaj →</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-5 animate-in fade-in duration-500">
                <div className="space-y-4">
                  {isGeneratingPresets ? (
                    <div className="mt-3 flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span className="text-[15px] font-medium text-foreground/80">
                        Czytam źródła…
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="mt-3 line-clamp-3 max-w-3xl text-[15px] leading-relaxed text-foreground/60">
                        {presetData?.summary || 'Wybierz jedno z pytań poniżej lub zadaj własne.'}
                      </p>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="pt-14 pb-24 px-4 space-y-6 w-full max-w-5xl mx-auto">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group/message items-start`}>
                  {/* Awatar jak w Chat AI: znak NEXTBYTE przy AI, kółko profilu przy użytkowniku. */}
                  {isUser ? (
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                      <User size={14} />
                    </div>
                  ) : (
                    <img src={znakNextbyte} alt="" aria-hidden className="nb-znak-marki mt-2 h-7 w-7 flex-shrink-0 object-contain" />
                  )}
                  <div className={`flex flex-col gap-1 ${isUser ? 'items-end max-w-[78%]' : 'items-start max-w-[88%]'}`}>
                    {isUser && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                      <div className={`flex flex-wrap gap-1.5 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {msg.attachments.map(att => {
                          const isImage = att.mimeType?.startsWith('image/');
                          return (
                            <div key={att.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px]">
                              {isImage && att.previewUrl
                                ? <img src={att.previewUrl} alt={att.name} className="w-6 h-6 rounded object-cover cursor-zoom-in hover:opacity-80 transition-opacity" onClick={() => setLightboxSrc(att.previewUrl)} />
                                : att.mimeType === 'application/pdf'
                                  ? <FileText size={12} className="text-primary" />
                                  : att.mimeType?.startsWith('audio/')
                                    ? <Mic size={12} className="text-primary" />
                                    : <FileIcon size={12} className="text-primary" />}
                              <span className="max-w-[140px] truncate text-foreground/85" title={att.name}>{att.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {(() => {
                      const prevMsg = !isUser && i > 0 ? messages[i - 1] : null;
                      const toolMatch = prevMsg?.hiddenPrompt && AI_TOOLS.find(t => prevMsg.content === t.label || prevMsg.content.startsWith(t.label + ':'));

                      const mdFallback = (
                        <div className="w-full">
                          <MarkdownRenderer
                            content={msg.content}
                            citations={msg.citations || []}
                            onCitationClick={handleCitationClick}
                            sources={sources}
                            pexelsKey={apiKeys?.pexels}
                          />
                        </div>
                      );

                      const bubbleClass = isUser
                        /* Dymki 1:1 z Chat AI: ciemne szkło, zaokrąglenie 16 px ze wszystkich
                           stron, tekst 15 px. Użytkownik ma rant akcentu z miękką poświatą,
                           AI — neutralny rant. Bez pełnego tła w kolorze akcentu. */
                        ? 'px-5 py-3.5 text-[15px] leading-relaxed rounded-2xl overflow-hidden bg-card/60 border border-primary/25 text-foreground backdrop-blur-md shadow-[0_0_28px_-10px_hsl(var(--primary)/0.45)]'
                        : 'px-5 py-4 text-[15px] leading-relaxed rounded-2xl overflow-hidden bg-card/40 border border-foreground/[0.10] text-foreground backdrop-blur-md';

                      const isNotFound = !isUser && msg.content?.includes('Nie znalazłem tych informacji w udostępnionych materiałach');
                      const showSearchPrompt = isNotFound && !respondedSearches[msg.id || i] && !autoWebSearch;

                      return (
                        <div className={bubbleClass}>
                          {isUser ? (() => {
                            const matchedTool = msg.hiddenPrompt && AI_TOOLS.find(t => msg.content === t.label || msg.content.startsWith(t.label + ':'));
                            if (matchedTool) {
                              const ToolIcon = matchedTool.icon;
                              const topicPart = msg.content.startsWith(matchedTool.label + ':')
                                ? msg.content.slice(matchedTool.label.length + 1).trim()
                                : null;
                              return (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center flex-shrink-0">
                                    <ToolIcon size={14} className={matchedTool.color} />
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block leading-none mb-0.5">Narzędzie AI</span>
                                    <span className="font-medium">{matchedTool.label}</span>
                                    {topicPart && <span className="text-foreground/50 font-normal"> · {topicPart}</span>}
                                  </div>
                                </div>
                              );
                            }
                            const m = msg.content.match(/^\[Temat:\s*(.+?)\]\s*/);
                            const topic = m?.[1];
                            const text = m ? msg.content.slice(m[0].length) : msg.content;
                            return (
                              <>
                                {topic && (
                                  <div className="text-[10px] text-primary/70 font-semibold mb-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 inline-block" />
                                    {topic}
                                  </div>
                                )}
                                {text && <span>{text}</span>}
                              </>
                            );
                          })() : toolMatch ? (
                            <ToolContentRenderer
                              toolId={toolMatch.id}
                              content={msg.content}
                              fallback={mdFallback}
                              extras={{ elevenlabsKey: apiKeys?.elevenlabs, ...(prevMsg?.toolMeta || {}) }}
                            />
                          ) : mdFallback}

                          {showSearchPrompt && (
                            <div className="mt-3 pt-2.5 border-t border-foreground/5 flex flex-col gap-2 select-none">
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span>Czy chcesz, abym przeszukał internet?</span>
                                <div className="group relative">
                                  <span className="cursor-help w-3.5 h-3.5 rounded-full bg-foreground/10 flex items-center justify-center text-[9px] font-bold">i</span>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 rounded bg-card border border-foreground/10 text-[10px] leading-relaxed text-foreground opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                                    Wyniki wyszukiwania w internecie mogą nie być zgodne z treścią wgranych plików źródłowych.
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSearchTrigger(i)}
                                  className="px-2.5 py-1 rounded bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 text-[10px] font-semibold transition-all"
                                >
                                  Tak, przeszukaj internet
                                </button>
                                <button
                                  onClick={() => handleDeclineSearch(i)}
                                  className="px-2.5 py-1 rounded bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground text-[10px] font-semibold transition-all"
                                >
                                  Nie, dziękuję
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className={`flex flex-wrap items-center gap-2 mt-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          toast.success('Skopiowano treść wiadomości do schowka.');
                        }}
                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group px-2 py-0.5 rounded hover:bg-foreground/5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-primary transition-colors"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        {isUser ? 'Kopiuj' : 'Kopiuj'}
                      </button>
                      {!isUser && (
                        <>
                          <button
                            onClick={() => onStartEditMessage && onStartEditMessage(i)}
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group px-2 py-0.5 rounded hover:bg-foreground/5"
                          >
                            <Edit3 size={11} className="group-hover:text-primary transition-colors" /> Edytuj
                          </button>
                          <button
                            onClick={() => onRegenerateMessage && onRegenerateMessage(i)}
                            className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors group px-2 py-0.5 rounded hover:bg-foreground/5"
                          >
                            <RefreshCw size={11} className="group-hover:text-primary transition-colors" /> Odśwież
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI loading bubble */}
            {isAiLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary border border-primary/30">
                  <Sparkles size={13} />
                </div>
                <div className="px-4 py-3 bg-card/40 border border-foreground/[0.10] rounded-2xl flex items-center gap-2 backdrop-blur-md">
                  <GlassSpinner size="sm" label="Myślę..." />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <div className="absolute bottom-28 right-8 z-40">
          <GlassTooltip content="Przewiń do dołu">
            <button
              onClick={scrollToBottom}
              className="p-2.5 rounded-full bg-card/90 border border-foreground/15 hover:bg-card hover:border-primary/40 text-foreground shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ArrowDown size={15} className="text-primary" />
            </button>
          </GlassTooltip>
        </div>
      )}

      {/* Input Area — NextByte Floating Prompt Widget (Screenshots 1 & 2) */}
      <div
        className="chat-input-bar flex-shrink-0 relative px-4 md:px-6 pb-6 flex justify-center bg-transparent border-none pointer-events-none z-30"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-20 pointer-events-none border-2 border-dashed border-primary/60 bg-primary/10 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl">
            <Paperclip size={24} className="text-primary mb-1 animate-bounce" />
            <p className="text-primary font-bold tracking-wider text-xs">Upuść pliki, żeby dodać do wiadomości</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*,audio/*,.csv,.json,.md,.log"
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />

        <div className="w-full max-w-4xl mx-auto flex flex-col pointer-events-auto">
          {/* Floating Nexbyte Prompt Widget Box */}
          <div className="nexbyte-chat-widget relative p-4 bg-card/75 border border-foreground/[0.13] rounded-2xl shadow-[0_4px_24px_-4px_hsl(var(--foreground)/0.08)] backdrop-blur-xl transition-all flex flex-col gap-3">

            {/* TOP BAR: Model Selector Dropdown & Filter Chips (Screenshots 1 & 2) */}
            <div className="flex items-center justify-between pb-2 border-b border-foreground/[0.08] select-none">
              <div className="flex items-center gap-2 relative">
                <GlassTooltip content="Zmień model AI">
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(v => !v)}
                    className="px-3 py-1 rounded-full bg-foreground/[0.06] hover:bg-foreground/[0.1] border border-foreground/[0.12] text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer shadow-sm transition-all select-none"
                  >
                    <Sparkles size={13} className="text-primary" />
                    <span>{activeModelMeta.name}</span>
                    {activeModelMeta.cost !== undefined && activeModelMeta.cost > 0 && (
                      <span className="text-[10px] text-primary font-mono font-bold">⚡ {activeModelMeta.cost}</span>
                    )}
                    <ChevronDown size={12} className={`text-foreground/50 ml-0.5 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </GlassTooltip>

                {modelDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-3 z-50 w-[92vw] md:w-[820px] max-w-4xl">
                    <GlassModelSearch
                      selectedId={selectedModel}
                      onSelectModel={(item) => {
                        setSelectedModel(item.id);
                        onModelSelectChange?.(item.id);
                        setModelDropdownOpen(false);
                      }}
                      isOpen={modelDropdownOpen}
                      onClose={() => setModelDropdownOpen(false)}
                    />
                  </div>
                )}

              </div>


              {/* Right Filter Chips */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-foreground/[0.04] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.08] border border-foreground/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={13} /> Dokumenty
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-foreground/[0.04] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.08] border border-foreground/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon size={13} /> Obrazy
                </button>
                <button
                  type="button"
                  onClick={() => setAutoWebSearch(v => !v)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    autoWebSearch
                      ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                      : 'bg-foreground/[0.04] text-foreground/70 border-foreground/10 hover:text-foreground'
                  }`}
                >
                  <Globe size={12} className={autoWebSearch ? 'text-primary' : ''} />
                  <span>WEB</span>
                </button>
              </div>
            </div>

            {/* Attachment preview pills */}
            {attachments.length > 0 && (
              <div className="pb-2 flex flex-wrap gap-2 border-b border-foreground/[0.06]">
                {attachments.map(att => {
                  const isImage = att.mimeType?.startsWith('image/');
                  return (
                    <div
                      key={att.id}
                      className="group flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-xl bg-card border border-primary/20 text-xs max-w-[220px]"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-background/40 flex items-center justify-center flex-shrink-0">
                        {isImage && att.previewUrl
                          ? <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                          : att.mimeType === 'application/pdf'
                            ? <FileText size={14} className="text-primary" />
                            : att.mimeType?.startsWith('audio/')
                              ? <Mic size={14} className="text-primary" />
                              : <FileIcon size={14} className="text-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground/90" title={att.name}>{att.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {att.size > 1024 * 1024 ? `${(att.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(att.size / 1024))} KB`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MIDDLE ROW: Textarea Input Field */}
            <form onSubmit={handleSubmit}>
              <div className="py-1 min-h-[44px] flex items-center">
                {isListening ? (
                  <div className="w-full flex items-center gap-1 h-10 px-3 rounded-xl bg-card/60 border border-primary/25">
                    {audioLevels.map((level, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full transition-[height] duration-75"
                        style={{
                          height: `${Math.max(3, Math.round(level * 28))}px`,
                          background: `hsl(var(--primary) / ${0.3 + level * 0.7})`,
                        }}
                      />
                    ))}
                  </div>
                ) : isTranscribing ? (
                  <div className="w-full flex items-center h-10 px-3 rounded-xl bg-card/60 border border-primary/20">
                    <GlassSpinner size="sm" label="Transkrybuję mowę..." />
                  </div>
                ) : (
                  <textarea
                    ref={inputRef}
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none px-1 text-sm md:text-base text-foreground placeholder:text-muted-foreground/50 font-sans min-h-[40px] max-h-36 py-1"
                    placeholder={
                      autoWebSearch
                        ? 'Szukaj w internecie...'
                        : 'Zadaj pytanie lub wpisz treść...'
                    }
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    onPaste={handlePaste}
                    disabled={isAiLoading}
                  />
                )}
              </div>

              {/* BOTTOM ROW: Action Icon Toolbar & Token Count + Send Button */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-foreground/[0.08]">
                {/* Left Action Icons (Screenshots 1 & 2): Paperclip, Mic, Call, Tools */}
                <div className="flex items-center gap-1.5">
                  <GlassTooltip content="Dodaj plik lub obraz">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAiLoading || attachments.length >= MAX_ATTACHMENTS}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Paperclip size={16} />
                    </button>
                  </GlassTooltip>

                  <GlassTooltip content={isListening ? 'Zatrzymaj nagrywanie' : 'Dyktuj głosowo'}>
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={isAiLoading || isTranscribing}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isListening ? 'text-destructive bg-destructive/15' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                      }`}
                    >
                      {isListening ? <Square size={13} fill="currentColor" /> : <Mic size={16} />}
                    </button>
                  </GlassTooltip>

                  {/* Menu "Narzędzia AI Studio" usunięte z composera — generowanie
                      dokumentów żyje wyłącznie w panelu Dokumenty (StudioPanel) po
                      prawej, który jest teraz stale otwarty. Dublowanie tej samej
                      listy w dwóch miejscach tylko myliło. */}
                </div>

                {/* Right Action Group (Screenshots 1 & 2): Tokens Badge & Send Button */}
                <div className="flex items-center gap-2">
                  <GlassTooltip content="Liczba tokenów w kontekście">
                    <GlassBadge intent="neutral" className="font-mono text-primary border-foreground/10 bg-foreground/[0.06] gap-1">
                      <Zap className="h-3 w-3" />
                      {fmtTokens(estimatedTotalTokens)} TOK
                    </GlassBadge>
                  </GlassTooltip>

                  <button
                    type="submit"
                    disabled={isListening || isTranscribing || (!input.trim() && attachments.length === 0) || (!hasSources && attachments.length === 0) || isAiLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-bold text-xs transition-all shadow-[0_0_16px_hsl(var(--primary)/0.25)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isAiLoading ? (
                      <Loader2 size={14} className="animate-spin text-primary" />
                    ) : (
                      <>
                        <Send size={13} className="text-primary" />
                        <span>Wyślij</span>
                        <span className="text-[10px] opacity-75 font-mono">· 2⚡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SUGEROWANE PYTANIA pod polem — miejsce „Wcześniejszych czatów" z Gemini.
              Wiersze listy zamiast pigułek: pełne zdanie czyta się szybciej. */}
          {isEmpty && hasSources && !isGeneratingPresets && presetData?.questions?.length > 0 && (
            <div className="nbb mt-6 px-2">
              <p className="mb-1 px-3 text-[13px] font-medium text-foreground/45">Sugerowane pytania</p>
              <ul>
                {presetData.questions.slice(0, 4).map((q, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handlePreset(q)}
                      className="nb-nav-pozycja group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
                    >
                      <Sparkles size={14} className="shrink-0 text-primary/60 group-hover:text-primary" />
                      <span className="flex-1 text-[14.5px] text-foreground/85 group-hover:text-foreground">{q}</span>
                      <ArrowRight size={14} className="shrink-0 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer AI Disclaimer */}
          <p className={`mx-auto mt-2 w-fit ${isEmpty ? 'hidden' : ''} select-none rounded-full border border-foreground/[0.08] bg-card/40 px-3 py-1 text-center text-[11px] text-foreground/55 backdrop-blur-md`}>
            Next Scribe odpowiada na podstawie Twoich źródeł — sprawdzaj ważne informacje. <a href="#" className="underline underline-offset-2 hover:text-foreground">Polityka prywatności</a>
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Podgląd"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain border border-foreground/[0.12]"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-card/80 border border-foreground/15 text-foreground hover:bg-card transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatPanel;
