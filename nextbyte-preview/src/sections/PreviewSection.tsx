import React, { useState, useEffect, useRef } from 'react'

/* ─── Injected keyframes & preview-only styles ───────────────────────────── */
const STYLES = `
@keyframes nb-scale-x {
  from { transform: scaleX(0) }
  to   { transform: scaleX(1) }
}
@keyframes nb-fade-up {
  from { opacity: 0; transform: translateY(8px) }
  to   { opacity: 1; transform: none }
}
@keyframes nb-breathe {
  0%,100% { opacity:1; transform:scale(1)   }
  50%     { opacity:.4; transform:scale(.65) }
}
@keyframes nb-blink {
  0%,100% { opacity:1 } 50% { opacity:0 }
}

/* stagger */
.pv-cell { animation: nb-fade-up .4s ease both }
.pv-cell:nth-child(1){ animation-delay: 20ms }
.pv-cell:nth-child(2){ animation-delay: 70ms }
.pv-cell:nth-child(3){ animation-delay:120ms }
.pv-cell:nth-child(4){ animation-delay:170ms }
.pv-cell:nth-child(5){ animation-delay:220ms }
.pv-cell:nth-child(6){ animation-delay:270ms }
.pv-cell:nth-child(7){ animation-delay:320ms }
.pv-cell:nth-child(8){ animation-delay:370ms }
.pv-cell:nth-child(9){ animation-delay:420ms }

/* bento tile */
.pv-tile {
  border-radius: var(--r-md);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--tafla-1) / .72);
  backdrop-filter: blur(10px) saturate(1.05);
  box-shadow: var(--swiatlo-gorne), var(--cien-plaski);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100%;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}
.pv-tile:hover {
  border-color: hsl(var(--primary) / .22);
  box-shadow: var(--swiatlo-gorne), var(--cien-uniesiony), 0 0 0 1px hsl(var(--primary) / .08);
  transform: translateY(-1px);
}

/* progress bar */
.pv-bar {
  transform-origin: left;
  animation: nb-scale-x 1s cubic-bezier(.16,1,.3,1) var(--delay,.6s) both;
}

/* status pulse */
.pv-pulse { animation: nb-breathe 2.2s ease-in-out infinite }

/* toggle thumb */
.pv-thumb { transition: margin-left .22s cubic-bezier(.34,1.56,.64,1) }

/* cursor blink in "typing" input */
.pv-cursor { display:inline-block; animation: nb-blink .9s step-end infinite }

/* demo button base */
.pv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 12px; font-weight: 600; letter-spacing: -.01em;
  border-radius: var(--r-sm);
  cursor: default; user-select: none;
  transition: color .14s, background .14s, border-color .14s, box-shadow .14s;
}
.pv-btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid transparent;
  padding: 8px 16px;
  box-shadow: 0 1px 0 0 hsl(210 40% 100% / .12) inset, 0 6px 16px -6px hsl(var(--primary) / .45);
}
.pv-btn-primary:hover {
  box-shadow: 0 1px 0 0 hsl(210 40% 100% / .18) inset, 0 10px 24px -6px hsl(var(--primary) / .55);
  filter: brightness(1.06);
}
.pv-btn-outline {
  background: transparent;
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  padding: 8px 14px;
}
.pv-btn-outline:hover {
  border-color: hsl(var(--primary) / .5);
  color: hsl(var(--primary));
  background: hsl(var(--primary) / .04);
}
.pv-btn-ghost {
  background: transparent;
  color: hsl(var(--muted-foreground));
  border: 1px solid transparent;
  padding: 8px 12px;
}
.pv-btn-ghost:hover {
  background: hsl(var(--foreground) / .04);
  color: hsl(var(--foreground));
}
.pv-btn-danger {
  background: hsl(var(--destructive) / .08);
  color: hsl(var(--destructive));
  border: 1px solid hsl(var(--destructive) / .22);
  padding: 7px 12px;
  font-size: 11px;
}

/* demo badge — NOT rounded-full */
.pv-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px;
  border-radius: var(--r-xs);
  font-size: 10.5px; font-weight: 700;
  cursor: default; user-select: none;
}
.pv-badge-success { background: rgb(34 197 94 / .09); color: #4ADE80; border: 1px solid rgb(34 197 94 / .18) }
.pv-badge-primary { background: hsl(var(--primary) / .1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / .22) }
.pv-badge-warn    { background: rgb(245 158 11 / .09); color: #F59E0B; border: 1px solid rgb(245 158 11 / .2) }
.pv-badge-muted   { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)) }

/* demo chip — NOT rounded-full */
.pv-chip {
  display: inline-flex; align-items: center;
  padding: 3px 9px;
  border-radius: var(--r-xs);
  font-size: 11px; font-weight: 500;
  cursor: default; user-select: none;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
}
.pv-chip-primary {
  background: hsl(var(--primary) / .08);
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary) / .18);
}

/* demo input */
.pv-input {
  width: 100%; padding: 8px 12px;
  border-radius: var(--r-sm);
  font-size: 12px;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  outline: none; cursor: default;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.pv-input-focus {
  background: hsl(var(--primary) / .04);
  border-color: hsl(var(--primary) / .55);
  box-shadow: 0 0 0 3px hsl(var(--primary) / .1);
  color: hsl(var(--foreground));
}
.pv-input::placeholder { color: hsl(var(--muted-foreground) / .5) }
`

