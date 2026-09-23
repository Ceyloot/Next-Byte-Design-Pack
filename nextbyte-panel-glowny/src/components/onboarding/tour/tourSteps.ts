export interface TourStep {
  target: string;
  mobileTarget?: string; // Alternative selector for mobile
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  mobilePosition?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  icon?: string;
  hideOnMobile?: boolean;
}

export const tourSteps: TourStep[] = [
  {
    target: '[data-sidebar="sidebar"]',
    mobileTarget: '[data-tour="mobile-menu-trigger"]',
    title: 'Nawigacja',
    description: 'Tutaj znajdziesz dostęp do wszystkich modułów platformy — od notatek, przez kalendarz, aż po asystenta AI.',
    position: 'right',
    mobilePosition: 'bottom',
    spotlightPadding: 0,
    icon: '📱',
  },
  {
    target: '[data-tour="sidebar-group-ai"]',
    mobileTarget: '[data-tour="mobile-menu-trigger"]',
    title: 'Sekcja AI',
    description: 'Tu mieszkają wszystkie funkcje oparte o sztuczną inteligencję — od osobistych asystentów, przez rozmowy i generowanie treści, po zaawansowane moduły wspierające Twoją codzienną pracę.',
    position: 'right',
    mobilePosition: 'bottom',
    spotlightPadding: 6,
    icon: '✨',
  },
  {
    target: '[data-tour="sidebar-group-praca"]',
    mobileTarget: '[data-tour="mobile-menu-trigger"]',
    title: 'Sekcja Praca',
    description: 'Twoje centrum produktywności i organizacji — wszystko, czego potrzebujesz, by planować, zarządzać czasem, prowadzić projekty i rozwijać własną firmę w jednym miejscu.',
    position: 'right',
    mobilePosition: 'bottom',
    spotlightPadding: 6,
    icon: '💼',
  },
  {
    target: '[data-tour="sidebar-group-spolecznosc"]',
    mobileTarget: '[data-tour="mobile-menu-trigger"]',
    title: 'Sekcja Społeczność',
    description: 'Przestrzeń do budowania Twojej obecności online, dzielenia się wiedzą, rozwoju oraz kontaktu z innymi twórcami i platformą.',
    position: 'right',
    mobilePosition: 'bottom',
    spotlightPadding: 6,
    icon: '🌐',
  },
  {
    // Cel przeniósł się z pulpitu do paska bocznego (02.09.2026) — dymek
    // po prawej, bo pod przyciskiem w pasku stoi menu, nie wolne miejsce.
    target: '[data-tour="spotlight-search"]',
    title: 'Szybkie wyszukiwanie',
    description: 'Szybko znajdź dowolną funkcję, notatkę czy ustawienie na platformie.',
    position: 'right',
    spotlightPadding: 8,
    icon: '🔍',
  },
  {
    target: '[data-tour="onboarding-checklist"]',
    title: 'Lista zadań startowych',
    description: 'Twoja lista rzeczy do zrobienia na start. Wykonuj zadania, aby odkryć pełnię możliwości platformy.',
    position: 'bottom',
    spotlightPadding: 8,
    icon: '✅',
  },
  {
    target: '[data-tour="minichat-assistant"]',
    title: 'Mini Personalny Asystent',
    description: 'Pływający przycisk w prawym dolnym rogu otwiera mini-chat z Personalnym Asystentem. Możesz szybko zadać pytanie bez opuszczania bieżącej strony.',
    position: 'left',
    mobilePosition: 'top',
    spotlightPadding: 12,
    icon: '✨',
  },
  {
    target: '[data-sidebar="footer"]',
    title: 'Twój profil i ustawienia',
    description: 'Kliknij tutaj, aby przejść do ustawień profilu, motywu kolorystycznego i preferencji konta.',
    position: 'top',
    spotlightPadding: 4,
    hideOnMobile: true,
  },
  {
    target: '[data-tour="sidebar-group-ai"]',
    mobileTarget: '[data-tour="mobile-menu-trigger"]',
    title: 'Zaczynamy od Chat AI',
    description: 'Najlepsze miejsce na start: tu mieszkają wszystkie modele AI. Wybierzesz jeden i wyślesz swoją pierwszą wiadomość.',
    position: 'right',
    mobilePosition: 'bottom',
    spotlightPadding: 6,
    icon: '🚀',
  },
];
