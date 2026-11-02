/**
 * ════════════════════════════════════════════════════════════════════════
 *  PODGLĄD KONTAKTU — ikona w wierszu, treść bez wchodzenia w kartę
 * ════════════════════════════════════════════════════════════════════════
 *
 * Ten klocek powstał w liście CRM i tam siedział zamurowany: dwa niemal
 * identyczne bloki po ~45 linii (e-mail i telefon), różniące się etykietą,
 * ikoną i schematem odnośnika. Trzeci ekran, który potrzebował tego samego
 * (Baza Danych → Podmioty), musiałby dopisać trzecią i czwartą kopię.
 *
 * ZASADA: wiersz listy pokazuje, ŻE kontakt istnieje; treść wychodzi dopiero
 * po kliknięciu. Adres e-mail w kolumnie zjada połowę szerokości tabeli i i tak
 * nikt go nie czyta — a kiedy jest potrzebny, potrzebny jest do skopiowania
 * albo do kliknięcia, nie do przeczytania.
 *
 * BRAK KONTAKTU TEŻ JEST INFORMACJĄ. Pusta wartość rysuje wygaszoną ikonę,
 * a nie pustkę: dzięki temu widać różnicę między „nie ma telefonu" a „kolumna
 * się nie doczytała", i od razu wiadomo, którą firmę trzeba uzupełnić.
 */
import React, { useState } from 'react';
import { Mail, Phone, Globe, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export type RodzajKontaktu = 'email' | 'telefon' | 'www';

const PRZEPIS: Record<RodzajKontaktu, {
  ikona: typeof Mail;
  etykieta: string;
  akcja: string;
  odnosnik: (v: string) => string;
  nowaKarta?: boolean;
}> = {
  email: {
    ikona: Mail,
    etykieta: 'E-mail',
    akcja: 'Napisz wiadomość',
    odnosnik: v => `mailto:${v}`,
  },
  telefon: {
    ikona: Phone,
    etykieta: 'Telefon',
    akcja: 'Zadzwoń',
    odnosnik: v => `tel:${v}`,
  },
  www: {
    ikona: Globe,
    etykieta: 'Strona',
    akcja: 'Otwórz stronę',
    // Adresy bywają wpisane bez schematu („aluplast.pl”). Bez `https://`
    // przeglądarka potraktowałaby to jako ścieżkę względną i próbowała otworzyć
    // podstronę panelu zamiast strony partnera.
    odnosnik: v => /^https?:\/\//i.test(v) ? v : `https://${v}`,
    nowaKarta: true,
  },
};

export const PodgladKontaktu: React.FC<{
  rodzaj: RodzajKontaktu;
  wartosc: string | null | undefined;
  /** Podpis nad wartością, gdy domyślny nie wystarcza (np. „Handlowy”). */
  etykieta?: string;
}> = ({ rodzaj, wartosc, etykieta }) => {
  const [skopiowane, setSkopiowane] = useState(false);
  const przepis = PRZEPIS[rodzaj];
  const Ikona = przepis.ikona;
  const czysta = wartosc?.trim();

  if (!czysta) {
    return (
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-md opacity-30"
        title={`Brak: ${(etykieta || przepis.etykieta).toLowerCase()}`}
      >
        <Ikona className="h-3.5 w-3.5" />
      </span>
    );
  }

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(czysta);
      setSkopiowane(true);
      setTimeout(() => setSkopiowane(false), 1500);
    } catch { /* schowek bywa zablokowany — cisza jest lepsza niż fałszywy błąd */ }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button data-w-odczycie=""
          // Wiersz listy jest klikalny i prowadzi w głąb. Bez zatrzymania
          // zdarzenia klik w ikonę otwierałby kartę ZAMIAST podglądu — czyli
          // dokładnie to, czego ten klocek ma oszczędzić.
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors"
          title={etykieta || przepis.etykieta}
        >
          <Ikona className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="center" side="top" onClick={e => e.stopPropagation()}>
        <div className="text-xs text-muted-foreground">{etykieta || przepis.etykieta}</div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate flex-1">{czysta}</span>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={kopiuj}>
            {skopiowane
              ? <Check className="h-3.5 w-3.5 text-green-500" />
              : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <Button size="sm" variant="outline" className="w-full" asChild>
          <a
            href={przepis.odnosnik(czysta)}
            {...(przepis.nowaKarta ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          >
            {przepis.akcja}
          </a>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default PodgladKontaktu;
