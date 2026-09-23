import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tile } from '@/components/ui/tile';
/* Znaki obu przestrzeni biorę z modułu, zamiast przerysowywać je tutaj: to
   czysty SVG bez CSS i bez magazynu (dwa `path` i stała akcentu), więc wejście
   na panel nie ciągnie za sobą ani stylów NextClouda, ani jego stanu. Gdyby
   znak kiedyś się zmienił, ma się zmienić w JEDNYM miejscu — kafelek panelu
   i kafelek w module to ta sama chmura, nie dwie podobne. */
import { SystemCloudMark, PrivateCloudMark } from '@/modules/nextcloud/components/SpaceMarks';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  DWIE CHMURY W PANELU GŁÓWNYM
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „w panelu głównym po prawej daj 6 ikon szybkich akcji, a po lewej
 * system i privatecloud 2 kafelki".
 *
 * Dolny pas panelu był dotąd sześcioma kafelkami skrótów w dwóch rzędach.
 * Skróty prowadzą do modułów, które stoją w pasku bocznym o dwa centymetry
 * dalej — więc powielały nawigację. Chmura tego nie robi: pokazuje STAN
 * (ile miejsca zostało), a nie samo wejście.
 *
 * ── POWIERZCHNIA Z PLATFORMY, WNĘTRZE Z NEXTCLOUDA ───────────────────────
 *
 * Dwa nieporozumienia po drodze, oba warte zapisania.
 *
 * ① Pierwsza wersja miała własną obudowę: `nb-horyzont`, poświata od dołu,
 *    barwa per chmura — czyli język KAFELKÓW SZYBKIEJ PODRÓŻY. Michał: „zrób
 *    te kafelki w stylu panelu głównego, bo strasznie odstają stylem". To ta
 *    sama pułapka, którą `ui/tile.tsx` opisuje w swoim nagłówku: osiemnaście
 *    z dwudziestu jeden plików Panelu Głównego skleiło sobie kiedyś własny
 *    kafelek i dlatego całość wyglądała na sklejaną.
 *
 * ② Druga wersja poszła o krok za daleko — wsadziła nazwę chmury w `TileHeader`,
 *    czyli w pasek tytułowy platformy, i chmura przestała wyglądać jak chmura.
 *    Michał doprecyzował: „w stylu miałem na myśli nie wygląd, bo wygląd chmur
 *    z NextClouda — tylko tła i całego kafelka".
 *
 * Granica przebiega więc dokładnie tu: POWIERZCHNIA jest platformy (`Tile` —
 * szkło, rant, uniesienie, promień, to samo co „Czeka na Ciebie" obok),
 * a WNĘTRZE jest NextClouda: znak w kwadracie, znak słowny „System/Private"
 * z „Cloud" w akcencie, opis, włosowa linia i stopka z „Otwórz →" — jeden do
 * jednego z bramą modułu (`screens/SpaceChooser.tsx`), tylko postawione na
 * karcie panelu zamiast na własnym tle.
 *
 * Kafelek PrivateCloud pokazuje zapełnienie, bo to jedyna liczba z chmury,
 * która potrafi zaskoczyć — i jedyna, która wymaga reakcji, zanim wgranie
 * odbije się od limitu. SystemCloud licznika nie dostaje: to lustro notatek,
 * promptów i studia, więc jego „zajętość" jest cudza, a policzenie jej znaczy
 * ściągnięcie kilkuset wierszy przy każdym wejściu na panel.
 */

const gb = (bajty: number): string => {
  if (!Number.isFinite(bajty) || bajty <= 0) return '0 GB';
  const w = bajty / 1024 ** 3;
  return w >= 10 ? `${Math.round(w)} GB` : `${w.toFixed(1).replace('.', ',')} GB`;
};

/** Zajętość i limit PrivateCloud — te same funkcje bazy, których pilnuje wyzwalacz. */
function useMiejsceChmury() {
  return useQuery({
    queryKey: ['nextcloud-miejsce-panel'],
    /* Pięć minut: to liczba, która zmienia się przy wgraniu pliku, a nie
       w trakcie patrzenia na panel. */
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: uzytkownik } = await supabase.auth.getUser();
      const id = uzytkownik?.user?.id;
      if (!id) return null;
      const [zajete, limit, ile] = await Promise.all([
        supabase.rpc('nextcloud_zajete_miejsce' as any, { p_user: id }),
        supabase.rpc('nextcloud_limit_miejsca' as any, { p_user: id }),
        supabase
          .from('nextcloud_elementy' as any)
          .select('numer', { count: 'exact', head: true })
          .eq('zarchiwizowany', false),
      ]);
      if (zajete.error || limit.error) return null;
      return {
        zajete: Number(zajete.data ?? 0),
        limit: Number(limit.data ?? 0),
        ile: ile.count ?? 0,
      };
    },
  });
}

