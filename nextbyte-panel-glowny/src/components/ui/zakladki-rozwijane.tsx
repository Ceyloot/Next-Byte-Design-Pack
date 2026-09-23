import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ROZWIJANE ZAKŁADKI — GLOBALNY KOMPONENT NA MATERIALE PLATFORMY
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Michał, 06.08.2026: „przebuduj to na liquid glass, a jak nie ma, to stwórz
 * globalny komponent takiego rozwijanego tab w stylu 1:1 liquid glass".
 *
 * Wcześniej ten wariant siedział prywatnie w `AnimatedTabs.tsx` i nie dało się
 * go użyć nigdzie indziej — a każdy ekran z listą zakładek na telefonie
 * potrzebuje dokładnie tego samego. Teraz jest osobnym komponentem biblioteki:
 * `AnimatedTabs` (i przez niego `Zakladki`) tylko go wywołują, ale można go
 * wstawić wprost wszędzie, gdzie trzeba wybrać jedno z wielu na wąskim ekranie.
 *
 * MATERIAŁ: warstwa pływająca, czyli `nb-szklo nb-szklo-plynne nb-szklo-tafla`
 * — ten sam zestaw, którym jedzie `PopoverContent` i `.nb-szklo-menu`
 * (refrakcja + rozmycie 8.8 px + tafla 0.60). Nie „coś podobnego": ta sama
 * trójka klas, więc zmiana przepisu w jednym miejscu przestraja i to menu.
 */
export interface PozycjaZakladki {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Liczba przy etykiecie; zero jest ukrywane. */
  licznik?: number;
}

export interface ZakladkiRozwijaneProps {
  tabs: PozycjaZakladki[];
  activeTab: string;
  onTabChange: (value: string) => void;
  /** Kolor akcentu studia (np. fiolet Studia Zdjęć). Domyślnie `--primary`. */
  accentColor?: string;
  className?: string;
}

