import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Plakietka } from '@/components/ui/plakietka';
import { useCompanyBytePool } from '@/hooks/useCompanyBytePool';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ETYKIETA KOSZTU BYTE — „3 Byte z puli firmy · w puli 942”
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (24.09.2026): w panelu firmowym AI ma uczciwie pokazywać koszty — przed
 * kliknięciem, nie po fakcie. Do tego dnia cenę pisało dziewięć różnych własnych
 * napisów (`text-[9px] opacity-60 bg-muted/30 …`, `Badge`, luźny `<span>`), a jedenaście
 * akcji nie mówiło o niej wcale. Ten komponent jest jedną odpowiedzią na oba braki.
 *
 * Liczby pochodzą z `lib/firma-klienta/kosztyAi.ts` (jedno źródło, test parytetu z edge);
 * ekran tylko pokazuje — pobiera serwer. Saldo dopisuje się z `useCompanyBytePool`, tym
 * samym kluczem, który moduł unieważnia po każdym pobraniu, więc po akcji liczba spada sama.
 *
 * Trzy postaci:
 *   wiersz  — linijka meta pod albo obok przycisku (domyślna);
 *   pigulka — plakietka do wnętrza przycisku, sama liczba;
 *   dymek   — nie komponent, a zdanie z `tekstKosztuByte` doklejane do `opis` w `Dymek`
 *             (w Panelu Klienta pod przyciskiem nie ma podpisów — STANDARD-WYGLADU §2).
 */

/** Zdanie o koszcie: liczba, reguła słowna albo „bez pobrania”, gdy akcja nic nie kosztuje. */
export const tekstKosztuByte = (byte: number | null, regula?: string): string =>
  byte === null
    ? `${regula ?? 'koszt zależny od wejścia'} (z puli firmy)`
    : byte === 0
      ? 'bez pobrania Byte'
      : `${byte} Byte z puli firmy`;

export interface EtykietaKosztuByteProps {
  /** Byte za jedno wywołanie; `null` = zależy od wejścia (pokazuje `regula`); `0` = bez opłaty. */
  byte: number | null;
  /** Reguła słowna, gdy liczby nie da się znać z góry („od 1 Byte — reszta wg długości”). */
  regula?: string;
  /** Firma, której saldo dopisać („· w puli 942”). Bez niej sama cena. */
  companyId?: string;
  wariant?: 'wiersz' | 'pigulka';
  className?: string;
}

/** Etykieta kosztu akcji AI z puli firmy: „3 Byte z puli firmy · w puli 942” — liczby z lib/firma-klienta/kosztyAi.ts. */
export const EtykietaKosztuByte: React.FC<EtykietaKosztuByteProps> = ({ byte, regula, companyId, wariant = 'wiersz', className }) => {
  const { data: pula } = useCompanyBytePool(companyId);
  const tekst = tekstKosztuByte(byte, regula);

  if (wariant === 'pigulka') {
    return (
      <Plakietka intencja="akcent" rozmiar="mala" className={cn('normal-case tracking-normal', className)} aria-label={tekst}>
        {byte === null ? 'Byte wg wejścia' : byte === 0 ? 'bez Byte' : `${byte} Byte`}
      </Plakietka>
    );
  }

  return (
    <span className={cn('inline-flex min-w-0 flex-wrap items-center gap-x-1 text-meta text-muted-foreground tabular-nums', className)}>
      <Zap aria-hidden="true" className="h-3 w-3 shrink-0" />
      <span>{tekst}</span>
      {pula && <span className="text-muted-foreground/70">· w puli {pula.total.toLocaleString('pl-PL')}</span>}
    </span>
  );
};

export default EtykietaKosztuByte;
