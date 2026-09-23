/**
 * Studio Video — jedno źródło prawdy dla frontu (modele, formaty, ruchy kamery).
 *
 * ⚠️ MUSI być zgodne z edge `supabase/functions/studio-video-generate/index.ts`:
 *   • id modelu = klucz w MODEL_BASE_BYTE (allowlista po stronie serwera),
 *   • koszt bazowy i wzór estimateByteCost() = 1:1 z serwerem,
 *   • ratio/quality/duration = ALLOWED_* na serwerze.
 * Rozjazd = użytkownik widzi inną cenę/parametr niż realnie pobrany/wysłany.
 */

// Kolor przewodni Studio Video = ZIELONY (Studio Zdjęć ma fiolet, Video zielony).
export const ACCENT = 'hsl(152, 76%, 45%)'; // szmaragdowa zieleń — akcent Studia Video
export const ACCENT_PRO = 'hsl(150, 88%, 55%)'; // jaśniejsza zieleń — akcent trybu Pro Editor

/** Surowa trójka HSL akcentu — do budowania wariantów alfa (glass zielony). */
export const ACCENT_HSL = '152, 76%, 45%';

/**
 * TEN SAM ZIELONY, ALE CIEMNIEJSZY — DO TEKSTU NA MOTYWACH JASNYCH.
 *
 * `ACCENT_HSL` ma jasność 45%, co nad ciemnym tłem czyta się świetnie, a nad
 * jasnym już nie. Zmierzone w Studio Video na motywie Jasnym: 17 elementów
 * (cena „7 Byte", tempo „1.25 ⟠/s", nazwy modeli) w przedziale 1.71–1.86 : 1,
 * przy progu AA 4.5. Praktycznie nie do odczytania.
 *
 * Barwa i nasycenie zostają — zielony ma dalej znaczyć Studio Video —
 * zmienia się wyłącznie jasność. 45% → 30% daje na białej tafli 5.4 : 1.
 * Podstawiane przez `[data-theme="nextbyte-light"]` w `index.css`.
 */
export const ACCENT_HSL_JASNY = '152, 76%, 30%';
/** `accentAlpha(0.2)` → 'hsla(152, 76%, 45%, 0.2)'. Zielony glass niezależny od --primary. */
export const accentAlpha = (a: number): string => `hsla(${ACCENT_HSL}, ${a})`;

/**
 * Prywatny bucket na NAGRANIA MOWY i FILMY ŹRÓDŁOWE (zakładki „Ożyw postać"
 * i „Lipsync"). Osobny od `studio-video-frames`, bo tamten trzyma klatki
 * wejściowe, powstał ręcznie w panelu i jego lista dozwolonych typów MIME nie
 * jest nigdzie w repozytorium — wrzucanie tam mp3 byłoby zakładem o cudzą
 * konfigurację. Zakładany migracją `20260901180000_studio_video_fal`.
 */
export const BUCKET_MOWA = 'studio-video-mowa';

/**
 * Modele, którym WOLNO wysłać proporcje kadru.
 *
 * Sprawdzone w maszynowych schematach fal (01.09.2026): pole `aspect_ratio`
 * mają wyłącznie Seedance (1 Pro i 2.5) oraz Veo 3.1. Kling, Hailuo, Pixverse
 * i Wan kadrują po wgranym obrazie — pokazany im suwak „Format" byłby wyborem
 * bez skutku, a człowiek miałby prawo uznać to za usterkę.
 *
 * Lista jest BIAŁĄ listą, nie czarną: model, o którym nic nie wiemy, nie
 * dostaje suwaka. Brak obietnicy jest lepszy od obietnicy niedotrzymanej.
 */
export const MODELE_Z_FORMATEM: string[] = [
  'fal-ai/bytedance/seedance/v1/pro/image-to-video',
  'bytedance/seedance-2.5/image-to-video',
  'fal-ai/veo3.1/image-to-video',
];

