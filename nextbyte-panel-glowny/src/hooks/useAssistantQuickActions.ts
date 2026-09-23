import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QuickAction {
  id: string;
  label: string;
  icon: string; // lucide icon name
  prompt: string;
  isDefault?: boolean;
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'default-plan-dnia',
    label: 'Plan dnia',
    icon: 'CalendarClock',
    isDefault: true,
    prompt:
      'Wygeneruj mi plan wykonania na dziś na podstawie moich aktualnych zadań i zaplanuj serię wydarzeń w kalendarzu w wolnych slotach (godziny 9-18, omijając zajęte). Najpierw pobierz moje zadania (todo + in_progress) oraz dzisiejszy kalendarz, wybierz 3-6 najważniejszych zadań na dziś, dobierz długości bloków według priorytetu i utwórz dla każdego propozycję wydarzenia z prefiksem "📋 ". Na końcu krótko uzasadnij układ.',
  },
  {
    id: 'default-podsumowanie-dnia',
    label: 'Podsumowanie dnia',
    icon: 'BarChart3',
    isDefault: true,
    prompt:
      'Podsumuj mi co dziś zrobiłem na podstawie ukończonych zadań, wydarzeń w kalendarzu i ostatnich notatek. Wypunktuj kluczowe osiągnięcia oraz wypisz co zostało do zrobienia na jutro.',
  },
  {
    id: 'default-next-tasks',
    label: 'Następne zadania',
    icon: 'ListChecks',
    isDefault: true,
    prompt:
      'Pokaż mi 5 najważniejszych zadań na najbliższy tydzień posortowanych według priorytetu i terminu. Dodaj krótkie uzasadnienie kolejności i zaznacz zadania zaległe.',
  },
  {
    id: 'default-nowa-notatka',
    label: 'Nowa notatka',
    icon: 'Lightbulb',
    isDefault: true,
    prompt:
      'Zapisz nową notatkę z moim pomysłem. Najpierw zapytaj mnie krótko o tytuł i treść, a następnie dodaj ją do moich notatek w odpowiednim folderze.',
  },
];

const EVT = 'assistantQuickActionsUpdated';

const keyForUser = (uid: string | null) =>
  `nb_assistant_quick_actions_${uid || 'anon'}`;

const loadCustom = (uid: string | null): QuickAction[] => {
  try {
    const raw = localStorage.getItem(keyForUser(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const useAssistantQuickActions = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [custom, setCustom] = useState<QuickAction[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      setCustom(loadCustom(uid));
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => setCustom(loadCustom(userId));
    window.addEventListener(EVT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener('storage', handler);
    };
  }, [userId]);

  const persist = useCallback(
    (next: QuickAction[]) => {
      try {
        localStorage.setItem(keyForUser(userId), JSON.stringify(next));
      } catch {}
      setCustom(next);
      window.dispatchEvent(new CustomEvent(EVT));
    },
    [userId]
  );

  const addAction = useCallback(
    (action: Omit<QuickAction, 'id' | 'isDefault'>) => {
      const next: QuickAction = {
        ...action,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      persist([...custom, next]);
      return next;
    },
    [custom, persist]
  );

  const updateAction = useCallback(
    (id: string, patch: Partial<Omit<QuickAction, 'id' | 'isDefault'>>) => {
      persist(custom.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [custom, persist]
  );

  const removeAction = useCallback(
    (id: string) => {
      persist(custom.filter((a) => a.id !== id));
    },
    [custom, persist]
  );

  return {
    defaults: DEFAULT_QUICK_ACTIONS,
    custom,
    all: [...DEFAULT_QUICK_ACTIONS, ...custom],
    addAction,
    updateAction,
    removeAction,
  };
};
