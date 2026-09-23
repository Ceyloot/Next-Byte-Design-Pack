import { Tile } from '@/components/ui/tile';
import { TloAplikacji } from '@/components/ui/tlo-aplikacji';

/**
 * PODGLĄD MATERIAŁU — tylko ta paczka, poza logowaniem.
 *
 * Panel Główny pokazuje prawdziwe dane, więc bez konta nie da się go obejrzeć
 * — a materiał powierzchni trzeba WIDZIEĆ, żeby go stroić. Ta strona odtwarza
 * sam stos powierzchni z panelu (strona → kafelek → kafelek zagnieżdżony →
 * wiersz) w tych samych klasach, w jakich składa go Panel Główny.
 *
 * Nie jest podpięta do nawigacji i nie wchodzi na platformę.
 */
export function ProbaMaterialu() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background p-6">
      {/* To samo tlo, co pod Panelem Glownym — bez niego szklo nie ma czego
          zalamywac i proba klamie. */}
      <TloAplikacji />
      <div className="relative">
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Próba materiału</h1>
          <p className="text-sm text-muted-foreground">
            Ten sam stos powierzchni co na Panelu Głównym. Przełącz motyw, żeby
            porównać oba.
          </p>
        </header>

        {/* Poziom 1 — kafelek na stronie */}
        <Tile intencja="akcent" elewacja="uniesiona" className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Poziom 1 — kafelek</p>
          <p className="mt-1 text-xl font-bold text-foreground">4 820 ⟠</p>

          {/* Poziom 2 — powierzchnia zagnieżdżona, tu widać szew */}
          <div className="mt-4 rounded-xl border border-border/40 nb-szklo nb-szklo-plynne p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Poziom 2 — zagnieżdżony</p>
            <p className="mt-1 text-sm text-foreground">Nic nie czeka</p>

            {/* Poziom 3 — wiersz/przycisk na powierzchni zagnieżdżonej */}
            <div className="mt-3 flex gap-2">
              <div className="rounded-lg border border-border/40 nb-szklo nb-szklo-plynne px-3 py-2 text-sm text-foreground">
                Zaplanuj wydarzenie
              </div>
              <div className="rounded-lg border border-border/40 nb-szklo nb-szklo-plynne px-3 py-2 text-sm text-foreground">
                Dodaj zadanie
              </div>
            </div>
          </div>
        </Tile>

        {/* Tafla — okna, arkusze, listy wyboru */}
        <div className="rounded-2xl border nb-szklo nb-szklo-plynne nb-szklo-tafla p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tafla — okno / lista wyboru</p>
          <p className="mt-1 text-sm text-foreground">Powierzchnia unosząca się nad stroną.</p>
        </div>

        {/* Pasek — ten sam materiał co nawigacja */}
        <nav className="flex items-center justify-between rounded-2xl border border-border/40 nb-szklo nb-szklo-plynne nb-szklo-tafla px-5 py-2.5 shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)]">
          <span className="font-bold text-foreground">NEXTBYTE</span>
          <span className="text-sm text-muted-foreground">Pasek nawigacji</span>
        </nav>

        {/* Odczyt zmiennych — żeby nie zgadywać, co faktycznie wyszło */}
        <pre id="proba-tokeny" className="rounded-xl border border-border/40 bg-card/60 p-3 text-[11px] text-muted-foreground" />
      </div>
      </div>
    </div>
  );
}