interface KafelekProps {
  znak: React.ReactNode;
  pierwszy: string;
  opis: string;
  stopka: React.ReactNode;
  onClick: () => void;
}

const KafelekChmury: React.FC<KafelekProps> = ({ znak, pierwszy, opis, stopka, onClick }) => (
  /* `Tile` jest `div`-em, więc klawiatura potrzebuje własnej obsługi. Sam
     przycisk w środku nie wystarczy: klikalna jest CAŁA karta, a to, co
     obsługuje mysz, ma obsługiwać też Tab i Enter. */
  <Tile
    interaktywny
    zwarty
    className="group h-full flex flex-col justify-between p-4"
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
    }}
  >
    <div className="flex flex-col gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-[0_4px_16px_-6px_hsl(var(--primary)/0.35)] transition-transform duration-200 group-hover:-translate-y-0.5"
      >
        {znak}
      </span>

      <div>
        <h3 className="text-base font-bold leading-tight text-foreground">
          {pierwszy}<span className="text-primary">Cloud</span>
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{opis}</p>
      </div>
    </div>

    {/* `mt-auto` dociska stopkę do dna, żeby obie karty miały linię informacji
        na tej samej wysokości niezależnie od długości opisu. Włosowa linia nad
        nią — tak samo jak w bramie modułu. */}
    <div className="mt-3 flex items-end justify-between gap-3 border-t border-border/60 pt-2.5">
      <span className="min-w-0 flex-1">{stopka}</span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
        Otwórz <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </div>
  </Tile>
);

export function KafelkiChmury() {
  const navigate = useNavigate();
  const { data: miejsce } = useMiejsceChmury();

  const udzial = miejsce && miejsce.limit > 0
    ? Math.min((miejsce.zajete / miejsce.limit) * 100, 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* `h-7` to wysokość przycisku „Edytuj" stojącego w nagłówku Szybkiej
          podróży obok. Bez wyrównania obu wierszy nagłówek chmur stał 7 px
          wyżej niż sąsiedni — zmierzone, i widać to było jak uskok. */}
      <div className="flex h-7 items-center justify-between px-1">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Twoje chmury
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <KafelekChmury
          znak={<SystemCloudMark size={24} />}
          pierwszy="System"
          opis="Notatki, prompty, pamięć AI i studio zdjęć — spięte z platformą, w jednym drzewie."
          onClick={() => navigate('/nextcloud?p=nextbyte')}
          stopka={
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Tylko do odczytu
            </span>
          }
        />

        <KafelekChmury
          znak={<PrivateCloudMark size={24} />}
          pierwszy="Private"
          opis="Twoje pliki i foldery. Zasady ustalasz sam — nic tu nie jest z góry ustalone."
          onClick={() => navigate('/nextcloud?p=moja')}
          stopka={
            miejsce ? (
              <>
                <span className="flex items-baseline gap-1 text-[11px] text-muted-foreground">
                  <b className="font-semibold tabular-nums text-foreground">{gb(miejsce.zajete)}</b>
                  z {gb(miejsce.limit)}
                  {miejsce.ile > 0 && <span className="opacity-60">· {miejsce.ile}</span>}
                </span>
                {/* Pasek, nie sam procent: zapełnienie czyta się z długości
                    szybciej niż z liczby. */}
                <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-muted/40">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(udzial, 0))}%`,
                      background: udzial >= 80 ? 'hsl(38 92% 55%)' : 'hsl(var(--primary))',
                    }}
                  />
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Twoje miejsce
              </span>
            )
          }
        />
      </div>
    </div>
  );
}
