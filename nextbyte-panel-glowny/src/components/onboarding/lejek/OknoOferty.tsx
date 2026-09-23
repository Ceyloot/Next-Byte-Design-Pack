import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { klasyKafelka, TileAction } from '@/components/ui/tile';
import { cn } from '@/lib/utils';
import { useAuthId } from '@/hooks/useAuth';
import {
  zapiszWynikOferty, oznaczOfertePokazana, zapiszEventLejka, ustawKrokLejka,
} from '@/lib/lejek';
import { IkonaByte } from '@/lib/byte';
import { Gift, GraduationCap, Check, Star, Zap } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  OFERTA LEJKA — trzy ekrany, jedna obietnica
 * ════════════════════════════════════════════════════════════════════════
 *
 * Scenariusz Michała:
 *   1. OFERTA      — paczka Byte 9,99 zł albo Premium −38%, pod spodem
 *                    mniejszym „zobacz inne plany"
 *   2. OSTATNIA SZANSA — po pierwszej odmowie: „to ostatni raz"
 *   3. AKADEMIA    — po drugiej: „rozumiemy, że nie ma teraz jak pozwolić
 *                    sobie na inwestycję" → 10 dni Akademii Premium gratis
 *
 * „OSTATNI RAZ" MUSI BYĆ PRAWDĄ — i to jest sedno tego pliku.
 * Michał, 24.08.2026: „oferta musi być na serio jednorazowa". Każde
 * kliknięcie zapisuje wynik w bazie (`user_onboarding_state.oferta_wynik`),
 * a `wolnoPokazacOferte` po `odrzucil-ostatecznie` nie przepuści już nigdy.
 * Gdyby zapis padł, `zapiszWynikOferty` zwraca `false` — NIE przechodzimy
 * wtedy dalej, bo lepiej pokazać ten sam ekran jeszcze raz teraz niż złamać
 * słowo za tydzień.
 *
 * „Zobacz inne plany" jest CELOWO mniejszy (Michał: „ale mniejszy aby
 * człowiek 1 z tych wybrał") — ale jest, bo odcięcie drogi do pełnego
 * cennika byłoby pułapką, a nie ofertą.
 */



type Ekran = 'oferta' | 'ostatnia-szansa' | 'akademia';

