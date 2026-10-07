/**
 * Intencje edycji (UI + rozpoznanie ze zdania) i tabela stylów artystycznych.
 *
 * Reguły dla poszczególnych operacji NIE są już tutaj — żyją w `prompty/`
 * (bricki + operacje, kopia z `canvas/prompts`). Mapowanie intencji na operację:
 * `operacjaZIntencji` w `polecenia.ts`.
 *
 * Treść dla modelu jest PO ANGIELSKU — to język, na którym trenowano
 * enkodery tekstu modeli edycyjnych (Nano Banana, Flux Kontext, Qwen-Image-Edit).
 * Nazwy i opisy w UI zostają po polsku.
 */

export type Intencja =
  | 'wstaw'
  | 'przenies'
  | 'zamien'
  | 'postac'
  | 'ubranie'
  | 'usun'
  | 'tekstura'
  | 'pora_roku'
  | 'pora_dnia'
  | 'efekt'
  | 'tlo'
  | 'styl'
  | 'perspektywa'
  | 'popraw'

export const INTENCJE: { id: Intencja; nazwa: string; opis: string }[] = [
  { id: 'wstaw', nazwa: 'Dodaj', opis: 'Wstaw nowy obiekt w scenę' },
  { id: 'przenies', nazwa: 'Przenieś', opis: 'Ten sam obiekt w innym miejscu' },
  { id: 'zamien', nazwa: 'Zamień', opis: 'Podmień jedną rzecz na drugą' },
  { id: 'postac', nazwa: 'Postać', opis: 'Twarz i tożsamość z drugiego zdjęcia' },
  { id: 'ubranie', nazwa: 'Ubranie', opis: 'Zmień strój lub kreację postaci' },
  { id: 'usun', nazwa: 'Usuń', opis: 'Skasuj obiekt i odtwórz tło' },
  { id: 'tekstura', nazwa: 'Tekstura', opis: 'Zmień materiał lub fakturę powierzchni' },
  { id: 'pora_roku', nazwa: 'Pora roku', opis: 'Zmień porę roku (wiosna, lato, jesień, zima)' },
  { id: 'pora_dnia', nazwa: 'Pora dnia', opis: 'Zmień porę dnia (świt, dzień, zachód, noc)' },
  { id: 'efekt', nazwa: 'Efekt', opis: 'Dodaj cień, odbicie, poświatę lub cząsteczki' },
  { id: 'tlo', nazwa: 'Tło', opis: 'Nowe otoczenie, te same postacie' },
  { id: 'styl', nazwa: 'Styl', opis: 'Styl artystyczny — kompozycja zostaje' },
  { id: 'perspektywa', nazwa: 'Perspektywa', opis: 'To samo miejsce z innego punktu widzenia' },
  { id: 'popraw', nazwa: 'Popraw', opis: 'Inna zmiana w kadrze' },
]

export interface StylDefinicja {
  klucz: string
  nazwa: string
  slowaKluczowe: RegExp
  reguly: string[]
}

