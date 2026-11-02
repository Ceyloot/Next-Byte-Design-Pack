import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Biblioteka — odczyt motywów do podglądu.
 *
 * WYŁĄCZNIE SELECT. Podgląd nigdy nie zapisuje do bazy i nie zmienia
 * motywu użytkownika — od tego jest `useGlobalTheme`. Tutaj tylko czytamy,
 * żeby pokazać, jak komponent wygląda w każdym z motywów.
 */

export interface MotywPodgladu {
  id: string;
  name: string;
  displayName: string;
  bytePrice: number | null;
  isPurchasable: boolean;
  /** css_variable -> hsl_value, np. '--primary' -> '204 72% 65%' */
  zmienne: Record<string, string>;
}

/**
 * Zmienne, które ustawia KAŻDY z aktywnych motywów — zweryfikowane zapytaniem
 * do bazy 29.07.2026 (14 z 14 motywów). Tylko na tych wolno budować komponenty:
 * wszystko poza tą listą zadziała u części użytkowników, a u reszty odziedziczy
 * wartość z `:root`, czyli z motywu domyślnego.
 */
export const BEZPIECZNE_ZMIENNE = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--accent', '--accent-foreground',
  '--muted', '--muted-foreground',
  '--border', '--input', '--ring',
  '--destructive', '--destructive-foreground',
  '--brand-primary', '--brand-primary-light', '--brand-primary-dark',
] as const;

/**
 * Zmienne ustawiane tylko przez CZĘŚĆ motywów — liczba to ile z 14 je definiuje.
 * Użycie ich bez fallbacku sprawia, że wygląd zależy od tego, jaki motyw ktoś kupił.
 */
export const RYZYKOWNE_ZMIENNE: Record<string, number> = {
  '--sidebar-accent': 13, '--sidebar-accent-foreground': 13, '--sidebar-border': 13,
  '--sidebar-foreground': 13, '--sidebar-primary': 13, '--sidebar-primary-foreground': 13,
  '--sidebar-ring': 10,
  '--brand-text-primary': 9, '--brand-text-secondary': 9, '--brand-text-tertiary': 8,
  '--sidebar-background': 8,
  '--brand-primary-glow': 7, '--brand-text-muted': 7,
  '--chart-1': 7, '--chart-2': 7, '--chart-3': 7, '--chart-4': 7, '--chart-5': 7,
  '--sidebar': 5,
  '--brand-bg': 1, '--brand-gray-100': 1, '--brand-gray-50': 1,
};

export function useMotywyPodgladu() {
  const [motywy, setMotywy] = useState<MotywPodgladu[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [blad, setBlad] = useState<string | null>(null);

  useEffect(() => {
    let anulowane = false;

    (async () => {
      try {
        const { data: themes, error: e1 } = await supabase
          .from('color_themes')
          .select('id, name, display_name, byte_price, is_purchasable')
          .eq('is_active', true)
          .order('byte_price', { ascending: true });
        if (e1) throw e1;

        const { data: kolory, error: e2 } = await supabase
          .from('color_settings')
          .select('theme_id, css_variable, hsl_value');
        if (e2) throw e2;

        const wgTematu = new Map<string, Record<string, string>>();
        for (const k of (kolory ?? []) as { theme_id: string; css_variable: string; hsl_value: string }[]) {
          if (!k.theme_id) continue;
          const b = wgTematu.get(k.theme_id) ?? {};
          b[k.css_variable] = k.hsl_value;
          wgTematu.set(k.theme_id, b);
        }

        if (anulowane) return;
        setMotywy(((themes ?? []) as any[]).map((t) => ({
          id: t.id,
          name: t.name,
          displayName: t.display_name || t.name,
          bytePrice: t.byte_price ?? null,
          isPurchasable: !!t.is_purchasable,
          zmienne: wgTematu.get(t.id) ?? {},
        })));
      } catch (err: any) {
        if (!anulowane) setBlad(err?.message || 'Nie udało się wczytać motywów.');
      } finally {
        if (!anulowane) setLadowanie(false);
      }
    })();

    return () => { anulowane = true; };
  }, []);

  return { motywy, ladowanie, blad };
}
