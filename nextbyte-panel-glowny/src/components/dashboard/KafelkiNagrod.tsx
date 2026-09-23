import React from 'react';
import { Plakietka } from '@/components/ui/plakietka';
import { Award, Sparkles, Image as ImageIcon, Palette, Lock, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KAFELKI NAGRÓD — co to jest, gdzie to zobaczysz
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „aby się pokazywały te 4 kafelki z informacjami co to i co to robi
 * i po co to jest".
 *
 * Wcześniej nagroda była linijką tekstu w rozwijanym panelu — nazwa i tyle.
 * „Beta Tester" jako nazwa odznaki, dekoracji awatara i tła profilu naraz
 * (bo wszystkie trzy tak się nazywają) nie mówi kompletnie nic o tym, co się
 * właściwie dostaje. Człowiek nie wykona trzech zadań dla czegoś, czego nie
 * umie sobie wyobrazić.
 *
 * Każdy kafelek odpowiada więc na trzy pytania w tej kolejności:
 *   1. CO TO JEST — typ nazwany po ludzku („Dekoracja awatara"),
 *   2. JAK WYGLĄDA — podgląd z bazy, nie ikona zastępcza,
 *   3. GDZIE TO ZOBACZYSZ — jedno zdanie o tym, gdzie nagroda się pojawia.
 *
 * Punkt 3 jest tu najważniejszy i najczęściej pomijany w takich panelach.
 * „Tło profilu" brzmi jak coś, czego nikt nie zobaczy — dopóki nie napiszemy,
 * że chodzi o profil publiczny, który oglądają inni.
 *
 * ── PODGLĄD, KTÓREGO NIE MA ─────────────────────────────────────────────
 * Gdy w bazie brakuje obrazka, kafelek pokazuje ikonę typu, a NIE pustą ramkę
 * ani łamiący się `<img>`. Nagroda bez podglądu ma dalej wyglądać na nagrodę.
 */

export interface NagrodaZeSzczegolami {
  id: string;
  reward_type: string;
  details?: {
    name?: string;
    icon_url?: string;
    preview_url?: string;
    decoration_url?: string;
    background_url?: string;
    rarity?: string;
    description?: string;
    primary_color?: string;
    bg_color?: string;
    card_color?: string;
  } | null;
}

/**
 * Słownik typów nagród. Trzymany w jednym miejscu, bo to samo tłumaczenie
 * („co to jest" + „gdzie to zobaczysz") będzie potrzebne wszędzie, gdzie
 * pokazujemy nagrody — w panelu eventu, w sklepie, w profilu.
 */
const TYPY: Record<string, { nazwa: string; gdzie: string; ikona: LucideIcon }> = {
  badge: {
    nazwa: 'Odznaka',
    gdzie: 'Pojawia się przy Twoim imieniu na profilu i w społeczności.',
    ikona: Award,
  },
  avatar_decoration: {
    nazwa: 'Dekoracja awatara',
    gdzie: 'Ramka wokół Twojego zdjęcia — widać ją wszędzie, gdzie się pojawiasz.',
    ikona: Sparkles,
  },
  profile_background: {
    nazwa: 'Tło profilu',
    gdzie: 'Tło Twojego profilu publicznego — tego, który oglądają inni.',
    ikona: ImageIcon,
  },
  color_theme: {
    nazwa: 'Motyw kolorystyczny',
    gdzie: 'Przemalowuje całą platformę — kolory interfejsu tylko dla Ciebie.',
    ikona: Palette,
  },
};

const RZADKOSC: Record<string, string> = {
  legendary: 'legendarna',
  epic: 'epicka',
  rare: 'rzadka',
  common: 'zwykła',
};

/**
 * `icon_url` odznaki NIE JEST adresem — to emoji.
 *
 * Nazwa pola mówi „url", a w bazie leży „🏆". Stary panel nagród renderował to
 * jako tekst (`<span className="text-3xl">`), więc działało; ja wstawiłem tę samą
 * wartość do `src` obrazka i wyszły cztery ikony złamanego pliku — dokładnie to,
 * co Michał zobaczył na Panelu Głównym 03.08.2026.
 *
 * Dlatego rozstrzygamy po ZAWARTOŚCI, a nie po nazwie pola: adres zaczyna się od
 * schematu albo ukośnika, wszystko inne jest znakiem do wypisania.
 */
const czyAdres = (v: string): boolean => /^(https?:|data:|blob:|\/)/i.test(v.trim());

const Podglad: React.FC<{ n: NagrodaZeSzczegolami; Ikona: LucideIcon }> = ({ n, Ikona }) => {
  const [padl, setPadl] = React.useState(false);
  const d = n.details;
  const surowe = d?.preview_url || d?.icon_url || d?.decoration_url || d?.background_url;
  const obraz = surowe && czyAdres(surowe) && !padl ? surowe : undefined;
  const emoji = surowe && !czyAdres(surowe) ? surowe : undefined;

  /* Motyw pokazujemy trzema polami koloru, a nie obrazkiem — bo motyw NIE MA
     obrazka, a zrzut ekranu interfejsu w kafelku 56×56 px i tak byłby plamą.
     Trzy pola (tło, karta, akcent) to dokładnie to, czym motyw się różni. */
  if (n.reward_type === 'color_theme' && d?.primary_color) {
    return (
      <span
        className="flex h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-foreground/[0.12]"
        aria-hidden="true"
      >
        <span className="w-1/2" style={{ background: `hsl(${d.bg_color})` }} />
        <span className="flex w-1/2 flex-col">
          <span className="h-1/2" style={{ background: `hsl(${d.card_color})` }} />
          <span className="h-1/2" style={{ background: `hsl(${d.primary_color})` }} />
        </span>
      </span>
    );
  }

  if (emoji) {
    return (
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[26px] leading-none ring-1 ring-inset ring-primary/25"
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  if (obraz) {
    return (
      <img
        src={obraz}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={() => setPadl(true)}
        className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-foreground/[0.12]"
      />
    );
  }

  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/25"
      aria-hidden="true"
    >
      <Ikona className="h-5 w-5" />
    </span>
  );
};

export const KafelkiNagrod: React.FC<{
  nagrody: NagrodaZeSzczegolami[];
  /** true, gdy nagrody są już odblokowane albo odebrane — zdejmuje kłódkę. */
  odblokowane: boolean;
}> = ({ nagrody, odblokowane }) => {
  if (nagrody.length === 0) return null;

  return (
    /* JEDNA KOLUMNA, NIE DWIE — poprawione po pomiarze 03.08.2026.
       Kafelki siedzą w środkowej kolumnie Panelu Głównego, która ma 392 px.
       Przy dwóch kolumnach pojedynczy kafelek wychodził 168 px: nazwa ucinała
       się do „Beta Te…", a zdanie „gdzie to zobaczysz" łamało się na siedem
       linijek po dwa słowa — czyli dokładnie ta informacja, dla której te
       kafelki powstały, stawała się nieczytelna.
       Zmierzone w przeglądarce, nie oszacowane na oko. */
    <div className="grid grid-cols-1 gap-2">
      {nagrody.map((n) => {
        const typ = TYPY[n.reward_type] ?? {
          nazwa: n.reward_type,
          gdzie: 'Nagroda z tego wydarzenia.',
          ikona: Award,
        };
        const nazwa = n.details?.name || typ.nazwa;
        const rzadkosc = n.details?.rarity ? RZADKOSC[n.details.rarity] ?? n.details.rarity : null;

        const legendarna = n.details?.rarity === 'legendary';

        return (
          /* KAFELEK MA MATERIAŁ, NIE SAMĄ OBWÓDKĘ.
             Michał o oknie nagród: „nie ma glassmorphizmu i fatalnie to wygląda".
             Zmierzone: wiersz miał tło `rgba(0,0,0,0)` i obwódkę `rgb(25,28,31)`
             na ciemnym tle okna — czyli praktycznie nic. Cztery przezroczyste
             prostokąty jeden pod drugim.
             Teraz: półprzezroczysta karta, refleks na górnej krawędzi, obwódka
             reagująca na kursor i lekkie uniesienie. Legendarna dostaje mocniejszy
             akcent — bo rzadkość ma być widać, zanim się przeczyta etykietę. */
          <div
            key={n.id}
            className={`group/nagroda relative flex gap-3 overflow-hidden rounded-xl border p-3 transition-all duration-300 ${
              legendarna
                ? 'border-primary/30 hover:border-primary/50'
                : 'border-border hover:border-primary/30'
            }`}
            style={{
              background: legendarna
                ? 'linear-gradient(135deg, hsl(var(--primary) / 0.10), hsl(var(--card) / 0.5) 60%)'
                : 'hsl(var(--card) / 0.5)',
              boxShadow: 'inset 0 1px 0 hsl(var(--foreground) / 0.07)',
            }}
          >
            {/* Poświata legendarnej — pod treścią, ledwie obecna, budzi się pod kursorem. */}
            {legendarna && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-8 -top-10 h-24 w-24 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover/nagroda:opacity-90"
                style={{ background: 'hsl(var(--primary) / 0.35)' }}
              />
            )}

            <span className="relative shrink-0 transition-transform duration-300 group-hover/nagroda:scale-105">
              <Podglad n={n} Ikona={typ.ikona} />
            </span>

            <div className="relative min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-[13px] font-semibold text-card-foreground">{nazwa}</p>
                {odblokowane
                  ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-label="odblokowane" />
                  : <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-label="zablokowane" />}
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {typ.nazwa}
                {rzadkosc && (
                  <Plakietka intencja={legendarna ? 'akcent' : 'neutralna'}>{rzadkosc}</Plakietka>
                )}
              </p>
              {/* Zdanie „gdzie to zobaczysz" — sedno tych kafelków. */}
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                {n.details?.description || typ.gdzie}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
