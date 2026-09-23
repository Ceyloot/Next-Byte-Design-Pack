import { useLocation } from 'react-router-dom';
import { useScreenSize } from '@/hooks/use-mobile';
import { ROUTE_HEADER_HEIGHTS, LAYOUT_CONSTANTS } from '@/constants/layout';

export const useMobileHeaderHeight = () => {
  const location = useLocation();
  const { isMobile } = useScreenSize();
  
  if (!isMobile) return 0;
  
  const routeHeight = ROUTE_HEADER_HEIGHTS[location.pathname as keyof typeof ROUTE_HEADER_HEIGHTS];
  return routeHeight || ROUTE_HEADER_HEIGHTS.default;
};

export const useChatContainerHeight = () => {
  const { isMobile, isTablet } = useScreenSize();
  
  const getContainerHeight = () => {
    if (isMobile) {
      // AppShell is h-[100dvh] with flex column: MobileHeader + main
      // main has flex-1 min-h-0, so it already subtracts header height
      // Just fill the parent completely
      return '100%';
    }
    if (isTablet) {
      return '100%';
    }
    return '100%';
  };
  
  const getKeyboardAwareHeight = () => {
    return getContainerHeight();
  };
  
  return {
    containerHeight: getContainerHeight(),
    keyboardAwareHeight: getKeyboardAwareHeight(),
    headerHeight: 48,
  };
};

export const useAppShellHeight = () => {
  const { isMobile } = useScreenSize();

  // Use fixed positioning approach on mobile to avoid dvh/svh quirks after keyboard closes
  // On desktop, h-screen is stable
  //
  // Obie warianty uwzględniają --nb-update-banner-h (wysokość globalnego paska
  // o nowej wersji, 0px gdy paska nie ma — patrz AppVersionBanner):
  //  - mobile: shell jest `fixed`, więc ignoruje padding #root; przesuwamy jego
  //    górną krawędź, żeby pasek nie zasłaniał MobileHeadera,
  //  - desktop: shell stoi w normalnym przepływie pod paddingiem #root, więc
  //    wystarczy odjąć wysokość paska od 100vh, inaczej pojawiłby się scroll.
  //
  // `relative` NALEŻY DO TEGO STRINGA, nie do miejsca użycia (07.09.2026).
  // Powłoka dostała dziś `relative` w szablonie klas (tło `TloAplikacji`
  // leży pod nią jako `absolute inset-0`). Na telefonie stało to obok
  // `fixed` — a o pozycji decyduje kolejność w ARKUSZU Tailwinda, nie
  // w atrybucie, i tam `.relative` jest po `.fixed`. Powłoka przestała
  // być przypięta do ekranu i rosła z treścią: w Studiu Zdjęć kompozytor
  // (`absolute bottom`) lądował 23 000 px niżej, pod całą galerią
  // (Michał: „na telefonie nie da się generować, pola nie ma").
  // `fixed` też tworzy kontekst pozycjonowania, więc tło działa pod nim.
  return isMobile
    ? 'fixed inset-0 top-[var(--nb-update-banner-h,0px)]'
    : 'relative h-[calc(100vh_-_var(--nb-update-banner-h,0px))]';
};