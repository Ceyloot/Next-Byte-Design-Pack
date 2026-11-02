/**
 * ════════════════════════════════════════════════════════════════════════
 *  PŁYNNY KURSOR — strojenie sprężyny w Zarządzie
 * ════════════════════════════════════════════════════════════════════════
 *
 * Gotowiec, z którego wzięliśmy mechanizm karetki, miał panel suwaków wbudowany
 * w sam komponent (`dialkit`) — czyli w produkcji, nad polem użytkownika.
 * Michał chciał tego panelu, ale tutaj: w Bibliotece komponentów, obok
 * strojenia kafelka i przycisku.
 *
 * PODGLĄD DZIAŁA TYLKO W SWOIM PUDEŁKU
 * Suwak nakłada zmienne `--nb-kursor-*` na kontener podglądu, a nie na korzeń
 * dokumentu. Zmienne CSS się dziedziczą, więc karetka w polu obok reaguje od
 * razu, ale reszta panelu — łącznie z polami, w których administrator akurat
 * coś pisze — zostaje na wartościach opublikowanych. Dopiero „Opublikuj"
 * przenosi ustawienia na całą platformę.
 */
import React from 'react';
import { Loader2, Check, Undo2, MousePointer2, AlertTriangle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tile, TileHeader, TileAction, TileFooter } from '@/components/ui/tile';
import { Pole, Obszar } from '@/components/ui/pola';
import { Plakietka } from '@/components/ui/plakietka';
import { useTokenyKomponentow, bezJednostki, zJednostka } from './useTokenyKomponentow';

const Suwak: React.FC<{
  etykieta: string;
  opis: string | null;
  wartosc: number;
  min: number;
  max: number;
  krok: number;
  jednostka: string;
  naZmiane: (v: number) => void;
}> = ({ etykieta, opis, wartosc, min, max, krok, jednostka, naZmiane }) => (
  <div>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-card-foreground">{etykieta}</span>
      <span className="text-[13px] tabular-nums text-primary">
        {wartosc}{jednostka}
      </span>
    </div>
    <Slider
      value={[wartosc]}
      min={min}
      max={max}
      step={krok}
      onValueChange={([v]) => naZmiane(v)}
      className="mt-2"
      aria-label={etykieta}
    />
    {opis && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{opis}</p>}
  </div>
);

