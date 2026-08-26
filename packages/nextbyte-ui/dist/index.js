import * as React33 from 'react';
import React33__default, { createContext, useRef, useCallback, useEffect, useContext, useState, useLayoutEffect, useId, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Minus, Check, X, Circle, ChevronDown, ChevronUp, Sparkles, Image, Blend, Stars, Building2, Waves, Ban, Upload, File, Star, Search, Paperclip, Mic, Phone, Wand2, Layers, Send, Flame, Zap, ChevronsUpDown, ChevronLeft, MoreHorizontal, ChevronRight, ArrowUp, ArrowDown, CornerDownLeft, Calendar, Heart, Copy, FolderOpen, Folder, MessageSquare, Plus, Terminal, Play, Pause, SkipBack, SkipForward, VolumeX, Volume2, Settings, Maximize2, Music, Lock, EyeOff, Eye, AlertCircle, Apple, Code2, Globe, Mail, ArrowRight, SlidersHorizontal, Download, Trash2, AlertTriangle, RefreshCw, Bell, List, ZoomIn, Crown, Server, Rocket, XCircle, CheckCircle2, Info, Database, SearchX, Inbox, CheckCheck } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Renderer, Geometry, Program, Mesh } from 'ogl';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Toaster as Toaster$1 } from 'sonner';
export { toast } from 'sonner';

// src/components/Tile.tsx
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var ELEWACJA = {
  /** w płaszczyźnie strony — tylko obramowanie */
  plaska: "shadow-none",
  /** domyślny kafelek z efektem szkła */
  uniesiona: "shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]",
  /** kafelek pod kursorem, panel nakładany */
  wyzej: "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.18)]"
};
var INTENCJA = {
  neutralna: { obwodka: "border-white/10 dark:border-white/10", ikona: "text-foreground/70", chip: "bg-white/[0.04]" },
  akcent: { obwodka: "border-primary/25", ikona: "text-primary", chip: "bg-primary/10" },
  krytyczna: { obwodka: "border-destructive/30", ikona: "text-destructive", chip: "bg-destructive/10" }
};
var PROMIEN = { kafelek: "rounded-2xl", wiersz: "rounded-xl", chip: "rounded-xl", pigulka: "rounded-full" };
function klasyKafelka(opcje) {
  const { intencja = "neutralna", elewacja = "uniesiona", interaktywny, zwarty } = opcje ?? {};
  return cn(
    PROMIEN.kafelek,
    "border",
    INTENCJA[intencja].obwodka,
    "flex flex-col",
    "nb-szklo",
    ELEWACJA[elewacja],
    "transition-all duration-200",
    interaktywny && "cursor-pointer hover:border-primary/40 hover:shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4)]",
    zwarty ? "p-3.5" : "p-5 lg:p-6"
  );
}
var Tile = React33__default.forwardRef(function Tile2({ intencja = "neutralna", elewacja = "uniesiona", interaktywny, zwarty, className, children, ...rest }, ref) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn(klasyKafelka({ intencja, elewacja, interaktywny, zwarty }), className),
      ...rest,
      children
    }
  );
});
var TileHeader = ({
  ikona: Ikona,
  tytul,
  podtytul,
  intencja = "akcent",
  poPrawej,
  className
}) => {
  const i = INTENCJA[intencja];
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-3 flex items-center gap-2.5", className), children: [
    Ikona && /* @__PURE__ */ jsx("span", { className: cn("flex h-8 w-8 shrink-0 items-center justify-center", PROMIEN.chip, i.chip), children: /* @__PURE__ */ jsx(Ikona, { className: cn("h-4 w-4", i.ikona) }) }),
    /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold text-foreground", children: tytul }),
      podtytul && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-xs text-foreground/60", children: podtytul })
    ] }),
    poPrawej && /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0", children: poPrawej })
  ] });
};
var TileRow = ({
  ikona: Ikona,
  intencja = "neutralna",
  poPrawej,
  className,
  children,
  ...rest
}) => {
  const i = INTENCJA[intencja];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        PROMIEN.wiersz,
        "flex items-center gap-2 border p-2.5 backdrop-blur-sm",
        intencja === "neutralna" ? "border-white/10 bg-white/[0.03] dark:border-white/10 dark:bg-white/[0.03]" : cn(i.obwodka, i.chip),
        className
      ),
      ...rest,
      children: [
        Ikona && /* @__PURE__ */ jsx(Ikona, { className: cn("h-3.5 w-3.5 shrink-0", i.ikona) }),
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-xs text-foreground", children }),
        poPrawej && /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0 text-[10px] text-foreground/60", children: poPrawej })
      ]
    }
  );
};
var TilePill = ({
  intencja = "akcent",
  children,
  className
}) => {
  const i = INTENCJA[intencja];
  return /* @__PURE__ */ jsx("span", { className: cn(
    PROMIEN.pigulka,
    "inline-flex items-center border border-white/10 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm",
    i.chip,
    i.ikona,
    className
  ), children });
};
var AKCJA = {
  glowna: "border-primary/40 bg-primary/[0.08] text-primary hover:border-primary/70 hover:bg-primary/[0.15]",
  wtorna: "border-foreground/15 bg-foreground/[0.04] text-foreground hover:border-foreground/30 hover:bg-foreground/[0.08]",
  cicha: "border-transparent bg-transparent text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground",
  usun: "border-destructive/40 bg-destructive/[0.08] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.15]"
};
var TileAction = React33__default.forwardRef(function TileAction2({ rodzaj = "wtorna", ikona: Ikona, samaIkona, className, children, ...rest }, ref) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref,
      type: "button",
      className: cn(
        PROMIEN.wiersz,
        "inline-flex h-9 items-center justify-center gap-1.5 border text-xs font-semibold backdrop-blur-md",
        samaIkona ? "w-9" : "px-3",
        AKCJA[rodzaj],
        "transition-colors duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      ),
      ...rest,
      children: [
        Ikona && /* @__PURE__ */ jsx(Ikona, { className: "h-3.5 w-3.5 shrink-0" }),
        !samaIkona && children
      ]
    }
  );
});
var TileFooter = ({ children, className }) => /* @__PURE__ */ jsx("div", { className: cn("mt-4 flex flex-wrap items-center gap-2", className), children });
var TOKENY_KAFELKA = { ELEWACJA, INTENCJA, PROMIEN, AKCJA };
var BG_OPTIONS = [
  { key: "nextbyte", label: "NextByte", icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }) },
  { key: "landscape", label: "Krajobraz", icon: /* @__PURE__ */ jsx(Image, { className: "h-3.5 w-3.5" }) },
  { key: "gradient", label: "Gradient", icon: /* @__PURE__ */ jsx(Blend, { className: "h-3.5 w-3.5" }) },
  { key: "galaxy", label: "Galaktyka", icon: /* @__PURE__ */ jsx(Stars, { className: "h-3.5 w-3.5" }) },
  { key: "city", label: "Miasto", icon: /* @__PURE__ */ jsx(Building2, { className: "h-3.5 w-3.5" }) },
  { key: "aurora", label: "Zorza", icon: /* @__PURE__ */ jsx(Waves, { className: "h-3.5 w-3.5" }) },
  { key: "off", label: "Brak", icon: /* @__PURE__ */ jsx(Ban, { className: "h-3.5 w-3.5" }) }
];
var PHOTOS = {
  landscape: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85&fit=crop",
  galaxy: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85&fit=crop",
  city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=85&fit=crop",
  aurora: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=85&fit=crop"
};
var OVERLAYS = {
  landscape: "rgba(5, 20, 25, 0.25)",
  galaxy: "rgba(2,2,15,0.45)",
  city: "rgba(3,5,18,0.50)",
  aurora: "rgba(2,8,12,0.40)"
};
function PhotoBg({ bgKey }) {
  const url = PHOTOS[bgKey];
  const overlay = OVERLAYS[bgKey];
  if (!url) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0",
        style: {
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }
      }
    ),
    overlay && /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: { background: overlay } })
  ] });
}
function GradientBg() {
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 nb-app-bg" });
}
var MASKA_LATARNIA = "radial-gradient(circle, white 10%, transparent 90%)";
function NextByteBg() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: { backgroundColor: "hsl(var(--background))" } }),
    /* @__PURE__ */ jsxs(
      "svg",
      {
        className: "absolute inset-0 w-full h-full pointer-events-none",
        style: { maskImage: MASKA_LATARNIA, WebkitMaskImage: MASKA_LATARNIA },
        "aria-hidden": true,
        children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", { id: "nb-grid", width: "60", height: "60", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsx("path", { d: "M 60 0 L 0 0 0 60", fill: "none", stroke: "hsl(var(--primary))", strokeWidth: "1", strokeOpacity: "0.14" }) }) }),
          /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "url(#nb-grid)" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -left-[15%] -top-[25%] h-[70%] w-[65%] rounded-full blur-[90px]",
          style: {
            background: "radial-gradient(circle, color-mix(in oklab, hsl(var(--foreground)) 6%, color-mix(in oklab, hsl(var(--primary)) 15%, hsl(var(--background)))), transparent 70%)"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -right-[10%] top-[10%] h-[60%] w-[50%] rounded-full blur-[100px]",
          style: {
            background: "radial-gradient(circle, color-mix(in oklab, hsl(var(--foreground)) 4%, color-mix(in oklab, hsl(var(--primary)) 10%, hsl(var(--background)))), transparent 70%)"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -bottom-[30%] left-[20%] h-[60%] w-[70%] rounded-full blur-[110px]",
          style: {
            background: "radial-gradient(circle, color-mix(in oklab, hsl(var(--foreground)) 6%, hsl(var(--background))), transparent 70%)"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0",
          style: {
            background: "radial-gradient(120% 90% at 50% 40%, transparent 40%, hsl(var(--background) / 0.6) 100%)"
          }
        }
      )
    ] })
  ] });
}
function AppBackground({ bgKey }) {
  if (bgKey === "off") return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: "pointer-events-none fixed inset-0",
      style: { zIndex: 0 },
      children: bgKey === "nextbyte" ? /* @__PURE__ */ jsx(NextByteBg, {}) : bgKey === "gradient" ? /* @__PURE__ */ jsx(GradientBg, {}) : /* @__PURE__ */ jsx(PhotoBg, { bgKey })
    }
  );
}
function BgToggle({ bgKey, onCycle }) {
  const current = BG_OPTIONS.find((b) => b.key === bgKey);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: onCycle,
      title: "Zmie\u0144 t\u0142o",
      className: cn(
        "fixed right-4 top-4 z-[9999] flex items-center gap-2 rounded-lg border",
        "px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-200",
        "border-border/60 bg-card/75 text-foreground/55 hover:bg-card/90 hover:text-foreground"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "opacity-70", children: current.icon }),
        /* @__PURE__ */ jsx("span", { children: current.label })
      ]
    }
  );
}
var GlassContext = createContext({
  isGlass: false,
  setIsGlass: () => {
  },
  toggle: () => {
  },
  showContent: true,
  setShowContent: () => {
  },
  toggleContent: () => {
  }
});
function GlassProvider({ children }) {
  const [isGlass, setIsGlass] = useState(true);
  const [showContent, setShowContent] = useState(true);
  return /* @__PURE__ */ jsx(
    GlassContext.Provider,
    {
      value: {
        isGlass,
        setIsGlass,
        toggle: () => setIsGlass((v) => !v),
        showContent,
        setShowContent,
        toggleContent: () => setShowContent((v) => !v)
      },
      children
    }
  );
}
function useGlass() {
  return useContext(GlassContext);
}
function useGlassCls(fallback = "") {
  const { isGlass } = useGlass();
  return isGlass ? "nb-szklo" : fallback;
}
var intentGlass = {
  neutral: "border-foreground/20 text-foreground/80",
  primary: "border-primary/40 text-primary",
  success: "border-emerald-400/40 text-emerald-400",
  warning: "border-amber-400/40 text-amber-400",
  danger: "border-red-400/40 text-red-400"
};
var intentNormal = {
  neutral: "border-border bg-muted text-foreground",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-400",
  danger: "border-red-400/40 bg-red-500/10 text-red-400"
};
var dotMap = {
  neutral: "bg-foreground/60",
  primary: "bg-primary",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400"
};
function Badge({
  intent = "neutral",
  size = "default",
  dot = false,
  className,
  children,
  ...props
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        isGlass ? "nb-szklo" : "",
        isGlass ? intentGlass[intent] : intentNormal[intent],
        className
      ),
      ...props,
      children: [
        dot && /* @__PURE__ */ jsx("span", { className: cn("h-1.5 w-1.5 rounded-full", dotMap[intent]) }),
        children
      ]
    }
  );
}
var fadeStyle = {
  maskImage: "radial-gradient(circle, white 10%, transparent 90%)",
  WebkitMaskImage: "radial-gradient(circle, white 10%, transparent 90%)"
};
var BackgroundPlus = ({
  patternColor = "#70BEFA",
  backgroundColor = "transparent",
  patternSize = 60,
  patternOpacity = 0.4,
  className,
  fade = true,
  style
}) => {
  const encoded = encodeURIComponent(patternColor);
  const backgroundStyle = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encoded}' fill-opacity='${patternOpacity}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    ...fade ? fadeStyle : {},
    ...style
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("absolute inset-0 w-full h-full pointer-events-none", className),
      style: backgroundStyle
    }
  );
};
var BackgroundDots = ({
  patternColor = "#70BEFA",
  backgroundColor = "transparent",
  patternSize = 20,
  patternOpacity = 0.5,
  className,
  fade = true,
  style
}) => {
  const encoded = encodeURIComponent(patternColor);
  const dotRadius = Math.max(1, patternSize * 0.05);
  const backgroundStyle = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${patternSize / 2}' cy='${patternSize / 2}' r='${dotRadius}' fill='${encoded}' fill-opacity='${patternOpacity}'/%3E%3C/svg%3E")`,
    ...fade ? fadeStyle : {},
    ...style
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("absolute inset-0 w-full h-full pointer-events-none", className),
      style: backgroundStyle
    }
  );
};
var BackgroundGrid = ({
  patternColor = "#70BEFA",
  backgroundColor = "transparent",
  patternSize = 40,
  patternOpacity = 0.3,
  className,
  fade = true,
  style
}) => {
  const encoded = encodeURIComponent(patternColor);
  const backgroundStyle = {
    backgroundColor,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 ${patternSize} ${patternSize}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M ${patternSize} 0 L 0 0 0 ${patternSize}' fill='none' stroke='${encoded}' stroke-width='1' stroke-opacity='${patternOpacity}'/%3E%3C/svg%3E")`,
    ...fade ? fadeStyle : {},
    ...style
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("absolute inset-0 w-full h-full pointer-events-none", className),
      style: backgroundStyle
    }
  );
};
var PatternBackground = ({
  pattern_type,
  pattern_color,
  pattern_size,
  pattern_opacity,
  background_color,
  fade,
  className,
  style
}) => {
  const props = {
    patternColor: pattern_color,
    patternSize: pattern_size,
    patternOpacity: pattern_opacity,
    backgroundColor: background_color,
    fade,
    className,
    style
  };
  switch (pattern_type) {
    case "plus":
      return /* @__PURE__ */ jsx(BackgroundPlus, { ...props });
    case "dots":
      return /* @__PURE__ */ jsx(BackgroundDots, { ...props });
    case "grid":
      return /* @__PURE__ */ jsx(BackgroundGrid, { ...props });
    default:
      return null;
  }
};
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-foreground",
        // Jezyk obwodek, tak jak `nextbyte` i TileAction. Pelne czerwone
        // wypelnienie bylo jedyna plama koloru w calym systemie i wylamywalo sie
        // z reszty — ostrzezenie niesie obwodka i kolor tekstu.
        destructive: "border border-destructive/40 bg-destructive/[0.06] text-destructive hover:border-destructive/70 hover:bg-destructive/[0.12]",
        outline: "border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border/70 transition-all duration-200",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted/40 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-transparent",
        // DOMYŚLNY przycisk platformy — używa go 717 plików. Zmiana tutaj zmienia
        // wygląd wszędzie, i o to chodzi.
        //
        // Język: obwódka + ~2% wypełnienia, ZERO wypełnienia kolorem. Akcent
        // niesie tekst, nie tło.
        //
        // Dlaczego `border-border` i `bg-foreground/[0.02]`, a nie biel:
        // wcześniej było `border-white/[0.10]` i `bg-white/[0.05]`. Warstwa łatek
        // `!important` dla `[data-theme="nextbyte-light"]` w index.css obsługuje
        // klasę `.border-white\/10`, ale NIE `border-white/[0.10]` — składnia z
        // nawiasami generuje inną nazwę klasy i w index.css nie ma jej wcale.
        // Efekt: na jasnym motywie 10% białej obwódki i 5% białego wypełnienia na
        // prawie białym tle były NIEWIDOCZNE — zostawał sam tekst wiszący w
        // powietrzu, w każdym z tych 717 plików.
        // `--foreground` odwraca się razem z motywem: w ciemnych daje 2% bieli
        // (czyli to samo co dotąd), w jasnych 2% czerni. Widoczne w obu.
        nextbyte: "relative border border-border text-primary hover:text-primary font-semibold rounded-xl hover:border-transparent transition-all duration-300 bg-foreground/[0.02] backdrop-blur-2xl overflow-hidden group/nextbyte",
        // Mocniejszy rejestr TEGO SAMEGO przycisku — nie osobny komponent.
        // Do wezwań na stronie wejściowej i miejsc pokazowych. Cały wygląd
        // siedzi w `.nb-glass` w index.css i liczy się od zmiennych motywu,
        // więc poświata idzie za kolorem wybranym przez użytkownika.
        glass: "nb-glass rounded-full font-semibold tracking-tight text-foreground hover:text-foreground"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-12 px-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "nextbyte",
      size: "default"
    }
  }
);
var Button = React33.forwardRef(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const { isGlass } = useGlass();
    const isNextbyte = variant === "nextbyte" || !variant && true;
    const glassClass = isGlass && isNextbyte ? "nb-szklo" : "";
    if (isNextbyte && !asChild) {
      return /* @__PURE__ */ jsxs(
        Comp,
        {
          className: cn(buttonVariants({ variant, size, className }), glassClass),
          ref,
          ...props,
          children: [
            /* @__PURE__ */ jsxs("span", { className: "absolute -inset-[1px] rounded-xl overflow-hidden opacity-20 group-hover/nextbyte:opacity-80 transition-opacity duration-500 pointer-events-none", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute inset-[-200%] bg-[conic-gradient(from_0deg,hsl(var(--primary)/0.3)_0deg,hsl(var(--primary)/0.6)_60deg,hsl(var(--primary))_120deg,hsl(var(--primary)/0.6)_180deg,hsl(var(--primary)/0.3)_240deg,hsl(var(--primary)/0.1)_300deg,hsl(var(--primary)/0.1)_360deg)] animate-spin-slow" }),
              /* @__PURE__ */ jsx("span", { className: "absolute inset-[1px] rounded-[10px] bg-card" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "relative z-10 flex items-center justify-center gap-2", children })
          ]
        }
      );
    }
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className }), glassClass),
        ref,
        ...props,
        children
      }
    );
  }
);
Button.displayName = "Button";
var SIZE = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-6 w-6"
};
var ICON_SIZE = {
  sm: "h-3 w-3",
  default: "h-3.5 w-3.5",
  lg: "h-4 w-4"
};
var Checkbox = React33.forwardRef(({ className, checkboxSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      ref,
      className: cn(
        "peer shrink-0 rounded-md border border-border bg-input",
        "transition-colors duration-200",
        "hover:border-border/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary",
        SIZE[checkboxSize],
        isGlass && "nb-szklo",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: "flex items-center justify-center text-primary-foreground", children: props.checked === "indeterminate" ? /* @__PURE__ */ jsx(Minus, { className: ICON_SIZE[checkboxSize] }) : /* @__PURE__ */ jsx(Check, { className: ICON_SIZE[checkboxSize] }) })
    }
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
var CheckboxField = ({
  label,
  description,
  id,
  checkboxSize,
  checked,
  onCheckedChange,
  disabled,
  className
}) => {
  const generatedId = React33.useId();
  const fieldId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-start gap-3", className), children: [
    /* @__PURE__ */ jsx(
      Checkbox,
      {
        id: fieldId,
        checkboxSize,
        checked,
        onCheckedChange,
        disabled,
        className: "mt-0.5"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: fieldId,
          className: cn(
            "block cursor-pointer text-sm font-medium text-foreground leading-5",
            disabled && "cursor-not-allowed opacity-50"
          ),
          children: label
        }
      ),
      description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-muted-foreground", children: description })
    ] })
  ] });
};
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogClose = DialogPrimitive.Close;
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React33.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-border bg-card p-6",
        "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: cn(
          "absolute right-4 top-4 rounded-lg p-1.5",
          "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
          "disabled:pointer-events-none"
        ), children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Zamknij" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx("div", { className: cn("mb-4 flex flex-col gap-1.5 pr-6", className), ...props });
var DialogTitle = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("font-heading text-lg font-semibold text-card-foreground", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
var DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
    ...props
  }
);
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogPortal = AlertDialogPrimitive.Portal;
var AlertDialogOverlay = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
var AlertDialogContent = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-border bg-card p-6",
        "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
var AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx("div", { className: cn("mb-4 flex flex-col gap-1.5", className), ...props });
var AlertDialogTitle = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("font-heading text-lg font-semibold text-card-foreground", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
var AlertDialogDescription = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
var AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
    ...props
  }
);
var AlertDialogAction = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(
      "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold",
      "border border-destructive/40 bg-destructive/[0.06] text-destructive",
      "hover:border-destructive/70 hover:bg-destructive/[0.12]",
      "focus:outline-none focus:ring-2 focus:ring-destructive/60 focus:ring-offset-2 focus:ring-offset-card",
      "transition-colors duration-150",
      className
    ),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
var AlertDialogCancel = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold",
      "border border-border bg-foreground/[0.02] text-foreground",
      "hover:bg-foreground/[0.06]",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
      "transition-colors duration-150",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
