import * as React from 'react';
import { Upload, X, Loader2, Image as ImageIcon, RefreshCw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Okno, OknoTresc, OknoNaglowek, OknoCialo } from './okno';
import { PodswietlenieUpuszczania, useUpuszczanie } from './podswietlenie-upuszczania';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  STREFA PLIKU — jedno miejsce „kliknij albo upuść, żeby dodać plik”
 * ════════════════════════════════════════════════════════════════════════
 *
 * Kajetan (14.09.2026, Dobór): strefa zdjęcia była własną kreskowaną ramką w
 * `PositionImageUpload` — bez odpowiednika w bibliotece. To sam WYGLĄD i
 * zachowanie klik/upuść/usuń; co zrobić z plikiem (magazyn, kompresja,
 * podpisany adres) decyduje rodzic przez `onPlik` i `podgladUrl`. Dzięki
 * temu ta sama strefa może przyjąć rysunek pozycji, zdjęcie z montażu czy
 * załącznik dokumentu, a wygląd zmienia się w jednym miejscu.
 *
 * `zwarta` = miniatura 48×48 (do wiersza), domyślnie pełna strefa z podpisem.
 *
 * `wypelnij` = podgląd na CAŁĄ strefę, klik otwiera go na pełnym ekranie
 * (Kajetan, 23.09.2026, Dobór: „nie mogę podejrzeć zdjęć, które wyekstraktował
 * przy każdej pozycji” i „zdjęcie nie zajmuje całej powierzchni okna”).
 * Domyślny wygląd trzymał obraz jako miniaturę 80×80 obok podpisu, a klik w
 * strefę otwierał wybór nowego pliku — podglądu nie było wcale. W tym wariancie
 * klik znaczy „pokaż”, a zmiana idzie przyciskiem „Zmień” albo upuszczeniem.
 * Rysunek techniczny rysujemy `object-contain`: przycięty rysunek kłamie.
 *
 * `nazwaPliku` (28.09.2026, okno „Zdjęcie → szkic" na tablicy) — przy miniaturze
 * stoi, CO wybrano, a nie tylko że coś wybrano.
 */
export const StrefaPliku: React.FC<{
  podgladUrl?: string | null;
  wgrywa?: boolean;
  onPlik: (plik: File) => void;
  onUsun?: () => void;
  /** Obrót obrazu w prawo — awaryjnie, gdy obraz przyszedł bokiem (Kajetan, 11.10.2026: rysunek z importu ma być
   *  obracany sam, „Obróć” jest na wypadek, gdy się nie udało). Bez propa przycisku nie ma. */
  onObroc?: () => void;
  tytul?: string;
  opis?: string;
  /** np. "image/*" */
  akceptuj?: string;
  zwarta?: boolean;
  /** podgląd wypełnia strefę; klik = pełny ekran; zmiana przyciskiem albo upuszczeniem */
  wypelnij?: boolean;
  /** czego dotyczy obraz — tytuł okna podglądu (domyślnie `tytul`) */
  podpis?: string;
  /** Nazwa wybranego pliku przy miniaturze (pełna strefa). */
  nazwaPliku?: string;
  /** Wiele plików naraz (27.10.2026, baza wiedzy): wybór i upuszczenie oddają całą listę. `onPlik` dostaje wtedy pierwszy. */
  onPliki?: (pliki: File[]) => void;
  /**
   * Duża strefa na szkle (27.10.2026, okno „Dodaj wiedzę”): wyższa, z ikoną w kafelku;
   * przy najechaniu i przeciąganiu ramka w kolorze akcentu i migoczące piksele (`PikseloweTlo`).
   */
  wyrazista?: boolean;
  /** Ikona i podpis drugiej linii dla wariantu `wyrazista` (np. lista przyjmowanych typów). */
  ikona?: React.ReactNode;
  className?: string;
}> = ({ podgladUrl, wgrywa, onPlik, onPliki, onUsun, onObroc, tytul = 'Dodaj plik', opis, akceptuj = 'image/*', zwarta, wypelnij, podpis, nazwaPliku, wyrazista, ikona, className }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [podglad, setPodglad] = React.useState(false);
  const wybierz = (f?: File | null) => { if (f) onPlik(f); };
  const wybierzWiele = (lista?: FileList | null) => {
    const pliki = Array.from(lista ?? []);
    if (!pliki.length) return;
    if (onPliki) onPliki(pliki); else wybierz(pliki[0]);
  };
  const wejscie = (
    <input ref={inputRef} type="file" accept={akceptuj} multiple={!!onPliki} className="hidden" onChange={e => { wybierzWiele(e.target.files); e.target.value = ''; }} />
  );
  const usun = (e: React.MouseEvent) => { e.stopPropagation(); onUsun?.(); };
  /* Globalny styl upuszczania (27.10.2026): jeden stan i jedna warstwa podświetlenia dla wszystkich wariantów. */
  const u = useUpuszczanie({ onPliki: (pliki) => (onPliki ? onPliki(pliki) : wybierz(pliki[0])) });
  const nad = u.nad;

  if (zwarta) {
    return (
      <button type="button" onClick={() => inputRef.current?.click()} {...u.handlery}
        className={cn('group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-muted/20', className)}>
        <PodswietlenieUpuszczania stan={u.stan} zaokraglenie="rounded-md" odstep={5} />
        {wgrywa ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          : podgladUrl ? (
            <>
              <img src={podgladUrl} alt="" className="h-full w-full object-cover" />
              {onUsun && <span role="button" aria-label="Usuń plik" onClick={usun} className="absolute right-0.5 top-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-background/90 opacity-0 group-hover:opacity-100"><X className="h-2.5 w-2.5" /></span>}
            </>
          ) : <ImageIcon className="h-4 w-4 text-muted-foreground/60" />}
        {wejscie}
      </button>
    );
  }

  if (wyrazista && !podgladUrl) {
    /* Podświetlenie (27.10.2026, Michał: „normalne, a nie radialne, jak w każdej aplikacji”):
       ramka zapala się kolorem akcentu, tło lekko się barwi, a piksele wypełniają strefę
       falą od środka. Najechanie i fokus dają lżejszą wersję, przeciąganie pliku pełną. */
    return (
      <div
        role="button" tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        {...u.handlery}
        data-nad={nad || undefined}
        className={cn('group relative isolate cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50', className)}
      >
        {/* Bez załamania (27.10.2026): filtr refrakcji rysował w strefie jaśniejszy prostokąt. */}
        <div data-nb-bez-refrakcji="" className={cn(
          'nb-szklo nb-szklo-plynne relative flex min-h-[176px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center',
        )}>
          <PodswietlenieUpuszczania stan={u.stan} />
          <span className={cn('relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-primary/10 text-primary transition-[transform,border-color] duration-200 ease-out', u.stan ? 'border-primary/60' : 'border-primary/30', nad && 'motion-safe:-translate-y-1')}>
            {wgrywa ? <Loader2 className="h-5 w-5 animate-spin" /> : (ikona ?? <Upload className="h-5 w-5" />)}
          </span>
          <span className="relative text-sm font-semibold text-foreground">{nad ? 'Upuść, żeby dodać' : tytul}</span>
          {opis && <span className="relative text-xs text-foreground/65">{opis}</span>}
        </div>
        {wejscie}
      </div>
    );
  }

  if (wypelnij && podgladUrl && !wgrywa) {
    return (
      <div onDragEnter={u.handlery.onDragEnter} onDragOver={u.handlery.onDragOver} onDragLeave={u.handlery.onDragLeave} onDrop={u.handlery.onDrop}
        className={cn('relative overflow-hidden rounded-lg border border-border/40 bg-muted/10', className)}>
        <PodswietlenieUpuszczania stan={nad ? 'nad' : null} zaokraglenie="rounded-lg" className="z-10" />
        <button type="button" onClick={() => setPodglad(true)} aria-label={`Powiększ: ${podpis ?? tytul}`}
          className="absolute inset-0 flex cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40">
          <img src={podgladUrl} alt={podpis ?? tytul} className="h-full w-full object-contain" />
        </button>
        {/* Przyciski zawsze widoczne — na tablecie nie ma najechania kursorem. */}
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="flex h-7 items-center gap-1.5 rounded-md border border-border/50 bg-background/90 px-2 text-przycisk text-foreground hover:bg-background">
            <RefreshCw className="h-3 w-3" /> Zmień
          </button>
          {onObroc && (
            <button type="button" onClick={e => { e.stopPropagation(); onObroc(); }} aria-label="Obróć w prawo" title="Obróć w prawo"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-background/90 hover:bg-background">
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
          {onUsun && (
            <button type="button" onClick={usun} aria-label="Usuń plik"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-background/90 hover:bg-destructive/10">
              <X className="h-3.5 w-3.5 text-destructive" />
            </button>
          )}
        </div>
        {wejscie}
        <Okno open={podglad} onOpenChange={setPodglad}>
          <OknoTresc rozmiar="pelny">
            <OknoNaglowek etykieta="Podgląd" tytul={podpis ?? tytul} />
            <OknoCialo>
              <img src={podgladUrl} alt={podpis ?? tytul} className="mx-auto max-h-[78vh] w-full object-contain" />
            </OknoCialo>
          </OknoTresc>
        </Okno>
      </div>
    );
  }

  return (
    <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
      {...u.handlery}
      className={cn('relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border/40 bg-muted/10 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40', className)}>
      <PodswietlenieUpuszczania stan={u.stan} zaokraglenie="rounded-lg" />
      {wgrywa ? (
        <div className="relative flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : podgladUrl ? (
        <div className="relative flex items-center gap-3">
          <img src={podgladUrl} alt={tytul} className="h-20 w-20 rounded-md border border-border/30 object-cover" />
          <div className="min-w-0 flex-1 text-xs text-muted-foreground">
            {nazwaPliku && <div className="mb-0.5 truncate text-[13px] font-medium text-foreground">{nazwaPliku}</div>}
            Kliknij albo upuść, żeby zmienić.
          </div>
          {/* `nb-cel-dotyku-wokol`: na dotyku 44 × 44 px bez rozpychania wiersza (28.09.2026). */}
          {onUsun && <button type="button" onClick={usun} aria-label="Usuń plik" className="nb-cel-dotyku-wokol flex h-7 w-7 items-center justify-center rounded-full hover:bg-destructive/10"><X className="h-3.5 w-3.5 text-destructive" /></button>}
        </div>
      ) : (
        /* Pismo 12 px: `foreground/65` zamiast `muted-foreground` z `opacity-60`
           (26.09.2026) — opis miał kontrast ok. 2,5 : 1, czyli był do zgadywania. */
        <div className="relative flex flex-col items-center justify-center py-4 text-foreground/65">
          <Upload className="mb-1.5 h-5 w-5" />
          <div className="text-xs font-medium text-foreground/80">{tytul}</div>
          {opis && <div className="mt-0.5 text-xs">{opis}</div>}
        </div>
      )}
      {wejscie}
    </div>
  );
};