export function modelPrzyjmujeFormat(model?: { id: string; provider?: string }, trybReferencji = false): boolean {
  if (!model) return false;
  // Runware przyjmuje proporcje w każdym modelu — tam nic się nie zmienia.
  if (model.provider !== 'fal') return true;
  /* Seedance 2.5: w `image-to-video` schemat fal ma `aspect_ratio` NA STAŁE „auto"
     (kadr z obrazu) — format działa dopiero w wariancie `reference-to-video`.
     Pigułka formatu bez skutku to wybór, który wygląda na usterkę. */
  if (/seedance-2\.5\//i.test(model.id)) return trybReferencji;
  return MODELE_Z_FORMATEM.includes(model.id);
}

/**
 * Formaty, które DANY model naprawdę przyjmie. Veo 3.1 (schemat fal,
 * sprawdzone 02.09.2026) zna wyłącznie 16:9 i 9:16 — pozostałe cztery
 * z globalnej listy kończyły się odmową po pobraniu Byte.
 */
export function dozwoloneFormaty(model?: { id: string; provider?: string }): VideoRatio[] {
  if (model && /veo/i.test(model.id)) return ['16:9', '9:16'];
  return RATIOS.map((r) => r.value as VideoRatio);
}

export type VideoRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
/**
 * 480p doszło 01.09.2026 z modelami fal, które nie mają nic wyżej (MultiTalk)
 * albo u których każdy krok w górę podwaja rachunek (Seedance 2.5: $0,22/s
 * przy 480p, $0,47 przy 720p, $1,16 przy 1080p).
 *
 * Nie pojawi się tam, gdzie go nie ma: `availableQualities` czyta KLUCZE
 * cennika modelu, więc modele bez 480p dalej pokazują tylko swoje jakości.
 */
export type VideoQuality = '480p' | '720p' | '1080p';
/**
 * Długości znane interfejsowi. 5 i 8 doszły 04.08.2026 — bez nich Pixverse
 * (jedyne dozwolone: 5 i 8) nie dało się wybrać NAWET na poziomie typów,
 * więc model figurował na liście, a wygenerować się nie dał.
 */
export type VideoDuration = 3 | 5 | 6 | 8 | 10;

/** Cennik modelu: Byte za 1s materiału, per jakość, osobno bez/z audio.
 *  Klucze = DOSTĘPNE jakości. 1:1 z kolumną `pricing` w tabeli studio_video_models. */
export type VideoQualityPrice = { base: number; audio?: number };
export type VideoModelPricing = Record<string, VideoQualityPrice>;

export interface StudioVideoModel {
  /** id Runware = klucz allowlisty w edge / model_id w tabeli */
  id: string;
  name: string;
  /** krótki opis pod nazwą */
  tagline: string;
  /** LEGACY: koszt bazowy w Byte — tylko dla modeli-stałych (fallback bez cennika). */
  baseByte?: number;
  /** Cennik z tabeli (Byte/1s per jakość). Gdy obecny — ma pierwszeństwo nad baseByte. */
  pricing?: VideoModelPricing;
  /** etykieta jakościowa do UI (w tabeli to zwykły tekst) */
  badge?: string;
  /** czy model wspiera ścieżkę audio */
  supportsAudio: boolean;
  /**
   * Długości, które MODEL faktycznie przyjmuje — źródłem jest kolumna
   * `durations` w `studio_video_models`, więc poprawia się je w Zarządzie,
   * bez deployu.
   *
   * Powód istnienia (04.08.2026): `DURATIONS` była jedną globalną listą
   * [3, 6, 10] dla wszystkich modeli. Michał wybrał 6 s przy Pixverse i dostał
   * od Runware: „The Duration requested for PixVerse V5 Fast must be a float.
   * Supported values are: '5', '8'". Czyli oferowaliśmy w interfejsie wartości,
   * których dostawca nie przyjmuje — generacja nie miała prawa się udać.
   */
  durations?: number[];
  isPremium?: boolean;
  sortOrder?: number;
  /** dostawca (do pickera) */
  provider?: string;
  /*
    Rodzaj modelu — decyduje, w której zakładce Studia model się pojawia
    i jakich pól zażąda interfejs:

      i2v     — obraz → wideo (scena). Potrzebuje zdjęcia i opisu.
      awatar  — osoba ze zdjęcia mówi. Potrzebuje zdjęcia i mowy (nagranie
                albo tekst), a opis mówi o ZACHOWANIU postaci, nie o scenie.
      lipsync — dopasowanie ust w gotowym wideo. NIE przyjmuje zdjęcia.

    Modele scenowe odrzucają zdjęcia z rozpoznawalnymi twarzami — to moderacja
    twórcy modelu, nie pośrednika. Dlatego rozdział na rodzaje nie jest
    kosmetyką: prowadzi człowieka do modelu, który jego zadanie w ogóle wykona.
  */
  rodzaj?: 'i2v' | 'awatar' | 'lipsync' | 'glos' | 'tts';
  /** ocena 1–10 do pasków w pickerze (jak Chat AI) */
  qualityRating?: number;
  speedRating?: number;
}

/** Lista modeli — kolejność od najtańszego. id + baseByte 1:1 z edge. */
export const MODELS: StudioVideoModel[] = [
  { id: 'pixverse:1@5-fast', name: 'Pixverse Fast', tagline: 'Najszybszy, budżetowy', baseByte: 5, badge: 'Budżet', supportsAudio: false, provider: 'PixVerse', qualityRating: 5, speedRating: 10 },
  { id: 'minimax:1@3', name: 'Minimax', tagline: 'Tanio, dobry ruch', baseByte: 6, badge: 'Budżet', supportsAudio: false, provider: 'MiniMax', qualityRating: 6, speedRating: 8 },
  { id: 'bytedance:seedance@1.5-pro', name: 'Seedance 1.5 Pro', tagline: 'Zbalansowana jakość', baseByte: 15, badge: 'Zbalansowany', supportsAudio: true, provider: 'ByteDance', qualityRating: 8, speedRating: 6 },
  { id: 'bytedance:seedance@2.0', name: 'Seedance 2.0', tagline: 'Najnowszy Seedance', baseByte: 20, badge: 'Najlepszy', supportsAudio: true, provider: 'ByteDance', qualityRating: 10, speedRating: 4 },
  { id: 'klingai:kling-video@3-pro', name: 'Kling Pro', tagline: 'Kinowa jakość, premium', baseByte: 40, badge: 'Premium', supportsAudio: true, provider: 'Kling AI', qualityRating: 9, speedRating: 3 },
];

/** Modele wspierające interpolację first→last frame (Runware `frame: 'last'`). */
export const MODELS_SUPPORTING_LAST_FRAME: string[] = [
  'bytedance:seedance@1.5-pro',
  'bytedance:seedance@2.0',
  'klingai:kling-video@3-pro',
];

export function supportsLastFrame(modelId?: string): boolean {
  if (!modelId) return false;
  return MODELS_SUPPORTING_LAST_FRAME.includes(modelId);
}

export const DEFAULT_MODEL = 'pixverse:1@5-fast';

export const RATIOS: { value: VideoRatio; label: string }[] = [
  { value: '16:9', label: '16:9 — poziomy' },
  { value: '9:16', label: '9:16 — pionowy' },
  { value: '1:1', label: '1:1 — kwadrat' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '21:9', label: '21:9 — kino' },
];

export const QUALITIES: VideoQuality[] = ['480p', '720p', '1080p'];
export const DURATIONS: VideoDuration[] = [3, 5, 6, 8, 10];

/**
 * Długości, które przyjmie KONKRETNY model.
 *
 * `DURATIONS` powyżej to tylko pełen zakres, jaki zna interfejs — a każdy
 * dostawca ma własną listę i odrzuca resztę. Michał wybrał 6 s przy Pixverse
 * i dostał: „The Duration requested for PixVerse V5 Fast must be a float.
 * Supported values are: '5', '8'". Czyli pokazywaliśmy wartości, przy których
 * generacja nie miała prawa się udać.
 *
 * Prawdziwe wartości siedzą w kolumnie `durations` tabeli `studio_video_models`,
 * więc poprawia się je w Zarządzie, bez deployu. Zapas [5, 8] jest najwęższy
 * z możliwych — lepiej pokazać za mało niż zaproponować coś, co spali Byte.
 */
export function availableDurations(m?: StudioVideoModel | null): VideoDuration[] {
  const z = m?.durations?.filter((d): d is VideoDuration => DURATIONS.includes(d as VideoDuration));
  return z && z.length ? z : [5, 8];
}

/**
 * Ile obrazów referencyjnych (`referenceImages`) przyjmuje dany model. 0 = nie obsługuje.
 *
 * Zweryfikowane w dokumentacji Runware (lipiec 2026):
 *   • Seedance 2.0        → do 9, wyklucza się z `frameImages`
 *   • Kling VIDEO 3.0 Pro → dokładnie 1
 *   • Seedance 1.5 Pro    → brak, ma wyłącznie `frameImages` (1–2)
 *   • Pixverse            → brak
 *
 * UWAGA: bliźniacza funkcja stoi w supabase/functions/studio-video-generate/index.ts —
 * Deno nie importuje z src/, więc limit trzeba zmieniać w OBU miejscach.
 */
export function maxReferencesFor(modelId: string): number {
  if (/seedance@2/i.test(modelId)) return 9;
  if (/kling-video@3/i.test(modelId)) return 1;
  /* fal: Seedance 2.5 przez wariant `reference-to-video` (edge przełącza
     końcówkę sam). Do 02.09.2026 nie było tu ani jednego modelu fal, więc
     od przejścia na fal „@" w opisie milczał u KAŻDEGO modelu. */
  if (/seedance-2\.5\//i.test(modelId)) return 9;
  /* fal: Kling v3 → `elements` (@Element1…), do 4 postaci/przedmiotów. To nasza
     droga dla PRAWDZIWYCH ludzi: ByteDance odrzuca fotografie twarzy w Seedance
     (zmierzone 02.09.2026), Kling je przepuszcza. */
  if (/fal-ai\/kling-video\/v3\//i.test(modelId)) return 4;
  return 0;
}

/**
 * Czy referencje wchodzą OBOK klatki startowej (Kling v3: `start_image_url`
 * jest wymagane, elementy są dodatkiem), czy ZAMIAST niej (Seedance: tryby
 * rozłączne u dostawcy). Front pilnuje tego przed wysłaniem, edge po swojej stronie.
 */
export function referencjeZKlatka(modelId?: string): boolean {
  return /fal-ai\/kling-video\/v3\//i.test(modelId || '');
}

/**
 * Ruchy kamery. `value` (EN) trafia do promptu na serwerze (`camera: <value>`),
 * `label` (PL) jest tylko dla UI. „Brak" = bez podpowiedzi ruchu.
 */
export const CAMERA_MOVEMENTS: { value: string; label: string; icon: string; description?: string }[] = [
  { value: 'Brak', label: 'Brak', icon: 'static', description: 'Statyczne ujęcie, bez ruchu kamery.' },
  { value: 'slow zoom in', label: 'Zbliżenie', icon: 'zoom-in', description: 'Płynne zbliżenie optyczne na środek.' },
  { value: 'slow zoom out', label: 'Oddalenie', icon: 'zoom-out', description: 'Płynne oddalenie optyczne.' },
  { value: 'pan left', label: 'Panorama L', icon: 'pan-left', description: 'Panorama kamery w lewo.' },
  { value: 'pan right', label: 'Panorama R', icon: 'pan-right', description: 'Panorama kamery w prawo.' },
  { value: 'tilt up', label: 'Góra', icon: 'tilt-up', description: 'Pochylenie kamery w górę.' },
  { value: 'tilt down', label: 'Dół', icon: 'tilt-down', description: 'Pochylenie kamery w dół.' },
  { value: 'dolly in', label: 'Najazd', icon: 'dolly-in', description: 'Fizyczny najazd w głąb sceny.' },
  { value: 'dolly out', label: 'Odjazd', icon: 'dolly-out', description: 'Fizyczny odjazd od sceny.' },
  { value: 'camera rotation', label: 'Obrót', icon: 'rotate', description: 'Obrót kamery wokół osi.' },
  { value: 'FPV drone shot', label: 'Dron FPV', icon: 'drone', description: 'Dynamiczne ujęcie jak z drona FPV.' },
  { value: 'orbit left', label: 'Orbita L', icon: 'orbit-left', description: 'Krążenie wokół obiektu w lewo.' },
  { value: 'orbit right', label: 'Orbita R', icon: 'orbit-right', description: 'Krążenie wokół obiektu w prawo.' },
  { value: 'camera shake', label: 'Wstrząsy', icon: 'shake', description: 'Trzęsąca się kamera (dynamika).' },
];

/**
 * Wycena Byte. Priorytet: cennik z tabeli (Byte/1s per jakość, base/audio) → gdy brak,
 * stary wzór z baseByte. MUSI być 1:1 z edge (`computeByteCost` / `legacyEstimateByteCost`),
 * inaczej user zobaczy inną cenę niż realnie pobraną.
 */
function legacyByteFromBase(base: number, duration: number, quality: VideoQuality, audio: boolean): number {
  const durMult = duration <= 3 ? 0.6 : duration <= 6 ? 1 : 1.6;
  const qMult = quality === '1080p' ? 1.3 : 1;
  const aMult = audio ? 1.2 : 1;
  return Math.max(1, Math.ceil(base * durMult * qMult * aMult));
}

/** Legacy (po id modelu) — używane m.in. jako fallback szacunku przy braku środków. */
export function estimateByteCost(
  modelId: string,
  duration: number,
  quality: VideoQuality,
  audio: boolean,
): number {
  const base = MODELS.find((m) => m.id === modelId)?.baseByte ?? 25;
  return legacyByteFromBase(base, duration, quality, audio);
}

/** Byte za 1s dla (model, jakość, audio) z cennika. null gdy model nie ma cennika. */
export function videoPricePerSecond(model: StudioVideoModel, quality: string, audio: boolean): number | null {
  const q = model.pricing?.[quality];
  if (q && typeof q.base === 'number') {
    return audio && model.supportsAudio && typeof q.audio === 'number' ? q.audio : q.base;
  }
  return null;
}

/** Koszt filmu w Byte = ceil(Byte/1s × sekundy), min 1. 1:1 z edge `computeByteCost`. */
export function videoByteCost(
  model: StudioVideoModel,
  quality: VideoQuality,
  duration: number,
  audio: boolean,
): number {
  const perSec = videoPricePerSecond(model, quality, audio);
  if (perSec != null) return Math.max(1, Math.ceil(perSec * duration));
  return legacyByteFromBase(model.baseByte ?? 25, duration, quality, audio);
}

/** Dostępne jakości modelu (klucze cennika przecięte z globalną listą). Fallback: wszystkie. */
export function availableQualities(model: StudioVideoModel): VideoQuality[] {
  if (model.pricing) {
    const keys = QUALITIES.filter((q) => q in (model.pricing as VideoModelPricing));
    if (keys.length) return keys;
  }
  return QUALITIES;
}
