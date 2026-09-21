import { createContext, useContext, useState, useEffect } from 'react';

// Lista i metadane 1:1 z motywami zdefiniowanymi w src/index.css, które z
// kolei są 1:1 z Next-Byte-Design-Pack/motywy.css. Nie dodawać motywu bez
// jego bloku [data-theme="..."] w index.css.
export const THEMES = [
  {
    id: 'dark-theme',
    label: 'Ciemny motyw',
    desc: 'Domyślny motyw NextByte — czysta czerń i błękit',
    accentColor: '#70BEFA',
    bgColor: '#050505',
    cardColor: 'rgba(8, 8, 8, 0.85)',
    preview: { bg: '#050505', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', accent: '#70BEFA' },
  },
  {
    id: 'light-apple',
    label: 'Jasny motyw',
    desc: 'Krystalicznie jasne szkło iOS i promienny błękit',
    accentColor: '#1E90F2',
    bgColor: '#F2F3F5',
    cardColor: 'rgba(255, 255, 255, 0.9)',
    preview: { bg: '#F2F3F5', card: 'rgba(255,255,255,0.9)', border: 'rgba(0,0,0,0.08)', accent: '#1E90F2' },
  },
  {
    id: 'lime-green',
    label: 'Neon Lime',
    desc: 'Energiczny odcień limetki i grafitowy kontrast',
    accentColor: '#B0F21A',
    bgColor: '#0A0C06',
    cardColor: 'rgba(16, 20, 10, 0.85)',
    preview: { bg: '#0A0C06', card: 'rgba(176,242,26,0.08)', border: 'rgba(176,242,26,0.25)', accent: '#B0F21A' },
  },
  {
    id: 'nextbyte-light',
    label: 'NextByte Jasny',
    desc: 'Chłodny, korporacyjny błękit na jasnym tle',
    accentColor: '#2B77C7',
    bgColor: '#F3F5F9',
    cardColor: 'rgba(238, 240, 245, 0.9)',
    preview: { bg: '#F3F5F9', card: 'rgba(255,255,255,0.85)', border: 'rgba(43,119,199,0.2)', accent: '#2B77C7' },
  },
  {
    id: 'future-theme',
    label: 'Przyszły motyw',
    desc: 'Minimalny, tylko podstawowe zmienne — jasny i surowy',
    accentColor: '#2266E3',
    bgColor: '#FAFAFA',
    cardColor: 'rgba(255, 255, 255, 0.95)',
    preview: { bg: '#FAFAFA', card: 'rgba(255,255,255,0.95)', border: 'rgba(0,0,0,0.08)', accent: '#2266E3' },
  },
  {
    id: 'refspace',
    label: 'RefSpace',
    desc: 'Czysta czerń i sygnałowa zieleń',
    accentColor: '#22C55E',
    bgColor: '#000000',
    cardColor: 'rgba(13, 13, 13, 0.9)',
    preview: { bg: '#000000', card: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', accent: '#22C55E' },
  },
  {
    id: 'sloneczny',
    label: 'Słoneczny',
    desc: 'Głęboki granat nocy z gorącym złotem',
    accentColor: '#FFC800',
    bgColor: '#0A0F1C',
    cardColor: 'rgba(15, 21, 38, 0.85)',
    preview: { bg: '#0A0F1C', card: 'rgba(255,200,0,0.08)', border: 'rgba(255,200,0,0.25)', accent: '#FFC800' },
  },
  {
    id: 'teczowy',
    label: 'Tęczowy RGB',
    desc: 'Głęboki czarny z intensywnym neonowym fioletem',
    accentColor: '#C026D3',
    bgColor: '#080808',
    cardColor: 'rgba(13, 13, 13, 0.85)',
    preview: { bg: '#080808', card: 'rgba(192,38,211,0.08)', border: 'rgba(192,38,211,0.25)', accent: '#C026D3' },
  },
  {
    id: 'aurora',
    label: 'Aurora',
    desc: 'Morska zorza polarna cyjanowo-turkusowa',
    accentColor: '#14C3E0',
    bgColor: '#050C0E',
    cardColor: 'rgba(9, 21, 24, 0.85)',
    preview: { bg: '#050C0E', card: 'rgba(20,195,224,0.08)', border: 'rgba(20,195,224,0.25)', accent: '#14C3E0' },
  },
  {
    id: 'fioletowy',
    label: 'Fioletowy',
    desc: 'Głęboki indygo z jasną purpurą',
    accentColor: '#8B6FF0',
    bgColor: '#07061A',
    cardColor: 'rgba(13, 12, 30, 0.85)',
    preview: { bg: '#07061A', card: 'rgba(139,111,240,0.08)', border: 'rgba(139,111,240,0.25)', accent: '#8B6FF0' },
  },
  {
    id: 'nextbyte-v2',
    label: 'NextByte Lekki',
    desc: 'Grafitowy z chłodnym błękitem marki',
    accentColor: '#5D7EEB',
    bgColor: '#0C0D0F',
    cardColor: 'rgba(15, 17, 19, 0.85)',
    preview: { bg: '#0C0D0F', card: 'rgba(93,126,235,0.08)', border: 'rgba(93,126,235,0.25)', accent: '#5D7EEB' },
  },
  {
    id: 'dragon-red',
    label: 'Smoczy',
    desc: 'Mroczny karmazyn i głęboka obwódka cieniowa',
    accentColor: '#EF4444',
    bgColor: '#000000',
    cardColor: 'rgba(8, 8, 8, 0.85)',
    preview: { bg: '#000000', card: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', accent: '#EF4444' },
  },
  {
    id: 'snowy-white',
    label: 'Śnieżny',
    desc: 'Czysta czerń z niemal białym akcentem',
    accentColor: '#F2F2F2',
    bgColor: '#000000',
    cardColor: 'rgba(8, 8, 8, 0.85)',
    preview: { bg: '#000000', card: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', accent: '#F2F2F2' },
  },
  {
    id: 'scandinavian',
    label: 'Scandinavian',
    desc: 'Ciepły kremowy jasny styl skandynawski z szałwią',
    accentColor: '#4F7766',
    bgColor: '#F4F3EE',
    cardColor: 'rgba(255, 255, 255, 0.9)',
    preview: { bg: '#F4F3EE', card: 'rgba(255,255,255,0.9)', border: 'rgba(79,119,102,0.3)', accent: '#4F7766' },
  },
  {
    id: 'luxury',
    label: 'Luxury Gold',
    desc: 'Ekskluzywne matowe złoto i szlachetna czerń',
    accentColor: '#D4AF37',
    bgColor: '#080808',
    cardColor: 'rgba(13, 13, 13, 0.85)',
    preview: { bg: '#080808', card: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.25)', accent: '#D4AF37' },
  },
];

const ThemeContext = createContext(null);

/* PODGLĄD: w nextbyte-preview motywem steruje przełącznik podglądu, nie ta
   aplikacja. Provider trzyma więc swój stan (żeby SettingsModal działał), ale
   domyślnie NIE dotyka <html>. W docelowym repo montuj z przejmujMotyw. */
export function ThemeProvider({ children, przejmujMotyw = false }) {
  const [theme, setThemeState] = useState(() =>
    localStorage.getItem('nb_ui_theme') || 'dark-theme'
  );
  const [bgPattern, setBgPattern] = useState(() =>
    localStorage.getItem('nb_bg_pattern') || 'grid'
  );

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem('nb_ui_theme', id);
    if (przejmujMotyw) document.documentElement.setAttribute('data-theme', id);
  };

  const setPattern = (pat) => {
    setBgPattern(pat);
    localStorage.setItem('nb_bg_pattern', pat);
    if (przejmujMotyw) document.documentElement.setAttribute('data-bg-pattern', pat);
  };

  useEffect(() => {
    if (!przejmujMotyw) return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bg-pattern', bgPattern);
  }, [przejmujMotyw, theme, bgPattern]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, bgPattern, setPattern, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