export const SterowanieKursorem: React.FC = () => {
  const {
    sandbox, live, ladowanie, blad, zapisywanie,
    ustaw, zapiszSandbox, publikuj, przywrocZLive,
  } = useTokenyKomponentow('pole-kursor');

  const [tekst, setTekst] = React.useState('przetestuj karetkę tutaj');
  const [opis, setOpis] = React.useState('Pole wielolinijkowe — karetka wędruje\ntakże między wierszami.');
  const [opublikowano, setOpublikowano] = React.useState(false);

  /* Zmienne z suwaków nakładane na TEN kontener — patrz nagłówek pliku. */
  const zmiennePodgladu = React.useMemo(() => {
    const s: Record<string, string> = {};
    sandbox.forEach(t => { s[t.token] = zJednostka(bezJednostki(t.wartosc), t.jednostka); });
    return s as React.CSSProperties;
  }, [sandbox]);

  /* Kursor przelicza sprężynę dopiero, gdy dostanie sygnał — inaczej siedziałby
     na wartościach z chwili zamontowania i suwak nie robiłby nic widocznego. */
  React.useEffect(() => {
    window.dispatchEvent(new Event('kursorPodglad'));
  }, [zmiennePodgladu]);

  const rozjazd = React.useMemo(
    () => sandbox.some(t => live[t.token] !== undefined && live[t.token] !== t.wartosc),
    [sandbox, live],
  );

  if (ladowanie) {
    return (
      <Tile>
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Wczytywanie tokenów kursora…
        </div>
      </Tile>
    );
  }

  if (blad) {
    return (
      <Tile intencja="krytyczna">
        <div className="flex items-start gap-2 p-6 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>
            <span className="block font-medium text-foreground">Nie udało się wczytać tokenów</span>
            <span className="block text-muted-foreground">{blad}</span>
          </span>
        </div>
      </Tile>
    );
  }

  if (sandbox.length === 0) {
    return (
      <Tile>
        <div className="p-6 text-sm text-muted-foreground">
          Brak tokenów kursora w bazie. Wgraj migrację
          <code className="mx-1 rounded bg-muted/60 px-1.5 py-0.5 text-[12px]">20260813210000_tokeny_plynnego_kursora.sql</code>
          — do tego czasu karetka jedzie na wartościach zapasowych z kodu.
        </div>
      </Tile>
    );
  }

  return (
    <Tile>
      <TileHeader
        ikona={MousePointer2}
        tytul="Płynny kursor w polach"
        podtytul="Karetka dojeżdża sprężyną zamiast przeskakiwać — wartości działają w każdym polu platformy"
        poPrawej={
          rozjazd
            ? <Plakietka intencja="uwaga" rozmiar="mala">szkic różni się od opublikowanego</Plakietka>
            : <Plakietka intencja="neutralna" rozmiar="mala">zgodne z opublikowanym</Plakietka>
        }
      />

      <div className="grid gap-5 p-4 pt-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ── Suwaki ── */}
        <div className="space-y-4">
          {sandbox.map(t => (
            <Suwak
              key={t.token}
              etykieta={t.etykieta}
              opis={t.opis}
              wartosc={bezJednostki(t.wartosc)}
              min={Number(t.min_wartosc ?? 0)}
              max={Number(t.max_wartosc ?? 100)}
              krok={Number(t.krok ?? 1)}
              jednostka={t.jednostka ?? ''}
              naZmiane={(v) => ustaw(t.token, zJednostka(v, t.jednostka))}
            />
          ))}
        </div>

        {/* ── Żywy podgląd ── */}
        <div style={zmiennePodgladu} className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pisz tutaj — karetka jedzie na ustawieniach z suwaków
          </p>
          <Pole
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="przetestuj karetkę"
          />
          {/* Drugie pole pokazuje, że to działa wszędzie, a nie w jednym miejscu. */}
          <Pole
            rozmiar="zwarte"
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="wariant zwarty"
          />
          {/* Wielolinijkowe — tu karetka wędruje TAKŻE między wierszami, więc
              pozycję liczy lustro pola, nie sama szerokość tekstu. Wpisz kilka
              linii i poklikaj po nich, żeby zobaczyć przeskok w pionie. */}
          <Obszar
            rows={3}
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            placeholder="pole wielolinijkowe — wpisz kilka wierszy"
          />
          <p className="text-[11px] leading-snug text-muted-foreground">
            Przy „Tłumieniu" poniżej ~15 karetka przelatuje cel i wraca — dobrze to widać,
            klikając myszą na początek i koniec tekstu. Reszta panelu celowo zostaje na
            wartościach opublikowanych, więc masz porównanie obok.
          </p>
        </div>
      </div>

      <TileFooter>
        <TileAction
          rodzaj="cicha"
          ikona={Undo2}
          disabled={zapisywanie}
          onClick={() => { void przywrocZLive(); setOpublikowano(false); }}
        >
          Przywróć opublikowane
        </TileAction>
        <TileAction
          rodzaj="wtorna"
          disabled={zapisywanie}
          onClick={() => { void zapiszSandbox(); }}
        >
          Zapisz szkic
        </TileAction>
        <TileAction
          rodzaj="glowna"
          ikona={opublikowano ? Check : undefined}
          disabled={zapisywanie}
          onClick={async () => {
            await publikuj();
            setOpublikowano(true);
            setTimeout(() => setOpublikowano(false), 2500);
          }}
        >
          {zapisywanie ? 'Zapisywanie…' : opublikowano ? 'Opublikowano' : 'Opublikuj na platformę'}
        </TileAction>
      </TileFooter>
    </Tile>
  );
};

export default SterowanieKursorem;