export const ZakladkiRozwijane: React.FC<ZakladkiRozwijaneProps> = ({
  tabs, activeTab, onTabChange, accentColor, className,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  /* Lista jedzie PORTALEM do <body>, więc nie jest już potomkiem `ref`.
     Bez własnego uchwytu kliknięcie w pozycję listy liczyłoby się jako
     „kliknięcie obok" i menu zamykałoby się przed wyborem. */
  const refListy = useRef<HTMLDivElement>(null);
  const [ramka, setRamka] = useState<{ left: number; top: number; width: number } | null>(null);

  /*
    ══════════════════════════════════════════════════════════════════════════
     LISTA W PORTALU, BO SZYBA NIE MOŻE BYĆ DZIECKIEM SZYBY (06.08.2026)
    ══════════════════════════════════════════════════════════════════════════

    Michał, ze zrzutu ze Studia Zdjęć na telefonie: „to na telefonie nie ma
    rozmycia, jak coś liquid glass to nie jest komponent to okno".

    Zmierzone przy otwartym menu:
      lista      → backdrop-filter: none, tło rgba(8,8,8,0.10)
      jej przodek→ backdrop-filter: url(#nb-refrakcja-delikatne) saturate(1.3)
                   blur(8.8px)   (przyklejony nagłówek Studia)

    Dwie wady naraz:

    ① KOMENTARZ TU KŁAMAŁ. Stało: „`nb-szklo` zamiast `nb-szklo
       nb-szklo-plynne` — rozmycie przy 95% krycia i tak nie miało czego
       rozmywać". Wypełnienie NIE wynosi 95%: `--nb-szklo-krycie` jest
       wstrzykiwane z tokenów motywu i zbija je do 0.10. Lista była więc
       w 90% przezroczysta i BEZ rozmycia — czyli okno, przez które widać
       galerię na wylot. Dokładnie to, co widać na zrzucie.

    ② SAMO DODANIE `nb-szklo-plynne` NIC BY NIE DAŁO. Lista stała
       `absolute` wewnątrz nagłówka, a nagłówek ma własny `backdrop-filter`,
       czyli USTANAWIA korzeń tła. Rozmycie dziecka liczyłoby się z już
       rozmytego rodzica (a poza jego obrysem — z niczego). To ta sama
       zasada, przez którą przyciski w pasku mobilnym dostały wgłębienie
       zamiast szkła.

    Stąd portal do <body> i materiał WARSTWY PŁYWAJĄCEJ
    (`nb-szklo nb-szklo-plynne nb-szklo-tafla`, wypełnienie 0.60) — ten sam,
    którym jedzie `PopoverContent` i `.nb-szklo-menu`. Pozycję liczymy
    z prostokąta wyzwalacza i przeliczamy przy przewijaniu oraz zmianie
    rozmiaru, bo element w portalu nie jeździ już razem z nagłówkiem.
  */
  const przelicz = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRamka({ left: r.left, top: r.bottom + 6, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    przelicz();
    window.addEventListener('resize', przelicz);
    window.addEventListener('scroll', przelicz, true);
    return () => {
      window.removeEventListener('resize', przelicz);
      window.removeEventListener('scroll', przelicz, true);
    };
  }, [open, przelicz]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const cel = e.target as Node;
      if (refListy.current?.contains(cel)) return;
      if (ref.current && !ref.current.contains(cel)) setOpen(false);
    };
    // Escape zamyka — kliknięcie obok było jedyną drogą wyjścia, a przy liście
    // na 60% ekranu „obok" bywa wąskim paskiem, w który trzeba celować.
    const naKlawisz = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', naKlawisz);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', naKlawisz);
    };
  }, [open]);

  const active = tabs.find(t => t.value === activeTab) || tabs[0];

  const accentBg = accentColor
    ? accentColor.replace(')', ' / 0.12)').replace('hsl(', 'hsla(')
    : 'hsl(var(--primary) / 0.12)';
  const accentBorder = accentColor
    ? accentColor.replace(')', ' / 0.35)').replace('hsl(', 'hsla(')
    : 'hsl(var(--primary) / 0.35)';

  return (
    <div ref={ref} className={cn('relative w-full', className)}>
      {/* Selected tab trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground border transition-colors nb-szklo"
        style={{
          background: accentBg,
          borderColor: accentBorder,
        }}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {active.icon}
          {active.label}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Dropdown — w portalu, poza szklanym nagłówkiem (patrz komentarz wyżej) */}
      {createPortal(
        <AnimatePresence>
          {open && ramka && (
          <motion.div
            ref={refListy}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ left: ramka.left, top: ramka.top, width: ramka.width }}
            /*
              WYSOKOŚĆ OGRANICZONA I WŁASNY PASEK PRZEWIJANIA.

              Michał na Zarządzie (18 zakładek): „a nie że w nieskończoność się
              otwiera". Lista renderowała WSZYSTKIE pozycje bez `max-height`,
              więc przy 18 zakładkach rozwijała się na dwa ekrany telefonu —
              ostatnie pozycje lądowały poza widokiem i nie dało się ich
              dosięgnąć, bo `overflow-hidden` blokował przewijanie WEWNĄTRZ
              listy, a strona pod spodem jest zablokowana otwartym menu.

              60vh, a nie stała liczba pikseli: telefon i laptop mają inne
              ekrany, a lista ma zawsze zostawić widoczny kawałek tła — inaczej
              nie widać, że to nakładka, którą można zamknąć kliknięciem obok.
              `nb-pasek` to nasz pasek przewijania (patrz index.css).
            */
            role="listbox"
            className="fixed z-[60] max-h-[60vh] overflow-y-auto overscroll-contain rounded-2xl border nb-szklo nb-szklo-plynne nb-szklo-tafla nb-pasek"
          >
            {tabs.map(tab => {
              const isActive = tab.value === activeTab;
              return (
                <button
                  key={tab.value}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onTabChange(tab.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                  style={isActive ? { background: accentBg } : undefined}
                >
                  {tab.icon}
                  <span className="min-w-0 truncate">{tab.label}</span>
                  {/* Licznik także w liście — inaczej znika na telefonie,
                      czyli dokładnie tam, gdzie skrót informacji jest
                      najbardziej potrzebny. */}
                  {!!tab.licznik && (
                    <span className="ml-auto shrink-0 rounded-full bg-foreground/10 px-1.5 py-px text-[10px] font-semibold tabular-nums text-muted-foreground">
                      {tab.licznik}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default ZakladkiRozwijane;