/* ─── Primitive helpers ──────────────────────────────────────────────────── */
function Tile({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`pv-tile pv-cell ${className}`} style={style}>{children}</div>
}

function TileName({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium mt-auto pt-3 block"
      style={{ color: 'hsl(var(--muted-foreground) / .35)' }}>
      {children}
    </span>
  )
}

function Progress({ label, pct, delay = '.6s' }: { label: string; pct: number; delay?: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-[5px]">
        <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--foreground))', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'hsl(var(--muted))', borderRadius: 99, overflow: 'hidden' }}>
        <div className="pv-bar" style={{ height: '100%', width: `${pct}%`, background: 'hsl(var(--primary))', borderRadius: 99, '--delay': delay } as React.CSSProperties} />
      </div>
    </div>
  )
}

/* ─── Toggle ─────────────────────────────────────────────────────────────── */
function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 42, height: 23, borderRadius: 12, padding: 3, display: 'flex', alignItems: 'center',
      background: on ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
      border: on ? '1px solid hsl(var(--primary))' : '1px solid hsl(var(--border))',
      transition: 'background .2s, border-color .2s', cursor: 'default', flexShrink: 0,
    }}>
      <div className="pv-thumb" style={{
        width: 17, height: 17, borderRadius: '50%',
        background: on ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground) / .4)',
        marginLeft: on ? 19 : 0,
      }} />
    </div>
  )
}

