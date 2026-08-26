import React from 'react'
import { ChevronDown, Paperclip, Mic, Phone, Wand2, Sparkles, Layers, Send } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useGlass } from '../../lib/glass-context'
import { GlassModelSearch } from './GlassModelSearch'

/* ═══════════════════════════════════════════════════════════════════
   Pasek pisania czatu — odwzorowanie 1:1 realnego markupu produkcyjnego
   NextByte (nextbyte.space/chat-ai). Wymiary, kolory i struktura klas
   przeniesione ze zrzutu strony, nie z pamięci: pigułka modelu ma
   neutralną obwódkę `border-border` (nie akcent), aktywny przełącznik
   źródła dostaje gradientowe tło + poświatę + cienką linię na górnej
   krawędzi (nie łuk), a narzędzia są kołami 32/36px — mniejsze, niż
   pierwsza wersja tego komponentu zakładała.
   ═══════════════════════════════════════════════════════════════════ */

export interface ComposerToggle {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}

export interface GlassChatComposerProps {
  modelName: string
  modelIcon?: React.ComponentType<{ className?: string }>
  modelCost?: number
  modelMenuOpen?: boolean
  onModelClick?: () => void
  toggles?: ComposerToggle[]
  onToggle?: (id: string) => void
  value?: string
  onChange?: (v: string) => void
  onSend?: () => void
  placeholder?: string
  tokenCount?: string
  sendCost?: number
  disabled?: boolean
  footerText?: React.ReactNode
  className?: string
}

export function GlassChatComposer({
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
  placeholder = 'Napisz wiadomość...',
  tokenCount,
  sendCost,
  disabled,
  footerText,
  className,
}: GlassChatComposerProps) {
  const { isGlass } = useGlass()
  const [internal, setInternal] = React.useState('')
  const val = value !== undefined ? value : internal
  const canSend = !disabled && val.trim().length > 0

  function set(v: string) {
    if (value === undefined) setInternal(v)
    onChange?.(v)
  }

  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      <div
        className={cn(
          'relative rounded-[1.75rem] border shadow-2xl transition-colors duration-200',
          isGlass
            ? 'nb-szklo nb-szklo-plynne shadow-primary/5 ring-1 ring-foreground/[0.04] border-border/60 hover:border-border/70'
            : 'bg-card border-border/70 hover:border-border',
        )}
      >
        {/* Górny pasek — pigułka modelu + przełączniki źródeł */}
        <div className="flex items-center justify-between gap-2 px-3 pt-2.5">
          <GlassModelSearch
            selectedId={modelName.toLowerCase().includes('szybki') ? 'szybki' : modelName.toLowerCase().includes('pro') ? 'pro' : 'szybki'}
            onSelect={(model) => onModelClick?.()}
            placement="top"
          />

          {toggles.length > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              {toggles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onToggle?.(t.id)}
                  title={t.label}
                  className={cn(
                    'relative inline-flex h-7 items-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
                    t.active
                      ? 'border-primary/30 bg-gradient-to-br from-primary/15 via-transparent to-primary/5 text-primary shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.4)] after:absolute after:inset-x-3 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent'
                      : 'border-muted-foreground/20 bg-muted/30 text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <t.icon className="h-3 w-3" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pole tekstowe */}
        <div className="relative">
          <textarea
            value={val}
            disabled={disabled}
            placeholder={placeholder}
            rows={2}
            onChange={(e) => set(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend?.() } }}
            className="!min-h-0 min-h-0 w-full resize-none border-0 bg-transparent px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            style={{ minHeight: 56, maxHeight: 120, height: 56 }}
          />
        </div>

        <div className="mx-3 h-px bg-border/20" />

        {/* Dolny pasek — narzędzia + tokeny + wyślij */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <ComposerTool icon={Paperclip} title="Załącz plik" />
            <ComposerTool icon={Mic} title="Nagraj" />
            <ComposerTool icon={Phone} title="Rozpocznij rozmowę głosową" />
            <ComposerTool icon={Wand2} title="Biblioteka promptów" />
            <ComposerTool icon={Sparkles} title="Deep Research" />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {tokenCount && (
              <div
                title="Ilość tokenów kontekstu"
                className="inline-flex h-9 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 text-xs text-primary/85 transition-colors hover:bg-primary/15 hover:text-primary"
              >
                <Layers className="h-3 w-3 opacity-80" />
                <span className="font-semibold tabular-nums">{tokenCount}</span>
                <span className="text-[9px] uppercase tracking-wide opacity-70">tok</span>
              </div>
            )}
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className={cn(
                'relative z-10 flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-200',
                canSend
                  ? 'border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15'
                  : 'cursor-not-allowed border-primary/30 bg-primary/10 text-foreground opacity-50',
              )}
            >
              <Send className="h-4 w-4 text-primary" />
              <span className="font-medium">Wyślij</span>
              {sendCost !== undefined && (
                <span className="flex items-center gap-0.5 font-semibold tabular-nums text-primary">
                  <span className="text-xs">·</span><span className="text-xs">{sendCost}</span><span className="text-xs">⟠</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {footerText !== undefined ? (
        <p className="px-3 pb-3 pt-2 text-center text-[10px] text-muted-foreground/70">{footerText}</p>
      ) : (
        <p className="px-3 pb-3 pt-2 text-center text-[10px] text-muted-foreground/70">
          Rozmawiasz ze sztuczną inteligencją (AI). AI może popełniać błędy — sprawdzaj ważne informacje.{' '}
          <a href="#" className="underline transition-colors hover:text-muted-foreground">Polityka prywatności</a>
        </p>
      )}
    </div>
  )
}

function ComposerTool({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <button
      type="button"
      title={title}
      className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30 p-0 transition-colors duration-200 hover:border-border hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
    >
      <Icon className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-foreground" />
    </button>
  )
}