export const TABELA_STYLOW: StylDefinicja[] = [
  {
    klucz: 'cartoon',
    nazwa: 'Kreskówka / Komiks',
    slowaKluczowe: /\b(kresk[oó]wk|cartoon|komiks|illustration|ilustracj)\b/i,
    reguly: [
      'Clean, bold line art outlines defining all primary forms and silhouettes.',
      'Flat, vibrant color fields with simplified cel-shading (2–3 tone steps per object maximum).',
      'Simplified textures and stylized highlights, avoiding photographic gradients.',
      'Expressive visual charm while preserving exact character identity and spatial layout.',
    ],
  },
  {
    klucz: 'oil_painting',
    nazwa: 'Malarstwo olejne',
    slowaKluczowe: /\b(olejn|oil painting|malarstw|farb\w* olejn|p[eę]dzel|obraz olejny)\b/i,
    reguly: [
      'Visible, textured impasto brushstrokes with physical paint thickness variation.',
      'Rich, warm color blending and deep chiaroscuro lighting contrast.',
      'Subtle canvas weave texture and painterly edge transitions (lost and found edges).',
      'Artistic painterly rendering while keeping recognizable subjects and scene geometry.',
    ],
  },
  {
    klucz: 'watercolor',
    nazwa: 'Akwarela',
    slowaKluczowe: /\b(akwarel|watercolor|wodn\w* farb|farby wodne)\b/i,
    reguly: [
      'Layered transparent color washes allowing luminous white paper reserve to shine through.',
      'Soft feathered, bleeding wet-on-wet edges and organic pigment flow.',
      'Natural paper granulation texture, delicate water blooms and edge backruns.',
      'Airy, atmospheric lightness preserving underlying composition and silhouettes.',
    ],
  },
  {
    klucz: 'sketch',
    nazwa: 'Szkic ołówkiem / węglem',
    slowaKluczowe: /\b(szkic|sketch|o[łl][oó]w\w*|w[eę]gl\w*|charcoal|pencil)\b/i,
    reguly: [
      'Expressive pencil/charcoal line work with varied stroke weights and energetic hatching/cross-hatching.',
      'Monochromatic tonal shading with paper-grain texture and soft smudged shadows.',
      'Spontaneous drawing character with subtle searching lines while maintaining tight structural accuracy.',
    ],
  },
  {
    klucz: 'anime',
    nazwa: 'Anime / Manga',
    slowaKluczowe: /\b(anime|manga|japo[ńn]sk\w* animacj)\b/i,
    reguly: [
      'Crisp, fine line art and vibrant, saturated colors with clean 2-step cel shading.',
      'Expressive stylized eyes, dynamic hair highlights, and white specular eye catchlights.',
      'Atmospheric anime aesthetic while preserving scene proportions and perspective.',
    ],
  },
  {
    klucz: 'photorealistic',
    nazwa: 'Fotorealistyczny',
    slowaKluczowe: /\b(fotoreal|photoreal|realistyczn|jak z aparatu|cinematic photo)\b/i,
    reguly: [
      'Physically accurate global illumination, subsurface scattering on skin, and micro-surface details.',
      'True-to-life camera optics: authentic depth of field, subtle chromatic aberration, and sensor noise.',
      'Natural material specularity, ambient occlusion and realistic shadow falloff.',
    ],
  },
  {
    klucz: 'vintage',
    nazwa: 'Vintage / Retro',
    slowaKluczowe: /\b(vintage|retro|stare zdj[eę]cie|analog|klisz|film grain|sepia|polaroid)\b/i,
    reguly: [
      'Authentic vintage film stock color shift: warm sepia/amber cast, lifted shadows, and gentle vignetting.',
      'Organic 35mm film grain texture, subtle lens blooming and reduced modern digital sharpness.',
      'Nostalgic analog atmosphere preserving all original subjects and structural elements.',
    ],
  },
  {
    klucz: 'cyberpunk',
    nazwa: 'Cyberpunk',
    slowaKluczowe: /\b(cyberpunk|neon|sci-?fi|futurystyczn|dystopi)\b/i,
    reguly: [
      'High contrast lighting with vibrant neon accents (magenta #FF00FF, electric cyan, purple, acid green).',
      'Wet reflective ground and glass surfaces catching luminous neon light spill and puddles.',
      'Dense atmospheric haze, futuristic technological details, and moody night atmosphere.',
    ],
  },
  {
    klucz: 'noir',
    nazwa: 'Film Noir',
    slowaKluczowe: /\b(noir|film noir|czarno-?bia[łl]|black and white|monochrom)\b/i,
    reguly: [
      'Classic high-contrast black and white with deep crushed blacks and selective dramatic highlights.',
      'Harsh directional lighting with venetian blind shadow patterns and dramatic silhouettes.',
      'Moody atmospheric mist, wet asphalt reflections, and vintage cinematic grain.',
    ],
  },
]

export function wykryjStyl(tekst: string): StylDefinicja | undefined {
  return TABELA_STYLOW.find(s => s.slowaKluczowe.test(tekst))
}