/* ─── Code block ─────────────────────────────────────────────────────────── */
function CodeBlock() {
  return (
    <div style={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>nb-tokens.css</span>
      </div>
      <pre style={{ padding: '16px 18px', fontSize: 11.5, lineHeight: 2.1, fontFamily: "'SF Mono','Consolas','Courier New',monospace", color: 'hsl(var(--muted-foreground) / .55)', margin: 0, overflowX: 'auto' }}>
        <span style={{ color: 'hsl(var(--muted-foreground) / .28)' }}>/* shape follows function */</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--r-xs</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>7px</span>{'   '}<span style={{ color: 'hsl(var(--muted-foreground) / .25)' }}>/* badge, chip */</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--r-sm</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>11px</span>{'  '}<span style={{ color: 'hsl(var(--muted-foreground) / .25)' }}>/* button, input */</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--r-md</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>16px</span>{'  '}<span style={{ color: 'hsl(var(--muted-foreground) / .25)' }}>/* card, panel */</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--r-lg</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>22px</span>{'  '}<span style={{ color: 'hsl(var(--muted-foreground) / .25)' }}>/* modal, nav */</span>{'\n\n'}
        <span style={{ color: 'hsl(var(--muted-foreground) / .28)' }}>/* motion is semantic */</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--speed-xs</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>80ms</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--speed-sm</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>140ms</span>{'\n'}
        <span style={{ color: 'hsl(var(--primary) / .65)' }}>--speed-md</span>{': '}<span style={{ color: 'hsl(var(--foreground) / .5)' }}>220ms</span>
      </pre>
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function PreviewSection() {
  const [on, setOn] = useState(true)
  const styleEl = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = STYLES
    document.head.appendChild(el)
    styleEl.current = el
    return () => el.remove()
  }, [])

  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="-mx-4 -mt-8 pb-14">

      {/* ── HEADER ── */}
      <div style={{ padding: '52px 32px 36px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 'clamp(60px,8.5vw,88px)', fontWeight: 900, letterSpacing: '-.06em', lineHeight: 1, color: 'hsl(var(--foreground))', fontVariantNumeric: 'tabular-nums' }}>
            811
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 8, letterSpacing: '-.01em' }}>
            komponentów · 15 motywów · 30 kategorii
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <span className="pv-badge pv-badge-success"><span className="pv-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />Aktywnie budowane</span>
            <span className="pv-badge pv-badge-primary">v0.1</span>
          </div>
          <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground) / .35)' }}>NextByte Design Pack · 2026</span>
        </div>
      </div>

      {/* ── BENTO GRID ── */}
      <div style={{ padding: '16px 32px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: '168px 136px 172px', gap: 10 }}>

        {/* Buttons — 2×1 */}
        <Tile style={{ gridColumn: '1/3' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <button className="pv-btn pv-btn-primary">Zapisz zmiany</button>
            <button className="pv-btn pv-btn-outline">Anuluj</button>
            <button className="pv-btn pv-btn-ghost">Podgląd</button>
            <button className="pv-btn pv-btn-danger">Usuń</button>
          </div>
          <TileName>Button · 6 wariantów · var(--r-sm) = 11px</TileName>
        </Tile>

        {/* Toggle — 1×1 */}
        <Tile>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Toggle on={on} />
              <span style={{ fontSize: 12, color: on ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', transition: 'color .2s' }}>
                {on ? 'Aktywny' : 'Wyłączony'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Toggle on={false} />
              <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Wyłączony</span>
            </div>
          </div>
          <TileName>Toggle · spring animation</TileName>
        </Tile>

        {/* Badges — 1×1 */}
        <Tile>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span className="pv-badge pv-badge-success" style={{ width: 'fit-content' }}><span className="pv-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>Gotowy</span>
            <span className="pv-badge pv-badge-primary" style={{ width: 'fit-content' }}><span className="pv-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>Beta</span>
            <span className="pv-badge pv-badge-warn"    style={{ width: 'fit-content' }}><span className="pv-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>Uwaga</span>
            <span className="pv-badge pv-badge-muted"   style={{ width: 'fit-content' }}>W planie</span>
          </div>
          <TileName>Badge · var(--r-xs) = 7px · nie pill</TileName>
        </Tile>

        {/* FEATURED — 2×2 */}
        <Tile style={{ gridColumn: '1/3', gridRow: '2/4', background: 'hsl(var(--tafla-2) / .85)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground) / .4)', marginBottom: 12, letterSpacing: '.01em' }}>
            Analiza projektu · live
          </div>
          {/* Realistic dashboard card */}
          <div style={{ flex: 1, background: 'hsl(var(--muted) / .45)', borderRadius: 'var(--r-sm)', border: '1px solid hsl(var(--border))', padding: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: 2, letterSpacing: '-.02em' }}>NB Design Pack</div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Ostatnia aktualizacja: teraz</div>
              </div>
              <span className="pv-badge pv-badge-success"><span className="pv-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>Live</span>
            </div>
            <div style={{ height: 1, background: 'hsl(var(--border))' }} />
            <Progress label="API requests" pct={81} delay=".7s" />
            <Progress label="Cache hit rate" pct={94} delay=".9s" />
            <Progress label="Error budget" pct={12} delay="1.1s" />
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button className="pv-btn pv-btn-primary" style={{ fontSize: 11, padding: '6px 14px' }}>Szczegóły →</button>
              <button className="pv-btn pv-btn-outline" style={{ fontSize: 11, padding: '6px 12px' }}>Eksport</button>
            </div>
          </div>
          <TileName>GlassCard · embedded dashboard · real context</TileName>
        </Tile>

        {/* Inputs — 2×1 */}
        <Tile style={{ gridColumn: '3/5' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className="pv-input" placeholder="Szukaj komponentu…" readOnly />
            <input className="pv-input pv-input-focus" defaultValue="GlassCard" readOnly />
          </div>
          <TileName>Input · focus ring via box-shadow · nie ring-2</TileName>
        </Tile>

        {/* Stat — 1×1 */}
        <Tile>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-.05em', color: 'hsl(var(--foreground))', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>15</div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 5 }}>unikalnych motywów</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', marginTop: 4 }}>+3 nowe</div>
          </div>
          <TileName>Stat · GlassStat</TileName>
        </Tile>

        {/* Chips — 1×1 */}
        <Tile>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <span className="pv-chip pv-chip-primary">React</span>
              <span className="pv-chip pv-chip-primary">TypeScript</span>
              <span className="pv-chip">Tailwind</span>
              <span className="pv-chip">Vite</span>
            </div>
          </div>
          <TileName>Chip / Tag · var(--r-xs) = 7px</TileName>
        </Tile>

      </div>

      {/* ── SECOND ROW ── */}
      <div style={{ padding: '10px 32px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>

        {/* Code block — 2 cols */}
        <div className="pv-cell" style={{ gridColumn: '1/3' }}>
          <CodeBlock />
        </div>

        {/* Progress — 1 col */}
        <Tile>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
            <Progress label="Akcje" pct={68} delay="1.3s" />
            <Progress label="Formularze" pct={44} delay="1.5s" />
            <Progress label="Nawigacja" pct={31} delay="1.7s" />
            <Progress label="Dane" pct={19} delay="1.9s" />
          </div>
          <TileName>Postęp budowania</TileName>
        </Tile>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ margin: '10px 32px 0', borderRadius: 'var(--r-md)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--tafla-1) / .72)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { n: '811', l: 'komponentów' },
          { n: '15',  l: 'motywów' },
          { n: '30',  l: 'kategorii' },
          { n: '0',   l: 'blobów w tle' },
        ].map((s, i) => (
          <div key={s.n} style={{ padding: '20px 24px', borderRight: i < 3 ? '1px solid hsl(var(--border))' : 'none' }}>
            <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-.04em', color: 'hsl(var(--foreground))', lineHeight: 1, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{s.l}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
