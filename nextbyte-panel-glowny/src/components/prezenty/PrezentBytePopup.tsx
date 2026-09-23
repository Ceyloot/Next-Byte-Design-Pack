import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuth';
import { Okno, OknoTresc, OknoNaglowek, OknoCialo, OknoStopka } from '@/components/ui/okno';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PREZENT BYTE OD ZESPOŁU — popup „Odbierz" po wejściu
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał (07.09.2026): „po wejściu popup mu się pokazuje z przyciskiem
 * Odbierz, ładny taki".
 *
 * Źródłem jest tabela `byte_prezenty` (wiersz na każde przyznanie przez
 * admina). Byte są już w portfelu — popup nie przelewa pieniędzy, tylko
 * oddaje człowiekowi CHWILĘ: ilość, słowo od zespołu, przycisk. Kliknięcie
 * wpisuje `odebrano_at`, odświeża saldo i odpala tę samą celebrację
 * z konfetti, którą platforma ma dla zakupów (`showByteReceived`).
 *
 * Dlaczego nie istniejąca celebracja sama: ona reaguje na transakcję
 * z ostatnich 30 sekund, więc kto nie był zalogowany w chwili przyznania,
 * nie zobaczyłby nic. Prezent czeka, aż człowiek wejdzie.
 *
 * Podgląd bez bazy (tylko DEV): `?prezent-demo=1`.
 */

interface Prezent {
  id: string;
  ilosc: number;
  opis: string | null;
  utworzono: string;
}

interface Props {
  /** celebracja z konfetti — podawana z kontekstu okien globalnych */
  onOdebrano?: (ilosc: number) => void;
}

const DEMO: Prezent = {
  id: 'demo',
  ilosc: 100,
  opis: 'Testy Platformy — dziękujemy za aktywność w Beta 4.0.0',
  utworzono: new Date().toISOString(),
};

export const PrezentBytePopup: React.FC<Props> = ({ onOdebrano }) => {
  const user = useAuthUser();
  const qc = useQueryClient();
  const [pracuje, ustawPracuje] = React.useState(false);
  const [demo, ustawDemo] = React.useState<Prezent | null>(() =>
    import.meta.env.DEV && typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).has('prezent-demo') ? DEMO : null);

  const { data: prezenty } = useQuery({
    queryKey: ['byte-prezenty', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    /* Zapas na wypadek, gdyby tabela nie była w publikacji realtime:
       osoba online i tak dostanie popup najpóźniej po 2 minutach. */
    refetchInterval: 120_000,
    queryFn: async () => {
      /* Filtr po WŁASNYM user_id, nie tylko RLS: admin ma politykę „Admin
         widzi prezenty" i bez filtra widział cudze nieodebrane prezenty
         (Michał 08.09: popup ze 100 ⟠ Grzegorza, „Odbierz" nie zamykało). */
      const { data, error } = await supabase
        .from('byte_prezenty' as never)
        .select('id, ilosc, opis, utworzono')
        .eq('user_id', user!.id)
        .is('odebrano_at', null)
        .order('utworzono', { ascending: true });
      if (error) {
        /* Brak tabeli przed migracją = brak prezentów, nie błąd na ekranie. */
        console.warn('[PrezentBytePopup]', error.message);
        return [] as Prezent[];
      }
      return (data ?? []) as unknown as Prezent[];
    },
  });

  /* NA ŻYWO (Michał 08.09: „a jak ktoś jest online?"): nowy wiersz w
     byte_prezenty dla tego użytkownika → odświeżamy listę → popup od razu,
     bez przeładowania. RLS przepuszcza tylko własne wiersze, filtr po
     user_id ogranicza ruch. */
  React.useEffect(() => {
    if (!user?.id) return;
    const kanal = supabase
      .channel(`byte-prezenty-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'byte_prezenty', filter: `user_id=eq.${user.id}` },
        () => { qc.invalidateQueries({ queryKey: ['byte-prezenty', user.id] }); })
      .subscribe();
    return () => { supabase.removeChannel(kanal); };
  }, [user?.id, qc]);

  const prezent = demo ?? prezenty?.[0] ?? null;
  const otwarte = !!prezent;

  const odbierz = async () => {
    if (!prezent) return;
    ustawPracuje(true);
    try {
      if (prezent.id !== 'demo') {
        /* `.select()` po update: RLS odfiltrowuje cudzy wiersz BEZ błędu
           (0 zaktualizowanych) — bez tej kontroli okno zostawało otwarte. */
        const { data: odebrane, error } = await supabase
          .from('byte_prezenty' as never)
          .update({ odebrano_at: new Date().toISOString() } as never)
          .eq('id', prezent.id)
          .eq('user_id', user!.id)
          .select('id');
        if (error) throw error;
        if (!odebrane || (odebrane as unknown[]).length === 0) throw new Error('prezent nie należy do tego konta albo już odebrany');
        await qc.invalidateQueries({ queryKey: ['byte-prezenty', user?.id] });
        await qc.invalidateQueries({ queryKey: ['wallet'] });
      } else {
        ustawDemo(null);
      }
      onOdebrano?.(prezent.ilosc);
    } catch (e) {
      toast.error('Nie udało się odebrać prezentu. Spróbuj ponownie.');
      console.error('[PrezentBytePopup]', e);
    } finally {
      ustawPracuje(false);
    }
  };

  return (
    <Okno open={otwarte} onOpenChange={() => { /* zamyka tylko „Odbierz" — prezent czeka */ }}>
      <OknoTresc intencja="akcent" rozmiar="maly" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
        <OknoNaglowek
          intencja="akcent"
          etykieta="Prezent od zespołu NextByte"
          tytul="Masz Byte do odebrania"
          podtytul="Zespół NextByte dołożył Byte do Twojego portfela."
          ikona={<Gift className="h-4 w-4" />}
          zZamknieciem={false}
        />
        <OknoCialo className="space-y-5">
          {/* Liczba jako bohater — jak w kafelkach salda */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 px-6 py-7 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
              style={{ background: 'radial-gradient(70% 100% at 50% 100%, hsl(var(--primary) / 0.28), transparent 70%)' }}
            />
            <div className="relative font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Otrzymujesz</div>
            <div className="relative mt-2 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-semibold tabular-nums tracking-tight text-foreground">{prezent?.ilosc.toLocaleString('pl-PL')}</span>
              <span className="text-3xl text-primary">⟠</span>
            </div>
            <div className="relative mt-1 text-xs text-muted-foreground">Byte do wykorzystania w każdym narzędziu</div>
          </div>

          {prezent?.opis && (
            <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Od zespołu</div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">{prezent.opis}</p>
            </div>
          )}
        </OknoCialo>
        <OknoStopka>
          <Button className="w-full sm:w-auto" onClick={odbierz} disabled={pracuje}>
            {pracuje ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            Odbierz
          </Button>
        </OknoStopka>
      </OknoTresc>
    </Okno>
  );
};

export default PrezentBytePopup;
