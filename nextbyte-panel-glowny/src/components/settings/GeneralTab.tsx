import React from 'react';
import { BookOpen, RotateCcw, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedBorderInput } from '@/components/ui/animated-border-input';
import { cn } from '@/lib/utils';
import { klasyKafelka } from '@/components/ui/tile';

interface GeneralTabProps {
  onRestartOnboarding?: () => void;
  name: string;
  setName: (name: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  email: string;
  setEmail: (email: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function GeneralTab({ 
  onRestartOnboarding,
  name,
  setName,
  lastName,
  setLastName,
  email,
  setEmail,
  onSave,
  onCancel,
  isSaving
}: GeneralTabProps) {
  /*
    NAZWA MÓWIŁA „glassCard", A MATERIAŁU NIE BYŁO.

    Ten sam wzorzec co `GlassSection` na stronie Planu: gradient akcentu plus
    `via-card/40`, czyli nieprzezroczysty przystanek pośrodku, który zasłania
    wszystko pod spodem — więc nawet gdyby szkło tu było, nie miałoby czego
    załamywać. Zmierzone: tło `rgba(0,0,0,0)` i zero `backdrop-filter`.

    `klasyKafelka` to ta sama funkcja, z której korzysta `Tile`, więc sekcja
    Ustawień jest odtąd z tego samego źródła co każda karta platformy.
  */
  const glassCard = cn(
    klasyKafelka({ intencja: 'akcent' }),
    'relative overflow-hidden border-primary/20 p-4 sm:p-4',
    'bg-gradient-to-br from-primary/[0.08] to-primary/[0.03]',
    'shadow-[0_4px_24px_hsl(var(--primary)/0.12)]',
  );
  return (
    /*
      ══════════════════════════════════════════════════════════════════════
       DANE I SAMOUCZEK OBOK SIEBIE (06.08.2026)
      ══════════════════════════════════════════════════════════════════════

      Michał zaznaczył to na zrzucie: „Imię", „Nazwisko" i „Adres email"
      zajmowały lewą stronę, prawa stała pusta, a Samouczek — mała karta
      z jednym przyciskiem — leżał POD nimi, znowu przez całą szerokość.
      Dwie karty zjadały dwa piętra ekranu, mając obok siebie wolne pół.

      Siatka `lg:grid-cols-3`: dane biorą dwie kolumny (mieszczą Imię
      i Nazwisko obok siebie), Samouczek jedną. Poniżej `lg` wraca układ
      jeden pod drugim, bo przy wąskim ekranie trzy kolumny robią z pól
      nieczytelne paski.
    */
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-start">
      {/* Profile Form */}
      <div className={cn(glassCard, 'lg:col-span-2')}>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatedBorderInput
              id="name"
              label="Imię"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Twoje imię"
              autoComplete="given-name"
            />
            <AnimatedBorderInput
              id="lastName"
              label="Nazwisko"
              icon={User}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Twoje nazwisko"
              autoComplete="family-name"
            />
          </div>

          <AnimatedBorderInput
            id="email"
            type="email"
            label="Adres email"
            icon={Mail}
            value={email}
            onChange={() => {}}
            placeholder="twoj@email.com"
            autoComplete="email"
            disabled
            className="opacity-60 cursor-not-allowed"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-primary/10">
            <Button
              variant="cichy"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="h-8"
            >
              Anuluj
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              variant="glass"
              className="h-8"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Zapisuję...
                </>
              ) : (
                'Zapisz zmiany'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Powiadomienia push przeniesione do zakładki „Powiadomienia", Przycisk
          Paniki do „Bezpieczeństwa" (06.08.2026). Po wyjęciu treści została tu
          PUSTA KARTA — samo tło z połyskiem, bez zawartości — i było ją widać
          na ekranie jako niewyjaśniony pasek między danymi konta a Samouczkiem.
          Skasowana. */}

      {/* Tutorial / Onboarding restart */}
      <div className={glassCard}>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">Samouczek</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Przejdź ponownie przez wprowadzenie do aplikacji, aby poznać wszystkie funkcje i możliwości.
            </p>
            <Button
              variant="obwodka"
              size="sm"
              onClick={onRestartOnboarding}
              className="h-8 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Uruchom samouczek ponownie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