var FileUploadButton = ({
  onFiles,
  accept,
  multiple,
  label = "Wybierz plik",
  disabled,
  className
}) => {
  const inputRef = React33.useRef(null);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "file",
        accept,
        multiple,
        className: "hidden",
        disabled,
        onChange: (e) => {
          if (e.target.files) onFiles?.(Array.from(e.target.files));
          e.target.value = "";
        }
      }
    ),
    /* @__PURE__ */ jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        disabled,
        className: cn("gap-2", className),
        onClick: () => inputRef.current?.click(),
        children: [
          /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
          " ",
          label
        ]
      }
    )
  ] });
};
var FileDropzone = ({
  onFiles,
  accept,
  multiple,
  disabled,
  hint = "PNG, JPG do 10MB",
  className
}) => {
  const { isGlass } = useGlass();
  const [dragging, setDragging] = React33.useState(false);
  const inputRef = React33.useRef(null);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "button",
      tabIndex: 0,
      onClick: () => inputRef.current?.click(),
      onKeyDown: (e) => {
        if (e.key === "Enter") inputRef.current?.click();
      },
      onDragOver: (e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      },
      onDragLeave: () => setDragging(false),
      onDrop: (e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        onFiles?.(Array.from(e.dataTransfer.files));
      },
      className: cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer",
        "transition-colors duration-200",
        dragging ? "border-primary bg-primary/[0.06]" : "border-border hover:border-border/70",
        disabled && "pointer-events-none opacity-50",
        isGlass && "nb-szklo",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "file",
            accept,
            multiple,
            className: "hidden",
            disabled,
            onChange: (e) => {
              if (e.target.files) onFiles?.(Array.from(e.target.files));
              e.target.value = "";
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-xl nb-wglobienie-gnizado text-foreground/60", children: /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-foreground", children: [
          "Przeci\u0105gnij plik tutaj ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "lub kliknij" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: hint })
      ]
    }
  );
};
function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
var FileList = ({ files, onRemove, className }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col gap-2", className), children: files.map((f, i) => {
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2",
      children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg nb-wglobienie-gnizado text-foreground/60", children: isImage ? /* @__PURE__ */ jsx(Image, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(File, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium text-foreground", children: f.name }),
          f.progress !== void 0 && f.progress < 100 ? /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/60", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-full bg-primary transition-all", style: { width: `${f.progress}%` } }) }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: formatSize(f.size) })
        ] }),
        onRemove && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onRemove(i),
            className: "rounded-full p-1 text-foreground/50 hover:bg-foreground/10 hover:text-foreground",
            children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    },
    i
  );
}) });
var FormSection = ({ title, description, children, className }) => /* @__PURE__ */ jsxs("div", { className: cn("space-y-4", className), children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-foreground", children: title }),
    description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: description })
  ] }),
  children
] });
var FormRow = ({ columns = 2, children, className }) => /* @__PURE__ */ jsx("div", { className: cn("grid gap-4", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1", className), children });
var FormDivider = ({ className }) => /* @__PURE__ */ jsx("div", { className: cn("border-t border-border", className) });
var FieldGroup = ({ label, children, className }) => /* @__PURE__ */ jsxs("fieldset", { className: cn("rounded-2xl border border-border p-4 space-y-3", className), children: [
  label && /* @__PURE__ */ jsx("legend", { className: "px-1.5 text-xs font-semibold text-foreground/70", children: label }),
  children
] });
var FormActions = ({ children, align = "right", className }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex items-center gap-2 pt-1",
      align === "right" && "justify-end",
      align === "left" && "justify-start",
      align === "between" && "justify-between",
      className
    ),
    children
  }
);
var inputVariants = cva(
  [
    "flex w-full rounded-xl border transition-colors duration-200",
    "bg-input text-foreground placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground"
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border hover:border-border/70",
        error: "border-destructive/50 hover:border-destructive/70 focus-visible:ring-destructive/60",
        ghost: "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.06] focus-visible:bg-input focus-visible:border-border"
      },
      inputSize: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default"
    }
  }
);
var Input = React33.forwardRef(
  ({ className, variant, inputSize, type, iconLeft, iconRight, ...props }, ref) => {
    const { isGlass } = useGlass();
    const glassClass = isGlass ? "nb-szklo" : "";
    const inputEl = /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          inputVariants({ variant, inputSize }),
          iconLeft && "pl-9",
          iconRight && "pr-9",
          glassClass,
          className
        ),
        ref,
        ...props
      }
    );
    if (!iconLeft && !iconRight) return inputEl;
    return /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
      iconLeft && /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex items-center", children: iconLeft }),
      inputEl,
      iconRight && /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground flex items-center", children: iconRight })
    ] });
  }
);
Input.displayName = "Input";
var InputLabel = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "label",
  {
    ref,
    className: cn("mb-1.5 block text-sm font-medium text-foreground", className),
    ...props
  }
));
InputLabel.displayName = "InputLabel";
var InputHint = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "span",
  {
    className: cn("mt-1.5 block text-xs text-muted-foreground", className),
    ...props
  }
);
var InputError = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "span",
  {
    className: cn("mt-1.5 flex items-center gap-1 text-xs text-destructive", className),
    ...props
  }
);
var Field = ({
  label,
  hint,
  error,
  htmlFor,
  className,
  children
}) => /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col", className), children: [
  label && /* @__PURE__ */ jsx(InputLabel, { htmlFor, children: label }),
  children,
  error ? /* @__PURE__ */ jsx(InputError, { children: error }) : hint && /* @__PURE__ */ jsx(InputHint, { children: hint })
] });
var VERT = (
  /* glsl */
  `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`
);
var FRAG = (
  /* glsl */
  `
precision highp float;

uniform vec2  uResolution;
uniform vec2  uMouse;     /* 0-1, y-flipped */
uniform float uTime;
uniform float uRadius;
uniform float uAlpha;

varying vec2 vUv;

/* Rounded-rect SDF, centred, aspect-corrected */
float sdRR(vec2 p, vec2 h, float r) {
  vec2 d = abs(p) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

void main() {
  float ar  = uResolution.x / uResolution.y;
  float px  = 1.0 / uResolution.y;
  vec2  uv  = vUv;

  vec2  p   = (uv - 0.5) * vec2(ar, 1.0);
  vec2  ph  = (vec2(0.5) - vec2(uRadius * px)) * vec2(ar, 1.0);
  float r   = uRadius * px;

  float dist   = sdRR(p, ph, r);
  float inside = 1.0 - smoothstep(-px, px, dist);
  if (inside < 0.001) { gl_FragColor = vec4(0.0); return; }

  /* \u2500\u2500 STREFA KRAW\u0118DZI \u2014 jak daleko od bordera (w pikselach, ujemne = wewn\u0105trz) \u2500 */
  float pxFromEdge = -dist / px;   /* >0 = wewn\u0105trz, 0 = na kraw\u0119dzi, <0 = poza */

  /* Efekty aktywne tylko przy kraw\u0119dzi (do ~16 px wewn\u0105trz) */
  float edgeZone = smoothstep(16.0, 0.0, pxFromEdge) * inside;
  float rimZone  = smoothstep( 3.0, 0.0, pxFromEdge) * inside;

  /* \u2500\u2500 1. RIM \u2014 tr\xF3jwarstwowy grubi brzeg szk\u0142a \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* Zewn\u0119trzna po\u015Bwiata (~4-5 px) */
  float outerGlow = smoothstep(5.0*px, 0.0, abs(dist + 2.5*px)) * inside;

  /* G\u0142\xF3wna linia bordera (\u22481.5 px) */
  float solidRim  = smoothstep(1.8*px, 0.0, abs(dist)) * inside;

  /* Wewn\u0119trzna jasna linia (1 px za borderem) */
  float innerLine = smoothstep(2.2*px, 0.0, abs(dist + 1.8*px))
                  * smoothstep(-4.0*px, 0.0, dist + 1.8*px) * inside;

  /* Chromatic aberration \u2014 RGB split tylko na kraw\u0119dzi, nie t\u0119cza */
  float dR = sdRR(p + vec2( 0.8*px, 0.0), ph, r);
  float dB = sdRR(p - vec2( 0.8*px, 0.0), ph, r);
  float rR = smoothstep(1.8*px, 0.0, abs(dR)) * inside;
  float rB = smoothstep(1.8*px, 0.0, abs(dB)) * inside;

  /* Ciep\u0142o/ch\u0142\xF3d zale\u017Cnie od pozycji na obwodzie (g\xF3ra=ciep\u0142e, d\xF3\u0142=zimne) */
  float wc = sin(atan(p.y, p.x) + 1.5707) * 0.5 + 0.5;
  vec3  chroma = vec3(mix(rB, rR, wc), solidRim, mix(rR, rB, wc));

  /* \u2500\u2500 2. TOP HIGHLIGHT \u2014 jasna linia u g\xF3ry szk\u0142a \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  /* Pozioma maska: pe\u0142na w centrum, zanika ku bokom */
  float topFade = 1.0 - smoothstep(0.0, 0.42, abs(uv.x - 0.5) * 2.0);
  /* 1-2px linia */
  float topLine = smoothstep(0.0, 1.8*px, uv.y)
                * smoothstep(3.5*px, 1.5*px, uv.y)
                * topFade * inside;
  /* Mi\u0119kka po\u015Bwiata pod lini\u0105 */
  float topGlow = smoothstep(0.0, 0.055, uv.y)
                * smoothstep(0.13, 0.04, uv.y)
                * topFade * inside;

  /* \u2500\u2500 3. SPECULAR \u2014 odbicie \u015Bwiat\u0142a sufitowego, tylko G\xD3RA karty \u2500\u2500\u2500\u2500 */
  /* \u015Arodek speculara: g\xF3rna cz\u0119\u015B\u0107 karty, X pod\u0105\u017Ca za mysz\u0105 */
  float specCX = (uMouse.x - 0.5) * ar * 0.4;          /* przesu\u0144 X \xB120% za mysz\u0105 */
  float specCY = ph.y * 0.55;                            /* zafixowany przy g\xF3rze */
  vec2  specC  = vec2(specCX, specCY);

  float sDist  = length(p - specC);

  /* Dwa loby: w\u0105ski jasny + szeroki mi\u0119kki */
  float sNarrow = exp(-sDist * sDist / 0.008) * 0.60;
  float sWide   = exp(-sDist * sDist / 0.09)  * 0.22;

  /* Specular aktywny TYLKO w g\xF3rnej po\u0142owie karty i blisko kraw\u0119dzi */
  float specTopMask = smoothstep(-ph.y * 0.1, ph.y * 0.6, p.y);  /* 0=d\xF3\u0142 1=g\xF3ra */
  float specEdgeFade = smoothstep(0.0, 0.25, edgeZone);            /* zanika przy kraw\u0119dzi */
  float specMask = specTopMask * (1.0 - specEdgeFade) * inside;
  /* Dodaj te\u017C w\u0105ski specular na rimie */
  float rimSpec = (sNarrow * 0.4) * rimZone;

  /* \u2500\u2500 COMPOSE \u2014 premultiplied alpha \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  vec3  col   = vec3(0.0);
  float alpha = 0.0;

  /* Outer glow */
  col   += vec3(1.0) * outerGlow * 0.10;   alpha += outerGlow * 0.07;
  /* Chroma rim */
  col   += chroma    * 0.85;                alpha += (rR + solidRim + rB)/3.0 * 0.65;
  /* Inner line */
  col   += vec3(1.0) * innerLine * 0.78;   alpha += innerLine * 0.48;
  /* Top line */
  col   += vec3(1.0) * topLine   * 0.95;   alpha += topLine   * 0.82;
  /* Top glow */
  col   += vec3(1.0) * topGlow   * 0.45;   alpha += topGlow   * 0.24;
  /* Specular (g\xF3ra) */
  col   += vec3(1.0) * (sNarrow + sWide) * specMask;
  alpha += (sNarrow * 0.58 + sWide * 0.20) * specMask;
  /* Rim specular */
  col   += vec3(1.0) * rimSpec;             alpha += rimSpec * 0.55;

  alpha *= uAlpha;
  col    = min(col, vec3(1.0));
  gl_FragColor = vec4(col * alpha, alpha);
}
`
);
var LiquidGlass = React33__default.forwardRef(
  function LiquidGlass2({ radius = 16, intensity = 1, className, children, ...rest }, ref) {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const meshRef = useRef(null);
    const rendRef = useRef(null);
    const rafRef = useRef(0);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const tRef = useRef(0);
    const alphaRef = useRef(0);
    const activeRef = useRef(false);
    const setWrapRef = useCallback((el) => {
      wrapRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    }, [ref]);
    useEffect(() => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const initGL = () => {
        if (rendRef.current) return;
        const renderer = new Renderer({
          canvas,
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          dpr: Math.min(window.devicePixelRatio, 2)
        });
        rendRef.current = renderer;
        const gl = renderer.gl;
        glRef.current = gl;
        gl.clearColor(0, 0, 0, 0);
        const geo = new Geometry(gl, {
          position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
          uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
        });
        const prog = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uResolution: { value: [canvas.offsetWidth, canvas.offsetHeight] },
            uMouse: { value: [0.5, 0.5] },
            uTime: { value: 0 },
            uRadius: { value: radius },
            uAlpha: { value: 0 }
          },
          transparent: true,
          depthTest: false,
          depthWrite: false
        });
        programRef.current = prog;
        meshRef.current = new Mesh(gl, { geometry: geo, program: prog });
      };
      const ro = new ResizeObserver(() => {
        const w = wrap.offsetWidth, h = wrap.offsetHeight;
        if (rendRef.current) {
          rendRef.current.setSize(w, h);
          programRef.current.uniforms.uResolution.value = [w, h];
        }
      });
      ro.observe(wrap);
      const animate = () => {
        if (!rendRef.current || !programRef.current || !meshRef.current) return;
        rafRef.current = requestAnimationFrame(animate);
        const target = activeRef.current ? intensity : 0;
        alphaRef.current += (target - alphaRef.current) * 0.12;
        if (!activeRef.current && alphaRef.current < 4e-3) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          programRef.current.uniforms.uAlpha.value = 0;
          rendRef.current.gl.clear(rendRef.current.gl.COLOR_BUFFER_BIT);
          return;
        }
        tRef.current += 0.016;
        const u = programRef.current.uniforms;
        u.uTime.value = tRef.current;
        u.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
        u.uAlpha.value = alphaRef.current;
        rendRef.current.gl.clear(rendRef.current.gl.COLOR_BUFFER_BIT);
        rendRef.current.render({ scene: meshRef.current });
      };
      const onEnter = () => {
        initGL();
        if (rendRef.current) {
          rendRef.current.setSize(wrap.offsetWidth, wrap.offsetHeight);
          programRef.current.uniforms.uResolution.value = [wrap.offsetWidth, wrap.offsetHeight];
        }
        activeRef.current = true;
        if (!rafRef.current) animate();
      };
      const onMove = (e) => {
        const rect = wrap.getBoundingClientRect();
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: 1 - (e.clientY - rect.top) / rect.height
        };
      };
      const onLeave = () => {
        activeRef.current = false;
        mouseRef.current = { x: 0.5, y: 0.8 };
      };
      wrap.addEventListener("mouseenter", onEnter);
      wrap.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
      return () => {
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
        wrap.removeEventListener("mouseenter", onEnter);
        wrap.removeEventListener("mousemove", onMove);
        wrap.removeEventListener("mouseleave", onLeave);
        glRef.current?.getExtension("WEBGL_lose_context")?.loseContext();
        rendRef.current = null;
        programRef.current = null;
        meshRef.current = null;
        glRef.current = null;
      };
    }, [radius, intensity]);
    return /* @__PURE__ */ jsxs("div", { ref: setWrapRef, className: cn("relative", className), ...rest, children: [
      children,
      /* @__PURE__ */ jsx(
        "canvas",
        {
          ref: canvasRef,
          "aria-hidden": true,
          className: "pointer-events-none absolute inset-0 h-full w-full",
          style: { zIndex: 10, borderRadius: radius }
        }
      )
    ] });
  }
);
function NbTabs({ tabs, defaultTab, onChange, className }) {
  const { isGlass } = useGlass();
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key ?? "");
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);
  const tabRefs = useRef(/* @__PURE__ */ new Map());
  function movePill(key) {
    const btn = tabRefs.current.get(key);
    const container = containerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPillStyle({
      left: bRect.left - cRect.left,
      width: bRect.width,
      opacity: 1
    });
  }
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => movePill(active));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    movePill(active);
  }, [active]);
  useEffect(() => {
    const observer = new ResizeObserver(() => movePill(active));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [active]);
  function handleClick(key) {
    setActive(key);
    onChange?.(key);
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      role: "tablist",
      className: cn(
        "relative flex flex-wrap items-center gap-0.5 rounded-full border p-1",
        isGlass ? "nb-szklo" : "border-border bg-muted/20",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute top-1 h-[calc(100%-8px)] rounded-full transition-[left,width] duration-300 ease-[cubic-bezier(.25,.46,.45,.94)]",
            style: pillStyle,
            children: isGlass ? (
              /* Wirujący conic-gradient + szklane wypełnienie */
              /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 rounded-full overflow-hidden", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full nb-pigulka-rant nb-tab-pill-spin" }),
                /* @__PURE__ */ jsx("span", { className: "absolute inset-[1px] rounded-full nb-pigulka-szklo" })
              ] })
            ) : (
              /* Aktywna zakładka — realny błękit marki, nie „prawie-tło z obwódką".
                 Cień w primary daje delikatną poświatę pod pigułką. */
              /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-primary shadow-[0_1px_0_0_hsl(210_40%_100%/.2)_inset,0_6px_16px_-6px_hsl(var(--primary)/.5)]" })
            )
          }
        ),
        tabs.map((tab) => {
          const isActive = tab.key === active;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              ref: (el) => {
                if (el) tabRefs.current.set(tab.key, el);
                else tabRefs.current.delete(tab.key);
              },
              role: "tab",
              "aria-selected": isActive,
              onClick: () => handleClick(tab.key),
              className: cn(
                "relative z-10 flex h-9 sm:h-10 min-w-0 flex-initial cursor-pointer items-center",
                "justify-center gap-1.5 whitespace-nowrap rounded-full px-3 sm:px-5 py-1.5",
                "text-xs sm:text-sm font-medium transition-colors duration-200",
                isActive ? isGlass ? "text-foreground" : "text-primary-foreground" : "text-foreground/65 hover:text-foreground hover:bg-foreground/5"
              ),
              children: [
                tab.icon && /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5", children: tab.icon }),
                tab.label
              ]
            },
            tab.key
          );
        })
      ]
    }
  );
}
var OtpInput = ({
  length = 6,
  value,
  defaultValue,
  onChange,
  onComplete,
  error,
  disabled,
  className
}) => {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33.useState(
    () => (value ?? defaultValue ?? "").padEnd(length, " ").slice(0, length).split("")
  );
  const refs = React33.useRef([]);
  const digits = value !== void 0 ? value.padEnd(length, " ").slice(0, length).split("") : internal;
  const setDigit = (i, char) => {
    const next = [...digits];
    next[i] = char;
    const joined = next.join("").trimEnd();
    if (value === void 0) setInternal(next);
    onChange?.(joined);
    if (joined.length === length) onComplete?.(joined);
  };
  const handleChange = (i, raw) => {
    const char = raw.replace(/[^0-9a-zA-Z]/g, "").slice(-1);
    setDigit(i, char || " ");
    if (char && i < length - 1) refs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i]?.trim() && i > 0) {
      refs.current[i - 1]?.focus();
      setDigit(i - 1, " ");
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^0-9a-zA-Z]/g, "").slice(0, length);
    const next = text.padEnd(length, " ").split("");
    if (value === void 0) setInternal(next);
    onChange?.(text);
    if (text.length === length) onComplete?.(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };
  return /* @__PURE__ */ jsx("div", { className: cn("flex gap-2", className), children: Array.from({ length }, (_, i) => /* @__PURE__ */ jsx(
    "input",
    {
      ref: (el) => {
        refs.current[i] = el;
      },
      type: "text",
      inputMode: "numeric",
      maxLength: 1,
      disabled,
      value: digits[i]?.trim() ?? "",
      onChange: (e) => handleChange(i, e.target.value),
      onKeyDown: (e) => handleKeyDown(i, e),
      onPaste: handlePaste,
      className: cn(
        "h-11 w-9 rounded-xl border bg-input text-center text-lg font-semibold text-foreground",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        error ? "border-destructive/50 focus-visible:ring-destructive/60" : "border-border hover:border-border/70",
        isGlass && "nb-szklo"
      )
    },
    i
  )) });
};
var SIZE2 = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-6 w-6"
};
var DOT_SIZE = {
  sm: "h-1.5 w-1.5",
  default: "h-2 w-2",
  lg: "h-2.5 w-2.5"
};
var RadioGroup = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(RadioGroupPrimitive.Root, { ref, className: cn("grid gap-3", className), ...props }));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
var RadioGroupItem = React33.forwardRef(({ className, radioSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square shrink-0 rounded-full border border-border bg-input",
        "transition-colors duration-200 hover:border-border/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary",
        SIZE2[radioSize],
        isGlass && "nb-szklo",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(RadioGroupPrimitive.Indicator, { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsx(Circle, { className: cn("fill-primary text-primary", DOT_SIZE[radioSize]) }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
var RadioCard = ({
  value,
  label,
  description,
  id,
  disabled,
  className
}) => {
  const generatedId = React33.useId();
  const fieldId = id ?? generatedId;
  return /* @__PURE__ */ jsxs(
    "label",
    {
      htmlFor: fieldId,
      className: cn(
        "flex items-start gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer",
        "transition-colors duration-200 hover:border-border/70",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.06]",
        disabled && "cursor-not-allowed opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(RadioGroupItem, { value, id: fieldId, disabled, className: "mt-0.5" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-foreground leading-5", children: label }),
          description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-muted-foreground", children: description })
        ] })
      ]
    }
  );
};
var RadioField = ({
  value,
  label,
  description,
  id,
  radioSize,
  disabled,
  className
}) => {
  const generatedId = React33.useId();
  const fieldId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-start gap-3", className), children: [
    /* @__PURE__ */ jsx(RadioGroupItem, { value, id: fieldId, radioSize, disabled, className: "mt-0.5" }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: fieldId,
          className: cn(
            "block cursor-pointer text-sm font-medium text-foreground leading-5",
            disabled && "cursor-not-allowed opacity-50"
          ),
          children: label
        }
      ),
      description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-muted-foreground", children: description })
    ] })
  ] });
};
var ICON_SIZE2 = { sm: "h-4 w-4", default: "h-5 w-5", lg: "h-6 w-6" };
var Rating = ({
  value,
  defaultValue = 0,
  onChange,
  max = 5,
  size = "default",
  readOnly,
  className
}) => {
  const [internal, setInternal] = React33.useState(defaultValue);
  const [hover, setHover] = React33.useState(null);
  const current = value ?? internal;
  const shown = hover ?? current;
  return /* @__PURE__ */ jsx("div", { className: cn("inline-flex items-center gap-0.5", className), role: "radiogroup", children: Array.from({ length: max }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      disabled: readOnly,
      "aria-label": `${n} z ${max}`,
      className: cn(
        "transition-transform disabled:cursor-default",
        !readOnly && "hover:scale-110 cursor-pointer"
      ),
      onClick: () => {
        setInternal(n);
        onChange?.(n);
      },
      onMouseEnter: () => !readOnly && setHover(n),
      onMouseLeave: () => !readOnly && setHover(null),
      children: /* @__PURE__ */ jsx(
        Star,
        {
          className: cn(
            ICON_SIZE2[size],
            n <= shown ? "fill-primary text-primary" : "fill-transparent text-muted-foreground",
            "transition-colors"
          )
        }
      )
    },
    n
  )) });
};
var EMOJIS = ["\u{1F621}", "\u{1F615}", "\u{1F610}", "\u{1F642}", "\u{1F60D}"];
var EMOJI_SIZE = { sm: "text-lg", default: "text-2xl", lg: "text-3xl" };
var EmojiRating = ({
  value,
  defaultValue = 0,
  onChange,
  size = "default",
  className
}) => {
  const [internal, setInternal] = React33.useState(defaultValue);
  const current = value ?? internal;
  return /* @__PURE__ */ jsx("div", { className: cn("inline-flex items-center gap-1.5", className), role: "radiogroup", children: EMOJIS.map((emoji, i) => {
    const n = i + 1;
    const active = n === current;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": emoji,
        onClick: () => {
          setInternal(n);
          onChange?.(n);
        },
        className: cn(
          EMOJI_SIZE[size],
          "rounded-full p-1.5 transition-all grayscale opacity-50 hover:opacity-100 hover:grayscale-0 hover:scale-110",
          active && "opacity-100 grayscale-0 bg-primary/10 scale-110"
        ),
        children: emoji
      },
      n
    );
  }) });
};
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SIZE_H = { sm: "h-8 text-xs", default: "h-10 text-sm", lg: "h-12 text-base" };
var SelectTrigger = React33.forwardRef(({ className, children, error, triggerSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      ref,
      className: cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input px-3",
        "text-foreground placeholder:text-muted-foreground",
        "transition-colors duration-200 hover:border-border/70",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&>span]:line-clamp-1",
        error && "border-destructive/50 hover:border-destructive/70 focus:ring-destructive/60",
        SIZE_H[triggerSize],
        isGlass && "nb-szklo",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" }) })
      ]
    }
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = React33.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      ref,
      className: cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        "rounded-2xl border border-border bg-popover text-popover-foreground",
        "shadow-[0_8px_24px_-12px_rgb(0_0_0/0.28),0_2px_4px_0_rgb(0_0_0/0.06)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        isGlass && "nb-szklo",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
});
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var SelectItem = React33.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm",
      "text-popover-foreground outline-none",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-border", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
var Slider = React33.forwardRef(({ className, showValue, formatValue, defaultValue, value, ...props }, ref) => {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33.useState(
    value ?? defaultValue ?? [0]
  );
  const current = value ?? internal;
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs(
      SliderPrimitive.Root,
      {
        ref,
        defaultValue,
        value,
        onValueChange: (v) => {
          setInternal(v);
          props.onValueChange?.(v);
        },
        className: cn(
          "relative flex w-full touch-none select-none items-center",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsx(
            SliderPrimitive.Track,
            {
              className: cn(
                "relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted/60",
                isGlass && "nb-szklo"
              ),
              children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-primary" })
            }
          ),
          current.map((_, i) => /* @__PURE__ */ jsx(
            SliderPrimitive.Thumb,
            {
              className: cn(
                "block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none",
                "hover:scale-110 transition-transform"
              )
            },
            i
          ))
        ]
      }
    ),
    showValue && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex justify-between text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: formatValue ? formatValue(current[0]) : current[0] }),
      current.length > 1 && /* @__PURE__ */ jsx("span", { children: formatValue ? formatValue(current[current.length - 1]) : current[current.length - 1] })
    ] })
  ] });
});
Slider.displayName = SliderPrimitive.Root.displayName;
var TRACK = {
  sm: "h-4 w-7",
  default: "h-5 w-9",
  lg: "h-6 w-11"
};
var THUMB = {
  sm: "h-3 w-3 data-[state=checked]:translate-x-3",
  default: "h-3.5 w-3.5 data-[state=checked]:translate-x-4",
  lg: "h-4.5 w-4.5 data-[state=checked]:translate-x-5"
};
var Switch = React33.forwardRef(({ className, switchSize = "default", ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    SwitchPrimitive.Root,
    {
      className: cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-200",
        "bg-muted/60 data-[state=checked]:bg-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        TRACK[switchSize],
        isGlass && "nb-szklo",
        className
      ),
      ...props,
      ref,
      children: /* @__PURE__ */ jsx(
        SwitchPrimitive.Thumb,
        {
          className: cn(
            "pointer-events-none block rounded-full bg-foreground/90 shadow-sm",
            "data-[state=checked]:bg-primary-foreground",
            "translate-x-0 transition-transform duration-200",
            THUMB[switchSize]
          )
        }
      )
    }
  );
});
Switch.displayName = SwitchPrimitive.Root.displayName;
var SwitchField = ({
  label,
  description,
  id,
  switchSize,
  checked,
  onCheckedChange,
  disabled,
  className
}) => {
  const generatedId = React33.useId();
  const fieldId = id ?? generatedId;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-start gap-3", className), children: [
    /* @__PURE__ */ jsx(
      Switch,
      {
        id: fieldId,
        switchSize,
        checked,
        onCheckedChange,
        disabled,
        className: "mt-0.5 shrink-0"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: fieldId,
          className: cn(
            "block cursor-pointer text-sm font-medium text-foreground leading-5",
            disabled && "cursor-not-allowed opacity-50"
          ),
          children: label
        }
      ),
      description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs text-muted-foreground", children: description })
    ] })
  ] });
};
var Tabs = TabsPrimitive.Root;
var TabsGroup = TabsPrimitive.List;
var TabsList = React33.forwardRef(({ className, ...props }, ref) => {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    TabsPrimitive.List,
    {
      ref,
      className: cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-1",
        isGlass && "nb-szklo",
        className
      ),
      ...props
    }
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5",
      "text-sm font-medium text-muted-foreground",
      "transition-all duration-150",
      // aktywna zakładka
      "data-[state=active]:bg-card data-[state=active]:text-card-foreground",
      "data-[state=active]:shadow-[0_1px_2px_0_rgb(0_0_0/0.06),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
      // hover na nieaktywnej
      "hover:text-foreground hover:bg-foreground/[0.04]",
      // focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/40",
      // disabled
      "disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
var TabsLine = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "flex items-end gap-0 border-b border-border",
      className
    ),
    ...props
  }
));
TabsLine.displayName = "TabsLine";
var TabsLineTrigger = React33.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "relative -mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-4 pb-2.5 pt-1.5",
      "text-sm font-medium text-muted-foreground",
      "transition-colors duration-150",
      "data-[state=active]:border-primary data-[state=active]:text-foreground",
      "hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
TabsLineTrigger.displayName = "TabsLineTrigger";
var TagInput = ({
  value,
  defaultValue = [],
  onChange,
  placeholder = "Dodaj i naci\u015Bnij Enter...",
  maxTags,
  disabled,
  className
}) => {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33.useState(defaultValue);
  const [draft, setDraft] = React33.useState("");
  const tags = value ?? internal;
  const commit = (next) => {
    if (value === void 0) setInternal(next);
    onChange?.(next);
  };
  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    if (maxTags && tags.length >= maxTags) return;
    commit([...tags, tag]);
  };
  const removeTag = (i) => {
    commit(tags.filter((_, idx) => idx !== i));
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-input px-2.5 py-2",
        "transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        disabled && "pointer-events-none opacity-50",
        isGlass && "nb-szklo",
        className
      ),
      children: [
        tags.map((tag, i) => /* @__PURE__ */ jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 pl-2.5 pr-1 py-0.5 text-xs font-medium text-foreground",
            children: [
              tag,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => removeTag(i),
                  className: "rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground",
                  children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
                }
              )
            ]
          },
          tag
        )),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: draft,
            onChange: (e) => setDraft(e.target.value),
            onKeyDown: handleKeyDown,
            onBlur: () => {
              if (draft) {
                addTag(draft);
                setDraft("");
              }
            },
            placeholder: tags.length === 0 ? placeholder : "",
            disabled: disabled || (maxTags ? tags.length >= maxTags : false),
            className: "min-w-[80px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          }
        )
      ]
    }
  );
};

// src/hooks/useProfilePatterns.ts
function useProfilePatterns(_userId) {
  return { activePattern: null };
}

// src/hooks/useProfileBackgrounds.ts
function useProfileBackgrounds(_userId) {
  return { activeBackground: null };
}

// src/hooks/usePatternLocations.ts
function usePatternLocations() {
  return {
    isLocationEnabled: (_location) => false
  };
}

// src/hooks/useAuth.ts
function useAuthId() {
  return null;
}
var TechGrid = ({ location, oczko = 44, className }) => {
  const { activePattern } = useProfilePatterns();
  const { activeBackground } = useProfileBackgrounds();
  const { isLocationEnabled } = usePatternLocations();
  const maWlasnyWzor = !!activePattern && isLocationEnabled(location);
  const maWlasneTlo = !!activeBackground?.background?.background_url;
  if (maWlasnyWzor || maWlasneTlo) return null;
  const linia = "hsl(var(--foreground) / 0.028)";
  const maska = "radial-gradient(ellipse 80% 44% at 50% 0%, #000 30%, transparent 100%)";
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: className || "pointer-events-none absolute inset-0 z-0",
      style: {
        backgroundImage: `linear-gradient(${linia} 1px, transparent 1px),linear-gradient(90deg, ${linia} 1px, transparent 1px)`,
        backgroundSize: `${oczko}px ${oczko}px`,
        WebkitMaskImage: maska,
        maskImage: maska
      }
    }
  );
};
var textareaVariants = cva(
  [
    "flex w-full rounded-xl border transition-colors duration-200",
    "bg-input text-foreground placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "px-3 py-2 text-sm"
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border hover:border-border/70",
        error: "border-destructive/50 hover:border-destructive/70 focus-visible:ring-destructive/60",
        ghost: "border-transparent bg-foreground/[0.04] hover:bg-foreground/[0.06] focus-visible:bg-input focus-visible:border-border"
      },
      resize: {
        none: "resize-none",
        auto: "resize-y"
      }
    },
    defaultVariants: {
      variant: "default",
      resize: "auto"
    }
  }
);
var Textarea = React33.forwardRef(
  ({ className, variant, resize, showCount, maxLength, autoGrow, onChange, value, defaultValue, ...props }, ref) => {
    const { isGlass } = useGlass();
    const innerRef = React33.useRef(null);
    React33.useImperativeHandle(ref, () => innerRef.current);
    const [count, setCount] = React33.useState(
      String(value ?? defaultValue ?? "").length
    );
    const grow = React33.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoGrow) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoGrow]);
    React33.useEffect(() => {
      grow();
    }, [grow, value]);
    return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          ref: innerRef,
          value,
          defaultValue,
          maxLength,
          className: cn(
            textareaVariants({ variant, resize: autoGrow ? "none" : resize }),
            isGlass && "nb-szklo",
            className
          ),
          onChange: (e) => {
            setCount(e.target.value.length);
            grow();
            onChange?.(e);
          },
          ...props
        }
      ),
      showCount && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-right text-[11px] text-muted-foreground", children: [
        count,
        maxLength ? ` / ${maxLength}` : ""
      ] })
    ] });
  }
);
Textarea.displayName = "Textarea";
function Toaster(props) {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme: "system",
      className: "toaster group",
      style: {
        "--normal-bg": "hsl(var(--popover))",
        "--normal-text": "hsl(var(--popover-foreground))",
        "--normal-border": "hsl(var(--border))",
        "--success-bg": "hsl(var(--popover))",
        "--success-text": "hsl(var(--popover-foreground))",
        "--success-border": "hsl(var(--primary) / 0.4)",
        "--error-bg": "hsl(var(--popover))",
        "--error-text": "hsl(var(--destructive))",
        "--error-border": "hsl(var(--destructive) / 0.4)",
        "--warning-bg": "hsl(var(--popover))",
        "--warning-text": "hsl(var(--popover-foreground))",
        "--border-radius": "var(--radius)",
        "--font-family": "var(--font-body), Inter, ui-sans-serif"
      },
      toastOptions: {
        classNames: {
          toast: "group-[.toaster]:border group-[.toaster]:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.28)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
}
var ELEWACJA_UNIESIONA = "shadow-[0_1px_2px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.28),inset_0_1px_0_0_rgb(255_255_255/0.12)]";
function GlassCard({
  variant = "default",
  radius = "rounded-2xl",
  padding = "p-5 lg:p-6",
  interactive = false,
  forceMode = "auto",
  className,
  children,
  ...props
}) {
  const { isGlass: isGlassCtx } = useGlass();
  const isGlass = forceMode === "solid" ? false : isGlassCtx;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        /* Soczewka na krawędzi. Zasięg steruje klasa na <html>:
           .nb-refrakcja-chrome  → tylko nav/panel/modal
           .nb-refrakcja-wszedzie → również karty i mniejsze elementy */
        isGlass ? "nb-szklo nb-szklo-plynne" : cn("nb-tafla", interactive && "nb-tafla-int"),
        ELEWACJA_UNIESIONA,
        radius,
        padding,
        interactive && "cursor-pointer hover:border-primary/40",
        className
      ),
      ...props,
      children
    }
  );
}

