import { useState } from 'react'
import { ArrowRight, ChevronDown, FileText, Image, MessageSquare, Video, BarChart3 } from 'lucide-react'
import { Karta, Sekcja } from '../Powierzchnia'
import { cn } from '@/lib/utils'

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  WZORCOWY KAFELEK LIQUID GLASS (Szybki Kreator)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Plik referencyjny architektury Liquid Glass dla całej platformy.
 *
 * ── ZASADY ARCHITEKTONICZNE ────────────────────────────────────────────────
 *
 * 1. POZIOMY POWIERZCHNI:
 *    • Karta zewnętrzna (`<Karta>`): półprzezroczysta tafla szkła `p2-pow-1`,
 *      z rozmyciem `backdrop-filter`, subtelnym światłem krawędziowym (specular)
 *      i miękkim cieniem uniesienia.
 *    • Niecka wewnętrzna (`<Sekcja>`): zagłębiona tafla `p2-pow-2` (inset glass well).
 *      W jasnym motywie NIE JEST kredowo-białym klocem — zachowuje delikatną
 *      przezroczystość i mikro-cień wewnętrzny, wtapiając się gładko w kartę.
 *    • Kontrolki (`p2-kontrolka`): małe tafle szklane o dopasowanym promieniu.
 *
 * 2. WSPÓŁŚRODKOWE ZAOKRĄGLENIA (koncentryczność):
 *    • Karta: padding 14px (p-3.5), promień 20px (r-lg).
 *    • Sekcja wewnątrz: promień 14px (calc(20px - 6px)), padding 10px.
 *    • Zero ząbkowanych rogów i zero „chamskich odcięć”.
 *
 * 3. CZYSTE TOKENY HSL:
 *    • Żadnych wpisanych na sztywno kolorów hex ani klas typu `bg-white`, `text-black`.
 *    • Barwy, kontrast i stany wynikają w 100% z aktywnego motywu.
 */
const TRYBY = [
  { id: 'czat', nazwa: 'Czat', ikona: MessageSquare },
  { id: 'obraz', nazwa: 'Obraz', ikona: Image },
  { id: 'wideo', nazwa: 'Wideo', ikona: Video },
  { id: 'notatka', nazwa: 'Notatka', ikona: FileText },
] as const

export function Kreator({ koszt = 2, posiadane = 0 }: { koszt?: number; posiadane?: number }) {
  const [tryb, setTryb] = useState<string>('czat')
  const brakuje = Math.max(0, koszt - posiadane)

  return (
    <Karta className="flex flex-col p-3.5">
      {/* Zakładki wyboru trybu */}
      <div role="tablist" aria-label="Rodzaj treści" className="mb-3 flex flex-wrap gap-1.5">
        {TRYBY.map(({ id, nazwa, ikona: Ikona }) => {
          const aktywny = tryb === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={aktywny}
              onClick={() => setTryb(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
                aktywny
                  ? 'p2-akcent-tlo shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.25)] font-semibold'
                  : 'p2-cichy hover:bg-[hsl(var(--foreground)/0.06)] hover:text-[hsl(var(--foreground))]',
              )}
            >
              <Ikona className="h-3.5 w-3.5" />
              {nazwa}
            </button>
          )
        })}
      </div>

      {/* Zagłębiona niecka szklana na pole tekstowe (inset glass well) */}
      <Sekcja className="flex min-h-[140px] flex-col p-2.5 transition-[border-color,box-shadow] duration-200 focus-within:border-[hsl(var(--primary)/0.4)] focus-within:shadow-[inset_0_1px_3px_0_hsl(var(--foreground)/0.04),0_0_0_1px_hsl(var(--primary)/0.2)]">
        <textarea
          placeholder="Napisz wiadomość..."
          aria-label="Treść do utworzenia"
          className="min-h-[110px] flex-1 resize-none bg-transparent p-1.5 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)/0.75)]"
        />
      </Sekcja>

      {/* Dolny pasek akcji */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          className="p2-kontrolka flex items-center gap-2 px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow active:scale-[0.98]"
        >
          <BarChart3 className="h-3.5 w-3.5 p2-akcent" />
          <span className="font-semibold text-[hsl(var(--foreground))]">Pro</span>
          <ChevronDown className="h-3.5 w-3.5 p2-cichy" />
        </button>

        <div className="flex items-center gap-3">
          <p className="text-xs p2-cichy font-mono">
            <span className="font-sans font-medium text-[hsl(var(--foreground)/0.8)]">≈{koszt} ⟠</span>
            {brakuje > 0 && (
              <span className="ml-1 text-[hsl(var(--destructive))]">
                · masz {posiadane}, brakuje {brakuje}
              </span>
            )}
          </p>
          <button
            type="button"
            className="p2-kontrolka flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))] active:scale-[0.98]"
          >
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /> Utwórz w Chat AI
          </button>
        </div>
      </div>
    </Karta>
  )
}
