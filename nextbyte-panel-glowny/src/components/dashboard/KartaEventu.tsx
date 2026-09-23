import React from 'react';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { Button } from '@/components/ui/button';
import { wypelnieniePaska, TOR_PASKA } from '@/components/ui/material-paska';
import {
  useEventTasks, useUserTaskProgress, useUserEventProgress,
  useEventRewardsWithDetails, useCanClaimRewards,
} from '@/hooks/useEventRewards';
import { KafelkiNagrod, type NagrodaZeSzczegolami } from './KafelkiNagrod';
import { Gift, Check, Circle } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KARTA EVENTU — postęp zamiast samej nazwy
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „eventy i nagrody bym przerobił — to event w wersji beta, gdzie
 * do odebrania po ogarnięciu zadań są nagrody. Fajnie aby zrobić to ładniej".
 *
 * ── CO BYŁO NIE TAK ─────────────────────────────────────────────────────
 * Poprzednia karta zajmowała ćwiartkę Panelu Głównego i mówiła dokładnie
 * dwie rzeczy: „1 aktywny" i „Beta Tester". Ani słowa o tym, CO trzeba
 * zrobić, ile już zrobione i co jest do odebrania — czyli o wszystkim, co
 * decyduje, czy człowiek w to wejdzie. Przycisk „Zobacz nagrody" rozwijał
 * panel niżej, więc żeby dowiedzieć się czegokolwiek, trzeba było kliknąć.
 *
 * ── CO POKAZUJE TERAZ ───────────────────────────────────────────────────
 * Postęp („2 z 3 zadań"), pasek, listę zadań ze stanem odhaczenia i nagrody
 * czekające na odbiór. Cel jest jeden: żeby dało się w dwie sekundy
 * odpowiedzieć na pytanie „ile mi brakuje".
 *
 * Pasek jedzie tym samym materiałem, co reszta platformy (`material-paska`),
 * a nie własnym gradientem — inaczej ten jeden pasek wyglądałby jak wklejony
 * z innego produktu.
 *
 * ── STAN „WSZYSTKO ZROBIONE" JEST OSOBNY ────────────────────────────────
 * Gdy zadania są odhaczone, a nagroda nieodebrana, karta przestaje pokazywać
 * postęp i zamienia się w jedno wezwanie do odbioru. Pasek w 100% obok
 * przycisku „Odbierz" to informacja zbędna — a przy nagrodzie liczy się to,
 * żeby jej nie przegapić.
 */

interface Props {
  eventId: string;
  nazwa: string;
  /** Otwiera pełny panel nagród pod kartą — szczegóły i odbiór. */
  onOtworz: () => void;
  /**
   * Tryb kafelka — sam nagłówek, pasek i przycisk, bez listy zadań i nagród.
   *
   * Powód (zmierzone 03.08.2026): pełna karta miała 581 px, czyli WIĘCEJ niż
   * skrzynka spraw obok (288 px). Event — rzecz jednorazowa, po odebraniu
   * nagrody już tylko pamiątka — był największym elementem centrum zarządzania.
   * Szczegóły i odbiór nagród nie znikają: rozwijają się w środkowej kolumnie
   * po kliknięciu, czyli wtedy, gdy człowiek faktycznie o nie prosi.
   */
  zwarty?: boolean;
}

export const KartaEventu: React.FC<Props> = ({ eventId, nazwa, onOtworz, zwarty = false }) => {
  const { data: zadania = [] } = useEventTasks(eventId);
  const { data: postepZadan = [] } = useUserTaskProgress(eventId);
  const { data: postep } = useUserEventProgress(eventId);
  const { data: nagrody = [] } = useEventRewardsWithDetails(eventId);
  const mozeOdebrac = useCanClaimRewards(eventId);

  const zrobione = new Set(
    (postepZadan as any[]).filter((p) => p.status === 'completed').map((p) => p.task_id),
  );
  const wymagane = (zadania as any[]).filter((z) => z.is_required);
  const ileZrobione = wymagane.filter((z) => zrobione.has(z.id)).length;
  const procent = wymagane.length > 0 ? (ileZrobione / wymagane.length) * 100 : 0;
  const odebrane = (postep as any)?.status === 'completed';

  return (
    <Tile intencja={mozeOdebrac ? 'akcent' : 'neutralna'} className="h-full">
      <TileHeader
        ikona={Gift}
        tytul={nazwa}
        podtytul={
          odebrane
            ? 'Nagroda odebrana'
            : mozeOdebrac
              ? 'Wszystkie zadania zrobione — nagroda czeka'
              : `${ileZrobione} z ${wymagane.length} ${wymagane.length === 1 ? 'zadania' : 'zadań'}`
        }
        intencja={mozeOdebrac ? 'akcent' : 'neutralna'}
        poPrawej={<Plakietka intencja={mozeOdebrac ? 'akcent' : 'neutralna'}>beta</Plakietka>}
      />

      {/* Pasek postępu tylko dopóki jest czego pilnować — patrz komentarz wyżej. */}
      {!odebrane && (zwarty || !mozeOdebrac) && wymagane.length > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full" style={TOR_PASKA}>
          <div
            className="h-full rounded-full"
            style={wypelnieniePaska('hsl(var(--primary))', `${procent}%`)}
          />
        </div>
      )}

      {!zwarty && !odebrane && wymagane.length > 0 && (
        <ul className="mb-3 space-y-1.5">
          {wymagane.slice(0, 4).map((z: any) => {
            const gotowe = zrobione.has(z.id);
            return (
              <li key={z.id} className="flex items-start gap-2">
                {gotowe ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                )}
                {/* Zrobione zadanie przygasa, ale NIE jest przekreślone —
                    przekreślenie w liście nagród czyta się jak „unieważnione".

                    Opis obok tytułu, bo sam tytuł nie mówi, co zrobić:
                    „Komunikacja z AI" to nazwa kategorii, a warunkiem jest
                    „Napisz 50 wiadomości do AI". Bez tego zadanie jest
                    nie do wykonania bez wchodzenia w szczegóły. */}
                <span className="min-w-0">
                  <span className={`block text-[12px] leading-snug ${gotowe ? 'text-muted-foreground' : 'text-card-foreground'}`}>
                    {z.title}
                  </span>
                  {z.description && !gotowe && (
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {z.description}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* NAGRODY JAKO KAFELKI, NIE LICZBA — Michał: „aby się pokazywały te
          4 kafelki z informacjami co to i co to robi i po co to jest".
          „Do odebrania: 2 nagrody" nie mówi nic o tym, co się dostaje —
          a nikt nie zrobi trzech zadań dla czegoś, czego nie umie sobie
          wyobrazić. Szczegóły każdego typu: `KafelkiNagrod.tsx`. */}
      {!zwarty && nagrody.length > 0 && (
        <div className="mb-3">
          <h4 className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {odebrane ? 'Twoje nagrody' : `Do zdobycia (${nagrody.length})`}
          </h4>
          <KafelkiNagrod
            nagrody={nagrody as NagrodaZeSzczegolami[]}
            odblokowane={odebrane || mozeOdebrac}
          />
        </div>
      )}

      <Button
        variant={mozeOdebrac ? 'nextbyte' : 'obwodka'}
        size="sm"
        className="w-full"
        onClick={onOtworz}
      >
        {odebrane ? 'Zobacz nagrodę' : mozeOdebrac ? 'Odbierz nagrodę' : 'Zobacz szczegóły'}
      </Button>
    </Tile>
  );
};
