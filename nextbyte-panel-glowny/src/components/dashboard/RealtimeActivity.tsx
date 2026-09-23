import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, Trophy, Building2, Bell, Sparkles, Check, X } from 'lucide-react';
import { useRealtimeActivity, ActivityType } from '@/hooks/useRealtimeActivity';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { hotCache } from '@/lib/hotMemoryCache';
import { Tile, TileHeader, TileRow } from '@/components/ui/tile';
import { Szkielet, PustyStan } from '@/components/ui/stany';
import { Plakietka } from '@/components/ui/plakietka';
import { cn } from '@/lib/utils';

/**
 * ZAKŁADKI GRUP — ten sam język co filtry w „Wróć do roboty" (11.08.2026,
 * Michał: „zmień też w taki sposób zakładkę aktywność live"): wszystkie
 * widoczne naraz, ikony z kolorem, nazwa w title/aria-label. Siedemnaście
 * typów zdarzeń to za dużo na osobne zakładki — grupujemy po tym, PO CO
 * człowiek zagląda do dziennika: co stworzyłem / co dostałem / co w firmie /
 * co wymaga uwagi.
 */
const GRUPY: Array<{
  klucz: string; etykieta: string; ikona: any; kolor: string; tlo: string;
  typy: ActivityType[];
}> = [
  { klucz: 'tworczosc', etykieta: 'Twórczość', ikona: Sparkles,
    kolor: 'text-violet-400', tlo: 'bg-violet-500/15',
    typy: ['tworczosc', 'chat', 'template', 'ai_proposal', 'course'] },
  { klucz: 'nagrody', etykieta: 'Nagrody i konto', ikona: Trophy,
    kolor: 'text-amber-400', tlo: 'bg-amber-500/15',
    typy: ['level', 'achievement', 'byte', 'konto'] },
  { klucz: 'firma', etykieta: 'Firma i zespół', ikona: Building2,
    kolor: 'text-sky-400', tlo: 'bg-sky-500/15',
    typy: ['team', 'invitation', 'company_task', 'work_shift'] },
  { klucz: 'powiadomienia', etykieta: 'Powiadomienia i zaproszenia', ikona: Bell,
    kolor: 'text-rose-400', tlo: 'bg-rose-500/15',
    typy: ['notification', 'calendar_invite', 'note_invite', 'folder_invite'] },
];

/**
 * KOLUMNA IKON PRZY WPISACH USUNIĘTA (11.08.2026, Michał: „pytanie czy te
 * ikonki są potrzebne bo miejsce zabierają"). Miał rację podwójnie:
 * na jego zrzucie stało DZIEWIĘĆ identycznych gwiazdek — ikona wspólna dla
 * całej grupy niczego nie różnicuje, a różnicowanie i tak robi treść
 * (wpisy twórczości niosą własne emoji: „📝 Notatka:", „🖼️ Wygenerowany
 * obraz:") oraz zakładki grup nad listą. Ikona bez informacji to czysty
 * koszt: ~24 px szerokości z każdego wiersza w kolumnie ~330 px.
 * Poprzednia mapa 17 typów→ikon żyła tylko dla tej kolumny — poszła z nią.
 */

/** Status jako kropka + tekst. Pudełko Badge przy KAŻDYM wpisie robiło z listy
    zdarzeń ścianę ramek — meta ma być tłem, nie konkurencją dla treści. */
const statusDot = {
  success: 'bg-primary',
  pending: 'bg-muted-foreground/50',
  info: 'bg-primary/40'
};

const statusLabels = {
  success: 'Zakończono',
  pending: 'Oczekuje',
  info: 'Nowe'
};