export const OknoOferty: React.FC<{
  open: boolean;
  /** Który ekran pokazać na wejściu — wyliczany z `oferta_wynik`. */
  startowy?: Ekran;
  onZamknij: () => void;
}> = ({ open, startowy = 'oferta', onZamknij }) => {
  const userId = useAuthId();
  const navigate = useNavigate();
  const [ekran, setEkran] = useState<Ekran>(startowy);
  const [zapisuje, setZapisuje] = useState(false);

  React.useEffect(() => {
    if (open && userId) void oznaczOfertePokazana(userId);
  }, [open, userId]);

  const kup = (co: 'byte' | 'premium') => {
    if (!userId) return;
    zapiszEventLejka(userId, 'oferta', 'complete', { wybor: co });
    void zapiszWynikOferty(userId, 'kupil');
    void ustawKrokLejka(userId, { funnel_step: 'zakonczony', funnel_completed_at: new Date().toISOString() });
    navigate(co === 'byte' ? '/sklep' : '/premium');
  };

  /** Odmowa. Zapis MUSI się udać — inaczej zostajemy na tym samym ekranie. */
  const odmow = async () => {
    if (!userId || zapisuje) return;
    setZapisuje(true);
    if (ekran === 'oferta') {
      const ok = await zapiszWynikOferty(userId, 'odrzucil');
      setZapisuje(false);
      if (!ok) return;                 // patrz komentarz nad komponentem
      zapiszEventLejka(userId, 'oferta', 'skip', { etap: 'pierwsza-odmowa' });
      setEkran('ostatnia-szansa');
      return;
    }
    const ok = await zapiszWynikOferty(userId, 'odrzucil-ostatecznie');
    setZapisuje(false);
    if (!ok) return;
    zapiszEventLejka(userId, 'oferta', 'skip', { etap: 'odmowa-ostateczna' });
    setEkran('akademia');
  };

  const zakoncz = () => {
    if (userId) {
      void ustawKrokLejka(userId, { funnel_step: 'zakonczony', funnel_completed_at: new Date().toISOString() });
    }
    onZamknij();
  };

  const tresc = {
    oferta: {
      tytul: 'Jednorazowa oferta na start',
      opis: 'Tylko teraz, tylko raz. Później wracamy do zwykłych cen.',
      ikona: <Gift className="h-5 w-5 text-foreground" />,
    },
    'ostatnia-szansa': {
      tytul: 'To ostatni raz, kiedy widzisz tę ofertę',
      opis: 'Mówimy serio — po zamknięciu nie wróci.',
      ikona: <Gift className="h-5 w-5 text-foreground" />,
    },
    akademia: {
      tytul: 'Rozumiemy',
      opis: 'Nie każdy moment jest na inwestycję. Zostaje coś od nas.',
      ikona: <GraduationCap className="h-5 w-5 text-foreground" />,
    },
  }[ekran];

  return (
    <NextByteModal
      open={open}
      /* Oferta jest decyzją, nie komunikatem — tło ma się cofnąć. */
      zaslonaClassName="nb-zaslona-rozmyta"
      /*
        ZAMKNIĘCIE KRZYŻYKIEM I ESC TO TA SAMA DECYZJA CO „NIE TERAZ".

        Wcześniej ta funkcja była pusta — zamknięcie miało iść „tylko przez
        przyciski", żeby odmowa na pewno trafiła do bazy. Skutek uboczny:
        krzyżyk w rogu okna BYŁ WIDOCZNY i nie robił nic. Człowiek klika,
        okno zostaje, klika drugi raz, dalej stoi. Wygląda na zepsute, a przy
        oknie, które mówi o pieniądzach, czyta się jak próba przytrzymania go
        siłą.

        Teraz każde zamknięcie przechodzi tą samą ścieżką co przycisk: pierwsza
        odmowa pokazuje ekran „to ostatni raz", druga zapisuje wynik ostateczny
        i domyka lejek. Michał 31.08: „jak wyłączy to okno jest potwierdzenie,
        że już go nie zobaczy, i w bazie się odnotowuje".
      */
      onOpenChange={(otwarte) => {
        if (otwarte) return;
        if (ekran === 'akademia') { zakoncz(); return; }
        void odmow();
      }}
      title={tresc.tytul}
      description={tresc.opis}
      icon={tresc.ikona}
      maxWidth="2xl"
      /* Nagłówek jest tu TREŚCIĄ, nie etykietą — oferta to moment,
         w którym człowiek podejmuje decyzję o pieniądzach. */
      naglowekWysrodkowany
      hideCloseButton
    >
      {ekran !== 'akademia' ? (
        <div>
          {/*
            KAŻDA KARTA MÓWI SWOIM JĘZYKIEM — Michał 31.08: „premium ma wyglądać
            tak jak z planów, a paczka byte tak jak z paczki byte".

            To nie jest kaprys. Człowiek, który kliknie „Wybieram Premium",
            wyląduje na cenniku i musi tam rozpoznać to, co przed chwilą widział.
            To samo z paczką: klik prowadzi do sklepu, gdzie karty wyglądają
            dokładnie tak, jak ta poniżej. Jeden wygląd dla obu byłby wygodny
            dla mnie, ale mylący dla niego.
          */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* ══ PACZKA BYTE — układ z „Paczki Byte" w Saldzie ══ */}
            <button type="button" onClick={() => kup('byte')}
              className={cn(
                'relative rounded-xl border p-4 text-left transition-all duration-200',
                'bg-gradient-to-br from-foreground/[0.04] to-foreground/[0.01]',
                'border-border/40 hover:-translate-y-0.5 hover:border-primary/50',
                'hover:from-primary/10 hover:to-primary/[0.02] hover:shadow-lg hover:shadow-primary/20',
              )}>
              <span className="mb-1 flex min-h-[18px] items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <Star className="h-2.5 w-2.5 fill-current" /> Na start
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  <Gift className="h-2.5 w-2.5" /> −60%
                </span>
              </span>

              <span className="block truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Mini paczka
              </span>

              <span className="mt-1 flex items-baseline gap-1">
                <span className="text-[26px] font-extrabold leading-none tabular-nums text-foreground">100</span>
                <span className="text-base font-bold text-primary">⟠</span>
              </span>

              <span className="mt-1 block min-h-[14px] text-[11px] leading-tight text-muted-foreground">
                Jednorazowo, bez subskrypcji
              </span>

              <span className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/40 pt-2.5">
                <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-foreground">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {/* Pełna cena mini paczki to 25 zł — patrz sklep. Przekreślenie
                      pokazuje, ile ta oferta naprawdę oszczędza. */}
                  <span className="text-[11px] font-normal tabular-nums text-muted-foreground/60 line-through">25 zł</span>
                  <span className="tabular-nums">9,99 zł</span>
                </span>
                <span className="whitespace-nowrap text-[10px] tabular-nums text-muted-foreground">10,0 gr / Byte</span>
              </span>
              <span className="mt-1 block truncate text-[10px] tabular-nums text-foreground/35">
                10,01 Byte / zł
              </span>
            </button>

            {/* ══ PREMIUM — układ z cennika ══ */}
            <div className="relative flex flex-col rounded-xl border border-primary/40 bg-primary/[0.06] p-4 shadow-[0_0_24px_hsl(var(--primary)/0.15)]">
              <span className="mb-1 flex min-h-[18px] items-center justify-end">
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <Star className="h-2.5 w-2.5 fill-current" /> Najlepsza oferta
                </span>
              </span>

              <span className="block text-lg font-bold tracking-wide text-primary">PREMIUM</span>
              <span className="mt-1 block text-[13px] text-muted-foreground">Pełny dostęp do funkcji AI</span>

              <span className="mt-3 flex flex-wrap items-baseline gap-2">
                {/* Przekreślona pełna cena PRZED promocyjną — tak jak przy
                    przełączniku „Rocznie" w cenniku. */}
                <span className="text-base tabular-nums text-destructive line-through opacity-70">99 PLN</span>
                <span className="flex items-baseline gap-1">
                  <span className="text-[30px] font-bold leading-none tabular-nums text-foreground">61,38</span>
                  <span className="text-base text-muted-foreground">PLN</span>
                </span>
                <span className="text-sm text-muted-foreground">/miesiąc</span>
              </span>
              <span className="mt-1 block text-[12px] text-muted-foreground">
                Pierwszy miesiąc. Potem <span className="tabular-nums">99 PLN</span>, można odejść.
              </span>

              <TileAction rodzaj="glowna" onClick={() => kup('premium')}
                          className="mt-3.5 w-full justify-center py-2.5">
                Wybierz PREMIUM
              </TileAction>

              <span className="mt-3.5 flex items-baseline gap-1.5 text-[12px] text-muted-foreground">
                Byte miesięcznie:
                <span className="text-sm font-bold tabular-nums text-primary">495 ⟠</span>
              </span>

              <ul className="mt-2 space-y-1.5">
                {['Wszystkie modele AI bez dopłat',
                  'Chat AI, Kalendarz, Zadania, Notatki bez limitu',
                  'Studio Zdjęć i Studio Video'].map(cecha => (
                  <li key={cecha} className="flex items-start gap-2 text-[11.5px] leading-snug text-foreground/85">
                    <Check className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
                    {cecha}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/*
            ODMOWA POŚRODKU, POD KARTAMI — Michał: „na samym środku przycisk
            rezygnuję, aby był na dole". „Zobacz inne plany" wypadło: wybór ma
            być między dwiema rzeczami na ekranie, a nie między nimi a trzecim
            miejscem, do którego trzeba wyjść.
          */}
          <div className="mt-5 flex justify-center">
            <button type="button" onClick={() => void odmow()} disabled={zapisuje}
              className="text-xs text-muted-foreground/70 underline-offset-4 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-50">
              {/*
                PEŁNE ZDANIE, NIE „Nie teraz" — Michał 31.08.
                Krótkie „Nie teraz" sugeruje, że oferta wróci później. Nie wróci:
                po drugiej odmowie zapisuje się `odrzucil-ostatecznie` i okno nie
                pokaże się nigdy więcej. Przycisk ma mówić, z czego człowiek
                naprawdę rezygnuje.
              */}
              {ekran === 'oferta'
                ? 'Rezygnuję z jednorazowej oferty'
                : 'Rezygnuję ostatecznie'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className={cn(klasyKafelka({ intencja: 'akcent', zwarty: true }))}>
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" /> 10 dni Akademii Premium
            </span>
            <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
              Pełny dostęp do kursów i materiałów. Bez karty, bez zobowiązań.
            </span>
          </div>
          <TileAction rodzaj="glowna" onClick={zakoncz} className="w-full justify-center">
            Odbieram i zaczynam
          </TileAction>
        </div>
      )}
    </NextByteModal>
  );
};