// src/components/glass/nb-displacement-map.ts
var CANVAS = 400;
var RIM = 12;
var SOFTEN = RIM * 0.8;
var PEAK_LOW = 0;
var PEAK_HIGH = 255;
function createWyraznaMap() {
  const inset = RIM / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
    <defs>
      <filter id="soften" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="${SOFTEN * 1.2}"/>
      </filter>
    </defs>
    <rect width="${CANVAS}" height="${CANVAS}" fill="rgb(128,128,128)"/>
    <rect x="0" y="${-inset}" width="${CANVAS}" height="${RIM * 1.5}" fill="rgb(128,${PEAK_HIGH},255)" filter="url(#soften)"/>
    <rect x="0" y="${CANVAS - inset}" width="${CANVAS}" height="${RIM * 1.5}" fill="rgb(128,${PEAK_LOW},0)" filter="url(#soften)"/>
    <rect x="${-inset}" y="0" width="${RIM * 1.5}" height="${CANVAS}" fill="rgb(${PEAK_HIGH},128,255)" filter="url(#soften)"/>
    <rect x="${CANVAS - inset}" y="0" width="${RIM * 1.5}" height="${CANVAS}" fill="rgb(${PEAK_LOW},128,0)" filter="url(#soften)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
var NB_MAPA_WYRAZNA = createWyraznaMap();

// src/components/glass/edge-refraction-map.ts
var CANVAS2 = 400;
var RIM2 = 10;
var SOFTEN2 = RIM2 * 0.8;
var PEAK_LOW2 = 0;
var PEAK_HIGH2 = 255;
function createFrameRefractionMap() {
  const inset = RIM2 / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS2}" height="${CANVAS2}" viewBox="0 0 ${CANVAS2} ${CANVAS2}">
    <defs>
      <filter id="soften" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="${SOFTEN2}"/>
      </filter>
    </defs>

    <!-- Base: neutral R=128 (no X shift), G=128 (no Y shift) across the whole body -->
    <rect width="${CANVAS2}" height="${CANVAS2}" fill="rgb(128,128,128)"/>

    <!-- TOP rim: G > 128 -> samples downward, inward from the top edge -->
    <rect x="0" y="${-inset}" width="${CANVAS2}" height="${RIM2}" fill="rgb(128,${PEAK_HIGH2},128)" filter="url(#soften)"/>
    <!-- BOTTOM rim: G < 128 -> samples upward, inward from the bottom edge -->
    <rect x="0" y="${CANVAS2 - inset}" width="${CANVAS2}" height="${RIM2}" fill="rgb(128,${PEAK_LOW2},128)" filter="url(#soften)"/>

    <!-- LEFT rim: R > 128 -> samples rightward, inward from the left edge -->
    <rect x="${-inset}" y="0" width="${RIM2}" height="${CANVAS2}" fill="rgb(${PEAK_HIGH2},128,128)" filter="url(#soften)"/>
    <!-- RIGHT rim: R < 128 -> samples leftward, inward from the right edge -->
    <rect x="${CANVAS2 - inset}" y="0" width="${RIM2}" height="${CANVAS2}" fill="rgb(${PEAK_LOW2},128,128)" filter="url(#soften)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
var EDGE_15_REFRACTION_MAP = createFrameRefractionMap();
function FastGlassFilter({ id, mapa, scale }) {
  return (
    // primitiveUnits="objectBoundingBox" forces feImage's 0..1 x/y/width/height to mean
    // exactly the filtered element's own box (no ambiguity with percentage resolution
    // that used to leave only the bottom rim inside the visible sampled window).
    // The filter region is kept tight to the element (no -10%/120% margin) since every
    // rim samples inward only — a smaller render buffer is cheaper for the GPU to
    // recompute on every one of the many glass tiles on screen.
    /* @__PURE__ */ jsxs("filter", { id, x: "0", y: "0", width: "1", height: "1", primitiveUnits: "objectBoundingBox", colorInterpolationFilters: "sRGB", children: [
      /* @__PURE__ */ jsx("feImage", { href: mapa, x: "0", y: "0", width: "1", height: "1", preserveAspectRatio: "none", result: "MAPA" }),
      /* @__PURE__ */ jsx("feDisplacementMap", { in: "SourceGraphic", in2: "MAPA", scale, xChannelSelector: "R", yChannelSelector: "G" })
    ] })
  );
}
function GlassFilter({ id, mapa, scaleR, scaleG, scaleB }) {
  return /* @__PURE__ */ jsxs(
    "filter",
    {
      id,
      x: "-35%",
      y: "-35%",
      width: "170%",
      height: "170%",
      colorInterpolationFilters: "sRGB",
      children: [
        /* @__PURE__ */ jsx(
          "feImage",
          {
            href: mapa,
            x: "0",
            y: "0",
            width: "100%",
            height: "100%",
            preserveAspectRatio: "none",
            result: "MAPA"
          }
        ),
        /* @__PURE__ */ jsx(
          "feDisplacementMap",
          {
            in: "SourceGraphic",
            in2: "MAPA",
            scale: scaleR,
            xChannelSelector: "R",
            yChannelSelector: "B",
            result: "KR_P"
          }
        ),
        /* @__PURE__ */ jsx(
          "feColorMatrix",
          {
            in: "KR_P",
            type: "matrix",
            values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
            result: "KR"
          }
        ),
        /* @__PURE__ */ jsx(
          "feDisplacementMap",
          {
            in: "SourceGraphic",
            in2: "MAPA",
            scale: scaleG,
            xChannelSelector: "R",
            yChannelSelector: "B",
            result: "KG_P"
          }
        ),
        /* @__PURE__ */ jsx(
          "feColorMatrix",
          {
            in: "KG_P",
            type: "matrix",
            values: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
            result: "KG"
          }
        ),
        /* @__PURE__ */ jsx(
          "feDisplacementMap",
          {
            in: "SourceGraphic",
            in2: "MAPA",
            scale: scaleB,
            xChannelSelector: "R",
            yChannelSelector: "B",
            result: "KB_P"
          }
        ),
        /* @__PURE__ */ jsx(
          "feColorMatrix",
          {
            in: "KB_P",
            type: "matrix",
            values: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
            result: "KB"
          }
        ),
        /* @__PURE__ */ jsx("feBlend", { in: "KG", in2: "KB", mode: "screen", result: "GB" }),
        /* @__PURE__ */ jsx("feBlend", { in: "KR", in2: "GB", mode: "screen", result: "RGB" }),
        /* @__PURE__ */ jsx("feGaussianBlur", { in: "RGB", stdDeviation: "0.3" })
      ]
    }
  );
}
function NbGlassFilters() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": "true",
      style: { position: "absolute", width: 0, height: 0, overflow: "hidden" },
      children: /* @__PURE__ */ jsx(
        "svg",
        {
          "aria-hidden": "true",
          focusable: "false",
          style: { position: "absolute", width: 0, height: 0 },
          children: /* @__PURE__ */ jsxs("defs", { children: [
            /* @__PURE__ */ jsx(
              FastGlassFilter,
              {
                id: "nb-refrakcja-delikatne",
                mapa: EDGE_15_REFRACTION_MAP,
                scale: 0.065
              }
            ),
            /* @__PURE__ */ jsx(
              GlassFilter,
              {
                id: "nb-refrakcja-wyrazne",
                mapa: NB_MAPA_WYRAZNA,
                scaleR: 84,
                scaleG: 92,
                scaleB: 100
              }
            )
          ] })
        }
      )
    }
  );
}
function GlassPanel({
  direction = "row",
  className,
  children,
  ...props
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia rounded-2xl" : "border border-border bg-muted/30 rounded-2xl",
        "flex items-center gap-2 p-2",
        direction === "col" && "flex-col",
        className
      ),
      ...props,
      children
    }
  );
}
var sizeMap = {
  sm: "h-8  px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};
function GlassInput({
  iconLeft,
  iconRight,
  size = "default",
  className,
  ...props
}) {
  const { isGlass } = useGlass();
  const hasLeft = !!iconLeft;
  const hasRight = !!iconRight;
  return /* @__PURE__ */ jsxs("div", { className: "relative flex items-center w-full", children: [
    hasLeft && /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute left-3 flex items-center text-foreground/50", children: iconLeft }),
    /* @__PURE__ */ jsx(
      "input",
      {
        className: cn(
          isGlass ? "nb-szklo bg-transparent" : "border border-border bg-input",
          "w-full rounded-xl outline-none",
          "text-foreground placeholder:text-foreground/40",
          "transition-[border-color,box-shadow] duration-200",
          "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
          sizeMap[size],
          hasLeft && "pl-9",
          hasRight && "pr-9",
          className
        ),
        ...props
      }
    ),
    hasRight && /* @__PURE__ */ jsx("span", { className: "absolute right-3 flex items-center text-foreground/50", children: iconRight })
  ] });
}
var sizeMap2 = {
  sm: { wrap: "h-8", icon: "h-3.5 w-3.5", input: "text-xs  pl-8  pr-7", iconLeft: "left-2.5", iconRight: "right-2" },
  default: { wrap: "h-10", icon: "h-4 w-4", input: "text-sm  pl-10 pr-8", iconLeft: "left-3", iconRight: "right-2.5" },
  lg: { wrap: "h-12", icon: "h-5 w-5", input: "text-base pl-12 pr-10", iconLeft: "left-3.5", iconRight: "right-3" }
};
function GlassSearch({
  placeholder = "Szukaj...",
  value,
  onChange,
  onSearch,
  size = "default",
  className,
  autoFocus
}) {
  const { isGlass } = useGlass();
  const inputRef = useRef(null);
  const sz = sizeMap2[size];
  function handleKey(e) {
    if (e.key === "Enter") onSearch?.(e.currentTarget.value);
    if (e.key === "Escape") {
      onChange?.("");
      inputRef.current?.blur();
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: cn(
    isGlass ? "nb-szklo" : "border border-border bg-input",
    "relative flex items-center rounded-full",
    sz.wrap,
    className
  ), children: [
    /* @__PURE__ */ jsx(Search, { className: cn("pointer-events-none absolute text-foreground/45", sz.icon, sz.iconLeft) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: inputRef,
        type: "search",
        value,
        onChange: (e) => onChange?.(e.target.value),
        onKeyDown: handleKey,
        placeholder,
        autoFocus,
        className: cn(
          "h-full w-full bg-transparent outline-none",
          "text-foreground placeholder:text-foreground/40",
          "[&::-webkit-search-cancel-button]:hidden",
          sz.input
        )
      }
    ),
    value && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          onChange?.("");
          inputRef.current?.focus();
        },
        className: cn("absolute flex items-center justify-center rounded-full p-0.5 text-foreground/50 hover:text-foreground", sz.iconRight),
        children: /* @__PURE__ */ jsx(X, { className: sz.icon })
      }
    )
  ] });
}
var sizeMap3 = {
  sm: "h-8  px-3   text-xs  gap-1.5 rounded-xl",
  default: "h-10 px-4   text-sm  gap-2   rounded-xl",
  lg: "h-12 px-6   text-base gap-2   rounded-2xl",
  icon: "h-10 w-10   text-sm          rounded-xl"
};
var normalBase = "border font-medium transition-all duration-200";
var normalMap = {
  /* CTA — pełny kolor marki. To jest to jedno miejsce, gdzie primary działa
     jako powierzchnia, nie jako szept. Domyślny wybór dla wezwań. */
  primary: "border-transparent bg-primary text-primary-foreground shadow-[0_1px_0_0_hsl(210_40%_100%/.15)_inset,0_8px_18px_-8px_hsl(var(--primary)/.5)] hover:brightness-110",
  /* CTA-gwiazda strony — jedyne miejsce z mocnym poświatowym cieniem.
     Dla "wybierz to" momentów (plan Ultimate, finałowe zaproszenie). */
  hero: "border-primary/60 bg-primary text-primary-foreground font-bold shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)] hover:brightness-110 active:scale-[0.98]",
  solid: "border-border/60 bg-muted/30 text-foreground hover:bg-muted/60 hover:border-border/80",
  ghost: "border-transparent text-foreground/70 hover:bg-muted/40 hover:text-foreground hover:border-border/40",
  outline: "border-border/70 bg-transparent text-foreground hover:bg-muted/30",
  danger: "border-destructive/40 bg-destructive/8 text-destructive hover:bg-destructive/14 hover:border-destructive/60",
  success: "border-emerald-500/40 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/14 hover:border-emerald-500/60"
};
var glassOverlay = {
  /* Nawet w glass, primary CTA ma realne wypełnienie — glass to podkład
     scenerii, primary to element interakcji. Nie mieszamy. */
  primary: "bg-primary text-primary-foreground border-transparent hover:brightness-110",
  hero: "bg-primary text-primary-foreground font-bold border-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)] hover:brightness-110 active:scale-[0.98]",
  solid: "text-foreground",
  ghost: "text-foreground/80 hover:text-foreground",
  outline: "text-foreground border-foreground/25 hover:border-foreground/45",
  danger: "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/16",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/28 hover:bg-emerald-500/16"
};
function GlassButton({
  variant = "solid",
  size = "default",
  className,
  children,
  disabled,
  ...props
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    "button",
    {
      disabled,
      className: cn(
        "inline-flex items-center justify-center font-medium select-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "disabled:pointer-events-none disabled:opacity-50",
        sizeMap3[size],
        isGlass ? variant === "primary" || variant === "hero" ? cn("border", glassOverlay[variant]) : cn("nb-szklo", glassOverlay[variant]) : cn(normalBase, normalMap[variant]),
        className
      ),
      ...props,
      children
    }
  );
}
var intentGlass2 = {
  neutral: "border-foreground/20 text-foreground/80",
  primary: "border-primary/40 text-primary",
  success: "border-emerald-400/40 text-emerald-400",
  warning: "border-amber-400/40 text-amber-400",
  danger: "border-red-400/40 text-red-400"
};
var intentNormal2 = {
  neutral: "border-border bg-muted text-foreground",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-400",
  danger: "border-red-400/40 bg-red-500/10 text-red-400"
};
var dotMap2 = {
  neutral: "bg-foreground/60",
  primary: "bg-primary",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400"
};
function GlassBadge({
  intent = "neutral",
  size = "default",
  dot = false,
  className,
  children,
  ...props
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cn(
        isGlass ? "nb-szklo" : intentNormal2[intent],
        isGlass && intentGlass2[intent],
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      ),
      ...props,
      children: [
        dot && /* @__PURE__ */ jsx("span", { className: cn("h-1.5 w-1.5 rounded-full", dotMap2[intent]) }),
        children
      ]
    }
  );
}
function GlassStat({
  label,
  value,
  delta,
  trend = "neutral",
  icon,
  subtext,
  className
}) {
  const trendIntent = trend === "up" ? "success" : trend === "down" ? "danger" : "neutral";
  return /* @__PURE__ */ jsxs(GlassCard, { className: cn("flex flex-col gap-3", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-foreground/60", children: label }),
      icon && /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl nb-wglobienie-gnizado text-foreground/70", children: icon })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "nb-liczby text-2xl font-semibold leading-none text-primary", children: value }),
      delta && /* @__PURE__ */ jsx(GlassBadge, { intent: trendIntent, size: "sm", dot: true, children: delta })
    ] }),
    subtext && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-foreground/45", children: subtext })
  ] });
}
function GlassModal({
  open,
  onClose,
  title,
  description,
  width = "max-w-md",
  className,
  children,
  footer
}) {
  const { isGlass } = useGlass();
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[9000] flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: cn(
          "absolute inset-0",
          isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia rounded-none border-0" : "bg-background/80 backdrop-blur-sm"
        ),
        style: isGlass ? { backdropFilter: "blur(16px) saturate(1.4)", background: "hsl(var(--card) / 0.25)" } : {},
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs(
      GlassCard,
      {
        role: "dialog",
        "aria-modal": "true",
        className: cn("relative z-10 w-full", width, "rounded-2xl p-0 overflow-hidden", className),
        padding: "p-0",
        radius: "rounded-2xl",
        children: [
          (title || description) && /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-foreground/10 px-6 py-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              title && /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-foreground", children: title }),
              description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-foreground/60", children: description })
            ] }),
            /* @__PURE__ */ jsx(GlassButton, { size: "icon", variant: "ghost", onClick: onClose, className: "shrink-0 h-8 w-8 rounded-full", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 py-5", children }),
          footer && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-2 border-t border-foreground/10 px-6 py-4", children: footer })
        ]
      }
    )
  ] });
}
function GlassNav({
  position = "top",
  className,
  children,
  ...props
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx(
    "nav",
    {
      className: cn(
        isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
        "flex items-center gap-3 rounded-2xl border px-4 py-2",
        position === "top" && "sticky top-4 z-50",
        className
      ),
      ...props,
      children
    }
  );
}
function GlassNavItem({ active = false, className, children, ...props }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: cn(
        "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-150",
        active ? "text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5",
        className
      ),
      ...props,
      children
    }
  );
}
function GlassNavBrand({ className, children, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex items-center gap-2 text-sm font-semibold text-foreground mr-2", className), ...props, children });
}
function GlassNavSpacer() {
  return /* @__PURE__ */ jsx("span", { className: "flex-1" });
}
var DEFAULT_MODELS = [
  {
    id: "szybki",
    name: "Szybki",
    provider: "NextByte",
    badge: "NEXTBYTE",
    description: "B\u0142yskawiczne odpowiedzi do prostych zada\u0144",
    fullDescription: "Gemini 2.0 Flash \u2014 zoptymalizowana pod k\u0105tem ultra szybkiego czasu reakcji i codziennych zapyta\u0144.",
    contextLabel: "Kontekst: 1M token\xF3w",
    tags: ["fast", "gemini", "nextbyte"],
    cost: 1,
    speed: "fast",
    icon: /* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }),
    group: "NEXTBYTE",
    metrics: [
      { label: "Inteligencja", value: 6 },
      { label: "Szybko\u015B\u0107", value: 10 },
      { label: "Kontekst", value: 9 },
      { label: "Koszt", value: 2 }
    ],
    messageCost: 1,
    reasoningLevels: ["Standard", "B\u0142yskawiczny"]
  },
  {
    id: "pro",
    name: "Pro",
    provider: "NextByte",
    badge: "NEXTBYTE",
    description: "Zaawansowane rozumowanie i analiza",
    fullDescription: "Gemini 3.1 Pro Preview \u2014 zaawansowane rozumowanie i analiza do bardziej z\u0142o\u017Conych zada\u0144 (2 Byte).",
    contextLabel: "Kontekst: 1M token\xF3w",
    tags: ["reasoning", "analysis", "pro"],
    cost: 2,
    speed: "balanced",
    icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
    group: "NEXTBYTE",
    metrics: [
      { label: "Inteligencja", value: 8 },
      { label: "Szybko\u015B\u0107", value: 7 },
      { label: "Kontekst", value: 10 },
      { label: "Koszt", value: 8 }
    ],
    messageCost: 2,
    reasoningLevels: ["Niski", "\u015Aredni", "Wysoki"]
  },
  {
    id: "ultra",
    name: "Ultra",
    provider: "NextByte",
    badge: "NEXTBYTE",
    description: "Najwy\u017Csza jako\u015B\u0107 \u2014 szybko\u015B\u0107 i inteligencja",
    fullDescription: "Claude 3.7 Sonnet / Gemini 1.5 Pro \u2014 bezkompromisowa jako\u015B\u0107 wnioskowania, analiza z\u0142o\u017Conych problem\xF3w.",
    contextLabel: "Kontekst: 2M token\xF3w",
    tags: ["ultra", "flagship", "code"],
    cost: 2,
    speed: "powerful",
    icon: /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }),
    group: "NEXTBYTE",
    metrics: [
      { label: "Inteligencja", value: 10 },
      { label: "Szybko\u015B\u0107", value: 8 },
      { label: "Kontekst", value: 10 },
      { label: "Koszt", value: 9 }
    ],
    messageCost: 2,
    reasoningLevels: ["Niski", "\u015Aredni", "G\u0142\u0119boki"]
  },
  {
    id: "lokalny",
    name: "Lokalny",
    provider: "NextByte",
    badge: "LOCAL",
    description: "Najpierw przetestuj po\u0142\u0105czenie",
    fullDescription: "Lokalne \u015Brodowisko AI (Ollama / LocalAI) uruchamiane na Twoim sprz\u0119cie bez przesy\u0142ania danych do chmury.",
    contextLabel: "Kontekst: 8K token\xF3w",
    tags: ["local", "privacy", "ollama"],
    needsSetup: true,
    speed: "fast",
    icon: /* @__PURE__ */ jsx(Server, { className: "h-4 w-4" }),
    group: "NEXTBYTE",
    metrics: [
      { label: "Inteligencja", value: 5 },
      { label: "Szybko\u015B\u0107", value: 9 },
      { label: "Kontekst", value: 3 },
      { label: "Koszt", value: 1 }
    ],
    messageCost: 0,
    reasoningLevels: ["Brak", "Lokalny"]
  },
  {
    id: "grok",
    name: "Grok 4.3",
    provider: "xAI",
    badge: "XAI",
    description: "xAI \u2014 agentic reasoning, 1M kontekst",
    fullDescription: "Grok 4.3 od xAI \u2014 zaawansowany model z naciskiem na wnioskowanie agentowe i wiedz\u0119 w czasie rzeczywistym.",
    contextLabel: "Kontekst: 1M token\xF3w",
    tags: ["grok", "xai", "realtime"],
    cost: 2,
    speed: "powerful",
    icon: /* @__PURE__ */ jsx(Rocket, { className: "h-4 w-4" }),
    group: "INNE MODELE",
    metrics: [
      { label: "Inteligencja", value: 9 },
      { label: "Szybko\u015B\u0107", value: 8 },
      { label: "Kontekst", value: 9 },
      { label: "Koszt", value: 7 }
    ],
    messageCost: 2,
    reasoningLevels: ["Niski", "\u015Aredni", "Wysoki"]
  },
  {
    id: "gpt",
    name: "GPT-5.4",
    provider: "OpenAI",
    badge: "OPENAI",
    description: "OpenAI \u2014 uniwersalny model do zada\u0144 mieszanych",
    fullDescription: "Flagowa linia modeli OpenAI z ulepszon\u0105 logik\u0105, syntez\u0105 wielomodaln\u0105 i szerok\u0105 wiedz\u0105 og\xF3ln\u0105.",
    contextLabel: "Kontekst: 128K token\xF3w",
    tags: ["openai", "gpt5", "multimodal"],
    cost: 2,
    speed: "balanced",
    icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
    group: "INNE MODELE",
    metrics: [
      { label: "Inteligencja", value: 9 },
      { label: "Szybko\u015B\u0107", value: 8 },
      { label: "Kontekst", value: 8 },
      { label: "Koszt", value: 8 }
    ],
    messageCost: 2,
    reasoningLevels: ["Niski", "\u015Aredni", "Wysoki"]
  },
  {
    id: "opus",
    name: "Claude Opus 5",
    provider: "Anthropic",
    badge: "ANTHROPIC",
    description: "Anthropic \u2014 d\u0142ugie konteksty i praca z kodem",
    fullDescription: "Model najwy\u017Cszej pr\xF3by od Anthropic \u2014 stworzony do d\u0142ugich dokument\xF3w, dog\u0142\u0119bnych analiz i pisania kodu.",
    contextLabel: "Kontekst: 200K token\xF3w",
    tags: ["anthropic", "claude", "code"],
    cost: 3,
    speed: "powerful",
    icon: /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }),
    group: "INNE MODELE",
    metrics: [
      { label: "Inteligencja", value: 10 },
      { label: "Szybko\u015B\u0107", value: 6 },
      { label: "Kontekst", value: 9 },
      { label: "Koszt", value: 10 }
    ],
    messageCost: 3,
    reasoningLevels: ["\u015Aredni", "Maksymalny"]
  },
  {
    id: "flux",
    name: "FLUX 1.1 Pro",
    provider: "Black Forest",
    badge: "BLACK FOREST",
    description: "Generowanie obraz\xF3w najwy\u017Cszej jako\u015Bci",
    fullDescription: "Generatywny model grafik i ilustracji o najwy\u017Cszym poziomie szczeg\xF3\u0142\xF3w i precyzyjnym rozumieniu tekstowych prompt\xF3w.",
    contextLabel: "Visual Prompt",
    tags: ["image-gen", "flux", "art"],
    cost: 2,
    speed: "balanced",
    icon: /* @__PURE__ */ jsx(Image, { className: "h-4 w-4" }),
    group: "INNE MODELE",
    metrics: [
      { label: "Inteligencja", value: 9 },
      { label: "Szybko\u015B\u0107", value: 7 },
      { label: "Kontekst", value: 5 },
      { label: "Koszt", value: 7 }
    ],
    messageCost: 2,
    reasoningLevels: ["Standard", "Ultra"]
  },
  {
    id: "llama",
    name: "Llama 3.3 70B",
    provider: "Meta",
    badge: "META",
    description: "Open source, lokalny i bez cenzury",
    fullDescription: "Open source od Meta AI \u2014 wszechstronny, zbalansowany i wysoce wydajny model do lokalnych zastosowa\u0144.",
    contextLabel: "Kontekst: 128K token\xF3w",
    tags: ["open-source", "meta", "llama"],
    cost: 1,
    speed: "fast",
    icon: /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }),
    group: "INNE MODELE",
    metrics: [
      { label: "Inteligencja", value: 8 },
      { label: "Szybko\u015B\u0107", value: 9 },
      { label: "Kontekst", value: 8 },
      { label: "Koszt", value: 3 }
    ],
    messageCost: 1,
    reasoningLevels: ["Standard"]
  }
];
function MetricBars({ value, max = 10 }) {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-[3px]", children: Array.from({ length: max }).map((_, i) => /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "h-[8px] flex-1 rounded-[2px] transition-all duration-200",
        i < value ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : "bg-foreground/[0.08]"
      )
    },
    i
  )) });
}
function GlassModelSearch({
  className,
  onSelect,
  selectedId = "szybki",
  models = DEFAULT_MODELS,
  mode = "dropdown",
  placement = "top",
  defaultOpen = false
}) {
  const { isGlass } = useGlass();
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [activeModelId, setActiveModelId] = useState(selectedId);
  const [hoveredModelId, setHoveredModelId] = useState(null);
  const [reasoningLevelsState, setReasoningLevelsState] = useState({
    pro: "\u015Aredni",
    ultra: "\u015Aredni",
    grok: "\u015Aredni",
    gpt: "\u015Aredni"
  });
  const containerRef = useRef(null);
  useEffect(() => {
    setActiveModelId(selectedId);
  }, [selectedId]);
  useEffect(() => {
    if (mode !== "dropdown") return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);
  const selectedModel = models.find((m) => m.id === activeModelId) || models[0];
  const peekedModel = models.find((m) => m.id === (hoveredModelId || activeModelId)) || selectedModel;
  const filtered = models.filter(
    (m) => !query || [m.name, m.provider, m.description, ...m.tags].some(
      (s) => s.toLowerCase().includes(query.toLowerCase())
    )
  );
  const groups = [
    { label: "NEXTBYTE", items: filtered.filter((m) => m.group === "NEXTBYTE") },
    { label: "INNE MODELE", items: filtered.filter((m) => m.group === "INNE MODELE") }
  ];
  function handleModelClick(model) {
    setActiveModelId(model.id);
    onSelect?.(model);
    if (mode === "dropdown") {
      setOpen(false);
    }
  }
  const activeReasoningLevel = reasoningLevelsState[peekedModel.id] || peekedModel.reasoningLevels[0] || "\u015Aredni";
  const popoverContent = /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-col md:flex-row gap-3 p-3 rounded-2xl border shadow-2xl transition-all duration-200 backdrop-blur-xl",
        isGlass ? "nb-szklo nb-szklo-plynne border-border/60 bg-background/95 shadow-primary/10" : "bg-card border-border/80 text-card-foreground",
        mode === "dropdown" && "w-full md:w-[700px] max-w-[95vw]"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative mb-1", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: query,
                onChange: (e) => setQuery(e.target.value),
                placeholder: "Szukaj modelu AI...",
                className: "w-full h-8 pl-8 pr-3 text-xs bg-muted/40 border border-border/50 rounded-xl placeholder:text-muted-foreground/60 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "max-h-[380px] overflow-y-auto pr-1 space-y-3", children: [
            groups.map((group) => {
              if (group.items.length === 0) return null;
              return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("p", { className: "px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60", children: group.label }),
                group.items.map((model) => {
                  const isActive = model.id === activeModelId;
                  const isHovered = model.id === hoveredModelId;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleModelClick(model),
                      onMouseEnter: () => setHoveredModelId(model.id),
                      onMouseLeave: () => setHoveredModelId(null),
                      className: cn(
                        "group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-150 border",
                        isActive ? "border-primary/40 bg-primary/[0.08] shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)]" : isHovered ? "border-border/60 bg-foreground/[0.04]" : "border-transparent hover:bg-foreground/[0.03]"
                      ),
                      children: [
                        isActive && /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                              isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                            ),
                            children: model.icon
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: cn(
                                  "text-xs font-semibold leading-tight",
                                  isActive ? "text-primary" : "text-foreground"
                                ),
                                children: model.name
                              }
                            ),
                            model.needsSetup && /* @__PURE__ */ jsx("span", { className: "rounded bg-amber-400/15 px-1 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-400", children: "SKONFIGURUJ" })
                          ] }),
                          /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-[11px] text-muted-foreground/80 leading-none", children: model.description })
                        ] }),
                        model.cost !== void 0 && /* @__PURE__ */ jsxs(
                          "span",
                          {
                            className: cn(
                              "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums",
                              isActive ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"
                            ),
                            children: [
                              "\u27E0 ",
                              model.cost
                            ]
                          }
                        )
                      ]
                    },
                    model.id
                  );
                })
              ] }, group.label);
            }),
            filtered.length === 0 && /* @__PURE__ */ jsxs("p", { className: "py-6 text-center text-xs text-muted-foreground", children: [
              "Brak modeli pasuj\u0105cych do \u201C",
              query,
              "\u201D"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full md:w-[320px] shrink-0 rounded-xl border border-border/50 bg-foreground/[0.02] p-4 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-base font-bold leading-none text-foreground", children: peekedModel.name }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-primary/80", children: peekedModel.badge || peekedModel.provider })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-relaxed text-muted-foreground", children: peekedModel.fullDescription || peekedModel.description }),
            peekedModel.contextLabel && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] font-mono text-muted-foreground/70", children: peekedModel.contextLabel }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-2 gap-x-4 gap-y-3", children: peekedModel.metrics.map((m) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70", children: m.label }),
              /* @__PURE__ */ jsx(MetricBars, { value: m.value })
            ] }, m.label)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground", children: "KOSZT WIADOMO\u015ACI" }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary tabular-nums", children: [
                peekedModel.messageCost,
                " Byte"
              ] })
            ] })
          ] }),
          peekedModel.reasoningLevels.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-3 border-t border-border/40", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70", children: "KONFIGURACJA" }),
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-medium text-foreground", children: "Poziom rozumowania" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-xl bg-muted/40 p-1", children: peekedModel.reasoningLevels.map((lvl) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setReasoningLevelsState((prev) => ({
                  ...prev,
                  [peekedModel.id]: lvl
                })),
                className: cn(
                  "flex h-7 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150",
                  lvl === activeReasoningLevel ? "bg-primary/20 text-primary font-semibold shadow-xs border border-primary/30" : "text-muted-foreground hover:text-foreground"
                ),
                children: lvl
              },
              lvl
            )) })
          ] })
        ] })
      ]
    }
  );
  if (mode === "inline") {
    return /* @__PURE__ */ jsx("div", { className: cn("w-full", className), children: popoverContent });
  }
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: cn("relative inline-block text-left", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen(!open),
        className: cn(
          "group inline-flex items-center gap-2 border border-border bg-background/40 h-11 px-3 text-[14px] text-card-foreground rounded-full transition-all duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 sm:h-9 text-xs font-medium",
          open && "border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: selectedModel.icon }),
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-left", children: selectedModel.name }),
          selectedModel.cost !== void 0 && /* @__PURE__ */ jsxs("span", { className: "shrink-0 tabular-nums text-primary/80 font-mono", children: [
            "\u27E0 ",
            selectedModel.cost
          ] }),
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute z-50 left-0 animate-in fade-in zoom-in-95 duration-150",
          placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
        ),
        children: popoverContent
      }
    )
  ] });
}
function GlassChatComposer({
  modelName,
  modelIcon: ModelIcon = Sparkles,
  modelCost,
  modelMenuOpen = false,
  onModelClick,
  toggles = [],
  onToggle,
  value,
  onChange,
  onSend,
  placeholder = "Napisz wiadomo\u015B\u0107...",
  tokenCount,
  sendCost,
  disabled,
  footerText,
  className
}) {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33__default.useState("");
  const val = value !== void 0 ? value : internal;
  const canSend = !disabled && val.trim().length > 0;
  function set(v) {
    if (value === void 0) setInternal(v);
    onChange?.(v);
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("mx-auto w-full max-w-4xl", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative rounded-[1.75rem] border shadow-2xl transition-colors duration-200",
          isGlass ? "nb-szklo nb-szklo-plynne shadow-primary/5 ring-1 ring-foreground/[0.04] border-border/60 hover:border-border/70" : "bg-card border-border/70 hover:border-border"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 px-3 pt-2.5", children: [
            /* @__PURE__ */ jsx(
              GlassModelSearch,
              {
                selectedId: modelName.toLowerCase().includes("szybki") ? "szybki" : modelName.toLowerCase().includes("pro") ? "pro" : "szybki",
                onSelect: (model) => onModelClick?.(),
                placement: "top"
              }
            ),
            toggles.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-1", children: toggles.map((t) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => onToggle?.(t.id),
                title: t.label,
                className: cn(
                  "relative inline-flex h-7 items-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                  t.active ? "border-primary/30 bg-gradient-to-br from-primary/15 via-transparent to-primary/5 text-primary shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.4)] after:absolute after:inset-x-3 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent" : "border-muted-foreground/20 bg-muted/30 text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsx(t.icon, { className: "h-3 w-3" }),
                  /* @__PURE__ */ jsx("span", { children: t.label })
                ]
              },
              t.id
            )) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
            "textarea",
            {
              value: val,
              disabled,
              placeholder,
              rows: 2,
              onChange: (e) => set(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend?.();
                }
              },
              className: "!min-h-0 min-h-0 w-full resize-none border-0 bg-transparent px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              style: { minHeight: 56, maxHeight: 120, height: 56 }
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "mx-3 h-px bg-border/20" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
              /* @__PURE__ */ jsx(ComposerTool, { icon: Paperclip, title: "Za\u0142\u0105cz plik" }),
              /* @__PURE__ */ jsx(ComposerTool, { icon: Mic, title: "Nagraj" }),
              /* @__PURE__ */ jsx(ComposerTool, { icon: Phone, title: "Rozpocznij rozmow\u0119 g\u0142osow\u0105" }),
              /* @__PURE__ */ jsx(ComposerTool, { icon: Wand2, title: "Biblioteka prompt\xF3w" }),
              /* @__PURE__ */ jsx(ComposerTool, { icon: Sparkles, title: "Deep Research" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-1.5", children: [
              tokenCount && /* @__PURE__ */ jsxs(
                "div",
                {
                  title: "Ilo\u015B\u0107 token\xF3w kontekstu",
                  className: "inline-flex h-9 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 text-xs text-primary/85 transition-colors hover:bg-primary/15 hover:text-primary",
                  children: [
                    /* @__PURE__ */ jsx(Layers, { className: "h-3 w-3 opacity-80" }),
                    /* @__PURE__ */ jsx("span", { className: "font-semibold tabular-nums", children: tokenCount }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-wide opacity-70", children: "tok" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: onSend,
                  disabled: !canSend,
                  className: cn(
                    "relative z-10 flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-200",
                    canSend ? "border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15" : "cursor-not-allowed border-primary/30 bg-primary/10 text-foreground opacity-50"
                  ),
                  children: [
                    /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 text-primary" }),
                    /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Wy\u015Blij" }),
                    sendCost !== void 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 font-semibold tabular-nums text-primary", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-xs", children: "\xB7" }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs", children: sendCost }),
                      /* @__PURE__ */ jsx("span", { className: "text-xs", children: "\u27E0" })
                    ] })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    ),
    footerText !== void 0 ? /* @__PURE__ */ jsx("p", { className: "px-3 pb-3 pt-2 text-center text-[10px] text-muted-foreground/70", children: footerText }) : /* @__PURE__ */ jsxs("p", { className: "px-3 pb-3 pt-2 text-center text-[10px] text-muted-foreground/70", children: [
      "Rozmawiasz ze sztuczn\u0105 inteligencj\u0105 (AI). AI mo\u017Ce pope\u0142nia\u0107 b\u0142\u0119dy \u2014 sprawdzaj wa\u017Cne informacje.",
      " ",
      /* @__PURE__ */ jsx("a", { href: "#", className: "underline transition-colors hover:text-muted-foreground", children: "Polityka prywatno\u015Bci" })
    ] })
  ] });
}
function ComposerTool({ icon: Icon2, title }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      title,
      className: "group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30 p-0 transition-colors duration-200 hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9",
      children: /* @__PURE__ */ jsx(Icon2, { className: "h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-foreground" })
    }
  );
}
function MetricBars2({ value, max = 10 }) {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-[3px]", children: Array.from({ length: max }).map((_, i) => /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "h-[8px] flex-1 rounded-sm",
        i < value ? "bg-primary" : "bg-foreground/[0.08]"
      )
    },
    i
  )) });
}
function GlassModelPicker({
  groups,
  activeId,
  peekId,
  onSelect,
  detail,
  onReasoningLevelChange,
  className
}) {
  const { isGlass } = useGlass();
  const panelCls = isGlass ? "nb-szklo nb-szklo-plynne border border-border/40" : "bg-card border border-border";
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-start gap-4", className), children: [
    /* @__PURE__ */ jsx("div", { className: cn("w-[340px] shrink-0 overflow-hidden rounded-2xl", panelCls), children: /* @__PURE__ */ jsx("div", { className: "max-h-[480px] overflow-y-auto p-2", children: groups.map((group, gi) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: cn(
        "px-3 pb-2 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40",
        gi > 0 && "pt-4"
      ), children: group.label }),
      group.items.map((item) => {
        const isActive = item.id === activeId;
        const isPeek = item.id === peekId && !isActive;
        const Icon2 = item.icon;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => onSelect?.(item),
            className: cn(
              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
              isActive ? "bg-primary/[0.08] border border-primary/20" : isPeek ? "bg-foreground/[0.04] border border-transparent" : "border border-transparent hover:bg-foreground/[0.03] hover:border-border/30"
            ),
            children: [
              isActive && /* @__PURE__ */ jsx(
                "span",
                {
                  "aria-hidden": true,
                  className: "absolute inset-y-[8px] left-0 w-[3px] rounded-full bg-primary"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isActive ? "bg-primary/10 text-primary" : "bg-foreground/[0.06] text-foreground/50 group-hover:text-foreground/70"
              ), children: /* @__PURE__ */ jsx(Icon2, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: cn(
                    "text-sm font-semibold leading-tight",
                    isActive ? "text-primary" : "text-foreground"
                  ), children: item.name }),
                  item.needsSetup && /* @__PURE__ */ jsx("span", { className: "rounded-[4px] bg-amber-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-amber-400", children: "Skonfiguruj" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-[11.5px] leading-tight text-foreground/45", children: item.description })
              ] }),
              item.cost !== void 0 && /* @__PURE__ */ jsxs("span", { className: cn(
                "shrink-0 rounded-full px-2 py-1 font-mono text-[11px] font-medium tabular-nums",
                isActive ? "bg-primary/[0.12] text-primary" : "bg-foreground/[0.05] text-foreground/40"
              ), children: [
                "\u27E0 ",
                item.cost
              ] })
            ]
          },
          item.id
        );
      })
    ] }, group.label)) }) }),
    /* @__PURE__ */ jsxs("div", { className: cn("w-[360px] shrink-0 rounded-2xl p-5", panelCls), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[18px] font-bold leading-none text-foreground", children: detail.name }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/35", children: detail.badge })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2.5 text-[12.5px] leading-[1.6] text-foreground/50", children: detail.description }),
      /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[11px] text-foreground/30", children: detail.contextLabel }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-2 gap-x-6 gap-y-4", children: detail.metrics.map((m) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.15em] text-foreground/50", children: m.label }),
        /* @__PURE__ */ jsx(MetricBars2, { value: m.value, max: m.max })
      ] }, m.label)) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between gap-3 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] px-4 py-3", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/45", children: "Koszt wiadomo\u015Bci" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[17px] font-bold leading-none text-primary", children: [
          detail.messageCost,
          " Byte"
        ] })
      ] }),
      detail.reasoningLevels.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/35", children: "Konfiguracja" }),
        /* @__PURE__ */ jsx("p", { className: "mb-3 text-[13px] text-foreground/80", children: "Poziom rozumowania" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-xl bg-foreground/[0.04] p-1", children: detail.reasoningLevels.map((level) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => onReasoningLevelChange?.(level),
            className: cn(
              "flex h-9 flex-1 items-center justify-center rounded-lg text-[13px] font-medium transition-all duration-150",
              level === detail.activeReasoningLevel ? "bg-foreground/[0.10] text-foreground shadow-sm" : "text-foreground/40 hover:text-foreground/65"
            ),
            children: level
          },
          level
        )) })
      ] })
    ] })
  ] });
}
var R = 40;
var CX = 50;
var CY = 50;
var CIRC = 2 * Math.PI * R;
var ARC = CIRC * (270 / 360);
var GAP = CIRC - ARC;
function GlassRing({
  value = 0,
  segments,
  size = 120,
  variant = "full",
  label,
  sublabel,
  subtext,
  color = "hsl(var(--primary))",
  thickness = 8,
  className
}) {
  const { isGlass } = useGlass();
  const pct = Math.min(100, Math.max(0, value));
  const labelStr = label !== void 0 ? String(label) : `${pct}%`;
  const fontSize = labelStr.length > 4 ? 14 : labelStr.length > 2 ? 18 : 22;
  const glowStyle = isGlass ? { filter: `drop-shadow(0 0 3px ${color})` } : {};
  if (segments && segments.length > 0) {
    const circ = 2 * Math.PI * R;
    let cum = 0;
    return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center", className), children: [
      /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", fill: "none", className: "-rotate-90", children: [
        /* @__PURE__ */ jsx("circle", { cx: CX, cy: CY, r: R, stroke: "hsl(var(--foreground) / 0.10)", strokeWidth: thickness }),
        segments.map((seg, i) => {
          const gapDeg = segments.length > 1 ? 1.5 : 0;
          const segCirc = seg.pct / 100 * circ;
          const dash = Math.max(0, segCirc - gapDeg / 360 * circ);
          const rotation = cum / 100 * 360;
          cum += seg.pct;
          return /* @__PURE__ */ jsxs("g", { children: [
            isGlass && /* @__PURE__ */ jsx(
              "circle",
              {
                cx: CX,
                cy: CY,
                r: R,
                stroke: seg.color,
                strokeWidth: thickness + 3,
                strokeDasharray: `${dash} ${circ - dash}`,
                strokeLinecap: "butt",
                transform: `rotate(${rotation} ${CX} ${CY})`,
                opacity: 0.08,
                style: { filter: "blur(3px)" }
              }
            ),
            /* @__PURE__ */ jsx(
              "circle",
              {
                cx: CX,
                cy: CY,
                r: R,
                stroke: seg.color,
                strokeWidth: thickness,
                strokeDasharray: `${dash} ${circ - dash}`,
                strokeLinecap: "butt",
                transform: `rotate(${rotation} ${CX} ${CY})`,
                className: "transition-all duration-300"
              }
            )
          ] }, i);
        }),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: "50",
            y: "50",
            textAnchor: "middle",
            dominantBaseline: "middle",
            fill: "currentColor",
            transform: "rotate(90 50 50)",
            style: { fontSize, fontWeight: 700, fontFamily: "inherit" },
            children: labelStr
          }
        )
      ] }),
      sublabel && /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/60 text-center mt-1", children: sublabel }),
      subtext && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-foreground/40 text-center mt-0.5", children: subtext })
    ] });
  }
  if (variant === "gauge") {
    const fillLen2 = pct / 100 * ARC;
    return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center", className), children: [
      /* @__PURE__ */ jsxs("svg", { width: size, height: size * 0.88, viewBox: "0 0 100 88", fill: "none", children: [
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: CX,
            cy: CY,
            r: R,
            stroke: "hsl(var(--foreground) / 0.10)",
            strokeWidth: thickness,
            strokeDasharray: `${ARC} ${GAP}`,
            strokeLinecap: "round",
            transform: "rotate(135 50 50)"
          }
        ),
        isGlass && fillLen2 > 0 && /* @__PURE__ */ jsx(
          "circle",
          {
            cx: CX,
            cy: CY,
            r: R,
            stroke: color,
            strokeWidth: thickness + 4,
            strokeDasharray: `${fillLen2} ${CIRC}`,
            strokeLinecap: "round",
            transform: "rotate(135 50 50)",
            opacity: 0.1,
            style: { filter: "blur(3px)" }
          }
        ),
        fillLen2 > 0 && /* @__PURE__ */ jsx(
          "circle",
          {
            cx: CX,
            cy: CY,
            r: R,
            stroke: color,
            strokeWidth: thickness,
            strokeDasharray: `${fillLen2} ${CIRC}`,
            strokeLinecap: "round",
            transform: "rotate(135 50 50)",
            style: { transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)", ...glowStyle }
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: "50",
            y: "47",
            textAnchor: "middle",
            dominantBaseline: "middle",
            fill: "currentColor",
            style: { fontSize, fontWeight: 700, fontFamily: "inherit" },
            children: labelStr
          }
        )
      ] }),
      sublabel && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground/80 text-center leading-tight", children: sublabel }),
      subtext && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-foreground/45 text-center mt-0.5", children: subtext })
    ] });
  }
  const fillLen = pct / 100 * CIRC;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col items-center", className), children: [
    /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 100 100", fill: "none", children: [
      /* @__PURE__ */ jsx(
        "circle",
        {
          cx: CX,
          cy: CY,
          r: R,
          stroke: "hsl(var(--foreground) / 0.10)",
          strokeWidth: thickness
        }
      ),
      isGlass && fillLen > 0 && /* @__PURE__ */ jsx(
        "circle",
        {
          cx: CX,
          cy: CY,
          r: R,
          stroke: color,
          strokeWidth: thickness + 4,
          strokeDasharray: `${fillLen} ${CIRC}`,
          strokeLinecap: "round",
          transform: "rotate(-90 50 50)",
          opacity: 0.1,
          style: { filter: "blur(3px)" }
        }
      ),
      fillLen > 0 && /* @__PURE__ */ jsx(
        "circle",
        {
          cx: CX,
          cy: CY,
          r: R,
          stroke: color,
          strokeWidth: thickness,
          strokeDasharray: `${fillLen} ${CIRC}`,
          strokeLinecap: "round",
          transform: "rotate(-90 50 50)",
          style: { transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)", ...glowStyle }
        }
      ),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: "50",
          y: "50",
          textAnchor: "middle",
          dominantBaseline: "middle",
          fill: "currentColor",
          style: { fontSize, fontWeight: 700, fontFamily: "inherit" },
          children: labelStr
        }
      )
    ] }),
    sublabel && /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/60 text-center mt-1", children: sublabel }),
    subtext && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-foreground/40 text-center mt-0.5", children: subtext })
  ] });
}
function GlassProgress({
  value,
  label,
  valueLabel,
  color = "hsl(var(--primary))",
  size = "default",
  showMarker = false,
  className
}) {
  const { isGlass } = useGlass();
  const pct = Math.min(100, Math.max(0, value));
  const h = size === "sm" ? "h-1" : "h-1.5";
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1.5", className), children: [
    (label || valueLabel) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      label && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground/80", children: label }),
      valueLabel && /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground/50 text-right", children: valueLabel })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: cn(
        h,
        "w-full rounded-full",
        isGlass ? "bg-foreground/8" : "bg-muted/50"
      ) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(h, "absolute inset-y-0 left-0 rounded-full"),
          style: {
            width: `${pct}%`,
            background: color,
            transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
            boxShadow: isGlass && pct > 0 ? `0 0 8px ${color}` : void 0
          }
        }
      ),
      showMarker && /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/25 rounded-full",
          style: { left: `${pct}%` }
        }
      )
    ] })
  ] });
}
var intentConfig = {
  info: {
    icon: /* @__PURE__ */ jsx(Info, { className: "h-4 w-4" }),
    glass: "border-primary/30 bg-primary/8",
    normal: "border-primary/30 bg-primary/6",
    iconColor: "text-primary",
    titleColor: "text-primary"
  },
  success: {
    icon: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
    glass: "border-emerald-500/30 bg-emerald-500/8",
    normal: "border-emerald-500/30 bg-emerald-500/6",
    iconColor: "text-emerald-400",
    titleColor: "text-emerald-400"
  },
  warning: {
    icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4" }),
    glass: "border-amber-400/35 bg-amber-400/8",
    normal: "border-amber-400/35 bg-amber-400/6",
    iconColor: "text-amber-400",
    titleColor: "text-amber-400"
  },
  danger: {
    icon: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }),
    glass: "border-destructive/35 bg-destructive/8",
    normal: "border-destructive/35 bg-destructive/6",
    iconColor: "text-destructive",
    titleColor: "text-destructive"
  }
};
function GlassAlert({
  intent = "info",
  title,
  children,
  onClose,
  className,
  icon
}) {
  const { isGlass } = useGlass();
  const cfg = intentConfig[intent];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative flex gap-3 rounded-2xl border px-4 py-3",
        isGlass ? cn("nb-szklo", cfg.glass) : cn("border", cfg.normal),
        className
      ),
      role: "alert",
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("mt-0.5 shrink-0", cfg.iconColor), children: icon ?? cfg.icon }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-0.5", children: [
          title && /* @__PURE__ */ jsx("p", { className: cn("text-sm font-semibold", cfg.titleColor), children: title }),
          children && /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/65 leading-relaxed", children })
        ] }),
        onClose && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "shrink-0 text-foreground/40 hover:text-foreground/70 transition-colors mt-0.5",
            "aria-label": "Zamknij",
            children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    }
  );
}
var colorMap = {
  default: {
    glass: "border-foreground/20 bg-foreground/6 text-foreground/80",
    normal: "border-border bg-muted/50 text-foreground/80"
  },
  primary: {
    glass: "border-primary/35 bg-primary/10 text-primary",
    normal: "border-primary/40 bg-primary/8 text-primary"
  },
  success: {
    glass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    normal: "border-emerald-500/35 bg-emerald-500/8 text-emerald-400"
  },
  warning: {
    glass: "border-amber-400/35 bg-amber-400/10 text-amber-400",
    normal: "border-amber-400/40 bg-amber-400/8 text-amber-400"
  },
  danger: {
    glass: "border-destructive/30 bg-destructive/10 text-destructive",
    normal: "border-destructive/35 bg-destructive/8 text-destructive"
  },
  purple: {
    glass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    normal: "border-violet-500/35 bg-violet-500/8 text-violet-400"
  },
  cyan: {
    glass: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
    normal: "border-cyan-400/35 bg-cyan-400/8 text-cyan-400"
  }
};
function GlassChip({
  color = "default",
  size = "default",
  onRemove,
  active,
  className,
  children,
  onClick
}) {
  const { isGlass } = useGlass();
  const cfg = colorMap[color];
  return /* @__PURE__ */ jsxs(
    "span",
    {
      role: onClick ? "button" : void 0,
      tabIndex: onClick ? 0 : void 0,
      onClick,
      onKeyDown: onClick ? (e) => e.key === "Enter" && onClick() : void 0,
      className: cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium select-none",
        size === "sm" ? "h-6 px-2.5 text-[11px]" : "h-7 px-3 text-xs",
        isGlass ? cn("nb-szklo", cfg.glass) : cfg.normal,
        active && "ring-2 ring-primary/40",
        onClick && "cursor-pointer",
        className
      ),
      children: [
        children,
        onRemove && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onRemove();
            },
            className: "ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity",
            "aria-label": "Usu\u0144",
            children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
          }
        )
      ]
    }
  );
}
var sizeMap4 = {
  xs: { avatar: "h-6  w-6", text: "text-[10px]", ring: "ring-1", dot: "h-1.5 w-1.5 -right-px -bottom-px" },
  sm: { avatar: "h-8  w-8", text: "text-xs", ring: "ring-1", dot: "h-2   w-2   -right-px -bottom-px" },
  md: { avatar: "h-10 w-10", text: "text-sm", ring: "ring-2", dot: "h-2.5 w-2.5 right-0 bottom-0" },
  lg: { avatar: "h-12 w-12", text: "text-base", ring: "ring-2", dot: "h-3   w-3   right-0 bottom-0" },
  xl: { avatar: "h-16 w-16", text: "text-xl", ring: "ring-2", dot: "h-3.5 w-3.5 right-0 bottom-0" }
};
var statusColor = {
  online: "bg-emerald-400",
  busy: "bg-destructive",
  away: "bg-amber-400",
  offline: "bg-foreground/30"
};
function initialsColor(str = "") {
  const h = str.split("").reduce((a, c) => a * 31 + c.charCodeAt(0) & 4095, 0);
  return `hsl(${h * 137 % 360} 55% 50%)`;
}
function GlassAvatar({
  src,
  initials,
  name,
  size = "md",
  status,
  color,
  className
}) {
  const { isGlass } = useGlass();
  const sz = sizeMap4[size];
  const bg = color ?? initialsColor(initials ?? name);
  const abbr = initials ?? (name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?");
  return /* @__PURE__ */ jsxs("div", { className: cn("relative inline-flex shrink-0", className), children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold text-white",
          sz.avatar,
          isGlass ? cn("nb-szklo", "ring-foreground/10", sz.ring) : cn("ring-foreground/10", sz.ring)
        ),
        style: !src ? { backgroundColor: bg } : void 0,
        title: name,
        "aria-label": name,
        children: src ? /* @__PURE__ */ jsx("img", { src, alt: name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { className: sz.text, children: abbr })
      }
    ),
    status && /* @__PURE__ */ jsx(
      "span",
      {
        className: cn(
          "absolute rounded-full border-2 border-background",
          sz.dot,
          statusColor[status]
        )
      }
    )
  ] });
}
function GlassAvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className
}) {
  const { isGlass } = useGlass();
  const sz = sizeMap4[size];
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center", className), children: [
    visible.map((av, i) => /* @__PURE__ */ jsx("div", { className: "-ml-2 first:ml-0", style: { zIndex: visible.length - i }, children: /* @__PURE__ */ jsx(GlassAvatar, { ...av, size }) }, i)),
    overflow > 0 && /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "-ml-2 rounded-full flex items-center justify-center font-semibold text-foreground/70",
          sz.avatar,
          sz.text,
          isGlass ? "nb-szklo" : "border border-border bg-muted/50"
        ),
        children: [
          "+",
          overflow
        ]
      }
    )
  ] });
}
var sideClasses = {
  top: { pos: "bottom-full left-1/2 -translate-x-1/2 mb-2", arrow: "top-full  left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground/20" },
  bottom: { pos: "top-full  left-1/2 -translate-x-1/2 mt-2", arrow: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground/20" },
  left: { pos: "right-full top-1/2 -translate-y-1/2 mr-2", arrow: "left-full   top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground/20" },
  right: { pos: "left-full  top-1/2 -translate-y-1/2 ml-2", arrow: "right-full  top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground/20" }
};
function GlassTooltip({
  content,
  children,
  side = "top",
  delay = 400,
  className
}) {
  const { isGlass } = useGlass();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const cfg = sideClasses[side];
  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  return /* @__PURE__ */ jsxs("span", { className: "relative inline-flex", onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, children: [
    children,
    visible && /* @__PURE__ */ jsxs(
      "span",
      {
        role: "tooltip",
        className: cn(
          "pointer-events-none absolute z-50 whitespace-nowrap px-3 py-1.5 text-xs font-medium",
          "rounded-lg border",
          cfg.pos,
          isGlass ? "nb-szklo text-foreground border-foreground/15" : "bg-card border-border text-foreground shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-150",
          className
        ),
        children: [
          content,
          /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "absolute border-4",
                cfg.arrow
              )
            }
          )
        ]
      }
    )
  ] });
}
function GlassDropdown({ trigger, items, align = "left", className }) {
  const { isGlass } = useGlass();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative inline-block", className), children: [
    /* @__PURE__ */ jsx("div", { onClick: () => setOpen((v) => !v), className: "cursor-pointer", children: trigger }),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-2xl border p-1",
          align === "right" ? "right-0" : "left-0",
          isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12" : "bg-card border-border shadow-xl"
        ),
        children: items.map((item, i) => {
          if (item.divider) {
            return /* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-foreground/8" }, i);
          }
          return /* @__PURE__ */ jsxs(
            "button",
            {
              disabled: item.disabled,
              onClick: () => setOpen(false),
              className: cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
                "transition-colors duration-150 text-left",
                item.danger ? "text-destructive hover:bg-destructive/10" : "text-foreground/80 hover:bg-foreground/8 hover:text-foreground",
                item.disabled && "pointer-events-none opacity-40"
              ),
              children: [
                item.icon && /* @__PURE__ */ jsx("span", { className: "shrink-0 opacity-70", children: item.icon }),
                /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.label })
              ]
            },
            item.key
          );
        })
      }
    )
  ] });
}
function GlassDropdownSelect({
  options,
  value,
  onChange,
  placeholder = "Wybierz...",
  className
}) {
  const { isGlass } = useGlass();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((v) => !v),
        className: cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm",
          "transition-all duration-200 cursor-pointer",
          isGlass ? cn("nb-szklo text-foreground") : "bg-input border-border text-foreground hover:border-border/80"
        ),
        children: [
          /* @__PURE__ */ jsx("span", { className: cn(!selected && "text-foreground/40"), children: selected ? selected.label : placeholder }),
          /* @__PURE__ */ jsx(ChevronDown, { className: cn("h-4 w-4 text-foreground/50 transition-transform duration-200", open && "rotate-180") })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border p-1",
          isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12" : "bg-card border-border shadow-xl"
        ),
        children: options.map((opt) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              onChange?.(opt.value);
              setOpen(false);
            },
            className: cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm",
              "transition-colors duration-150 cursor-pointer",
              opt.value === value ? "bg-primary/12 text-primary font-medium" : "text-foreground/80 hover:bg-foreground/8 hover:text-foreground"
            ),
            children: [
              opt.label,
              opt.value === value && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" })
            ]
          },
          opt.value
        ))
      }
    )
  ] });
}
function useBase() {
  const { isGlass } = useGlass();
  return isGlass ? "nb-shimmer bg-foreground/[0.07]" : "nb-shimmer bg-muted";
}
function GlassSkeleton({ radius = "rounded-lg", className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(useBase(), radius, className), ...props });
}
function GlassSkeletonText({
  lines = 3,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("space-y-2", className), children: Array.from({ length: lines }).map((_, i) => /* @__PURE__ */ jsx(
    GlassSkeleton,
    {
      className: cn("h-3", i === lines - 1 && lines > 1 ? "w-3/5" : "w-full")
    },
    i
  )) });
}
var AV = { xs: "h-6 w-6", sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12", xl: "h-16 w-16" };
function GlassSkeletonAvatar({
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsx(GlassSkeleton, { radius: "rounded-full", className: cn(AV[size], "shrink-0", className) });
}
function GlassSkeletonListItem({ className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-3", className), children: [
    /* @__PURE__ */ jsx(GlassSkeletonAvatar, { size: "md" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx(GlassSkeleton, { className: "h-3 w-1/3" }),
      /* @__PURE__ */ jsx(GlassSkeleton, { className: "h-2.5 w-1/2" })
    ] })
  ] });
}
function GlassSkeletonImage({
  aspect = "aspect-video",
  className
}) {
  return /* @__PURE__ */ jsx(GlassSkeleton, { radius: "rounded-2xl", className: cn(aspect, "w-full", className) });
}
function GlassSkeletonCard({
  image = true,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "space-y-3 rounded-2xl p-5",
        isGlass ? "nb-szklo" : "border border-border bg-card",
        className
      ),
      children: [
        image && /* @__PURE__ */ jsx(GlassSkeletonImage, { className: "mb-1" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(GlassSkeletonAvatar, { size: "sm" }),
          /* @__PURE__ */ jsx(GlassSkeleton, { className: "h-3 w-1/3" })
        ] }),
        /* @__PURE__ */ jsx(GlassSkeletonText, { lines: 3 })
      ]
    }
  );
}
function GlassSkeletonTable({
  rows = 5,
  cols = 4,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "overflow-hidden rounded-2xl",
        isGlass ? "nb-szklo" : "border border-border bg-card",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: cn("flex gap-4 px-4 py-3", isGlass ? "bg-foreground/[0.04]" : "bg-muted/40"), children: Array.from({ length: cols }).map((_, i) => /* @__PURE__ */ jsx(GlassSkeleton, { className: "h-2.5 flex-1" }, i)) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/40", children: Array.from({ length: rows }).map((_, r) => /* @__PURE__ */ jsx("div", { className: "flex gap-4 px-4 py-3", children: Array.from({ length: cols }).map((_2, c) => /* @__PURE__ */ jsx(GlassSkeleton, { className: cn("h-3 flex-1", c === 0 && "max-w-[40%]") }, c)) }, r)) })
      ]
    }
  );
}
function GlassSkeletonForm({
  fields = 3,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-4", className), children: [
    Array.from({ length: fields }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(GlassSkeleton, { className: "h-2.5 w-24" }),
      /* @__PURE__ */ jsx(GlassSkeleton, { radius: "rounded-xl", className: "h-10 w-full" })
    ] }, i)),
    /* @__PURE__ */ jsx(GlassSkeleton, { radius: "rounded-xl", className: "h-10 w-32" })
  ] });
}
var RING = {
  sm: { box: "h-4 w-4", bw: "border-2" },
  md: { box: "h-6 w-6", bw: "border-2" },
  lg: { box: "h-10 w-10", bw: "border-[3px]" }
};
function GlassSpinner({
  size = "md",
  className,
  label
}) {
  const s = RING[size];
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-2", className), role: "status", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: cn(
          "inline-block rounded-full nb-spin",
          s.box,
          s.bw,
          "border-foreground/15 border-t-primary"
        )
      }
    ),
    label && /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground/60", children: label }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u0141adowanie\u2026" })
  ] });
}
var DOT = { sm: "h-1 w-1", md: "h-1.5 w-1.5", lg: "h-2.5 w-2.5" };
function GlassSpinnerDots({
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-end gap-1", className), role: "status", children: [
    [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: cn("inline-block rounded-full bg-primary nb-dot-skok", DOT[size]),
        style: { animationDelay: `${i * 0.16}s` }
      },
      i
    )),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u0141adowanie\u2026" })
  ] });
}
function GlassSpinnerBar({
  top = false,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: cn(
        "h-0.5 w-full overflow-hidden",
        isGlass ? "bg-foreground/10" : "bg-muted",
        top && "fixed inset-x-0 top-0 z-[200]",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-primary nb-pasek-nieokr" }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u0141adowanie\u2026" })
      ]
    }
  );
}
function GlassLoadingOverlay({
  label = "\u0141adowanie\u2026",
  fullScreen = true,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "status",
      className: cn(
        "z-[150] flex flex-col items-center justify-center gap-3",
        fullScreen ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
        isGlass ? "nb-szklo backdrop-blur-md" : "bg-background/80 backdrop-blur-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(GlassSpinner, { size: "lg" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-foreground/70", children: label })
      ]
    }
  );
}
var PRESET = {
  "ogolny": {
    icon: /* @__PURE__ */ jsx(Inbox, { className: "h-6 w-6" }),
    title: "Nic tu jeszcze nie ma",
    desc: "Gdy pojawi\u0105 si\u0119 pierwsze elementy, zobaczysz je w tym miejscu.",
    tone: "text-foreground/50"
  },
  "brak-wynikow": {
    icon: /* @__PURE__ */ jsx(SearchX, { className: "h-6 w-6" }),
    title: "Brak wynik\xF3w",
    desc: "Nic nie pasuje do tego zapytania. Spr\xF3buj innych s\u0142\xF3w lub wyczy\u015B\u0107 filtry.",
    tone: "text-foreground/50"
  },
  "brak-danych": {
    icon: /* @__PURE__ */ jsx(Database, { className: "h-6 w-6" }),
    title: "Brak danych",
    desc: "Dla wybranego zakresu nie ma jeszcze \u017Cadnych rekord\xF3w.",
    tone: "text-foreground/50"
  },
  "blad": {
    icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-6 w-6" }),
    title: "Nie uda\u0142o si\u0119 wczyta\u0107",
    desc: "Co\u015B posz\u0142o nie tak po naszej stronie. Spr\xF3buj ponownie za chwil\u0119.",
    tone: "text-destructive/70"
  }
};
function GlassEmpty({
  variant = "ogolny",
  icon,
  title,
  desc,
  action,
  compact = false,
  bordered = true,
  className
}) {
  const { isGlass } = useGlass();
  const cfg = PRESET[variant];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-5 py-8" : "gap-3 px-6 py-14",
        bordered && (isGlass ? "nb-szklo rounded-2xl" : "rounded-2xl border border-dashed border-border bg-card/40"),
        className
      ),
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "flex items-center justify-center rounded-full",
              compact ? "h-10 w-10" : "h-14 w-14",
              isGlass ? "border border-foreground/10 bg-foreground/[0.06]" : "border border-border bg-muted/50",
              cfg.tone
            ),
            children: icon ?? cfg.icon
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: cn("font-semibold text-foreground", compact ? "text-sm" : "text-base"), children: title ?? cfg.title }),
          /* @__PURE__ */ jsx("p", { className: cn("mx-auto max-w-sm text-foreground/55", compact ? "text-xs" : "text-xs leading-relaxed"), children: desc ?? cfg.desc })
        ] }),
        action && /* @__PURE__ */ jsx("div", { className: "mt-1", children: action })
      ]
    }
  );
}
var Ctx = createContext(null);
function GlassAccordion({
  multiple = false,
  defaultOpen = [],
  className,
  children
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = (k) => setOpen(
    (prev) => prev.includes(k) ? prev.filter((x) => x !== k) : multiple ? [...prev, k] : [k]
  );
  return /* @__PURE__ */ jsx(Ctx.Provider, { value: { open, toggle }, children: /* @__PURE__ */ jsx("div", { className: cn("space-y-2", className), children }) });
}
function GlassAccordionItem({
  value,
  title,
  icon,
  badge,
  disabled = false,
  forceMode = "auto",
  className,
  children
}) {
  const { isGlass: isGlassCtx } = useGlass();
  const isGlass = forceMode === "solid" ? false : isGlassCtx;
  const ctx = useContext(Ctx);
  const auto = useId();
  const key = value ?? auto;
  const [solo, setSolo] = useState(false);
  const isOpen = ctx ? ctx.open.includes(key) : solo;
  const toggle = () => ctx ? ctx.toggle(key) : setSolo((v) => !v);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "overflow-hidden rounded-2xl",
        isGlass ? "nb-szklo" : "border border-border bg-card",
        disabled && "opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: toggle,
            disabled,
            "aria-expanded": isOpen,
            className: cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left",
              "transition-colors duration-200",
              !disabled && (isGlass ? "hover:bg-foreground/[0.04]" : "hover:bg-muted/40"),
              disabled && "cursor-not-allowed"
            ),
            children: [
              icon && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-primary", children: icon }),
              /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-medium text-foreground", children: title }),
              badge,
              /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  className: cn(
                    "h-4 w-4 shrink-0 text-foreground/40 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "grid transition-all duration-300 ease-out",
              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            ),
            children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: cn(
              "px-4 pb-3.5 pt-0 text-xs leading-relaxed text-foreground/65",
              isGlass ? "border-t border-foreground/[0.07]" : "border-t border-border/60",
              "mt-0 pt-3"
            ), children }) })
          }
        )
      ]
    }
  );
}
function GlassCollapsible({
  title,
  defaultOpen = false,
  className,
  children
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        "aria-expanded": open,
        className: "flex w-full items-center gap-2 py-2 text-left text-xs font-medium text-foreground/50 transition-colors hover:text-foreground/80",
        children: [
          /* @__PURE__ */ jsx(ChevronDown, { className: cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180") }),
          title
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"), children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "pb-2", children }) }) })
  ] });
}
var PANEL = {
  right: "inset-y-0 right-0 h-full w-full max-w-md border-l",
  left: "inset-y-0 left-0  h-full w-full max-w-md border-r",
  bottom: "inset-x-0 bottom-0 w-full max-h-[85vh] border-t rounded-t-3xl",
  top: "inset-x-0 top-0    w-full max-h-[85vh] border-b rounded-b-3xl"
};
var HIDDEN = {
  right: "translate-x-full",
  left: "-translate-x-full",
  bottom: "translate-y-full",
  top: "-translate-y-full"
};
function GlassDrawer({
  open,
  onClose,
  side = "right",
  title,
  desc,
  footer,
  handle,
  className,
  children
}) {
  const { isGlass } = useGlass();
  const showHandle = handle ?? side === "bottom";
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: onClose,
        "aria-hidden": true,
        className: cn(
          "fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        role: "dialog",
        "aria-modal": "true",
        "aria-hidden": !open,
        className: cn(
          "fixed z-[141] flex flex-col",
          "transition-transform duration-300 ease-out",
          PANEL[side],
          !open && HIDDEN[side],
          isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia border-foreground/12" : "border-border bg-card",
          className
        ),
        children: [
          showHandle && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 justify-center pt-3", children: /* @__PURE__ */ jsx("span", { className: "h-1 w-10 rounded-full bg-foreground/20" }) }),
          (title || desc) && /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-start gap-3 px-5 pb-3 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-0.5", children: [
              title && /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }),
              desc && /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/55", children: desc })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                "aria-label": "Zamknij",
                className: "shrink-0 rounded-lg p-1 text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 py-2", children }),
          footer && /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "shrink-0 px-5 py-3.5",
                isGlass ? "border-t border-foreground/[0.08]" : "border-t border-border"
              ),
              children: footer
            }
          )
        ]
      }
    )
  ] });
}
var MONTH_NAMES_PL = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Pa\u017A", "Lis", "Gru"];
var DAY_LABELS_PL = ["", "Wt", "", "Cz", "", "Sob", ""];
function generateActivityData(weeksCount = 26) {
  const endDate = new Date(2026, 7, 15);
  const currentDayOfWeek = (endDate.getDay() + 6) % 7;
  const daysToSunday = 6 - currentDayOfWeek;
  const endOfWeekDate = new Date(endDate);
  endOfWeekDate.setDate(endDate.getDate() + daysToSunday);
  const totalDays = weeksCount * 7;
  const startDate = new Date(endOfWeekDate);
  startDate.setDate(endOfWeekDate.getDate() - totalDays + 1);
  const weeks = [];
  const monthLabels = [];
  let lastMonth = -1;
  let totalCount = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  const activeStartIndex = Math.floor(weeksCount * 0.6);
  for (let w = 0; w < weeksCount; w++) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const dayIndex = w * 7 + d;
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + dayIndex);
      const isFuture = cellDate > endDate;
      const monthNum = cellDate.getMonth();
      if (d === 0 && monthNum !== lastMonth) {
        if (monthLabels.length === 0 || w - monthLabels[monthLabels.length - 1].weekIndex >= 3) {
          monthLabels.push({
            month: MONTH_NAMES_PL[monthNum],
            weekIndex: w
          });
          lastMonth = monthNum;
        }
      }
      let count = 0;
      let level = 0;
      if (!isFuture) {
        if (w < activeStartIndex) {
          const rand = Math.random();
          if (rand > 0.88) {
            count = Math.floor(Math.random() * 3) + 1;
            level = count > 2 ? 2 : 1;
          }
        } else {
          const dayOfWeek = cellDate.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const seed = (w * 13 + d * 29) % 100;
          if (isWeekend) {
            if (seed > 45) {
              count = Math.floor(Math.random() * 4) + 1;
              level = count > 2 ? 2 : 1;
            }
          } else {
            if (seed > 10) {
              const intensity = seed % 10 / 10;
              if (intensity > 0.75) {
                count = Math.floor(Math.random() * 10) + 15;
                level = 4;
              } else if (intensity > 0.45) {
                count = Math.floor(Math.random() * 6) + 8;
                level = 3;
              } else if (intensity > 0.2) {
                count = Math.floor(Math.random() * 4) + 4;
                level = 2;
              } else {
                count = Math.floor(Math.random() * 3) + 1;
                level = 1;
              }
            }
          }
        }
      }
      if (count > 0) {
        totalCount += count;
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      const dateString = cellDate.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      weekDays.push({
        date: cellDate,
        dateString,
        count,
        level
      });
    }
    weeks.push(weekDays);
  }
  let currentStreak = 0;
  let checkingDayIndex = weeksCount * 7 - 1 - daysToSunday;
  while (checkingDayIndex >= 0) {
    const w = Math.floor(checkingDayIndex / 7);
    const d = checkingDayIndex % 7;
    if (weeks[w] && weeks[w][d] && weeks[w][d].count > 0) {
      currentStreak++;
      checkingDayIndex--;
    } else {
      break;
    }
  }
  return {
    weeks,
    monthLabels,
    totalCount,
    maxStreak,
    currentStreak
  };
}
function GlassActivityGrid({
  weeksCount = 26,
  className,
  showSummary = true,
  showStreaks = true,
  quote = "Zu\u017Cy\u0142e\u015B ~374\xD7 wi\u0119cej token\xF3w ni\u017C \u201EFolwark zwierz\u0119cy\u201D.",
  showContent = true,
  title = "Aktywno\u015B\u0107",
  badgeText = "OSTATNIE 6 MIES.",
  compact = false,
  hideHeader = false
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const data = useMemo(() => generateActivityData(weeksCount), [weeksCount]);
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col relative select-none", compact ? "gap-2 py-0" : "gap-2.5 py-1", className), children: [
    !hideHeader && /* @__PURE__ */ jsxs("div", { className: cn("flex flex-wrap items-center justify-between gap-2", compact ? "h-5" : "h-6"), children: [
      /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2", compact ? "h-5" : "h-6"), children: [
        /* @__PURE__ */ jsx("h2", { className: cn("font-bold text-foreground flex items-center gap-1.5 leading-none", compact ? "text-xs" : "text-sm"), children: showContent ? title : /* @__PURE__ */ jsx("span", { className: cn("inline-block bg-foreground/25 rounded-md animate-pulse", compact ? "h-3 w-16" : "h-3.5 w-20") }) }),
        /* @__PURE__ */ jsxs("div", { className: cn("font-semibold text-foreground/50 flex items-center gap-1 px-2 rounded-full bg-foreground/5 border border-foreground/10", compact ? "text-[9px] h-4" : "text-[10px] h-5"), children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" }),
          showContent ? /* @__PURE__ */ jsx("span", { children: badgeText }) : /* @__PURE__ */ jsx("span", { className: "inline-block h-2 w-16 bg-foreground/20 rounded animate-pulse" })
        ] })
      ] }),
      showStreaks && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 text-[11px] text-foreground/60", children: showContent ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 border border-foreground/8 text-[10px]", children: [
          /* @__PURE__ */ jsx(Flame, { className: "h-3.5 w-3.5 text-amber-400" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Bie\u017C\u0105ca seria: ",
            /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
              data.currentStreak,
              " dni"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-foreground/5 border border-foreground/8 text-[10px]", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Max: ",
            /* @__PURE__ */ jsxs("strong", { className: "text-foreground", children: [
              data.maxStreak,
              " dni"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-foreground/50 tabular-nums", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: data.totalCount.toLocaleString("pl-PL") }),
          " zapyta\u0144"
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "h-4 w-32 bg-foreground/15 rounded-full animate-pulse" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative overflow-x-auto pb-0.5 pt-0.5 scrollbar-none", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 min-w-max", children: [
      /* @__PURE__ */ jsx("div", { className: cn("flex text-foreground/50 font-medium relative", compact ? "pl-5 text-[9px] h-3.5" : "pl-7 text-[10px] h-5"), children: data.monthLabels.map(({ month, weekIndex }) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute",
          style: { left: compact ? `${20 + weekIndex * 12}px` : `${28 + weekIndex * 16}px` },
          children: month
        },
        `${month}-${weekIndex}`
      )) }),
      /* @__PURE__ */ jsxs("div", { className: cn("flex items-start", compact ? "gap-[2.5px]" : "gap-1"), children: [
        /* @__PURE__ */ jsx("div", { className: cn("flex flex-col pt-0 pr-0.5 shrink-0 text-foreground/40 font-medium", compact ? "gap-[2.5px] text-[8px]" : "gap-1 text-[10px]"), children: DAY_LABELS_PL.map((label, idx) => /* @__PURE__ */ jsx("div", { className: cn("flex items-center justify-end leading-none", compact ? "w-4 h-2.5" : "w-5 h-3.5"), children: label }, idx)) }),
        /* @__PURE__ */ jsx("div", { className: cn("flex", compact ? "gap-[2.5px]" : "gap-1"), children: data.weeks.map((week, wIdx) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col", compact ? "gap-[2.5px]" : "gap-1"), children: week.map((day, dIdx) => /* @__PURE__ */ jsx(
          "div",
          {
            onMouseEnter: (e) => {
              if (!showContent) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCell({
                day,
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            },
            onMouseLeave: () => setHoveredCell(null),
            className: cn(
              "transition-all duration-150 cursor-pointer hover:scale-115 hover:z-20 hover:ring-1.5 hover:ring-primary hover:shadow-sm",
              compact ? "w-2.5 h-2.5 rounded-[2px]" : "w-3.5 h-3.5 rounded-[2.5px]",
              !showContent && "bg-foreground/12 animate-pulse",
              showContent && day.level === 0 && "bg-foreground/[0.07] hover:bg-foreground/20",
              showContent && day.level === 1 && "bg-primary/25 hover:bg-primary/40",
              showContent && day.level === 2 && "bg-primary/50 hover:bg-primary/65",
              showContent && day.level === 3 && "bg-primary/75 hover:bg-primary/90",
              showContent && day.level === 4 && "bg-primary hover:bg-primary/90"
            )
          },
          `${wIdx}-${dIdx}`
        )) }, wIdx)) })
      ] })
    ] }) }),
    hoveredCell && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none transition-opacity duration-150",
        style: { left: `${hoveredCell.x}px`, top: `${hoveredCell.y}px` },
        children: /* @__PURE__ */ jsxs("div", { className: "nb-szklo px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-medium text-foreground whitespace-nowrap border border-foreground/15 flex flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-primary", children: hoveredCell.day.count > 0 ? `${hoveredCell.day.count} zapyta\u0144 / akcji` : "Brak aktywno\u015Bci" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-foreground/60", children: hoveredCell.day.dateString })
        ] })
      }
    ),
    showSummary && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-foreground/8 text-[11px] text-foreground/50", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-foreground/70 font-medium", children: quote }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-foreground/45 shrink-0 ml-auto", children: [
        /* @__PURE__ */ jsx("span", { children: "Mniej" }),
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-[2px] bg-foreground/[0.07]" }),
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-[2px] bg-primary/25" }),
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-[2px] bg-primary/50" }),
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-[2px] bg-primary/75" }),
        /* @__PURE__ */ jsx("span", { className: "w-3 h-3 rounded-[2px] bg-primary" }),
        /* @__PURE__ */ jsx("span", { children: "Wi\u0119cej" })
      ] })
    ] })
  ] });
}
function GlassFeatureRow({
  icon: Icon2,
  label,
  desc,
  badge,
  highlight = false,
  className
}) {
  const { isGlass } = useGlass();
  const RowIcon = Icon2 || Check;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex items-start gap-3 py-2 px-2 rounded-xl border-b last:border-0 transition-colors duration-150",
    isGlass ? "border-foreground/[0.06]" : "border-border/60",
    highlight ? "bg-primary/[0.06]" : isGlass ? "hover:bg-foreground/[0.03]" : "hover:bg-muted/40",
    className
  ), children: [
    /* @__PURE__ */ jsx("span", { className: cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-lg mt-0.5",
      highlight ? "bg-primary/20 text-primary" : "nb-wglobienie-gnizado text-foreground/70"
    ), children: /* @__PURE__ */ jsx(RowIcon, { className: "h-3.5 w-3.5" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: cn("text-xs font-semibold leading-snug", highlight ? "text-foreground" : "text-foreground/90"), children: label }),
      desc && /* @__PURE__ */ jsx("div", { className: "text-[11px] text-foreground/50 mt-0.5 leading-snug", children: desc })
    ] }),
    badge && (typeof badge === "string" ? /* @__PURE__ */ jsx(GlassBadge, { intent: highlight ? "primary" : "neutral", size: "sm", className: "shrink-0 self-center uppercase tracking-wider", children: badge }) : /* @__PURE__ */ jsx("span", { className: "shrink-0 self-center", children: badge }))
  ] });
}
function Cell({ value, highlighted }) {
  if (value === "yes") {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: cn("w-4 h-4", highlighted ? "text-primary" : "text-foreground/70") }) });
  }
  if (value === "no") {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 text-foreground/25" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("text-center text-[11px] font-semibold", highlighted ? "text-primary" : "text-foreground/75"), children: value });
}
function GlassCompareTable({ columns, rows, highlightLast = true, className }) {
  const { isGlass } = useGlass();
  const gridCols = `1.6fr repeat(${columns.length}, 1fr)`;
  return /* @__PURE__ */ jsx("div", { className: cn(
    "rounded-2xl border overflow-hidden",
    isGlass ? "nb-szklo nb-szklo-plynne" : "nb-tafla",
    className
  ), children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("div", { style: { minWidth: `${280 + columns.length * 100}px` }, children: [
    /* @__PURE__ */ jsxs("div", { className: cn("grid border-b", isGlass ? "border-foreground/[0.08]" : "border-border/60"), style: { gridTemplateColumns: gridCols }, children: [
      /* @__PURE__ */ jsx("div", { className: "p-3.5 md:p-4 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/50", children: "Funkcja" }),
      columns.map((c, i) => {
        const last = highlightLast && i === columns.length - 1;
        return /* @__PURE__ */ jsx("div", { className: cn(
          "p-3.5 md:p-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] border-l",
          isGlass ? "border-foreground/[0.06]" : "border-border/40",
          last ? "text-primary bg-primary/[0.05]" : "text-foreground/40"
        ), children: c }, c);
      })
    ] }),
    rows.map((row, ri) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn("grid border-b last:border-0", isGlass ? "border-foreground/[0.05]" : "border-border/30"),
        style: { gridTemplateColumns: gridCols },
        children: [
          /* @__PURE__ */ jsx("div", { className: "p-3.5 md:p-4 text-xs text-foreground/80", children: row.label }),
          row.values.map((v, i) => {
            const last = highlightLast && i === columns.length - 1;
            return /* @__PURE__ */ jsx("div", { className: cn(
              "p-3.5 md:p-4 border-l",
              isGlass ? "border-foreground/[0.06]" : "border-border/40",
              last && "bg-primary/[0.04]"
            ), children: /* @__PURE__ */ jsx(Cell, { value: v, highlighted: last }) }, i);
          })
        ]
      },
      ri
    ))
  ] }) }) });
}
function GlassTable({
  columns,
  data,
  caption,
  compact,
  onRowClick,
  className,
  rowKey,
  selectable,
  selectedKeys,
  onSelectionChange,
  stickyHeader,
  maxHeight
}) {
  const { isGlass } = useGlass();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [internalSelected, setInternalSelected] = useState([]);
  const selected = selectedKeys ?? internalSelected;
  const getKey = (row, idx) => rowKey?.(row, idx) ?? idx;
  function setSelected(next) {
    if (selectedKeys === void 0) setInternalSelected(next);
    onSelectionChange?.(next);
  }
  function toggleRow(key) {
    setSelected(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }
  function toggleAll(keys) {
    setSelected(selected.length === keys.length ? [] : keys);
  }
  const sorted = React33__default.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), "pl", { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);
  function handleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }
  const cellPad = compact ? "px-4 py-2" : "px-4 py-3";
  const alignMap = { left: "text-left", center: "text-center", right: "text-right" };
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "w-full overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: [
    caption && /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b border-foreground/10", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: caption }) }),
    /* @__PURE__ */ jsx("div", { className: cn("overflow-x-auto", stickyHeader && "overflow-y-auto"), style: stickyHeader ? { maxHeight: maxHeight ?? "360px" } : void 0, children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: cn(stickyHeader && "sticky top-0 z-10 backdrop-blur-md", stickyHeader && (isGlass ? "bg-card/90" : "bg-card")), children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-foreground/10", children: [
        selectable && /* @__PURE__ */ jsx("th", { className: cn(cellPad, "w-10"), children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            checkboxSize: "sm",
            checked: sorted.length > 0 && selected.length === sorted.length ? true : selected.length > 0 ? "indeterminate" : false,
            onCheckedChange: () => toggleAll(sorted.map((row, i) => getKey(row, i)))
          }
        ) }),
        columns.map((col) => /* @__PURE__ */ jsx(
          "th",
          {
            style: { width: col.width },
            className: cn(
              cellPad,
              "text-xs font-semibold text-foreground/55 uppercase tracking-wide whitespace-nowrap",
              alignMap[col.align ?? "left"],
              col.sortable && "cursor-pointer select-none hover:text-foreground/80 transition-colors"
            ),
            onClick: col.sortable ? () => handleSort(col.key) : void 0,
            children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              col.header,
              col.sortable && (sortKey === col.key ? sortDir === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronsUpDown, { className: "h-3 w-3 opacity-40" }))
            ] })
          },
          col.key
        ))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-foreground/[0.06]", children: sorted.map((row, rIdx) => {
        const key = getKey(row, rIdx);
        const isSelected = selected.includes(key);
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            onClick: onRowClick ? () => onRowClick(row, rIdx) : void 0,
            className: cn(
              "transition-colors duration-100 hover:bg-foreground/[0.035]",
              onRowClick && "cursor-pointer",
              isSelected && "bg-primary/[0.06]"
            ),
            children: [
              selectable && /* @__PURE__ */ jsx("td", { className: cellPad, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Checkbox, { checkboxSize: "sm", checked: isSelected, onCheckedChange: () => toggleRow(key) }) }),
              columns.map((col) => /* @__PURE__ */ jsx(
                "td",
                {
                  className: cn(
                    cellPad,
                    "text-sm text-foreground/80 whitespace-nowrap",
                    alignMap[col.align ?? "left"]
                  ),
                  children: col.render ? col.render(row[col.key], row, rIdx) : String(row[col.key] ?? "")
                },
                col.key
              ))
            ]
          },
          rIdx
        );
      }) })
    ] }) })
  ] });
}
function GlassLineChart({
  series,
  height = 180,
  caption,
  showGrid = true,
  showDots = true,
  showXLabels = true,
  showYLabels = false,
  className
}) {
  const { isGlass } = useGlass();
  const W = 600;
  const H = height;
  const padL = showYLabels ? 40 : 16;
  const padR = 16;
  const padT = 16;
  const padB = showXLabels ? 28 : 8;
  const allValues = series.flatMap((s) => s.points.map((p) => p.value));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range2 = maxVal - minVal || 1;
  const maxPoints = Math.max(...series.map((s) => s.points.length));
  function toX(i) {
    return padL + i / Math.max(maxPoints - 1, 1) * (W - padL - padR);
  }
  function toY(v) {
    return padT + (1 - (v - minVal) / range2) * (H - padT - padB);
  }
  const GRID_LINES = 4;
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full flex flex-col gap-2", className), children: [
    caption && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground/55", children: caption }),
    /* @__PURE__ */ jsxs(
      "svg",
      {
        viewBox: `0 0 ${W} ${H}`,
        width: "100%",
        height: H,
        fill: "none",
        className: "overflow-visible",
        children: [
          /* @__PURE__ */ jsx("defs", { children: series.map((s, si) => {
            const color = s.color ?? "hsl(var(--primary))";
            return /* @__PURE__ */ jsxs("linearGradient", { id: `glc-area-${si}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: isGlass ? 0.3 : 0.2 }),
              /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: color, stopOpacity: 0.01 })
            ] }, `grad-${si}`);
          }) }),
          showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
            const y = padT + i / GRID_LINES * (H - padT - padB);
            return /* @__PURE__ */ jsx(
              "line",
              {
                x1: padL,
                y1: y,
                x2: W - padR,
                y2: y,
                stroke: "currentColor",
                strokeOpacity: 0.07,
                strokeWidth: 1
              },
              i
            );
          }),
          showYLabels && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
            const y = padT + i / GRID_LINES * (H - padT - padB);
            const val = maxVal - i / GRID_LINES * range2;
            return /* @__PURE__ */ jsx(
              "text",
              {
                x: padL - 6,
                y,
                textAnchor: "end",
                dominantBaseline: "middle",
                fill: "currentColor",
                fillOpacity: 0.4,
                style: { fontSize: 10, fontFamily: "inherit" },
                children: val >= 1e3 ? `${(val / 1e3).toFixed(0)}k` : Math.round(val)
              },
              i
            );
          }),
          series.map((s, si) => {
            const color = s.color ?? "hsl(var(--primary))";
            const pts = s.points.map((p, i) => ({ x: toX(i), y: toY(p.value) }));
            const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
            const last = pts[pts.length - 1];
            const first = pts[0];
            const area = s.showArea !== false && [
              `M ${first.x.toFixed(1)},${(H - padB).toFixed(1)}`,
              ...pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
              `L ${last.x.toFixed(1)},${(H - padB).toFixed(1)} Z`
            ].join(" ");
            return /* @__PURE__ */ jsxs("g", { children: [
              area && /* @__PURE__ */ jsx("path", { d: area, fill: `url(#glc-area-${si})` }),
              /* @__PURE__ */ jsx(
                "polyline",
                {
                  points: polyline,
                  stroke: color,
                  strokeWidth: 2,
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ),
              isGlass && /* @__PURE__ */ jsx(
                "polyline",
                {
                  points: polyline,
                  stroke: color,
                  strokeWidth: 6,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeOpacity: 0.12,
                  style: { filter: "blur(4px)" }
                }
              ),
              showDots && pts.map((p, i) => /* @__PURE__ */ jsxs("g", { children: [
                /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: 3.5, fill: color }),
                isGlass && /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: 7, fill: color, fillOpacity: 0.15 })
              ] }, i)),
              showDots && /* @__PURE__ */ jsx("circle", { cx: last.x, cy: last.y, r: 5, fill: color })
            ] }, si);
          }),
          showXLabels && (() => {
            const labels = series[0]?.points ?? [];
            const step = Math.ceil(labels.length / 8);
            return labels.map((p, i) => {
              if (i % step !== 0 && i !== labels.length - 1) return null;
              return /* @__PURE__ */ jsx(
                "text",
                {
                  x: toX(i),
                  y: H - padB + 14,
                  textAnchor: "middle",
                  fill: "currentColor",
                  fillOpacity: 0.4,
                  style: { fontSize: 10, fontFamily: "inherit" },
                  children: p.label
                },
                i
              );
            });
          })()
        ]
      }
    ),
    series.some((s) => s.label) && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 px-1", children: series.filter((s) => s.label).map((s, si) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "h-2 w-5 rounded-full",
          style: { background: s.color ?? "hsl(var(--primary))" }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-foreground/55", children: s.label })
    ] }, si)) })
  ] });
}
var SIZE3 = {
  sm: { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3", label: "text-xs" },
  md: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4", label: "text-sm" },
  lg: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5", label: "text-sm" }
};
function GlassToggle({
  checked,
  defaultChecked = false,
  onChange,
  size = "md",
  disabled,
  label,
  description,
  className
}) {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33__default.useState(defaultChecked);
  const isOn = checked !== void 0 ? checked : internal;
  const s = SIZE3[size];
  function toggle() {
    if (disabled) return;
    const next = !isOn;
    setInternal(next);
    onChange?.(next);
  }
  return /* @__PURE__ */ jsxs("label", { className: cn("inline-flex items-center gap-3 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className), children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        role: "switch",
        type: "button",
        "aria-checked": isOn,
        disabled,
        onClick: toggle,
        className: cn(
          "relative shrink-0 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          s.track,
          isOn ? isGlass ? "bg-primary/70 shadow-[0_0_8px_2px_hsl(var(--primary)/0.35)]" : "bg-primary" : isGlass ? "nb-szklo" : "bg-muted"
        ),
        children: /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "absolute top-0.5 left-0.5 rounded-full shadow-sm transition-all duration-200",
              s.thumb,
              isOn ? cn("translate-x-full", s.translate, "bg-white") : isGlass ? "bg-foreground/60" : "bg-foreground/40"
            ),
            style: isOn && isGlass ? { boxShadow: "0 0 6px 1px hsl(var(--primary)/0.5)" } : void 0
          }
        )
      }
    ),
    (label || description) && /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      label && /* @__PURE__ */ jsx("span", { className: cn("font-medium text-foreground leading-tight", s.label), children: label }),
      description && /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground/50 mt-0.5", children: description })
    ] })
  ] });
}
function GlassSlider({
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatValue,
  showValue,
  disabled,
  color = "hsl(var(--primary))",
  className
}) {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33__default.useState(value ?? defaultValue);
  const current = value ?? internal;
  const isRange = current.length > 1;
  function clamp(v) {
    return Math.min(max, Math.max(min, Math.round(v / step) * step));
  }
  function pct(v) {
    return (v - min) / (max - min) * 100;
  }
  function handleChange(idx, raw) {
    const next = [...current];
    next[idx] = clamp(raw);
    if (isRange) {
      if (idx === 0 && next[0] > next[1]) next[0] = next[1];
      if (idx === 1 && next[1] < next[0]) next[1] = next[0];
    }
    setInternal(next);
    onChange?.(next);
  }
  function onInputChange(idx, e) {
    handleChange(idx, Number(e.target.value));
  }
  const lo = isRange ? pct(current[0]) : 0;
  const hi = pct(current[isRange ? 1 : 0]);
  const fmt2 = (v) => formatValue ? formatValue(v) : String(v);
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full flex flex-col gap-2", disabled && "opacity-50", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative flex items-center h-5", children: [
      /* @__PURE__ */ jsx("div", { className: cn(
        "absolute inset-y-0 my-auto h-1.5 w-full rounded-full",
        isGlass ? "nb-szklo" : "bg-muted/60"
      ) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-y-0 my-auto h-1.5 rounded-full pointer-events-none transition-all duration-100",
          style: {
            left: `${lo}%`,
            width: `${hi - lo}%`,
            background: color,
            boxShadow: isGlass ? `0 0 6px 1px ${color}60` : void 0
          }
        }
      ),
      current.map((v, i) => /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min,
          max,
          step,
          value: v,
          disabled,
          onChange: (e) => onInputChange(i, e),
          className: cn(
            "absolute w-full appearance-none bg-transparent cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary",
            "[&::-webkit-slider-thumb]:bg-background",
            "[&::-webkit-slider-thumb]:shadow-sm",
            "[&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            isGlass && "[&::-webkit-slider-thumb]:shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary",
            "[&::-moz-range-thumb]:bg-background"
          ),
          style: { zIndex: i === 0 && isRange ? 1 : 2 }
        },
        i
      ))
    ] }),
    showValue && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-foreground/50 font-mono tabular-nums", children: [
      /* @__PURE__ */ jsx("span", { children: fmt2(current[0]) }),
      isRange && /* @__PURE__ */ jsx("span", { children: fmt2(current[1]) })
    ] })
  ] });
}
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
function GlassPagination({
  page,
  total,
  siblings = 1,
  onChange,
  size = "md",
  className
}) {
  const { isGlass } = useGlass();
  const btnSize = size === "sm" ? "h-7 min-w-[28px] text-xs" : "h-8 min-w-[32px] text-sm";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  function btn(base) {
    return cn(
      "inline-flex items-center justify-center rounded-lg px-2 font-medium transition-all duration-150 select-none",
      btnSize,
      base,
      isGlass ? "hover:bg-foreground/[0.08]" : "hover:bg-muted/60"
    );
  }
  function activeCls() {
    return isGlass ? "bg-primary/20 text-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.25)]" : "bg-primary text-primary-foreground";
  }
  const DOTS = -1;
  function getPages() {
    const totalShown = siblings * 2 + 5;
    if (total <= totalShown) return range(1, total);
    const leftSib = Math.max(page - siblings, 1);
    const rightSib = Math.min(page + siblings, total);
    const showLeft = leftSib > 2;
    const showRight = rightSib < total - 1;
    if (!showLeft && showRight) return [...range(1, rightSib + 1), DOTS, total];
    if (showLeft && !showRight) return [1, DOTS, ...range(leftSib - 1, total)];
    return [1, DOTS, ...range(leftSib, rightSib), DOTS, total];
  }
  const pages = getPages();
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-1", className), children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => page > 1 && onChange(page - 1),
        disabled: page <= 1,
        className: cn(btn("text-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed")),
        "aria-label": "Poprzednia strona",
        children: /* @__PURE__ */ jsx(ChevronLeft, { className: iconSize })
      }
    ),
    pages.map(
      (p, i) => p === DOTS ? /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center justify-center text-foreground/30", btnSize), children: /* @__PURE__ */ jsx(MoreHorizontal, { className: iconSize }) }, `dots-${i}`) : /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onChange(p),
          className: cn(
            btn(""),
            p === page ? cn(activeCls(), "cursor-default") : "text-foreground/60"
          ),
          children: p
        },
        p
      )
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => page < total && onChange(page + 1),
        disabled: page >= total,
        className: cn(btn("text-foreground/60 disabled:opacity-30 disabled:cursor-not-allowed")),
        "aria-label": "Nast\u0119pna strona",
        children: /* @__PURE__ */ jsx(ChevronRight, { className: iconSize })
      }
    )
  ] });
}
var DEFAULT_COLORS = ["hsl(var(--primary))", "hsl(160 60% 45%)", "hsl(38 92% 50%)", "hsl(270 70% 60%)"];
function GlassBarChart({
  data,
  colors = DEFAULT_COLORS,
  seriesLabels,
  orientation = "vertical",
  mode = "grouped",
  height = 200,
  showGrid = true,
  showValues = false,
  showAxisLabels = true,
  caption,
  className
}) {
  const { isGlass } = useGlass();
  const rows = data.map((d) => Array.isArray(d.values) ? d.values : [d.values]);
  const seriesCount = Math.max(...rows.map((r) => r.length));
  const maxVal = mode === "stacked" ? Math.max(...rows.map((r) => r.reduce((a, b) => a + b, 0))) : Math.max(...rows.flat());
  const scaleMax = maxVal || 1;
  const isVertical = orientation === "vertical";
  const W = 600;
  const H = height;
  const padL = isVertical ? 40 : 90;
  const padR = 16;
  const padT = 12;
  const padB = showAxisLabels ? 28 : 10;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const GRID_LINES = 4;
  const slot = (isVertical ? plotW : plotH) / data.length;
  const bandPad = slot * 0.22;
  const band = slot - bandPad;
  const barSize = mode === "stacked" ? band : band / seriesCount;
  function valueToLen(v) {
    return v / scaleMax * (isVertical ? plotH : plotW);
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("w-full flex flex-col gap-2", className), children: [
    caption && /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground/55", children: caption }),
    /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: H, fill: "none", className: "overflow-visible", children: [
      showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
        const t = i / GRID_LINES;
        return isVertical ? /* @__PURE__ */ jsx(
          "line",
          {
            x1: padL,
            y1: padT + t * plotH,
            x2: W - padR,
            y2: padT + t * plotH,
            stroke: "currentColor",
            strokeOpacity: 0.07,
            strokeWidth: 1
          },
          i
        ) : /* @__PURE__ */ jsx(
          "line",
          {
            x1: padL + t * plotW,
            y1: padT,
            x2: padL + t * plotW,
            y2: H - padB,
            stroke: "currentColor",
            strokeOpacity: 0.07,
            strokeWidth: 1
          },
          i
        );
      }),
      showGrid && Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
        const t = i / GRID_LINES;
        const val = isVertical ? scaleMax * (1 - t) : scaleMax * t;
        const txt = val >= 1e3 ? `${(val / 1e3).toFixed(0)}k` : Math.round(val);
        return isVertical ? /* @__PURE__ */ jsx(
          "text",
          {
            x: padL - 6,
            y: padT + t * plotH,
            textAnchor: "end",
            dominantBaseline: "middle",
            fill: "currentColor",
            fillOpacity: 0.4,
            style: { fontSize: 10, fontFamily: "inherit" },
            children: txt
          },
          i
        ) : /* @__PURE__ */ jsx(
          "text",
          {
            x: padL + t * plotW,
            y: H - padB + 14,
            textAnchor: "middle",
            fill: "currentColor",
            fillOpacity: 0.4,
            style: { fontSize: 10, fontFamily: "inherit" },
            children: txt
          },
          i
        );
      }),
      rows.map((vals, di) => {
        const bandStart = (isVertical ? padL : padT) + di * slot + bandPad / 2;
        let stackAcc = 0;
        return /* @__PURE__ */ jsx("g", { children: vals.map((v, si) => {
          const color = colors[si % colors.length];
          const len = valueToLen(v);
          const offset = mode === "stacked" ? 0 : si * barSize;
          const pos = bandStart + offset;
          const stackOffset = mode === "stacked" ? valueToLen(stackAcc) : 0;
          if (mode === "stacked") stackAcc += v;
          const x = isVertical ? pos : padL + stackOffset;
          const y = isVertical ? H - padB - len - stackOffset : pos;
          const w = isVertical ? barSize : len;
          const h = isVertical ? len : barSize;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              "rect",
              {
                x,
                y,
                width: Math.max(w - 2, 1),
                height: Math.max(h, 1),
                rx: 4,
                fill: color,
                fillOpacity: isGlass ? 0.75 : 0.9
              }
            ),
            isGlass && /* @__PURE__ */ jsx(
              "rect",
              {
                x,
                y,
                width: Math.max(w - 2, 1),
                height: Math.max(h, 1),
                rx: 4,
                fill: color,
                fillOpacity: 0.25,
                style: { filter: "blur(6px)" }
              }
            ),
            showValues && mode !== "stacked" && /* @__PURE__ */ jsx(
              "text",
              {
                x: isVertical ? x + (w - 2) / 2 : x + len + 6,
                y: isVertical ? y - 5 : y + h / 2,
                textAnchor: isVertical ? "middle" : "start",
                dominantBaseline: "middle",
                fill: "currentColor",
                fillOpacity: 0.65,
                style: { fontSize: 10, fontWeight: 600, fontFamily: "inherit" },
                children: v
              }
            )
          ] }, si);
        }) }, di);
      }),
      showAxisLabels && data.map((d, di) => {
        const center = (isVertical ? padL : padT) + di * slot + slot / 2;
        return isVertical ? /* @__PURE__ */ jsx(
          "text",
          {
            x: center,
            y: H - padB + 14,
            textAnchor: "middle",
            fill: "currentColor",
            fillOpacity: 0.45,
            style: { fontSize: 10, fontFamily: "inherit" },
            children: d.label
          },
          di
        ) : /* @__PURE__ */ jsx(
          "text",
          {
            x: padL - 8,
            y: center,
            textAnchor: "end",
            dominantBaseline: "middle",
            fill: "currentColor",
            fillOpacity: 0.45,
            style: { fontSize: 10, fontFamily: "inherit" },
            children: d.label
          },
          di
        );
      })
    ] }),
    seriesLabels && seriesLabels.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 px-1", children: seriesLabels.map((lbl, si) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm", style: { background: colors[si % colors.length] } }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-foreground/55", children: lbl })
    ] }, si)) })
  ] });
}
var UP = "hsl(160 60% 45%)";
var DOWN = "hsl(0 72% 58%)";
function GlassSparkline({
  data,
  variant = "line",
  color,
  width = 90,
  height = 28,
  showArea = true,
  showLastDot = true,
  autoTrendColor = false,
  className
}) {
  const { isGlass } = useGlass();
  if (data.length === 0) return null;
  const trendUp = data[data.length - 1] >= data[0];
  const stroke = color ?? (autoTrendColor ? trendUp ? UP : DOWN : "hsl(var(--primary))");
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range2 = max - min || 1;
  const padY = 3;
  const toX = (i) => i / Math.max(data.length - 1, 1) * width;
  const toY = (v) => padY + (1 - (v - min) / range2) * (height - padY * 2);
  const pts = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const area = [
    `M ${pts[0].x.toFixed(1)},${height}`,
    ...pts.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${last.x.toFixed(1)},${height} Z`
  ].join(" ");
  const gradId = React33__default.useId();
  return /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: `0 0 ${width} ${height}`,
      width,
      height,
      fill: "none",
      className: cn("shrink-0 overflow-visible", className),
      "aria-hidden": "true",
      children: variant === "bar" ? data.map((v, i) => {
        const barW = Math.max(width / data.length - 1.5, 1);
        const h = Math.max((v - min) / range2 * (height - padY * 2) + 2, 2);
        return /* @__PURE__ */ jsx(
          "rect",
          {
            x: i / data.length * width,
            y: height - h,
            width: barW,
            height: h,
            rx: 1,
            fill: stroke,
            fillOpacity: i === data.length - 1 ? 0.95 : isGlass ? 0.45 : 0.35
          },
          i
        );
      }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        showArea && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: stroke, stopOpacity: isGlass ? 0.35 : 0.22 }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: stroke, stopOpacity: 0.01 })
          ] }) }),
          /* @__PURE__ */ jsx("path", { d: area, fill: `url(#${gradId})` })
        ] }),
        isGlass && /* @__PURE__ */ jsx(
          "polyline",
          {
            points: polyline,
            stroke,
            strokeWidth: 4,
            strokeOpacity: 0.2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            style: { filter: "blur(3px)" }
          }
        ),
        /* @__PURE__ */ jsx(
          "polyline",
          {
            points: polyline,
            stroke,
            strokeWidth: 1.75,
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        showLastDot && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("circle", { cx: last.x, cy: last.y, r: 2.25, fill: stroke }),
          isGlass && /* @__PURE__ */ jsx("circle", { cx: last.x, cy: last.y, r: 5, fill: stroke, fillOpacity: 0.2 })
        ] })
      ] })
    }
  );
}
function StatusTick({ status }) {
  if (status === "sending") {
    return /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full border border-current opacity-40 animate-pulse" });
  }
  if (status === "sent") return /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 opacity-50" });
  if (status === "delivered") return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3 w-3 opacity-50" });
  return /* @__PURE__ */ jsx(CheckCheck, { className: "h-3 w-3 text-primary" });
}
function GlassChatBubble({
  role = "assistant",
  children,
  avatar,
  author,
  time,
  status,
  className
}) {
  const { isGlass } = useGlass();
  if (role === "system") {
    return /* @__PURE__ */ jsx("div", { className: cn("flex justify-center py-1", className), children: /* @__PURE__ */ jsx("span", { className: cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-foreground/50",
      isGlass ? "nb-szklo" : "bg-muted/60 border border-border"
    ), children }) });
  }
  const isUser = role === "user";
  return /* @__PURE__ */ jsxs("div", { className: cn("flex w-full gap-2.5", isUser ? "flex-row-reverse" : "flex-row", className), children: [
    avatar && /* @__PURE__ */ jsx("div", { className: cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
      isUser ? "bg-primary/20 text-primary border border-primary/30" : isGlass ? "nb-szklo text-foreground/70" : "bg-muted text-foreground/70 border border-border"
    ), children: avatar }),
    /* @__PURE__ */ jsxs("div", { className: cn("flex max-w-[78%] flex-col gap-1", isUser ? "items-end" : "items-start"), children: [
      author && /* @__PURE__ */ jsx("span", { className: "px-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40", children: author }),
      /* @__PURE__ */ jsx("div", { className: cn(
        "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
        isUser ? isGlass ? "bg-primary/20 text-foreground border border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.18)] rounded-br-md" : "bg-primary text-primary-foreground rounded-br-md" : isGlass ? "nb-szklo nb-szklo-plynne text-foreground/90 rounded-bl-md" : "bg-card border border-border text-foreground/90 rounded-bl-md"
      ), children }),
      (time || status) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-1 text-[10px] text-foreground/40", children: [
        time && /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: time }),
        status && isUser && /* @__PURE__ */ jsx(StatusTick, { status })
      ] })
    ] })
  ] });
}
function GlassChatTyping({ avatar, label, className }) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-end gap-2.5", className), children: [
    avatar && /* @__PURE__ */ jsx("div", { className: cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
      isGlass ? "nb-szklo text-foreground/70" : "bg-muted text-foreground/70 border border-border"
    ), children: avatar }),
    /* @__PURE__ */ jsxs("div", { className: cn(
      "flex items-center gap-1.5 rounded-2xl rounded-bl-md px-3.5 py-3",
      isGlass ? "nb-szklo nb-szklo-plynne" : "bg-card border border-border"
    ), children: [
      [0, 1, 2].map((i) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "h-1.5 w-1.5 rounded-full bg-foreground/45",
          style: { animation: `nb-typing 1.2s ${i * 0.16}s infinite ease-in-out` }
        },
        i
      )),
      label && /* @__PURE__ */ jsx("span", { className: "ml-1 text-[11px] text-foreground/45", children: label })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `@keyframes nb-typing{0%,60%,100%{opacity:.28;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}` })
  ] });
}
function GlassChatHeader({ title, subtitle, avatar, online, actions, className }) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex items-center gap-3 rounded-t-2xl px-4 py-3",
    isGlass ? "nb-szklo nb-szklo-plynne" : "bg-card border-b border-border",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
        isGlass ? "nb-szklo text-primary" : "bg-primary/15 text-primary border border-primary/25"
      ), children: avatar ?? /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }) }),
      online && /* @__PURE__ */ jsx("span", { className: "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-foreground", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "truncate text-[11px] text-foreground/45", children: subtitle })
    ] }),
    actions ?? /* @__PURE__ */ jsx("button", { className: "flex h-7 w-7 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/[0.06] hover:text-foreground", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) })
  ] });
}
function GlassChatInput({
  value,
  onChange,
  onSend,
  placeholder = "Napisz wiadomo\u015B\u0107...",
  disabled,
  suggestions,
  className
}) {
  const { isGlass } = useGlass();
  const [internal, setInternal] = React33__default.useState("");
  const val = value !== void 0 ? value : internal;
  function set(v) {
    if (value === void 0) setInternal(v);
    onChange?.(v);
  }
  function send(text) {
    const payload = (text ?? val).trim();
    if (!payload || disabled) return;
    onSend?.(payload);
    set("");
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-2", className), children: [
    suggestions && suggestions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: suggestions.map((s) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => send(s),
        className: cn(
          "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
          isGlass ? "nb-szklo text-foreground/65 hover:text-foreground" : "border border-border bg-card text-foreground/65 hover:text-foreground hover:bg-foreground/[0.04]"
        ),
        children: s
      },
      s
    )) }),
    /* @__PURE__ */ jsxs("div", { className: cn(
      "flex items-center gap-2 rounded-2xl px-3 py-2 transition-all",
      isGlass ? "nb-szklo nb-szklo-plynne focus-within:shadow-[0_0_14px_hsl(var(--primary)/0.2)]" : "border border-border bg-card focus-within:border-primary/50"
    ), children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled,
          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-40",
          children: /* @__PURE__ */ jsx(Paperclip, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: val,
          disabled,
          placeholder,
          onChange: (e) => set(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
          className: "min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/35 disabled:opacity-50"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => send(),
          disabled: disabled || !val.trim(),
          className: cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
            val.trim() && !disabled ? isGlass ? "bg-primary/25 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]" : "bg-primary text-primary-foreground" : "text-foreground/25"
          ),
          children: /* @__PURE__ */ jsx(Send, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
function GlassChatThread({
  children,
  maxHeight = 380,
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("flex flex-col gap-3 overflow-y-auto px-4 py-4", className),
      style: { maxHeight },
      children
    }
  );
}
function GlassCommandPalette({
  open,
  onClose,
  items,
  placeholder = "Wpisz polecenie lub szukaj...",
  emptyText = "Brak wynik\xF3w",
  inline = false,
  className
}) {
  const { isGlass } = useGlass();
  const [query, setQuery] = React33__default.useState("");
  const [active, setActive] = React33__default.useState(0);
  const inputRef = React33__default.useRef(null);
  const listRef = React33__default.useRef(null);
  const filtered = React33__default.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || it.group?.toLowerCase().includes(q) || it.hint?.toLowerCase().includes(q)
    );
  }, [items, query]);
  const groups = React33__default.useMemo(() => {
    const out = [];
    filtered.forEach((item, index) => {
      const last = out[out.length - 1];
      if (last && last.name === item.group) last.items.push({ item, index });
      else out.push({ name: item.group, items: [{ item, index }] });
    });
    return out;
  }, [filtered]);
  React33__default.useEffect(() => {
    setActive(0);
  }, [query, open]);
  React33__default.useEffect(() => {
    if (open && !inline) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open, inline]);
  React33__default.useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const run = React33__default.useCallback((item) => {
    item.onRun?.();
    onClose();
    setQuery("");
  }, [onClose]);
  React33__default.useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % Math.max(filtered.length, 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const it = filtered[active];
        if (it) run(it);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onClose, run]);
  if (!open) return null;
  const panel = /* @__PURE__ */ jsxs("div", { className: cn(
    "flex w-full flex-col overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card shadow-2xl",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2.5 px-4 py-3", isGlass ? "border-b border-foreground/[0.08]" : "border-b border-border"), children: [
      /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 shrink-0 text-primary" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder,
          className: "min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        }
      ),
      /* @__PURE__ */ jsx("kbd", { className: "hidden shrink-0 rounded-md border border-foreground/10 bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-foreground/45 sm:inline-block", children: "ESC" })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: listRef, className: "max-h-[320px] overflow-y-auto p-1.5", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-8 text-center text-xs text-foreground/40", children: emptyText }) : groups.map((g, gi) => /* @__PURE__ */ jsxs("div", { className: "mb-1", children: [
      g.name && /* @__PURE__ */ jsx("p", { className: "px-2.5 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-foreground/35", children: g.name }),
      g.items.map(({ item, index }) => {
        const Icon2 = item.icon;
        const isActive = index === active;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            "data-idx": index,
            onMouseEnter: () => setActive(index),
            onClick: () => run(item),
            className: cn(
              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors",
              isActive ? isGlass ? "bg-primary/15 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.18)]" : "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-foreground/[0.05]"
            ),
            children: [
              Icon2 && /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate font-medium", children: item.label }),
              item.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[10px] text-foreground/35", children: item.hint }),
              item.shortcut && /* @__PURE__ */ jsx("kbd", { className: "shrink-0 rounded-md border border-foreground/10 bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[9px] text-foreground/45", children: item.shortcut })
            ]
          },
          item.id
        );
      })
    ] }, gi)) }),
    /* @__PURE__ */ jsxs("div", { className: cn(
      "flex items-center gap-3 px-4 py-2 text-[10px] text-foreground/35",
      isGlass ? "border-t border-foreground/[0.08]" : "border-t border-border"
    ), children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(ArrowUp, { className: "h-2.5 w-2.5" }),
        /* @__PURE__ */ jsx(ArrowDown, { className: "h-2.5 w-2.5" }),
        " nawigacja"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(CornerDownLeft, { className: "h-2.5 w-2.5" }),
        " wybierz"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "ml-auto tabular-nums", children: [
        filtered.length,
        " pozycji"
      ] })
    ] })
  ] });
  if (inline) return panel;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in-0 duration-150",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative z-10 w-full max-w-lg animate-in fade-in-0 zoom-in-[0.98] slide-in-from-top-2 duration-150", children: panel })
  ] });
}
function useCommandPalette() {
  const [open, setOpen] = React33__default.useState(false);
  React33__default.useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen, close: () => setOpen(false) };
}
var MONTHS = ["Stycze\u0144", "Luty", "Marzec", "Kwiecie\u0144", "Maj", "Czerwiec", "Lipiec", "Sierpie\u0144", "Wrzesie\u0144", "Pa\u017Adziernik", "Listopad", "Grudzie\u0144"];
var DOW = ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "So", "Nd"];
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
function GlassCalendar({
  mode = "single",
  value,
  onChange,
  defaultMonth,
  minDate,
  maxDate,
  compact = false,
  className
}) {
  const { isGlass } = useGlass();
  const initial = defaultMonth ?? (value instanceof Date ? value : value?.from) ?? /* @__PURE__ */ new Date();
  const [view, setView] = React33__default.useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [hover, setHover] = React33__default.useState(null);
  const today = startOfDay(/* @__PURE__ */ new Date());
  const days = buildGrid(view.getFullYear(), view.getMonth());
  const single = mode === "single" ? value : null;
  const range2 = mode === "range" ? value : null;
  function disabled(d) {
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return false;
  }
  const previewTo = range2?.from && !range2.to ? hover : null;
  function inRange(d) {
    if (mode !== "range" || !range2?.from) return false;
    const end = range2.to ?? previewTo;
    if (!end) return false;
    const [lo, hi] = range2.from <= end ? [range2.from, end] : [end, range2.from];
    return d > startOfDay(lo) && d < startOfDay(hi);
  }
  function pick(d) {
    if (disabled(d)) return;
    if (mode === "single") {
      onChange?.(d);
      return;
    }
    if (!range2?.from || range2.to) {
      onChange?.({ from: d, to: null });
      return;
    }
    onChange?.(range2.from <= d ? { from: range2.from, to: d } : { from: d, to: range2.from });
  }
  const cell = compact ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "inline-flex flex-col gap-2 rounded-2xl p-3",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-0.5", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1)),
          className: "flex h-6 w-6 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
          "aria-label": "Poprzedni miesi\u0105c",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: cn("font-semibold text-foreground", compact ? "text-[11px]" : "text-xs"), children: [
        MONTHS[view.getMonth()],
        " ",
        view.getFullYear()
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1)),
          className: "flex h-6 w-6 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
          "aria-label": "Nast\u0119pny miesi\u0105c",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-0.5", children: DOW.map((d) => /* @__PURE__ */ jsx("span", { className: cn("flex items-center justify-center font-semibold text-foreground/30", cell), children: d }, d)) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-0.5", onMouseLeave: () => setHover(null), children: days.map((d, i) => {
      const outside = d.getMonth() !== view.getMonth();
      const isToday = sameDay(d, today);
      const isDisabled = disabled(d);
      const selected = mode === "single" ? sameDay(d, single) : sameDay(d, range2?.from) || sameDay(d, range2?.to);
      const between = inRange(d);
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          disabled: isDisabled,
          onMouseEnter: () => setHover(d),
          onClick: () => pick(d),
          className: cn(
            "flex items-center justify-center rounded-lg font-medium transition-all tabular-nums",
            cell,
            isDisabled && "cursor-not-allowed opacity-20",
            !isDisabled && !selected && !between && "hover:bg-foreground/[0.07]",
            outside ? "text-foreground/25" : "text-foreground/75",
            between && !selected && (isGlass ? "bg-primary/12 text-primary" : "bg-primary/10 text-primary"),
            selected && (isGlass ? "bg-primary/30 text-primary font-bold shadow-[0_0_10px_hsl(var(--primary)/0.35)]" : "bg-primary text-primary-foreground font-bold"),
            isToday && !selected && "ring-1 ring-primary/40 text-primary"
          ),
          children: d.getDate()
        },
        i
      );
    }) })
  ] });
}
function fmt(d) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function GlassDatePicker({
  mode = "single",
  value,
  onChange,
  placeholder = "Wybierz dat\u0119",
  className
}) {
  const { isGlass } = useGlass();
  const [open, setOpen] = React33__default.useState(false);
  const ref = React33__default.useRef(null);
  React33__default.useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  const label = React33__default.useMemo(() => {
    if (mode === "single") return value instanceof Date ? fmt(value) : null;
    const r = value;
    if (!r?.from) return null;
    return r.to ? `${fmt(r.from)} \u2014 ${fmt(r.to)}` : `${fmt(r.from)} \u2014 ...`;
  }, [value, mode]);
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative inline-block", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        className: cn(
          "flex h-10 w-full min-w-[200px] items-center gap-2 rounded-xl px-3 text-sm transition-all",
          isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-input",
          open && "ring-2 ring-primary/30"
        ),
        children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 shrink-0 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: cn("flex-1 text-left", label ? "text-foreground" : "text-foreground/35"), children: label ?? placeholder }),
          /* @__PURE__ */ jsx(ChevronRight, { className: cn("h-3.5 w-3.5 shrink-0 text-foreground/35 transition-transform", open && "rotate-90") })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-full z-50 mt-2 animate-in fade-in-0 zoom-in-[0.98] duration-150", children: /* @__PURE__ */ jsx(
      GlassCalendar,
      {
        mode,
        value,
        onChange: (v) => {
          onChange?.(v);
          if (mode === "single" || v?.to) setOpen(false);
        }
      }
    ) })
  ] });
}
function GlassCombobox({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Wybierz...",
  searchPlaceholder = "Szukaj...",
  emptyText = "Brak wynik\xF3w",
  disabled,
  className
}) {
  const { isGlass } = useGlass();
  const [open, setOpen] = React33__default.useState(false);
  const [query, setQuery] = React33__default.useState("");
  const [active, setActive] = React33__default.useState(0);
  const ref = React33__default.useRef(null);
  const inputRef = React33__default.useRef(null);
  const selected = React33__default.useMemo(
    () => multiple ? Array.isArray(value) ? value : [] : value ? [value] : [],
    [value, multiple]
  );
  const filtered = React33__default.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q));
  }, [options, query]);
  React33__default.useEffect(() => {
    setActive(0);
  }, [query, open]);
  React33__default.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
    else setQuery("");
  }, [open]);
  React33__default.useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  function toggle(opt) {
    if (opt.disabled) return;
    if (!multiple) {
      onChange?.(opt.value);
      setOpen(false);
      return;
    }
    const next = selected.includes(opt.value) ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
    onChange?.(next);
  }
  function removeChip(v, e) {
    e.stopPropagation();
    onChange?.(selected.filter((s) => s !== v));
  }
  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = filtered[active];
      if (o) toggle(o);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Backspace" && !query && multiple && selected.length) {
      onChange?.(selected.slice(0, -1));
    }
  }
  const singleLabel = !multiple && selected[0] ? options.find((o) => o.value === selected[0])?.label : null;
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative w-full max-w-sm", className), children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => !disabled && setOpen((v) => !v),
        className: cn(
          "flex min-h-10 w-full cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-all",
          isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-input",
          open && "ring-2 ring-primary/30",
          disabled && "cursor-not-allowed opacity-50"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex min-w-0 flex-1 flex-wrap items-center gap-1", children: multiple && selected.length > 0 ? selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return /* @__PURE__ */ jsxs(
              "span",
              {
                className: cn(
                  "inline-flex items-center gap-1 rounded-full py-0.5 pl-2 pr-1 text-[11px] font-medium",
                  isGlass ? "bg-primary/20 text-primary" : "bg-primary/12 text-primary"
                ),
                children: [
                  opt?.label ?? v,
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => removeChip(v, e),
                      className: "flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors hover:bg-primary/25",
                      "aria-label": `Usu\u0144 ${opt?.label ?? v}`,
                      children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
                    }
                  )
                ]
              },
              v
            );
          }) : singleLabel ? /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: singleLabel }) : /* @__PURE__ */ jsx("span", { className: "text-foreground/35", children: placeholder }) }),
          /* @__PURE__ */ jsx(ChevronDown, { className: cn("h-3.5 w-3.5 shrink-0 text-foreground/35 transition-transform", open && "rotate-180") })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: cn(
      "absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl",
      "animate-in fade-in-0 zoom-in-[0.98] slide-in-from-top-1 duration-150",
      isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card shadow-xl"
    ), children: [
      /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2 px-3 py-2", isGlass ? "border-b border-foreground/[0.08]" : "border-b border-border"), children: [
        /* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5 shrink-0 text-foreground/35" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            value: query,
            onChange: (e) => setQuery(e.target.value),
            onKeyDown,
            placeholder: searchPlaceholder,
            className: "min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/30"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-56 overflow-y-auto p-1.5", children: filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-3 py-6 text-center text-xs text-foreground/40", children: emptyText }) : filtered.map((opt, i) => {
        const Icon2 = opt.icon;
        const isSel = selected.includes(opt.value);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: opt.disabled,
            onMouseEnter: () => setActive(i),
            onClick: () => toggle(opt),
            className: cn(
              "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors",
              opt.disabled && "cursor-not-allowed opacity-35",
              i === active && !opt.disabled && (isGlass ? "bg-primary/12" : "bg-foreground/[0.06]"),
              isSel ? "text-primary font-medium" : "text-foreground/75"
            ),
            children: [
              Icon2 && /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: opt.label }),
              opt.hint && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[10px] text-foreground/35", children: opt.hint }),
              isSel && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 shrink-0 text-primary" })
            ]
          },
          opt.value
        );
      }) })
    ] })
  ] });
}
function GlassStepper({
  steps,
  current,
  orientation = "horizontal",
  error = false,
  onStepClick,
  className
}) {
  const { isGlass } = useGlass();
  const isH = orientation === "horizontal";
  return /* @__PURE__ */ jsx("div", { className: cn(isH ? "flex w-full items-start" : "flex flex-col", className), children: steps.map((step, i) => {
    const done = i < current;
    const active = i === current;
    const failed = active && error;
    const last = i === steps.length - 1;
    const Icon2 = step.icon;
    const marker = /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all",
          failed ? "bg-destructive text-destructive-foreground" : done ? isGlass ? "bg-primary/30 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]" : "bg-primary text-primary-foreground" : active ? isGlass ? "bg-primary/20 text-primary ring-2 ring-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.3)]" : "bg-primary/15 text-primary ring-2 ring-primary/40" : isGlass ? "nb-szklo text-foreground/40" : "bg-muted text-foreground/40 border border-border"
        ),
        children: failed ? /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) : done ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : Icon2 ? /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5" }) : i + 1
      }
    );
    const connector = !last && /* @__PURE__ */ jsx("div", { className: cn(
      isH ? "mt-4 h-0.5 flex-1" : "ml-4 min-h-[28px] w-0.5 flex-1",
      done ? "bg-primary/50" : isGlass ? "bg-foreground/12" : "bg-border"
    ) });
    const labels = /* @__PURE__ */ jsxs("div", { className: cn(isH ? "mt-2 text-center" : "pb-6 pt-0.5"), children: [
      /* @__PURE__ */ jsx("p", { className: cn(
        "text-xs font-semibold leading-tight transition-colors",
        failed ? "text-destructive" : active ? "text-primary" : done ? "text-foreground/75" : "text-foreground/40"
      ), children: step.label }),
      step.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10px] leading-snug text-foreground/40", children: step.description })
    ] });
    if (isH) {
      return /* @__PURE__ */ jsxs(React33__default.Fragment, { children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn("flex min-w-0 flex-col items-center", onStepClick && "cursor-pointer"),
            onClick: () => onStepClick?.(i),
            children: [
              marker,
              labels
            ]
          }
        ),
        connector
      ] }, i);
    }
    return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        marker,
        connector
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn("min-w-0 flex-1", onStepClick && "cursor-pointer"),
          onClick: () => onStepClick?.(i),
          children: labels
        }
      )
    ] }, i);
  }) });
}
function GlassProgressSteps({
  total,
  current,
  labels,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn("flex w-full flex-col gap-2", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
      /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
        "Krok ",
        Math.min(current + 1, total),
        " z ",
        total
      ] }),
      labels?.[current] && /* @__PURE__ */ jsx("span", { className: "text-foreground/50", children: labels[current] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: Array.from({ length: total }).map((_, i) => /* @__PURE__ */ jsx(
      "div",
      {
        className: cn(
          "h-1.5 flex-1 rounded-full transition-all duration-300",
          i <= current ? isGlass ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.45)]" : "bg-primary" : isGlass ? "bg-foreground/12" : "bg-muted"
        )
      },
      i
    )) })
  ] });
}
function shell(isGlass) {
  return isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card";
}
function Thumb3({
  icon: Icon2,
  gradient = "from-primary/30 via-sky-600/20 to-blue-600/15",
  className,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-br", gradient, className), children: [
    Icon2 && /* @__PURE__ */ jsx(Icon2, { className: "h-8 w-8 text-white/70" }),
    children
  ] });
}
function GlassMediaCard({
  title,
  description,
  meta,
  badge,
  icon,
  gradient,
  horizontal = false,
  video = false,
  duration,
  footer,
  onClick,
  className
}) {
  const { isGlass } = useGlass();
  const thumb = /* @__PURE__ */ jsxs(
    Thumb3,
    {
      icon: video ? void 0 : icon,
      gradient,
      className: horizontal ? "h-full w-28 shrink-0" : "h-36 w-full",
      children: [
        video && /* @__PURE__ */ jsx("span", { className: "flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm ring-1 ring-white/25", children: /* @__PURE__ */ jsx(Play, { className: "ml-0.5 h-4 w-4 fill-white text-white" }) }),
        badge && /* @__PURE__ */ jsx("span", { className: "absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm", children: badge }),
        duration && /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white tabular-nums", children: duration })
      ]
    }
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick,
      className: cn(
        "group overflow-hidden rounded-2xl transition-all duration-200",
        shell(isGlass),
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
        horizontal && "flex",
        className
      ),
      children: [
        thumb,
        /* @__PURE__ */ jsxs("div", { className: cn("flex min-w-0 flex-col gap-1 p-3.5", horizontal && "flex-1 justify-center"), children: [
          /* @__PURE__ */ jsx("h4", { className: "truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary", children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "line-clamp-2 text-[11px] leading-relaxed text-foreground/55", children: description }),
          meta && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10px] text-foreground/35", children: meta }),
          footer && /* @__PURE__ */ jsx("div", { className: "mt-2", children: footer })
        ] })
      ]
    }
  );
}
function GlassProductCard({
  name,
  price,
  oldPrice,
  badge,
  rating,
  reviews,
  icon,
  gradient,
  soldOut,
  onAdd,
  className
}) {
  const { isGlass } = useGlass();
  const [liked, setLiked] = React33__default.useState(false);
  return /* @__PURE__ */ jsxs("div", { className: cn("group overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5", shell(isGlass), className), children: [
    /* @__PURE__ */ jsxs(Thumb3, { icon, gradient, className: cn("h-32 w-full", soldOut && "opacity-40 grayscale"), children: [
      badge && /* @__PURE__ */ jsx("span", { className: cn(
        "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        isGlass ? "bg-primary/85 text-white" : "bg-primary text-primary-foreground"
      ), children: badge }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          },
          className: "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60",
          "aria-label": liked ? "Usu\u0144 z ulubionych" : "Dodaj do ulubionych",
          children: /* @__PURE__ */ jsx(Heart, { className: cn("h-3 w-3 transition-colors", liked ? "fill-red-500 text-red-500" : "text-white/75") })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 p-3", children: [
      /* @__PURE__ */ jsx("h4", { className: "truncate text-[13px] font-semibold text-foreground", children: name }),
      rating !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(
          Star,
          {
            className: cn("h-2.5 w-2.5", i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-foreground/15")
          },
          i
        )),
        reviews !== void 0 && /* @__PURE__ */ jsxs("span", { className: "ml-0.5 text-[10px] text-foreground/40", children: [
          "(",
          reviews,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-foreground tabular-nums", children: price }),
        oldPrice && /* @__PURE__ */ jsx("span", { className: "text-[11px] text-foreground/35 line-through tabular-nums", children: oldPrice })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onAdd,
          disabled: soldOut,
          className: cn(
            "mt-1 h-8 w-full rounded-xl text-[11px] font-bold transition-all",
            soldOut ? "cursor-not-allowed bg-foreground/[0.06] text-foreground/30" : isGlass ? "bg-primary/25 text-primary hover:bg-primary/35 shadow-[0_0_10px_hsl(var(--primary)/0.25)]" : "bg-primary text-primary-foreground hover:brightness-110"
          ),
          children: soldOut ? "Niedost\u0119pny" : "Dodaj do koszyka"
        }
      )
    ] })
  ] });
}
function GlassProfileCard({
  name,
  role,
  bio,
  initials,
  stats,
  online,
  cover = false,
  gradient = "from-primary/35 via-sky-600/25 to-blue-600/20",
  actions,
  className
}) {
  const { isGlass } = useGlass();
  const fallback = initials ?? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return /* @__PURE__ */ jsxs("div", { className: cn("overflow-hidden rounded-2xl", shell(isGlass), className), children: [
    cover && /* @__PURE__ */ jsx("div", { className: cn("h-16 w-full bg-gradient-to-r", gradient) }),
    /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col p-4", cover && "-mt-8"), children: [
      /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-3", cover && "flex-col items-start"), children: [
        /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
            cover && "ring-4 ring-background",
            isGlass ? "bg-primary/25 text-primary" : "bg-primary/15 text-primary border border-primary/25"
          ), children: fallback }),
          online && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-background" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: cn("min-w-0", cover && "mt-2"), children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-bold text-foreground", children: name }),
          role && /* @__PURE__ */ jsx("p", { className: "truncate text-[11px] text-foreground/50", children: role })
        ] }),
        !cover && actions && /* @__PURE__ */ jsx("div", { className: "ml-auto shrink-0", children: actions })
      ] }),
      bio && /* @__PURE__ */ jsx("p", { className: "mt-3 text-[11px] leading-relaxed text-foreground/55", children: bio }),
      stats && stats.length > 0 && /* @__PURE__ */ jsx("div", { className: cn(
        "mt-3 grid gap-2 border-t pt-3",
        isGlass ? "border-foreground/[0.08]" : "border-border"
      ), style: { gridTemplateColumns: `repeat(${stats.length}, minmax(0,1fr))` }, children: stats.map((s) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground tabular-nums", children: s.value }),
        /* @__PURE__ */ jsx("p", { className: "text-[9px] uppercase tracking-wide text-foreground/40", children: s.label })
      ] }, s.label)) }),
      cover && actions && /* @__PURE__ */ jsx("div", { className: "mt-3", children: actions })
    ] })
  ] });
}
var STATUS_COLOR = {
  done: "hsl(160 60% 45%)",
  active: "hsl(var(--primary))",
  pending: "hsl(var(--muted-foreground))",
  error: "hsl(0 72% 58%)"
};
function GlassTimeline({
  events,
  orientation = "vertical",
  compact = false,
  className
}) {
  const { isGlass } = useGlass();
  if (orientation === "horizontal") {
    return /* @__PURE__ */ jsx("div", { className: cn("flex w-full items-start overflow-x-auto pb-2", className), children: events.map((ev, i) => {
      const color = ev.color ?? STATUS_COLOR[ev.status ?? "pending"];
      const Icon2 = ev.icon;
      const last = i === events.length - 1;
      return /* @__PURE__ */ jsxs(React33__default.Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-[110px] flex-col items-center px-1 text-center", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              style: {
                background: `color-mix(in srgb, ${color} 22%, transparent)`,
                boxShadow: isGlass ? `0 0 10px color-mix(in srgb, ${color} 40%, transparent)` : void 0
              },
              children: Icon2 ? /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5", style: { color } }) : /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: { background: color } })
            }
          ),
          ev.time && /* @__PURE__ */ jsx("span", { className: "mt-1.5 font-mono text-[9px] text-foreground/35 tabular-nums", children: ev.time }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[11px] font-semibold leading-tight text-foreground/85", children: ev.title }),
          ev.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10px] leading-snug text-foreground/45", children: ev.description })
        ] }),
        !last && /* @__PURE__ */ jsx(
          "div",
          {
            className: "mt-3.5 h-0.5 min-w-[24px] flex-1",
            style: { background: `color-mix(in srgb, ${color} 35%, transparent)` }
          }
        )
      ] }, i);
    }) });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-col", className), children: events.map((ev, i) => {
    const color = ev.color ?? STATUS_COLOR[ev.status ?? "pending"];
    const Icon2 = ev.icon;
    const last = i === events.length - 1;
    return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            style: {
              background: `color-mix(in srgb, ${color} 20%, transparent)`,
              boxShadow: isGlass && ev.status === "active" ? `0 0 12px color-mix(in srgb, ${color} 45%, transparent)` : void 0
            },
            children: Icon2 ? /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5", style: { color } }) : /* @__PURE__ */ jsx(
              "span",
              {
                className: cn("rounded-full", ev.status === "active" ? "h-2.5 w-2.5 animate-pulse" : "h-2 w-2"),
                style: { background: color }
              }
            )
          }
        ),
        !last && /* @__PURE__ */ jsx(
          "div",
          {
            className: cn("w-0.5 flex-1", compact ? "min-h-[16px]" : "min-h-[26px]"),
            style: { background: `color-mix(in srgb, ${color} 25%, transparent)` }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("min-w-0 flex-1", last ? "pb-0" : compact ? "pb-3" : "pb-5"), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[13px] font-semibold leading-tight text-foreground", children: ev.title }),
          ev.time && /* @__PURE__ */ jsx("span", { className: "shrink-0 font-mono text-[10px] text-foreground/35 tabular-nums", children: ev.time })
        ] }),
        ev.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] leading-relaxed text-foreground/50", children: ev.description }),
        ev.meta && /* @__PURE__ */ jsx("div", { className: "mt-1.5", children: ev.meta })
      ] })
    ] }, i);
  }) });
}
function GlassActivityFeed({
  items,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-col", className), children: items.map((it, i) => {
    const Icon2 = it.icon;
    const fallback = it.initials ?? it.actor.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-foreground/[0.03]",
          i !== items.length - 1 && (isGlass ? "border-b border-foreground/[0.05]" : "border-b border-border/50")
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
            isGlass ? "nb-szklo text-foreground/70" : "bg-muted text-foreground/70 border border-border"
          ), children: Icon2 ? /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5 text-primary" }) : fallback }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[12px] leading-snug text-foreground/70", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: it.actor }),
              " ",
              it.action,
              " ",
              it.target && /* @__PURE__ */ jsx("span", { className: "font-medium text-primary", children: it.target })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10px] text-foreground/35", children: it.time }),
            it.meta && /* @__PURE__ */ jsx("div", { className: "mt-1.5", children: it.meta })
          ] })
        ]
      },
      i
    );
  }) });
}
var FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function useFocusTrap(active) {
  const ref = React33__default.useRef(null);
  React33__default.useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const previous = document.activeElement;
    const first = root.querySelectorAll(FOCUSABLE)[0];
    first?.focus();
    function onKey(e) {
      if (e.key !== "Tab") return;
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [active]);
  return ref;
}
function useReducedMotion() {
  const [reduced, setReduced] = React33__default.useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  React33__default.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
function SrOnly({ children }) {
  return /* @__PURE__ */ jsx("span", { className: "sr-only", children });
}
function LiveRegion({
  message,
  politeness = "polite"
}) {
  return /* @__PURE__ */ jsx("div", { "aria-live": politeness, "aria-atomic": "true", className: "sr-only", children: message });
}
function SkipLink({ href = "#main", children = "Przejd\u017A do tre\u015Bci" }) {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href,
      className: cn(
        "sr-only focus:not-sr-only",
        "focus:fixed focus:left-4 focus:top-4 focus:z-[999]",
        "focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2",
        "focus:text-sm focus:font-semibold focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      ),
      children
    }
  );
}
function GlassKbd({ keys, className }) {
  return /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center gap-1", className), children: keys.map((k, i) => /* @__PURE__ */ jsxs(React33__default.Fragment, { children: [
    i > 0 && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-foreground/25", children: "+" }),
    /* @__PURE__ */ jsx("kbd", { className: "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md border border-foreground/12 bg-foreground/[0.05] px-1.5 font-mono text-[10px] font-semibold text-foreground/60", children: k })
  ] }, i)) });
}
var MAXW = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none"
};
function GlassContainer({
  size = "lg",
  bleed = false,
  className,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("mx-auto w-full", bleed ? "max-w-none px-0" : cn(MAXW[size], "px-4 sm:px-6"), className), children });
}
var COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
};
var GAP2 = { sm: "gap-2", md: "gap-3", lg: "gap-5" };
function GlassGrid({
  cols = 3,
  gap = "md",
  className,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("grid", COLS[cols], GAP2[gap], className), children });
}
var SPAN = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4"
};
var ROWSPAN = { 1: "", 2: "lg:row-span-2" };
function GlassBento({
  tiles,
  gap = "md",
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("grid auto-rows-[minmax(120px,auto)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", GAP2[gap], className), children: tiles.map((t, i) => /* @__PURE__ */ jsx("div", { className: cn(SPAN[t.span ?? 1], ROWSPAN[t.rows ?? 1]), children: t.content }, i)) });
}
function GlassMasonry({
  cols = 3,
  gap = "md",
  className,
  children
}) {
  const colCls = cols === 2 ? "sm:columns-2" : cols === 4 ? "sm:columns-2 lg:columns-4" : "sm:columns-2 lg:columns-3";
  const gapCls = gap === "sm" ? "gap-2" : gap === "lg" ? "gap-5" : "gap-3";
  return /* @__PURE__ */ jsx("div", { className: cn("columns-1", colCls, gapCls, className), children: React33__default.Children.map(children, (child, i) => (
    // break-inside-avoid zapobiega rozcięciu kafelka między kolumnami.
    /* @__PURE__ */ jsx("div", { className: cn("break-inside-avoid", gap === "sm" ? "mb-2" : gap === "lg" ? "mb-5" : "mb-3"), children: child }, i)
  )) });
}
var RATIO = {
  "1/2": "lg:grid-cols-2",
  "1/3": "lg:grid-cols-[1fr_2fr]",
  "2/3": "lg:grid-cols-[2fr_1fr]",
  "1/4": "lg:grid-cols-[1fr_3fr]"
};
function GlassSplit({
  ratio = "1/2",
  gap = "lg",
  reverse = false,
  className,
  children
}) {
  const kids = React33__default.Children.toArray(children);
  return /* @__PURE__ */ jsx("div", { className: cn("grid grid-cols-1 items-center", RATIO[ratio], GAP2[gap], className), children: kids.map((k, i) => /* @__PURE__ */ jsx("div", { className: cn(reverse && (i === 0 ? "lg:order-2" : "lg:order-1")), children: k }, i)) });
}
var SPACE = { xs: "gap-1", sm: "gap-2", md: "gap-4", lg: "gap-6", xl: "gap-10" };
var ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
function GlassStack({
  space = "md",
  align = "stretch",
  divide = false,
  className,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: cn(
    "flex flex-col",
    SPACE[space],
    ALIGN[align],
    divide && "divide-y divide-foreground/[0.07]",
    className
  ), children });
}
var JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" };
function GlassCluster({
  space = "sm",
  justify = "start",
  align = "center",
  className,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-wrap", SPACE[space], JUSTIFY[justify], ALIGN[align], className), children });
}
var ASPECT = {
  "16/9": "aspect-video",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "21/9": "aspect-[21/9]"
};
function GlassAspectRatio({
  ratio = "16/9",
  className,
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("relative w-full overflow-hidden", ASPECT[ratio], className), children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children }) });
}
function GlassDivider({
  orientation = "horizontal",
  label,
  variant = "solid",
  className
}) {
  const line = {
    solid: "bg-foreground/[0.09]",
    dashed: "bg-[repeating-linear-gradient(90deg,hsl(var(--foreground)/0.16)_0_6px,transparent_6px_12px)]",
    dotted: "bg-[repeating-linear-gradient(90deg,hsl(var(--foreground)/0.22)_0_2px,transparent_2px_6px)]",
    gradient: "bg-gradient-to-r from-transparent via-primary/40 to-transparent"
  }[variant];
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsx(
      "span",
      {
        "aria-hidden": true,
        className: cn("inline-block w-px self-stretch", variant === "solid" ? "bg-foreground/[0.09]" : "bg-foreground/[0.14]", className)
      }
    );
  }
  if (!label) {
    return /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: cn("h-px w-full", line, className) });
  }
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-3", className), children: [
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: cn("h-px flex-1", line) }),
    /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35", children: label }),
    /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: cn("h-px flex-1", line) })
  ] });
}
function GlassOrb({
  size = 320,
  color = "hsl(var(--primary))",
  opacity = 0.18,
  blur = 80,
  className,
  style
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: cn("pointer-events-none absolute rounded-full", className),
      style: { width: size, height: size, background: color, opacity, filter: `blur(${blur}px)`, ...style }
    }
  );
}
var NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
function GlassNoise({
  opacity = 0.05,
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: cn("pointer-events-none absolute inset-0 mix-blend-overlay", className),
      style: { backgroundImage: NOISE_SVG, opacity }
    }
  );
}
function GlassSpotlight({
  color = "hsl(var(--primary))",
  size = 380,
  className,
  children
}) {
  const ref = React33__default.useRef(null);
  const [pos, setPos] = React33__default.useState(null);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      onMouseMove: (e) => {
        const r = ref.current.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      },
      onMouseLeave: () => setPos(null),
      className: cn("relative overflow-hidden", className),
      children: [
        pos && /* @__PURE__ */ jsx(
          "div",
          {
            "aria-hidden": true,
            className: "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200",
            style: {
              left: pos.x,
              top: pos.y,
              width: size,
              height: size,
              background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
              opacity: 0.13,
              filter: "blur(28px)"
            }
          }
        ),
        children
      ]
    }
  );
}
function GlassMeshGradient({
  colors = ["hsl(var(--primary))", "hsl(190 70% 50%)", "hsl(270 65% 58%)"],
  opacity = 0.3,
  className
}) {
  const layers = [
    { c: colors[0], pos: "20% 25%" },
    { c: colors[1] ?? colors[0], pos: "80% 20%" },
    { c: colors[2] ?? colors[0], pos: "55% 85%" }
  ];
  return /* @__PURE__ */ jsx(
    "div",
    {
      "aria-hidden": true,
      className: cn("pointer-events-none absolute inset-0", className),
      style: {
        opacity,
        backgroundImage: layers.map((l) => `radial-gradient(at ${l.pos}, ${l.c} 0px, transparent 55%)`).join(", ")
      }
    }
  );
}
function GlassAurora({
  className,
  speed = 18
}) {
  const id = React33__default.useId().replace(/:/g, "");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: cn("pointer-events-none absolute inset-0 opacity-40", className),
        style: {
          background: `conic-gradient(from 180deg at 50% 50%, hsl(var(--primary)/0.5), hsl(190 70% 50%/0.35), hsl(270 65% 58%/0.4), hsl(var(--primary)/0.5))`,
          filter: "blur(56px)",
          animation: `nb-aurora-${id} ${speed}s linear infinite`
        }
      }
    ),
    /* @__PURE__ */ jsx("style", { children: `@keyframes nb-aurora-${id}{0%{transform:rotate(0) scale(1.25)}100%{transform:rotate(360deg) scale(1.25)}}` })
  ] });
}
function GlassCornerDecor({
  size = 14,
  color = "hsl(var(--primary)/0.5)",
  corners = "all",
  className
}) {
  const show = {
    tl: corners !== "bottom",
    tr: corners !== "bottom",
    bl: corners !== "top",
    br: corners !== "top"
  };
  const base = "absolute";
  const s = `${size}px`;
  return /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: cn("pointer-events-none absolute inset-0", className), children: [
    show.tl && /* @__PURE__ */ jsx("span", { className: cn(base, "left-0 top-0 border-l border-t"), style: { width: s, height: s, borderColor: color } }),
    show.tr && /* @__PURE__ */ jsx("span", { className: cn(base, "right-0 top-0 border-r border-t"), style: { width: s, height: s, borderColor: color } }),
    show.bl && /* @__PURE__ */ jsx("span", { className: cn(base, "bottom-0 left-0 border-b border-l"), style: { width: s, height: s, borderColor: color } }),
    show.br && /* @__PURE__ */ jsx("span", { className: cn(base, "bottom-0 right-0 border-b border-r"), style: { width: s, height: s, borderColor: color } })
  ] });
}
function GlassBorderGlow({
  radius = "rounded-2xl",
  color = "hsl(var(--primary))",
  animated = false,
  className,
  children
}) {
  const { isGlass } = useGlass();
  const id = React33__default.useId().replace(/:/g, "");
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", radius, className), children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-hidden": true,
        className: cn("pointer-events-none absolute -inset-px", radius),
        style: {
          background: animated ? `conic-gradient(from 0deg, transparent 0%, ${color} 25%, transparent 50%, ${color} 75%, transparent 100%)` : `linear-gradient(135deg, ${color}, transparent 45%, transparent 55%, ${color})`,
          opacity: isGlass ? 0.55 : 0.35,
          animation: animated ? `nb-glow-${id} 4s linear infinite` : void 0
        }
      }
    ),
    /* @__PURE__ */ jsx("div", { className: cn("relative h-full w-full", radius), children }),
    animated && /* @__PURE__ */ jsx("style", { children: `@keyframes nb-glow-${id}{to{transform:rotate(360deg)}}` })
  ] });
}
function GlassList({
  divided = true,
  className,
  children
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx("div", { className: cn(
    "flex flex-col overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    divided && (isGlass ? "divide-y divide-foreground/[0.06]" : "divide-y divide-border"),
    className
  ), children });
}
function GlassListItem({
  title,
  description,
  leading,
  trailing,
  chevron,
  active,
  disabled,
  onClick,
  className
}) {
  const clickable = !!onClick && !disabled;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: clickable ? onClick : void 0,
      role: clickable ? "button" : void 0,
      tabIndex: clickable ? 0 : void 0,
      onKeyDown: clickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      } : void 0,
      className: cn(
        "flex items-center gap-3 px-3.5 py-2.5 transition-colors",
        clickable && "cursor-pointer hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:bg-foreground/[0.06]",
        active && "bg-primary/[0.08]",
        disabled && "pointer-events-none opacity-40",
        className
      ),
      children: [
        leading && /* @__PURE__ */ jsx("div", { className: "shrink-0", children: leading }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: cn("truncate text-[13px] font-medium leading-tight", active ? "text-primary" : "text-foreground"), children: title }),
          description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 truncate text-[11px] text-foreground/45", children: description })
        ] }),
        trailing && /* @__PURE__ */ jsx("div", { className: "shrink-0", children: trailing }),
        chevron && /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5 shrink-0 text-foreground/25" })
      ]
    }
  );
}
function GlassBulletList({
  items,
  ordered = false,
  /** Ptaszek zamiast kropki — do list korzyści. */
  check = false,
  className
}) {
  const Tag = ordered ? "ol" : "ul";
  return /* @__PURE__ */ jsx(Tag, { className: cn("flex flex-col gap-2", className), children: items.map((it, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/75", children: [
    ordered ? /* @__PURE__ */ jsx("span", { className: "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[9px] font-bold text-primary", children: i + 1 }) : check ? /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" }) : /* @__PURE__ */ jsx("span", { className: "mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" }),
    /* @__PURE__ */ jsx("span", { className: "min-w-0", children: it })
  ] }, i)) });
}
function GlassKeyValue({
  rows,
  /** 'row' — klucz i wartość w jednej linii; 'stack' — pod sobą. */
  layout = "row",
  className
}) {
  const { isGlass } = useGlass();
  const [copied, setCopied] = React33__default.useState(null);
  function copy(text, i) {
    navigator.clipboard?.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied((c) => c === i ? null : c), 1600);
  }
  return /* @__PURE__ */ jsx("dl", { className: cn(
    "flex flex-col",
    isGlass ? "divide-y divide-foreground/[0.06]" : "divide-y divide-border/60",
    className
  ), children: rows.map((r, i) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "gap-1 py-2.5",
        layout === "row" ? "flex items-baseline justify-between gap-4" : "flex flex-col"
      ),
      children: [
        /* @__PURE__ */ jsx("dt", { className: "shrink-0 text-[11px] font-medium text-foreground/45", children: r.key }),
        /* @__PURE__ */ jsxs("dd", { className: cn(
          "flex min-w-0 items-center gap-1.5 text-[12px] text-foreground",
          r.mono && "font-mono text-[11px]",
          layout === "row" && "justify-end text-right"
        ), children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: r.value }),
          r.copyable && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => copy(r.copyable, i),
              className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-foreground/30 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
              "aria-label": "Kopiuj",
              children: copied === i ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" })
            }
          )
        ] })
      ]
    },
    i
  )) });
}
var WEIGHT = {
  1: "text-[10px] opacity-45",
  2: "text-[11px] opacity-60",
  3: "text-xs opacity-75",
  4: "text-sm font-medium opacity-90",
  5: "text-base font-bold opacity-100"
};
function GlassTagCloud({ tags, className }) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-wrap items-baseline gap-x-3 gap-y-2", className), children: tags.map((t, i) => /* @__PURE__ */ jsx(
    "button",
    {
      onClick: t.onClick,
      className: cn(
        "rounded-lg px-1.5 py-0.5 text-primary transition-all hover:bg-primary/10",
        WEIGHT[t.weight ?? 3],
        isGlass && (t.weight ?? 3) >= 4 && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.35)]"
      ),
      children: t.label
    },
    i
  )) });
}
function GlassTreeView({
  nodes,
  defaultExpanded = [],
  selectedId,
  onSelect,
  showGuides = true,
  className
}) {
  const [expanded, setExpanded] = React33__default.useState(new Set(defaultExpanded));
  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("flex flex-col", className), role: "tree", children: nodes.map((n) => /* @__PURE__ */ jsx(
    TreeBranch,
    {
      node: n,
      depth: 0,
      expanded,
      toggle,
      selectedId,
      onSelect,
      showGuides
    },
    n.id
  )) });
}
function TreeBranch({
  node,
  depth,
  expanded,
  toggle,
  selectedId,
  onSelect,
  showGuides
}) {
  const { isGlass } = useGlass();
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const Icon2 = node.icon ?? (hasChildren ? isOpen ? FolderOpen : Folder : File);
  return /* @__PURE__ */ jsxs("div", { role: "treeitem", "aria-expanded": hasChildren ? isOpen : void 0, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: () => {
          if (node.disabled) return;
          if (hasChildren) toggle(node.id);
          onSelect?.(node);
        },
        className: cn(
          "group flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 transition-colors",
          !node.disabled && "hover:bg-foreground/[0.05]",
          node.disabled && "pointer-events-none opacity-35",
          isSelected && (isGlass ? "bg-primary/[0.14] text-primary" : "bg-primary/10 text-primary")
        ),
        style: { paddingLeft: 6 + depth * 16 },
        children: [
          hasChildren ? /* @__PURE__ */ jsx(
            ChevronRight,
            {
              className: cn("h-3 w-3 shrink-0 text-foreground/35 transition-transform", isOpen && "rotate-90")
            }
          ) : /* @__PURE__ */ jsx("span", { className: "w-3 shrink-0" }),
          /* @__PURE__ */ jsx(Icon2, { className: cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-foreground/45") }),
          /* @__PURE__ */ jsx("span", { className: cn("min-w-0 flex-1 truncate text-[12px]", isSelected ? "font-medium" : "text-foreground/75"), children: node.label }),
          node.badge && /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[10px] text-foreground/35", children: node.badge })
        ]
      }
    ),
    hasChildren && isOpen && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      showGuides && /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: "absolute bottom-1 top-0 w-px bg-foreground/[0.08]",
          style: { left: 12 + depth * 16 }
        }
      ),
      node.children.map((c) => /* @__PURE__ */ jsx(
        TreeBranch,
        {
          node: c,
          depth: depth + 1,
          expanded,
          toggle,
          selectedId,
          onSelect,
          showGuides
        },
        c.id
      ))
    ] })
  ] });
}
var PRIORITY = {
  low: { label: "Niski", cls: "bg-foreground/[0.08] text-foreground/50" },
  medium: { label: "\u015Aredni", cls: "bg-amber-500/15 text-amber-400" },
  high: { label: "Wysoki", cls: "bg-red-500/15 text-red-400" }
};
function GlassKanbanCard({
  card,
  dragging,
  onDragStart,
  onDragEnd,
  className
}) {
  const { isGlass } = useGlass();
  const p = card.priority ? PRIORITY[card.priority] : null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      draggable: true,
      onDragStart,
      onDragEnd,
      className: cn(
        "cursor-grab rounded-xl p-2.5 transition-all active:cursor-grabbing",
        isGlass ? "nb-szklo" : "border border-border bg-card",
        dragging ? "opacity-40" : "hover:-translate-y-0.5 hover:shadow-md",
        className
      ),
      children: [
        card.labels && card.labels.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-1.5 flex flex-wrap gap-1", children: card.labels.map((l, i) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
            style: { background: `color-mix(in srgb, ${l.color} 18%, transparent)`, color: l.color },
            children: l.text
          },
          i
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-[12px] font-medium leading-snug text-foreground", children: card.title }),
        card.description && /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-foreground/45", children: card.description }),
        (p || card.comments || card.attachments || card.assignee) && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
          p && /* @__PURE__ */ jsx("span", { className: cn("rounded px-1.5 py-0.5 text-[9px] font-bold", p.cls), children: p.label }),
          !!card.comments && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-foreground/35", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-2.5 w-2.5" }),
            card.comments
          ] }),
          !!card.attachments && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-foreground/35", children: [
            /* @__PURE__ */ jsx(Paperclip, { className: "h-2.5 w-2.5" }),
            card.attachments
          ] }),
          card.assignee && /* @__PURE__ */ jsx("span", { className: cn(
            "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold",
            isGlass ? "bg-primary/20 text-primary" : "bg-primary/15 text-primary"
          ), children: card.assignee })
        ] })
      ]
    }
  );
}
function GlassKanbanColumn({
  column,
  children,
  onAdd,
  isDropTarget,
  ...dropProps
}) {
  const { isGlass } = useGlass();
  const over = column.limit !== void 0 && column.cards.length > column.limit;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ...dropProps,
      className: cn(
        "flex w-64 shrink-0 flex-col gap-2 rounded-2xl p-2.5 transition-colors",
        isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-card/60",
        isDropTarget && "ring-2 ring-primary/40"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-1", children: [
          column.accent && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 shrink-0 rounded-full", style: { background: column.accent } }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-wide text-foreground/70", children: column.title }),
          /* @__PURE__ */ jsxs("span", { className: cn(
            "rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold tabular-nums",
            over ? "bg-red-500/15 text-red-400" : "bg-foreground/[0.07] text-foreground/40"
          ), children: [
            column.cards.length,
            column.limit !== void 0 && `/${column.limit}`
          ] }),
          /* @__PURE__ */ jsx("button", { className: "ml-auto flex h-5 w-5 items-center justify-center rounded-md text-foreground/30 hover:bg-foreground/[0.07] hover:text-foreground", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-3 w-3" }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex min-h-[60px] flex-col gap-2", children }),
        onAdd && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onAdd,
            className: "flex items-center justify-center gap-1 rounded-xl border border-dashed border-foreground/12 py-1.5 text-[11px] font-medium text-foreground/35 transition-colors hover:border-primary/40 hover:text-primary",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
              " Dodaj kart\u0119"
            ]
          }
        )
      ]
    }
  );
}
function GlassKanbanBoard({
  columns,
  onChange,
  onAddCard,
  className
}) {
  const [drag, setDrag] = React33__default.useState(null);
  const [overCol, setOverCol] = React33__default.useState(null);
  function drop(toCol) {
    if (!drag || drag.fromCol === toCol) {
      setDrag(null);
      setOverCol(null);
      return;
    }
    const card = columns.find((c) => c.id === drag.fromCol)?.cards.find((c) => c.id === drag.cardId);
    if (!card) {
      setDrag(null);
      setOverCol(null);
      return;
    }
    onChange?.(columns.map((col) => {
      if (col.id === drag.fromCol) return { ...col, cards: col.cards.filter((c) => c.id !== drag.cardId) };
      if (col.id === toCol) return { ...col, cards: [...col.cards, card] };
      return col;
    }));
    setDrag(null);
    setOverCol(null);
  }
  return /* @__PURE__ */ jsx("div", { className: cn("flex gap-3 overflow-x-auto pb-2", className), children: columns.map((col) => /* @__PURE__ */ jsx(
    GlassKanbanColumn,
    {
      column: col,
      isDropTarget: overCol === col.id && drag?.fromCol !== col.id,
      onAdd: onAddCard ? () => onAddCard(col.id) : void 0,
      onDragOver: (e) => {
        e.preventDefault();
        setOverCol(col.id);
      },
      onDragLeave: () => setOverCol((c) => c === col.id ? null : c),
      onDrop: (e) => {
        e.preventDefault();
        drop(col.id);
      },
      children: col.cards.map((card) => /* @__PURE__ */ jsx(
        GlassKanbanCard,
        {
          card,
          dragging: drag?.cardId === card.id,
          onDragStart: () => setDrag({ cardId: card.id, fromCol: col.id }),
          onDragEnd: () => {
            setDrag(null);
            setOverCol(null);
          }
        },
        card.id
      ))
    },
    col.id
  )) });
}
function GlassCodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  highlight = [],
  maxLines,
  className
}) {
  const { isGlass } = useGlass();
  const [copied, setCopied] = React33__default.useState(false);
  const [expanded, setExpanded] = React33__default.useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const clipped = maxLines !== void 0 && lines.length > maxLines && !expanded;
  const shown = clipped ? lines.slice(0, maxLines) : lines;
  function copy() {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: [
    (filename || language) && /* @__PURE__ */ jsxs("div", { className: cn(
      "flex items-center gap-2 px-3.5 py-2",
      isGlass ? "border-b border-foreground/[0.08]" : "border-b border-border"
    ), children: [
      /* @__PURE__ */ jsx(Terminal, { className: "h-3 w-3 shrink-0 text-primary" }),
      filename && /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] text-foreground/70", children: filename }),
      language && /* @__PURE__ */ jsx("span", { className: "rounded bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-foreground/40", children: language }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: copy,
          className: "ml-auto flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-medium text-foreground/40 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
          children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-emerald-400" }),
            "Skopiowano"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
            "Kopiuj"
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-x-auto", children: [
      /* @__PURE__ */ jsx("pre", { className: "py-2.5 font-mono text-[11.5px] leading-relaxed", children: shown.map((line, i) => {
        const n = i + 1;
        const hl = highlight.includes(n);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn("flex px-3.5", hl && (isGlass ? "bg-primary/[0.10]" : "bg-primary/[0.07]")),
            children: [
              showLineNumbers && /* @__PURE__ */ jsx("span", { className: cn(
                "mr-3.5 w-6 shrink-0 select-none text-right tabular-nums",
                hl ? "text-primary" : "text-foreground/20"
              ), children: n }),
              /* @__PURE__ */ jsx("code", { className: cn("whitespace-pre", hl ? "text-foreground" : "text-foreground/75"), children: line || " " })
            ]
          },
          i
        );
      }) }),
      clipped && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" })
    ] }),
    maxLines !== void 0 && lines.length > maxLines && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setExpanded((v) => !v),
        className: cn(
          "flex w-full items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-foreground/45 transition-colors hover:text-primary",
          isGlass ? "border-t border-foreground/[0.08]" : "border-t border-border"
        ),
        children: [
          /* @__PURE__ */ jsx(ChevronRight, { className: cn("h-3 w-3 transition-transform", expanded ? "-rotate-90" : "rotate-90") }),
          expanded ? "Zwi\u0144" : `Poka\u017C wszystkie ${lines.length} linii`
        ]
      }
    )
  ] });
}
function GlassInlineCode({ children, className }) {
  return /* @__PURE__ */ jsx("code", { className: cn(
    "rounded-md border border-foreground/[0.08] bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-primary",
    className
  ), children });
}
var JSON_COLOR = {
  key: "text-primary",
  string: "text-emerald-400",
  number: "text-amber-400",
  boolean: "text-purple-400",
  null: "text-foreground/35"
};
function JsonNode({ name, value, depth, last }) {
  const [open, setOpen] = React33__default.useState(depth < 2);
  const pad = { paddingLeft: depth * 14 };
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  if (!isObj) {
    const type = value === null ? "null" : typeof value;
    const text = value === null ? "null" : typeof value === "string" ? `"${value}"` : String(value);
    return /* @__PURE__ */ jsxs("div", { style: pad, className: "flex gap-1.5 whitespace-nowrap", children: [
      name !== void 0 && /* @__PURE__ */ jsxs("span", { className: JSON_COLOR.key, children: [
        '"',
        name,
        '":'
      ] }),
      /* @__PURE__ */ jsx("span", { className: JSON_COLOR[type] ?? "text-foreground", children: text }),
      !last && /* @__PURE__ */ jsx("span", { className: "text-foreground/25", children: "," })
    ] });
  }
  const entries = isArr ? value.map((v, i) => [String(i), v]) : Object.entries(value);
  const [openB, closeB] = isArr ? ["[", "]"] : ["{", "}"];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: pad, className: "flex cursor-pointer items-center gap-1 whitespace-nowrap", onClick: () => setOpen((v) => !v), children: [
      /* @__PURE__ */ jsx(ChevronRight, { className: cn("h-2.5 w-2.5 shrink-0 text-foreground/30 transition-transform", open && "rotate-90") }),
      name !== void 0 && /* @__PURE__ */ jsxs("span", { className: JSON_COLOR.key, children: [
        '"',
        name,
        '":'
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-foreground/45", children: openB }),
      !open && /* @__PURE__ */ jsxs("span", { className: "text-foreground/25", children: [
        "\u2026 ",
        entries.length,
        " ",
        closeB
      ] })
    ] }),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      entries.map(([k, v], i) => /* @__PURE__ */ jsx(JsonNode, { name: isArr ? void 0 : k, value: v, depth: depth + 1, last: i === entries.length - 1 }, k)),
      /* @__PURE__ */ jsxs("div", { style: pad, className: "flex gap-1 whitespace-nowrap pl-[14px]", children: [
        /* @__PURE__ */ jsx("span", { className: "text-foreground/45", children: closeB }),
        !last && /* @__PURE__ */ jsx("span", { className: "text-foreground/25", children: "," })
      ] })
    ] })
  ] });
}
function GlassJsonViewer({ data, className }) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsx("div", { className: cn(
    "overflow-x-auto rounded-2xl p-3.5 font-mono text-[11.5px] leading-relaxed",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: /* @__PURE__ */ jsx(JsonNode, { value: data, depth: 0, last: true }) });
}
var LEVEL = {
  info: { cls: "text-sky-400", tag: "INFO" },
  warn: { cls: "text-amber-400", tag: "WARN" },
  error: { cls: "text-red-400", tag: "ERROR" },
  debug: { cls: "text-foreground/40", tag: "DEBUG" },
  success: { cls: "text-emerald-400", tag: "OK" }
};
function GlassLogView({
  lines,
  maxHeight = 260,
  /** Filtr poziomów — puste pokazuje wszystko. */
  levels,
  className
}) {
  const { isGlass } = useGlass();
  const shown = levels?.length ? lines.filter((l) => levels.includes(l.level)) : lines;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "overflow-auto rounded-2xl p-3 font-mono text-[11px] leading-relaxed",
        isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
        className
      ),
      style: { maxHeight },
      children: shown.length === 0 ? /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-foreground/30", children: "Brak wpis\xF3w" }) : shown.map((l, i) => {
        const lv = LEVEL[l.level];
        return /* @__PURE__ */ jsxs("div", { className: "flex gap-2 whitespace-nowrap py-0.5 hover:bg-foreground/[0.03]", children: [
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-foreground/25 tabular-nums", children: l.time }),
          /* @__PURE__ */ jsx("span", { className: cn("w-11 shrink-0 font-bold", lv.cls), children: lv.tag }),
          l.source && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-foreground/35", children: [
            "[",
            l.source,
            "]"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-foreground/70", children: l.message })
        ] }, i);
      })
    }
  );
}
function Frame({ item, className }) {
  const Icon2 = item.icon;
  if (item.render) return /* @__PURE__ */ jsx("div", { className: cn("h-full w-full", className), children: item.render });
  return /* @__PURE__ */ jsx("div", { className: cn(
    "flex h-full w-full items-center justify-center bg-gradient-to-br",
    item.gradient ?? "from-primary/30 via-sky-600/20 to-blue-600/15",
    className
  ), children: Icon2 && /* @__PURE__ */ jsx(Icon2, { className: "h-7 w-7 text-white/60" }) });
}
function GlassGallery({
  items,
  cols = 3,
  masonry = false,
  onOpen,
  className
}) {
  const colCls = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-3";
  const colMasonry = cols === 2 ? "sm:columns-2" : cols === 4 ? "columns-2 sm:columns-4" : "sm:columns-3";
  const tile = (it, i) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => onOpen?.(i),
      className: cn(
        "group relative block w-full overflow-hidden rounded-xl",
        !masonry && "aspect-square",
        masonry && "mb-2 break-inside-avoid"
      ),
      style: masonry ? { height: 110 + i % 3 * 55 } : void 0,
      children: [
        /* @__PURE__ */ jsx(Frame, { item: it }),
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ jsx(ZoomIn, { className: "h-5 w-5 text-white" }) }),
        it.title && /* @__PURE__ */ jsx("span", { className: "absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] font-medium text-white", children: it.title })
      ]
    },
    it.id
  );
  return masonry ? /* @__PURE__ */ jsx("div", { className: cn("columns-1 gap-2", colMasonry, className), children: items.map(tile) }) : /* @__PURE__ */ jsx("div", { className: cn("grid grid-cols-2 gap-2", colCls, className), children: items.map(tile) });
}
function GlassLightbox({
  items,
  index,
  onClose,
  onIndexChange
}) {
  const open = index !== null;
  React33__default.useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onClose, onIndexChange]);
  if (!open) return null;
  const it = items[index];
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[210] flex items-center justify-center p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background/85 backdrop-blur-md animate-in fade-in-0 duration-150", onClick: onClose }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground",
        "aria-label": "Zamknij",
        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
      }
    ),
    items.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onIndexChange((index - 1 + items.length) % items.length),
          className: "absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground",
          "aria-label": "Poprzedni",
          children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onIndexChange((index + 1) % items.length),
          className: "absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground",
          "aria-label": "Nast\u0119pny",
          children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("figure", { className: "relative z-[1] flex max-h-full w-full max-w-3xl flex-col gap-3 animate-in fade-in-0 zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsx("div", { className: "aspect-video w-full overflow-hidden rounded-2xl", children: /* @__PURE__ */ jsx(Frame, { item: it }) }),
      /* @__PURE__ */ jsxs("figcaption", { className: "text-center", children: [
        it.title && /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: it.title }),
        it.caption && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-foreground/50", children: it.caption }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1.5 font-mono text-[10px] text-foreground/30 tabular-nums", children: [
          index + 1,
          " / ",
          items.length
        ] })
      ] })
    ] })
  ] });
}
function GlassCarousel({
  items,
  autoPlay = false,
  interval = 4e3,
  className
}) {
  const { isGlass } = useGlass();
  const [i, setI] = React33__default.useState(0);
  const [paused, setPaused] = React33__default.useState(false);
  React33__default.useEffect(() => {
    if (!autoPlay || paused || items.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), interval);
    return () => clearInterval(t);
  }, [autoPlay, paused, interval, items.length]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn("flex flex-col gap-2", className),
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      children: [
        /* @__PURE__ */ jsxs("div", { className: cn(
          "relative aspect-[16/7] w-full overflow-hidden rounded-2xl",
          isGlass ? "nb-szklo" : "border border-border"
        ), children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex h-full w-full transition-transform duration-500 ease-out",
              style: { transform: `translateX(-${i * 100}%)` },
              children: items.map((it) => /* @__PURE__ */ jsxs("div", { className: "relative h-full w-full shrink-0", children: [
                /* @__PURE__ */ jsx(Frame, { item: it }),
                (it.title || it.caption) && /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10", children: [
                  it.title && /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white", children: it.title }),
                  it.caption && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[11px] text-white/70", children: it.caption })
                ] })
              ] }, it.id))
            }
          ),
          items.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setI((v) => (v - 1 + items.length) % items.length),
                className: "absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white",
                "aria-label": "Poprzedni slajd",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setI((v) => (v + 1) % items.length),
                className: "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white",
                "aria-label": "Nast\u0119pny slajd",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-1.5", children: items.map((_, idx) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setI(idx),
            "aria-label": `Slajd ${idx + 1}`,
            className: cn(
              "rounded-full transition-all duration-300",
              idx === i ? cn("h-1.5 w-5 bg-primary", isGlass && "shadow-[0_0_8px_hsl(var(--primary)/0.5)]") : "h-1.5 w-1.5 bg-foreground/20 hover:bg-foreground/40"
            )
          },
          idx
        )) })
      ]
    }
  );
}
function GlassImageCompare({
  before,
  after,
  labelBefore = "Przed",
  labelAfter = "Po",
  className
}) {
  const [pct, setPct] = React33__default.useState(50);
  const ref = React33__default.useRef(null);
  const dragging = React33__default.useRef(false);
  const move = React33__default.useCallback((clientX) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPct(Math.min(100, Math.max(0, (clientX - r.left) / r.width * 100)));
  }, []);
  React33__default.useEffect(() => {
    function onMove(e) {
      if (dragging.current) move(e.clientX);
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [move]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      onPointerDown: (e) => {
        dragging.current = true;
        move(e.clientX);
      },
      className: cn("relative aspect-video w-full cursor-ew-resize select-none overflow-hidden rounded-2xl", className),
      children: [
        /* @__PURE__ */ jsx(Frame, { item: after }),
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm", children: labelAfter }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 overflow-hidden", style: { clipPath: `inset(0 ${100 - pct}% 0 0)` }, children: [
          /* @__PURE__ */ jsx(Frame, { item: before }),
          /* @__PURE__ */ jsx("span", { className: "absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm", children: labelBefore })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.5)]", style: { left: `${pct}%` }, children: /* @__PURE__ */ jsxs("span", { className: "absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg", children: [
          /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3 w-3 text-black" }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3 text-black" })
        ] }) })
      ]
    }
  );
}
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function Scrubber({
  value,
  max,
  onChange,
  glow
}) {
  const ref = React33__default.useRef(null);
  const dragging = React33__default.useRef(false);
  const pct = max > 0 ? value / max * 100 : 0;
  const seek = React33__default.useCallback((clientX) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    onChange(Math.min(max, Math.max(0, (clientX - r.left) / r.width * max)));
  }, [max, onChange]);
  React33__default.useEffect(() => {
    function onMove(e) {
      if (dragging.current) seek(e.clientX);
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [seek]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      onPointerDown: (e) => {
        dragging.current = true;
        seek(e.clientX);
      },
      className: "group/scrub relative h-4 cursor-pointer touch-none py-1.5",
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-1 w-full overflow-hidden rounded-full bg-foreground/15", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full rounded-full bg-primary transition-[width] duration-100",
            style: { width: `${pct}%`, boxShadow: glow ? "0 0 8px hsl(var(--primary)/0.6)" : void 0 }
          }
        ) }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition-opacity group-hover/scrub:opacity-100",
            style: { left: `${pct}%` }
          }
        )
      ]
    }
  );
}
function GlassVideoPlayer({
  title,
  duration = 754,
  poster,
  className
}) {
  const { isGlass } = useGlass();
  const [playing, setPlaying] = React33__default.useState(false);
  const [t, setT] = React33__default.useState(0);
  const [muted, setMuted] = React33__default.useState(false);
  React33__default.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => v >= duration ? (setPlaying(false), duration) : v + 1), 1e3);
    return () => clearInterval(id);
  }, [playing, duration]);
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "group relative aspect-video w-full overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: poster ?? /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-gradient-to-br from-primary/25 via-sky-700/20 to-blue-800/20" }) }),
    !playing && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setPlaying(true),
        className: "absolute inset-0 flex items-center justify-center",
        "aria-label": "Odtw\xF3rz",
        children: /* @__PURE__ */ jsx("span", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/25 backdrop-blur-sm transition-transform hover:scale-105", children: /* @__PURE__ */ jsx(Play, { className: "ml-0.5 h-5 w-5 fill-white text-white" }) })
      }
    ),
    title && /* @__PURE__ */ jsx("p", { className: "absolute inset-x-0 top-0 truncate bg-gradient-to-b from-black/60 to-transparent px-4 pb-6 pt-3 text-xs font-semibold text-white", children: title }),
    /* @__PURE__ */ jsxs("div", { className: cn(
      "absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity",
      playing && "opacity-0 group-hover:opacity-100"
    ), children: [
      /* @__PURE__ */ jsx(Scrubber, { value: t, max: duration, onChange: setT, glow: isGlass }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-white", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setPlaying((v) => !v), "aria-label": playing ? "Pauza" : "Odtw\xF3rz", children: playing ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4 fill-white" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 fill-white" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => setT((v) => Math.max(0, v - 10)), "aria-label": "Cofnij 10 s", children: /* @__PURE__ */ jsx(SkipBack, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => setT((v) => Math.min(duration, v + 10)), "aria-label": "Do przodu 10 s", children: /* @__PURE__ */ jsx(SkipForward, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx("button", { onClick: () => setMuted((v) => !v), "aria-label": muted ? "W\u0142\u0105cz d\u017Awi\u0119k" : "Wycisz", children: muted ? /* @__PURE__ */ jsx(VolumeX, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxs("span", { className: "ml-1 font-mono text-[10px] tabular-nums text-white/80", children: [
          fmtTime(t),
          " / ",
          fmtTime(duration)
        ] }),
        /* @__PURE__ */ jsx("button", { className: "ml-auto", "aria-label": "Ustawienia", children: /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx("button", { "aria-label": "Pe\u0142ny ekran", children: /* @__PURE__ */ jsx(Maximize2, { className: "h-3.5 w-3.5" }) })
      ] })
    ] })
  ] });
}
function bars(seed, n) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  return Array.from({ length: n }, (_, i) => {
    h = h * 1103515245 + 12345 >>> 0;
    return 0.25 + (h >>> 16) % 100 / 100 * 0.75 * (0.6 + 0.4 * Math.sin(i / 4));
  });
}
function GlassAudioPlayer({
  title,
  artist,
  duration = 214,
  showWaveform = true,
  className
}) {
  const { isGlass } = useGlass();
  const [playing, setPlaying] = React33__default.useState(false);
  const [t, setT] = React33__default.useState(0);
  const wave = React33__default.useMemo(() => bars(title, 48), [title]);
  React33__default.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => v >= duration ? (setPlaying(false), duration) : v + 1), 1e3);
    return () => clearInterval(id);
  }, [playing, duration]);
  const progress = duration > 0 ? t / duration : 0;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex items-center gap-3 rounded-2xl p-3",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setPlaying((v) => !v),
        "aria-label": playing ? "Pauza" : "Odtw\xF3rz",
        className: cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
          isGlass ? "bg-primary/25 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]" : "bg-primary text-primary-foreground"
        ),
        children: playing ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4 fill-current" }) : /* @__PURE__ */ jsx(Play, { className: "ml-0.5 h-4 w-4 fill-current" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsx(Music, { className: "h-3 w-3 shrink-0 text-primary/70" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-[12px] font-semibold text-foreground", children: title }),
        artist && /* @__PURE__ */ jsx("p", { className: "truncate text-[10px] text-foreground/45", children: artist }),
        /* @__PURE__ */ jsxs("span", { className: "ml-auto shrink-0 font-mono text-[10px] tabular-nums text-foreground/40", children: [
          fmtTime(t),
          " / ",
          fmtTime(duration)
        ] })
      ] }),
      showWaveform ? /* @__PURE__ */ jsx(
        "div",
        {
          className: "mt-1.5 flex h-7 cursor-pointer items-center gap-[2px]",
          onClick: (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setT((e.clientX - r.left) / r.width * duration);
          },
          children: wave.map((h, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: cn(
                "flex-1 rounded-full transition-colors",
                i / wave.length <= progress ? "bg-primary" : "bg-foreground/15"
              ),
              style: {
                height: `${h * 100}%`,
                boxShadow: isGlass && i / wave.length <= progress ? "0 0 4px hsl(var(--primary)/0.5)" : void 0
              }
            },
            i
          ))
        }
      ) : /* @__PURE__ */ jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsx(Scrubber, { value: t, max: duration, onChange: setT, glow: isGlass }) })
    ] })
  ] });
}
function GlassAuthCard({
  title,
  subtitle,
  logo,
  footer,
  className,
  children
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "w-full max-w-sm rounded-2xl p-6",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card shadow-xl",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 flex flex-col items-center text-center", children: [
      logo && /* @__PURE__ */ jsx("div", { className: "mb-3", children: logo }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-foreground", children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-foreground/50", children: subtitle })
    ] }),
    children,
    footer && /* @__PURE__ */ jsx("div", { className: "mt-5 text-center text-xs text-foreground/50", children: footer })
  ] });
}
function GlassPasswordField({
  value,
  onChange,
  placeholder = "Has\u0142o",
  showStrength = false,
  error,
  className
}) {
  const { isGlass } = useGlass();
  const [visible, setVisible] = React33__default.useState(false);
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
    /* @__PURE__ */ jsxs("div", { className: cn(
      "flex h-10 items-center gap-2 rounded-xl px-3 transition-all",
      isGlass ? "nb-szklo" : "border border-border bg-input",
      error ? "ring-2 ring-destructive/40" : "focus-within:ring-2 focus-within:ring-primary/30"
    ), children: [
      /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 shrink-0 text-foreground/40" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: visible ? "text" : "password",
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder,
          className: "min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setVisible((v) => !v),
          "aria-label": visible ? "Ukryj has\u0142o" : "Poka\u017C has\u0142o",
          className: "shrink-0 text-foreground/35 transition-colors hover:text-foreground",
          children: visible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-[11px] text-destructive", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 shrink-0" }),
      error
    ] }),
    showStrength && value && /* @__PURE__ */ jsx(GlassPasswordStrength, { password: value })
  ] });
}
function scorePassword(pw) {
  const checks = [
    { label: "Min. 8 znak\xF3w", ok: pw.length >= 8 },
    { label: "Wielka litera", ok: /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(pw) },
    { label: "Ma\u0142a litera", ok: /[a-ząćęłńóśźż]/.test(pw) },
    { label: "Cyfra", ok: /\d/.test(pw) },
    { label: "Znak specjalny", ok: /[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(pw) }
  ];
  const passed = checks.filter((c) => c.ok).length;
  const score = Math.max(0, passed - 1);
  const label = ["Bardzo s\u0142abe", "S\u0142abe", "\u015Arednie", "Dobre", "Bardzo mocne"][score];
  return { score, label, checks };
}
var STRENGTH_COLOR = [
  "hsl(0 72% 58%)",
  "hsl(14 85% 58%)",
  "hsl(38 92% 50%)",
  "hsl(80 60% 45%)",
  "hsl(160 60% 45%)"
];
function GlassPasswordStrength({
  password,
  showChecks = true,
  className
}) {
  const { score, label, checks } = React33__default.useMemo(() => scorePassword(password), [password]);
  const color = STRENGTH_COLOR[score];
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "h-1 flex-1 rounded-full transition-colors duration-300",
        style: { background: i <= score ? color : "hsl(var(--foreground)/0.12)" }
      },
      i
    )) }),
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold", style: { color }, children: label }),
    showChecks && /* @__PURE__ */ jsx("div", { className: "mt-0.5 grid grid-cols-2 gap-x-3 gap-y-0.5", children: checks.map((c) => /* @__PURE__ */ jsxs(
      "span",
      {
        className: cn("flex items-center gap-1 text-[10px]", c.ok ? "text-emerald-400" : "text-foreground/30"),
        children: [
          /* @__PURE__ */ jsx(Check, { className: cn("h-2.5 w-2.5 shrink-0", !c.ok && "opacity-30") }),
          c.label
        ]
      },
      c.label
    )) })
  ] });
}
var PROVIDERS = {
  google: { label: "Google", icon: Globe },
  github: { label: "GitHub", icon: Code2 },
  apple: { label: "Apple", icon: Apple }
};
function GlassSocialButtons({
  providers = ["google", "github", "apple"],
  /** 'row' — same ikony obok siebie; 'stack' — pełne przyciski z tekstem. */
  layout = "stack",
  onSelect,
  className
}) {
  const { isGlass } = useGlass();
  const base = isGlass ? "nb-szklo hover:bg-foreground/[0.06]" : "border border-border bg-card hover:bg-foreground/[0.04]";
  return /* @__PURE__ */ jsx("div", { className: cn(layout === "row" ? "flex gap-2" : "flex flex-col gap-2", className), children: providers.map((p) => {
    const { label, icon: Icon2 } = PROVIDERS[p];
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelect?.(p),
        className: cn(
          "flex items-center justify-center gap-2 rounded-xl text-[12px] font-medium text-foreground/80 transition-colors",
          base,
          layout === "row" ? "h-10 flex-1" : "h-10 w-full"
        ),
        children: [
          /* @__PURE__ */ jsx(Icon2, { className: "h-4 w-4" }),
          layout === "stack" && /* @__PURE__ */ jsxs("span", { children: [
            "Kontynuuj z ",
            label
          ] })
        ]
      },
      p
    );
  }) });
}
function GlassLoginForm({
  onSubmit,
  error,
  loading,
  className
}) {
  const { isGlass } = useGlass();
  const [email, setEmail] = React33__default.useState("");
  const [password, setPassword] = React33__default.useState("");
  const [remember, setRemember] = React33__default.useState(true);
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: cn("flex flex-col gap-3", className),
      onSubmit: (e) => {
        e.preventDefault();
        onSubmit?.({ email, password, remember });
      },
      children: [
        error && /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "h-3.5 w-3.5 shrink-0" }),
          error
        ] }),
        /* @__PURE__ */ jsxs("div", { className: cn(
          "flex h-10 items-center gap-2 rounded-xl px-3 transition-all focus-within:ring-2 focus-within:ring-primary/30",
          isGlass ? "nb-szklo" : "border border-border bg-input"
        ), children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5 shrink-0 text-foreground/40" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "Adres e-mail",
              autoComplete: "email",
              className: "min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/35"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(GlassPasswordField, { value: password, onChange: setPassword }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
          /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-1.5 text-foreground/60", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: remember,
                onChange: (e) => setRemember(e.target.checked),
                className: "h-3.5 w-3.5 accent-primary"
              }
            ),
            "Zapami\u0119taj mnie"
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "font-medium text-primary hover:underline", children: "Nie pami\u0119tam has\u0142a" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: cn(
              "mt-1 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50",
              isGlass ? "bg-primary/25 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.28)] hover:bg-primary/35" : "bg-primary text-primary-foreground hover:brightness-110"
            ),
            children: loading ? "Logowanie\u2026" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Zaloguj si\u0119 ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
            ] })
          }
        )
      ]
    }
  );
}
function GlassFilterBar({
  query,
  onQueryChange,
  chips = [],
  onRemoveChip,
  onClearAll,
  placeholder = "Szukaj\u2026",
  actions,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-2", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: cn(
        "flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 transition-all focus-within:ring-2 focus-within:ring-primary/25",
        isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-input"
      ), children: [
        /* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5 shrink-0 text-foreground/40" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: query,
            onChange: (e) => onQueryChange(e.target.value),
            placeholder,
            className: "min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/35"
          }
        ),
        query && /* @__PURE__ */ jsx("button", { onClick: () => onQueryChange(""), className: "shrink-0 text-foreground/30 hover:text-foreground", "aria-label": "Wyczy\u015B\u0107", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-foreground/65 transition-colors hover:text-foreground",
        isGlass ? "nb-szklo" : "border border-border bg-card"
      ), children: [
        /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-3.5 w-3.5" }),
        " Filtry"
      ] }),
      actions
    ] }),
    chips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
      chips.map((c) => /* @__PURE__ */ jsxs(
        "span",
        {
          className: cn(
            "inline-flex items-center gap-1 rounded-full py-0.5 pl-2 pr-1 text-[10px] font-medium",
            isGlass ? "bg-primary/18 text-primary" : "bg-primary/12 text-primary"
          ),
          children: [
            /* @__PURE__ */ jsxs("span", { className: "opacity-60", children: [
              c.label,
              ":"
            ] }),
            c.value,
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onRemoveChip?.(c.id),
                className: "flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-primary/25",
                "aria-label": `Usu\u0144 filtr ${c.label}`,
                children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" })
              }
            )
          ]
        },
        c.id
      )),
      onClearAll && /* @__PURE__ */ jsx("button", { onClick: onClearAll, className: "ml-1 text-[10px] font-medium text-foreground/40 hover:text-foreground", children: "Wyczy\u015B\u0107 wszystko" })
    ] })
  ] });
}
function GlassBulkActionBar({
  count,
  onClear,
  actions,
  /** Przykleja pasek do dołu ekranu, gdy coś jest zaznaczone. */
  floating = false,
  className
}) {
  const { isGlass } = useGlass();
  if (count === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex items-center gap-3 rounded-2xl px-4 py-2.5",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card shadow-lg",
    floating && "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-3 duration-200",
    className
  ), children: [
    /* @__PURE__ */ jsx("span", { className: cn(
      "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
      isGlass ? "bg-primary/25 text-primary" : "bg-primary text-primary-foreground"
    ), children: count }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-foreground/65", children: "zaznaczono" }),
    /* @__PURE__ */ jsx("div", { className: "ml-2 flex items-center gap-1.5", children: actions ?? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("button", { className: "flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-foreground/65 transition-colors hover:bg-foreground/[0.07] hover:text-foreground", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
        " Eksportuj"
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10", children: [
        /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
        " Usu\u0144"
      ] })
    ] }) }),
    onClear && /* @__PURE__ */ jsx("button", { onClick: onClear, className: "ml-auto shrink-0 text-foreground/35 transition-colors hover:text-foreground", "aria-label": "Odznacz wszystko", children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) })
  ] });
}
function GlassSettingsSection({
  title,
  description,
  children,
  className
}) {
  const { isGlass } = useGlass();
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_1.4fr]",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-foreground", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] leading-relaxed text-foreground/50", children: description })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children })
  ] });
}
function GlassDangerZone({
  title = "Strefa niebezpieczna",
  items,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("overflow-hidden rounded-2xl border border-destructive/30", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-destructive/25 bg-destructive/[0.07] px-4 py-2.5", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 shrink-0 text-destructive" }),
      /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold uppercase tracking-wide text-destructive", children: title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-destructive/15", children: items.map((it) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[12px] font-semibold text-foreground", children: it.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10.5px] leading-relaxed text-foreground/50", children: it.description })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: it.onAction,
          className: "shrink-0 rounded-lg border border-destructive/40 px-3 py-1.5 text-[11px] font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground",
          children: it.action
        }
      )
    ] }, it.label)) })
  ] });
}
function GlassApiKey({
  label,
  value,
  createdAt,
  onRegenerate,
  className
}) {
  const { isGlass } = useGlass();
  const [visible, setVisible] = React33__default.useState(false);
  const [copied, setCopied] = React33__default.useState(false);
  const masked = React33__default.useMemo(() => {
    if (value.length <= 12) return "\u2022".repeat(value.length);
    const head = value.slice(0, 7);
    const tail = value.slice(-4);
    return `${head}${"\u2022".repeat(Math.max(8, value.length - 11))}${tail}`;
  }, [value]);
  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex flex-col gap-2 rounded-2xl p-3",
    isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[12px] font-semibold text-foreground", children: label }),
      createdAt && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-foreground/35", children: [
        "utworzony ",
        createdAt
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("code", { className: cn(
        "min-w-0 flex-1 truncate rounded-lg px-2.5 py-1.5 font-mono text-[11px]",
        isGlass ? "bg-foreground/[0.06] text-foreground/75" : "bg-muted/60 text-foreground/75"
      ), children: visible ? value : masked }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setVisible((v) => !v),
          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
          "aria-label": visible ? "Ukryj klucz" : "Poka\u017C klucz",
          children: visible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: copy,
          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-foreground",
          "aria-label": "Kopiuj klucz",
          children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 text-emerald-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" })
        }
      ),
      onRegenerate && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onRegenerate,
          className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/35 transition-colors hover:bg-foreground/[0.07] hover:text-amber-400",
          "aria-label": "Wygeneruj ponownie",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" })
        }
      )
    ] })
  ] });
}
function GlassUsageBar({
  label,
  used,
  total,
  unit = "",
  /** Próg, powyżej którego pasek zmienia kolor na ostrzegawczy. */
  warnAt = 80,
  className
}) {
  const { isGlass } = useGlass();
  const pct = total > 0 ? Math.min(100, used / total * 100) : 0;
  const over = pct >= 100;
  const warn = pct >= warnAt;
  const color = over ? "hsl(0 72% 58%)" : warn ? "hsl(38 92% 50%)" : "hsl(var(--primary))";
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-col gap-1.5", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-foreground/70", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] tabular-nums text-foreground/45", children: [
        used.toLocaleString("pl-PL"),
        " / ",
        total.toLocaleString("pl-PL"),
        " ",
        unit,
        /* @__PURE__ */ jsxs("span", { className: "ml-1.5 font-bold", style: { color }, children: [
          Math.round(pct),
          "%"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("h-1.5 w-full overflow-hidden rounded-full", isGlass ? "bg-foreground/10" : "bg-muted"), children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full rounded-full transition-all duration-500",
        style: { width: `${pct}%`, background: color, boxShadow: isGlass ? `0 0 8px ${color}` : void 0 }
      }
    ) })
  ] });
}
var INTENT_DOT = {
  info: "bg-sky-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400"
};
function GlassNotificationCenter({
  items,
  onMarkAllRead,
  onSelect,
  maxHeight = 340,
  className
}) {
  const { isGlass } = useGlass();
  const unread = items.filter((i) => !i.read).length;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "flex w-full max-w-sm flex-col overflow-hidden rounded-2xl",
    isGlass ? "nb-szklo nb-szklo-plynne nb-powierzchnia" : "border border-border bg-card shadow-xl",
    className
  ), children: [
    /* @__PURE__ */ jsxs("div", { className: cn(
      "flex items-center gap-2 px-3.5 py-2.5",
      isGlass ? "border-b border-foreground/[0.08]" : "border-b border-border"
    ), children: [
      /* @__PURE__ */ jsx(Bell, { className: "h-3.5 w-3.5 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: "Powiadomienia" }),
      unread > 0 && /* @__PURE__ */ jsxs("span", { className: "rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary tabular-nums", children: [
        unread,
        " nowe"
      ] }),
      onMarkAllRead && unread > 0 && /* @__PURE__ */ jsx("button", { onClick: onMarkAllRead, className: "ml-auto text-[10px] font-medium text-foreground/40 transition-colors hover:text-primary", children: "Oznacz jako przeczytane" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-y-auto", style: { maxHeight }, children: items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "px-4 py-10 text-center text-xs text-foreground/35", children: "Brak powiadomie\u0144" }) : items.map((n) => {
      const Icon2 = n.icon;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onSelect?.(n),
          className: cn(
            "flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-foreground/[0.04]",
            isGlass ? "border-b border-foreground/[0.05]" : "border-b border-border/50",
            !n.read && (isGlass ? "bg-primary/[0.05]" : "bg-primary/[0.03]")
          ),
          children: [
            /* @__PURE__ */ jsxs("span", { className: "relative mt-0.5 shrink-0", children: [
              Icon2 ? /* @__PURE__ */ jsx(Icon2, { className: "h-3.5 w-3.5 text-foreground/50" }) : /* @__PURE__ */ jsx("span", { className: cn("block h-2 w-2 rounded-full", INTENT_DOT[n.intent ?? "info"]) }),
              !n.read && Icon2 && /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-primary" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: cn("text-[12px] leading-tight", n.read ? "text-foreground/65" : "font-semibold text-foreground"), children: n.title }),
              n.description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[10.5px] leading-relaxed text-foreground/45", children: n.description }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[9.5px] text-foreground/30", children: n.time })
            ] })
          ]
        },
        n.id
      );
    }) })
  ] });
}
var GF_EXP = new Uint8Array(512);
var GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 285;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();
function gfMul(a, b) {
  return a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
}
function rsGenerator(deg) {
  let poly = [1];
  for (let i = 0; i < deg; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}
function rsEncode(data, ecLen) {
  const gen = rsGenerator(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1], factor);
  }
  return res;
}
var VERSION_L = {
  1: { data: 19, ec: 7 },
  2: { data: 34, ec: 10 },
  3: { data: 55, ec: 15 },
  4: { data: 80, ec: 20 },
  5: { data: 108, ec: 26 },
  6: { data: 136, ec: 18 }
};
var ALIGN_POS = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34]
};
function buildQR(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = 0;
  for (const v of [1, 2, 3, 4, 5, 6]) {
    if (bytes.length + 2 <= VERSION_L[v].data) {
      version = v;
      break;
    }
  }
  if (!version) return null;
  const { data: dataCap, ec: ecLen } = VERSION_L[version];
  const size = 17 + version * 4;
  const bits = [];
  const push = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push(val >> i & 1);
  };
  push(4, 4);
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, dataCap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((a, b) => a << 1 | b, 0));
  }
  const PAD = [236, 17];
  let p = 0;
  while (codewords.length < dataCap) codewords.push(PAD[p++ % 2]);
  const all = [...codewords, ...rsEncode(codewords, ecLen)];
  const m = Array.from({ length: size }, () => new Array(size).fill(null));
  const setFinder = (r, c) => {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const rr = r + i, cc = c + j;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const inRing = i >= 0 && i <= 6 && j >= 0 && j <= 6;
        const on = inRing && (i === 0 || i === 6 || j === 0 || j === 6 || i >= 2 && i <= 4 && j >= 2 && j <= 4);
        m[rr][cc] = on;
      }
    }
  };
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    const on = i % 2 === 0;
    if (m[6][i] === null) m[6][i] = on;
    if (m[i][6] === null) m[i][6] = on;
  }
  for (const ar of ALIGN_POS[version]) {
    for (const ac of ALIGN_POS[version]) {
      if (m[ar][ac] !== null) continue;
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          m[ar + i][ac + j] = Math.max(Math.abs(i), Math.abs(j)) !== 1;
        }
      }
    }
  }
  m[size - 8][8] = true;
  const reserved = /* @__PURE__ */ new Set();
  for (let i = 0; i < 9; i++) {
    reserved.add(`8,${i}`);
    reserved.add(`${i},8`);
  }
  for (let i = 0; i < 8; i++) {
    reserved.add(`8,${size - 1 - i}`);
    reserved.add(`${size - 1 - i},8`);
  }
  let bitIdx = 0;
  const dataBits = [];
  for (const cw of all) for (let i = 7; i >= 0; i--) dataBits.push(cw >> i & 1);
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let n = 0; n < size; n++) {
      const row = upward ? size - 1 - n : n;
      for (const c of [col, col - 1]) {
        if (m[row][c] !== null || reserved.has(`${row},${c}`)) continue;
        let bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
        if ((row + c) % 2 === 0) bit ^= 1;
        m[row][c] = bit === 1;
      }
    }
    upward = !upward;
  }
  const FORMAT_L0 = 30660;
  const fmtBit = (i) => (FORMAT_L0 >> i & 1) === 1;
  for (let i = 0; i <= 5; i++) m[8][i] = fmtBit(i);
  m[8][7] = fmtBit(6);
  m[8][8] = fmtBit(7);
  m[7][8] = fmtBit(8);
  for (let i = 9; i <= 14; i++) m[14 - i][8] = fmtBit(i);
  for (let i = 0; i <= 7; i++) m[size - 1 - i][8] = fmtBit(i);
  for (let i = 8; i <= 14; i++) m[8][size - 15 + i] = fmtBit(i);
  return m.map((row) => row.map((c) => c === true));
}
function GlassQrCode({
  value,
  size = 148,
  quiet = 2,
  label,
  className
}) {
  const { isGlass } = useGlass();
  const matrix = React33__default.useMemo(() => buildQR(value), [value]);
  if (!matrix) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn("flex items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 text-[11px] text-destructive", className),
        style: { width: size, height: size },
        children: "Tekst za d\u0142ugi"
      }
    );
  }
  const n = matrix.length;
  const total = n + quiet * 2;
  return /* @__PURE__ */ jsxs("div", { className: cn("inline-flex flex-col items-center gap-2", className), children: [
    /* @__PURE__ */ jsx("div", { className: cn("rounded-2xl p-2.5", isGlass ? "nb-szklo" : "border border-border bg-card"), children: /* @__PURE__ */ jsxs(
      "svg",
      {
        width: size,
        height: size,
        viewBox: `0 0 ${total} ${total}`,
        shapeRendering: "crispEdges",
        role: "img",
        "aria-label": label ?? `Kod QR: ${value}`,
        children: [
          /* @__PURE__ */ jsx("rect", { width: total, height: total, fill: "white", rx: 1 }),
          matrix.map(
            (row, r) => row.map((on, c) => on ? /* @__PURE__ */ jsx("rect", { x: c + quiet, y: r + quiet, width: 1, height: 1, fill: "black" }, `${r}-${c}`) : null)
          )
        ]
      }
    ) }),
    label && /* @__PURE__ */ jsx("p", { className: "max-w-[180px] truncate text-center text-[10px] text-foreground/45", children: label })
  ] });
}
function GlassCountdown({
  to,
  onDone,
  compact = false,
  className
}) {
  const { isGlass } = useGlass();
  const [left, setLeft] = React33__default.useState(() => Math.max(0, to.getTime() - Date.now()));
  React33__default.useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, to.getTime() - Date.now());
      setLeft(ms);
      if (ms === 0) {
        clearInterval(id);
        onDone?.();
      }
    }, 1e3);
    return () => clearInterval(id);
  }, [to, onDone]);
  const s = Math.floor(left / 1e3);
  const parts = [
    { v: Math.floor(s / 86400), label: "dni" },
    { v: Math.floor(s % 86400 / 3600), label: "godz" },
    { v: Math.floor(s % 3600 / 60), label: "min" },
    { v: s % 60, label: "sek" }
  ];
  if (compact) {
    return /* @__PURE__ */ jsx("span", { className: cn("font-mono text-sm font-bold tabular-nums text-primary", className), children: parts.map((p) => String(p.v).padStart(2, "0")).join(":") });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("flex gap-2", className), children: parts.map((p) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex min-w-[52px] flex-col items-center rounded-xl px-2 py-1.5",
        isGlass ? "nb-szklo" : "border border-border bg-card"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("font-mono text-lg font-bold tabular-nums text-foreground", isGlass && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.3)]"), children: String(p.v).padStart(2, "0") }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase tracking-wide text-foreground/40", children: p.label })
      ]
    },
    p.label
  )) });
}
var UNITS = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1]
];
function GlassRelativeTime({
  date,
  className
}) {
  const [, tick] = React33__default.useReducer((x) => x + 1, 0);
  React33__default.useEffect(() => {
    const id = setInterval(tick, 3e4);
    return () => clearInterval(id);
  }, []);
  const text = React33__default.useMemo(() => {
    const diff = (date.getTime() - Date.now()) / 1e3;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat("pl", { numeric: "auto" });
    for (const [unit, secs] of UNITS) {
      if (abs >= secs || unit === "second") {
        return rtf.format(Math.round(diff / secs), unit);
      }
    }
    return "";
  }, [date]);
  return /* @__PURE__ */ jsx("time", { dateTime: date.toISOString(), title: date.toLocaleString("pl-PL"), className, children: text });
}
function GlassBackToTop({
  /** Po ilu pikselach przewinięcia przycisk się pojawia. */
  threshold = 320,
  target,
  className
}) {
  const { isGlass } = useGlass();
  const [show, setShow] = React33__default.useState(false);
  React33__default.useEffect(() => {
    const el = target?.current;
    const read = () => setShow((el ? el.scrollTop : window.scrollY) > threshold);
    const node = el ?? window;
    node.addEventListener("scroll", read, { passive: true });
    read();
    return () => node.removeEventListener("scroll", read);
  }, [threshold, target]);
  if (!show) return null;
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => (target?.current ?? window).scrollTo({ top: 0, behavior: "smooth" }),
      "aria-label": "Wr\xF3\u0107 na g\xF3r\u0119",
      className: cn(
        "fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full transition-all animate-in fade-in-0 zoom-in-90",
        isGlass ? "nb-szklo nb-szklo-plynne text-primary shadow-[0_0_14px_hsl(var(--primary)/0.25)]" : "border border-border bg-card text-primary shadow-lg",
        "hover:-translate-y-0.5",
        className
      ),
      children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-4 w-4" })
    }
  );
}
function GlassToc({
  entries,
  title = "Na tej stronie",
  className
}) {
  const { isGlass } = useGlass();
  const [active, setActive] = React33__default.useState(entries[0]?.id ?? null);
  React33__default.useEffect(() => {
    const els = entries.map((e) => document.getElementById(e.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (ents) => {
        const visible = ents.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      // Górny pas ekranu decyduje o „bieżącej" sekcji.
      { rootMargin: "-10% 0px -75% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [entries]);
  return /* @__PURE__ */ jsxs("nav", { className: cn(
    "flex flex-col gap-1 rounded-2xl p-3",
    isGlass ? "nb-szklo nb-szklo-plynne" : "border border-border bg-card",
    className
  ), children: [
    /* @__PURE__ */ jsxs("p", { className: "mb-1 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35", children: [
      /* @__PURE__ */ jsx(List, { className: "h-3 w-3" }),
      title
    ] }),
    entries.map((e) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => document.getElementById(e.id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        className: cn(
          "truncate rounded-lg px-2 py-1 text-left text-[11.5px] transition-colors",
          e.level === 2 && "pl-5",
          active === e.id ? cn("font-semibold text-primary", isGlass ? "bg-primary/[0.12]" : "bg-primary/[0.08]") : "text-foreground/55 hover:bg-foreground/[0.05] hover:text-foreground"
        ),
        children: e.label
      },
      e.id
    ))
  ] });
}

// src/lib/chart-colors.ts
var CHART_1 = "hsl(var(--chart-1, var(--primary)))";
var CHART_2 = "hsl(var(--chart-2, var(--brand-primary-light)))";
var CHART_3 = "hsl(var(--chart-3, var(--brand-primary-dark)))";
var CHART_4 = "hsl(var(--chart-4, var(--destructive)))";
var CHART_NEUTRAL = "hsl(var(--muted-foreground))";
var TINT_1 = "hsl(var(--primary))";
var TINT_2 = "color-mix(in oklch, hsl(var(--primary)) 74%, black 26%)";
var TINT_3 = "color-mix(in oklch, hsl(var(--primary)) 50%, black 50%)";
var TINT_4 = "color-mix(in oklch, hsl(var(--primary)) 30%, black 70%)";
var TINT_5 = "color-mix(in oklch, hsl(var(--primary)) 16%, black 84%)";
function tintFaded(color, pct) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
function useLiquidGlassScroll(containerRef) {
  useEffect(() => {
    let animationFrameId = null;
    let lastScrollY = 0;
    let currentVelocity = 0;
    let targetVelocity = 0;
    let currentShift = 0;
    let targetShift = 0;
    const getScrollY = () => {
      if (containerRef && containerRef.current) {
        return containerRef.current.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };
    const SETTLE_EPSILON = 0.01;
    const updateRefraction = () => {
      const scrollY = getScrollY();
      const deltaY = scrollY - lastScrollY;
      lastScrollY = scrollY;
      targetVelocity = deltaY * 0.4;
      currentVelocity += (targetVelocity - currentVelocity) * 0.15;
      targetShift = Math.sin(scrollY * 8e-3) * 3 + currentVelocity * 0.5;
      currentShift += (targetShift - currentShift) * 0.12;
      document.documentElement.style.setProperty("--nb-scroll-shift", `${currentShift.toFixed(2)}px`);
      document.documentElement.style.setProperty("--nb-scroll-velocity", `${currentVelocity.toFixed(2)}`);
      document.documentElement.style.setProperty(
        "--nb-scroll-scale",
        `${(14 + Math.min(Math.abs(currentVelocity) * 0.5, 8)).toFixed(2)}px`
      );
      targetVelocity *= 0.85;
      const settled = Math.abs(deltaY) < SETTLE_EPSILON && Math.abs(currentVelocity) < SETTLE_EPSILON && Math.abs(targetShift - currentShift) < SETTLE_EPSILON;
      if (settled) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(updateRefraction);
    };
    const ensureRunning = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(updateRefraction);
      }
    };
    const targetElement = containerRef?.current || window;
    targetElement.addEventListener("scroll", ensureRunning, { passive: true });
    return () => {
      targetElement.removeEventListener("scroll", ensureRunning);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef]);
}

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, AppBackground, BG_OPTIONS, BackgroundDots, BackgroundGrid, BackgroundPlus, Badge, BgToggle, Button, CHART_1, CHART_2, CHART_3, CHART_4, CHART_NEUTRAL, Checkbox, CheckboxField, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, EmojiRating, Field, FieldGroup, FileDropzone, FileList, FileUploadButton, FormActions, FormDivider, FormRow, FormSection, GlassAccordion, GlassAccordionItem, GlassActivityFeed, GlassActivityGrid, GlassAlert, GlassApiKey, GlassAspectRatio, GlassAudioPlayer, GlassAurora, GlassAuthCard, GlassAvatar, GlassAvatarGroup, GlassBackToTop, GlassBadge, GlassBarChart, GlassBento, GlassBorderGlow, GlassBulkActionBar, GlassBulletList, GlassButton, GlassCalendar, GlassCard, GlassCarousel, GlassChatBubble, GlassChatComposer, GlassChatHeader, GlassChatInput, GlassChatThread, GlassChatTyping, GlassChip, GlassCluster, GlassCodeBlock, GlassCollapsible, GlassCombobox, GlassCommandPalette, GlassCompareTable, GlassContainer, GlassCornerDecor, GlassCountdown, GlassDangerZone, GlassDatePicker, GlassDivider, GlassDrawer, GlassDropdown, GlassDropdownSelect, GlassEmpty, GlassFeatureRow, GlassFilterBar, GlassGallery, GlassGrid, GlassImageCompare, GlassInlineCode, GlassInput, GlassJsonViewer, GlassKanbanBoard, GlassKanbanCard, GlassKanbanColumn, GlassKbd, GlassKeyValue, GlassLightbox, GlassLineChart, GlassList, GlassListItem, GlassLoadingOverlay, GlassLogView, GlassLoginForm, GlassMasonry, GlassMediaCard, GlassMeshGradient, GlassModal, GlassModelPicker, GlassModelSearch, GlassNav, GlassNavBrand, GlassNavItem, GlassNavSpacer, GlassNoise, GlassNotificationCenter, GlassOrb, GlassPagination, GlassPanel, GlassPasswordField, GlassPasswordStrength, GlassProductCard, GlassProfileCard, GlassProgress, GlassProgressSteps, GlassProvider, GlassQrCode, GlassRelativeTime, GlassRing, GlassSearch, GlassSettingsSection, GlassSkeleton, GlassSkeletonAvatar, GlassSkeletonCard, GlassSkeletonForm, GlassSkeletonImage, GlassSkeletonListItem, GlassSkeletonTable, GlassSkeletonText, GlassSlider, GlassSocialButtons, GlassSparkline, GlassSpinner, GlassSpinnerBar, GlassSpinnerDots, GlassSplit, GlassSpotlight, GlassStack, GlassStat, GlassStepper, GlassTable, GlassTagCloud, GlassTimeline, GlassToc, GlassToggle, GlassTooltip, GlassTreeView, GlassUsageBar, GlassVideoPlayer, Input, InputError, InputHint, InputLabel, LiquidGlass, LiveRegion, NbGlassFilters, NbTabs, OtpInput, PatternBackground, RadioCard, RadioField, RadioGroup, RadioGroupItem, Rating, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, SkipLink, Slider, SrOnly, Switch, SwitchField, TINT_1, TINT_2, TINT_3, TINT_4, TINT_5, TOKENY_KAFELKA, Tabs, TabsContent, TabsGroup, TabsLine, TabsLineTrigger, TabsList, TabsTrigger, TagInput, TechGrid, Textarea, Tile, TileAction, TileFooter, TileHeader, TilePill, TileRow, Toaster, buttonVariants, cn, klasyKafelka, scorePassword, tintFaded, useAuthId, useCommandPalette, useFocusTrap, useGlass, useGlassCls, useLiquidGlassScroll, usePatternLocations, useProfileBackgrounds, useProfilePatterns, useReducedMotion };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map