export function RealtimeActivity() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activities, setActivities, isLoading, refreshActivities } = useRealtimeActivity();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [filtrGrupy, setFiltrGrupy] = useState<string | null>(null);

  // Deklaracje PRZED filtrem: `filter` woła je synchronicznie, a `const`
  // zadeklarowany niżej jeszcze nie istnieje (strefa martwa) — pierwszy
  // oczekujący wpis wywracał cały strumień.
  const isInviteType = (type: ActivityType) =>
    type === 'calendar_invite' || type === 'note_invite' || type === 'folder_invite';

  const isCompanyInvite = (activity: { type: ActivityType; status: string; metadata?: Record<string, any> }) =>
    activity.type === 'invitation' && activity.status === 'pending' && activity.metadata?.token;

  const logActivities = activities.filter(activity => {
    if (activity.status !== 'pending') return true;
    if (isInviteType(activity.type)) return false;
    if (isCompanyInvite(activity)) return false;
    return true;
  });

  const handleCompanyInviteAction = async (
    e: React.MouseEvent, activityId: string, token: string, companyId: string, action: 'accept' | 'reject'
  ) => {
    e.stopPropagation();
    setProcessingIds(prev => new Set(prev).add(activityId));
    // Optimistically update the activity to remove action buttons immediately
    const invId = activityId.replace('inv-', '');
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const companyName = activities.find(a => a.id === activityId)?.metadata?.companyName || 'firma';

    setActivities(prev => prev.map(a => 
      a.id === activityId 
        ? { 
            ...a, 
            status: action === 'accept' ? 'success' as const : 'info' as const,
            message: action === 'accept' ? `Dołączono do firmy: ${companyName}` : `Odrzucono zaproszenie: ${companyName}`,
            metadata: undefined 
          }
        : a
    ));

    try {
      if (action === 'accept') {
        const { data, error } = await supabase.functions.invoke('manage-company-member', {
          body: { action: 'accept_invitation', invitation_token: token },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        // Ensure invitation status is updated in DB as fallback
        await supabase.from('company_invitations').update({ status: 'accepted' } as any).eq('id', invId);
        hotCache.delete('user-companies');
        hotCache.delete('user-companies-admin');
        queryClient.refetchQueries({ queryKey: ['user-invitations'] });
        queryClient.refetchQueries({ queryKey: ['user-companies'] });
        queryClient.invalidateQueries({ queryKey: ['user-company-status'] });
        toast.success('Zaproszenie zaakceptowane! 🎉');
        const { data: company } = await supabase.from('companies').select('slug').eq('id', companyId).single();
        if (company?.slug) navigate(`/firma/${company.slug}/panel`);
      } else {
        const { error } = await supabase.from('company_invitations').update({ status: 'rejected' } as any).eq('id', invId);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
        toast.success('Zaproszenie odrzucone');
      }
      await refreshActivities();
    } catch (err: any) {
      console.error('Error handling company invite:', err);
      // Rollback optimistic update
      await refreshActivities();
      toast.error(err?.message || 'Nie udało się przetworzyć zaproszenia');
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
    }
  };

  const handleInviteAction = async (
    e: React.MouseEvent, activityId: string, table: string, inviteId: string, action: 'accepted' | 'rejected'
  ) => {
    e.stopPropagation();
    setProcessingIds(prev => new Set(prev).add(activityId));
    try {
      const { error } = await supabase.from(table as any).update({ status: action }).eq('id', inviteId);
      if (error) throw error;
      toast.success(action === 'accepted' ? 'Zaproszenie zaakceptowane!' : 'Zaproszenie odrzucone');
      await refreshActivities();
    } catch (err) {
      console.error('Error handling invite:', err);
      toast.error('Nie udało się przetworzyć zaproszenia');
    } finally {
      setProcessingIds(prev => { const next = new Set(prev); next.delete(activityId); return next; });
    }
  };

  const handleActivityClick = (type: ActivityType) => {
    const routes: Partial<Record<ActivityType, string>> = {
      chat: '/chat-ai', team: '/zespol', template: '/szablony', course: '/akademia',
      level: '/konto', achievement: '/konto', invitation: '/firma', byte: '/konto',
      notification: '/aktualnosci', company_task: '/zadania', work_shift: '/firma',
      ai_proposal: '/asystent-nextbyte', calendar_invite: '/kalendarz',
      note_invite: '/notatki', folder_invite: '/notatki'
    };
    const route = routes[type];
    if (route) navigate(route);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'przed chwilą';
    if (diffMins < 60) return `${diffMins}min temu`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h temu`;
    /* Rok DOPISUJEMY tylko wtedy, gdy jest inny niż bieżący. „01.08.2026"
       w kolumnie o szerokości ~330 px zabierało 30 px na informację, którą
       czytelnik i tak zna — a te 30 px szły z treści wpisu. */
    const bierzacyRok = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('pl-PL',
      bierzacyRok
        ? { day: '2-digit', month: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderCardShell = (children: React.ReactNode) => (
    /* Ten sam limit co w `WrocDoRoboty` — pełne uzasadnienie i pomiar tam.
       Tu było najgorzej: 1332 px i 20 wierszy bez wewnętrznego scrolla. */
    <Tile intencja="akcent" className="flex max-h-[60dvh] ekran1:max-h-none h-full flex-col">
      <TileHeader
        ikona={Activity}
        tytul="Aktywność Live"
        poPrawej={
          <Plakietka
            intencja={logActivities.length > 0 ? 'akcent' : 'neutralna'}
            kropka
            zywa={logActivities.length > 0}
          >
            Na żywo
          </Plakietka>
        }
      />
      {children}
    </Tile>
  );

  if (isLoading) {
    // Szkielet ma kształt docelowej listy: kółko ikony + dwie linijki wpisu.
    return renderCardShell(
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-2.5">
            <Szkielet wierszy={1} ksztalt="kolo" className="shrink-0" />
            <Szkielet wierszy={2} className="flex-1 pt-1.5" />
          </div>
        ))}
      </div>
    );
  }

  if (logActivities.length === 0) {
    return renderCardShell(
      <PustyStan
        ikona={Sparkles}
        tytul="Brak aktywności"
        opis="Gdy zaczniesz korzystać z platformy — rozmowy z AI, zaproszenia, nagrody — zobaczysz je tutaj na żywo."
      />
    );
  }

  /* Zakładki widać ZAWSZE w komplecie (Michał, 11.08: „chciałbym aby każda
     zakładka była tam widoczna") — interfejs nie skacze zależnie od tego,
     co akurat jest w dzienniku. Grupa bez wpisów jest wyszarzona
     i nieklikalna z wyjaśnieniem w title: mapa cała, w pustkę nie wejdziesz. */
  const wpisyGrupy = (g: (typeof GRUPY)[number]) =>
    logActivities.filter((a) => g.typy.includes(a.type)).length;
  const widoczneWpisy = filtrGrupy
    ? logActivities.filter((a) => GRUPY.find((g) => g.klucz === filtrGrupy)?.typy.includes(a.type))
    : logActivities;

  return renderCardShell(
    <>
      <div className="mb-2.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFiltrGrupy(null)}
          className={cn(
            'shrink-0 rounded-lg border px-2 py-1 text-[11px] leading-none transition-colors',
            filtrGrupy === null
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30',
          )}
        >
          Wszystko
        </button>
        {GRUPY.map((g) => {
          const Ikona = g.ikona;
          const ile = wpisyGrupy(g);
          const pusta = ile === 0;
          return (
            <button
              key={g.klucz}
              type="button"
              disabled={pusta}
              onClick={() => setFiltrGrupy(filtrGrupy === g.klucz ? null : g.klucz)}
              aria-label={g.etykieta}
              aria-pressed={filtrGrupy === g.klucz}
              title={pusta ? `${g.etykieta} — brak wpisów` : g.etykieta}
              className={cn(
                'flex h-[22px] w-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
                pusta && 'cursor-default opacity-35',
                filtrGrupy === g.klucz
                  ? cn('border-primary/40', g.tlo, g.kolor)
                  : 'border-border text-muted-foreground',
                !pusta && filtrGrupy !== g.klucz && 'hover:border-primary/30',
              )}
            >
              <Ikona className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      {/* Wysokość z układu, nie z liczby wpisanej ręcznie: `max-h-[232px]`
          zostawiało puste pół kolumny na wysokim ekranie i tak samo dusiło
          listę na niskim. Teraz dziennik bierze tyle, ile zostało w kolumnie. */}
      <div className="-mr-1 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
        {widoczneWpisy.map((activity) => {
          const isPendingInvite = isInviteType(activity.type) && activity.status === 'pending';
          const isPendingCompanyInvite = isCompanyInvite(activity);
          const hasActionButtons = isPendingInvite || isPendingCompanyInvite;
          const isProcessing = processingIds.has(activity.id);

          return (
            <TileRow
              key={activity.id}
              className={!hasActionButtons
                ? 'cursor-pointer transition-colors hover:border-primary/40 hover:bg-foreground/[0.06]'
                : 'items-start'}
              onClick={() => !hasActionButtons && handleActivityClick(activity.type)}
              poPrawej={
                /* SŁOWO STATUSU TYLKO WTEDY, GDY COŚ ZNACZY.
                   „Zakończono" stoi przy niemal każdym wpisie — to stan
                   domyślny, więc nie niesie informacji, a zabiera miejsce.
                   Zmierzone 04.08.2026 przy 1280×800: kolumna dziennika ma
                   ~330 px, z czego „• Zakończono · 01.08.2026" brało ~140 px
                   i treść wpisu ucinała się do „Notatk…". Kropka koloru
                   zostaje zawsze (niesie ten sam stan bez słowa), a pełna
                   nazwa siedzi w `title` dla czytników ekranu.
                   „Oczekuje" i „Nowe" pokazujemy wprost — te wymagają reakcji. */
                <span
                  className="inline-flex items-center gap-1.5"
                  title={statusLabels[activity.status]}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[activity.status]}`} aria-hidden />
                  {activity.status !== 'success' && (
                    <>
                      {statusLabels[activity.status]}
                      <span aria-hidden>·</span>
                    </>
                  )}
                  <span className="tabular-nums text-muted-foreground">{formatTime(activity.timestamp)}</span>
                </span>
              }
            >
              {/* `whitespace-normal` zdejmuje nowrap wiersza — treść zdarzenia
                  ma prawo do dwóch linii, meta zostaje w jednej.

                  BEZ `block`. Ta klasa ustawia `display: block` i WYGRYWA
                  z `display: -webkit-box`, którego wymaga `-webkit-line-clamp`.
                  Efekt zmierzony 04.08.2026: klamra była martwa, a wiersz
                  z długim promptem generacji miał 272 px zamiast ~50 px —
                  jeden wpis zjadał cały widoczny dziennik. Ten sam rodzaj
                  kolizji co `flex` vs `flex-col` w banerze Nowości: dwie klasy
                  spierają się o `display`, a wygrywa kolejność w arkuszu. */}
              <span className="whitespace-normal line-clamp-2 font-medium leading-snug">
                {activity.message}
              </span>
              {isPendingCompanyInvite && (
                <span className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="obwodka" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={(e) => handleCompanyInviteAction(e, activity.id, activity.metadata!.token, activity.metadata!.companyId, 'accept')}>
                    <Check className="w-3 h-3 mr-1" />Akceptuj
                  </Button>
                  <Button size="sm" variant="usun" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={(e) => handleCompanyInviteAction(e, activity.id, activity.metadata!.token, activity.metadata!.companyId, 'reject')}>
                    <X className="w-3 h-3 mr-1" />Odrzuć
                  </Button>
                </span>
              )}
              {isPendingInvite && activity.metadata?.inviteId && activity.metadata?.table && (
                <span className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="obwodka" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={(e) => handleInviteAction(e, activity.id, activity.metadata!.table, activity.metadata!.inviteId, 'accepted')}>
                    <Check className="w-3 h-3 mr-1" />Akceptuj
                  </Button>
                  <Button size="sm" variant="usun" className="h-7 px-3 text-xs" disabled={isProcessing} onClick={(e) => handleInviteAction(e, activity.id, activity.metadata!.table, activity.metadata!.inviteId, 'rejected')}>
                    <X className="w-3 h-3 mr-1" />Odrzuć
                  </Button>
                </span>
              )}
            </TileRow>
          );
        })}
      </div>

      {/* Stopka „Ostatnia aktualizacja" USUNIĘTA 03.08.2026 — pokazywała czas
          NAJNOWSZEGO WPISU pod etykietą sugerującą świeżość danych. Przy
          dzienniku, który jedzie na żywo, czytało się to jako „ten kafelek nie
          odświeżył się od dwóch dni", a ten sam czas stoi w pierwszym wierszu
          listy. Etykieta kłamiąca o świeżości danych jest gorsza niż jej brak. */
      }
    </>
  );
}
