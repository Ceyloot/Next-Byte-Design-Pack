import React from 'react'
import { doAtrybutuD } from './animacja'
import type { Efekt, Wezel } from './typy'

/**
 * Jeden renderer dla kanwy, miniatur w bibliotece i podglądu eksportu.
 * Dzięki temu kafelek w bibliotece wygląda dokładnie tak, jak po wstawieniu
 * na scenę — nie ma osobnych „ładnych obrazków”.
 */

/* ── Efekty tła ───────────────────────────────────────────────────
 * Trzymamy je jako czysty CSS (bez klas Tailwinda), bo dokładnie ten
 * sam obiekt trafia potem do eksportowanego kodu.
 */
export function stylEfektu(efekt: Efekt | undefined, akcent: string, promien: number): React.CSSProperties {
  const a = akcent
  switch (efekt) {
    case 'glass':
      return {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: promien,
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        boxShadow: '0 18px 40px -18px rgba(0,0,0,0.65)',
      }
    case 'liquid':
      return {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.10))',
        border: '1px solid rgba(255,255,255,0.20)',
        borderRadius: promien,
        backdropFilter: 'blur(26px) saturate(180%) brightness(1.08)',
        WebkitBackdropFilter: 'blur(26px) saturate(180%) brightness(1.08)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -18px 30px -24px rgba(255,255,255,0.35), 0 24px 50px -22px rgba(0,0,0,0.75)',
      }
    case 'neon':
      return {
        background: 'rgba(8,12,18,0.82)',
        border: '1px solid ' + a,
        borderRadius: promien,
        boxShadow: `0 0 0 1px ${a}22, 0 0 22px -2px ${a}, inset 0 0 22px -12px ${a}`,
      }
    case 'gradient':
      return {
        background: `linear-gradient(#0b0f14, #0b0f14) padding-box, linear-gradient(135deg, ${a}, transparent 55%, ${a}88) border-box`,
        border: '1px solid transparent',
        borderRadius: promien,
        boxShadow: '0 18px 40px -20px rgba(0,0,0,0.7)',
      }
    case 'siatka':
      return {
        background:
          'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 22px 22px,' +
          'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 22px 22px,' +
          'rgba(10,14,20,0.9)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: promien,
      }
    default:
      return {
        background: 'rgba(16,20,27,0.92)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: promien,
      }
  }
}

/* ── Kształty wektorowe ──────────────────────────────────────────── */

function Wektor({ wezel }: { wezel: Wezel }) {
  const { w, h, wypelnienie = 'none', obrys = 'transparent', grubosc = 0, promien = 0 } = wezel
  const wspolne = {
    fill: wypelnienie,
    stroke: obrys,
    strokeWidth: grubosc,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
      {wezel.typ === 'prostokat' && (
        <rect x={0} y={0} width={w} height={h} rx={Math.min(promien, Math.min(w, h) / 2)} {...wspolne} />
      )}
      {wezel.typ === 'elipsa' && <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...wspolne} />}
      {wezel.typ === 'sciezka' && <path d={doAtrybutuD(wezel.punkty ?? [], !!wezel.zamknieta)} {...wspolne} />}
    </svg>
  )
}

/* ── Kafelek i przycisk ──────────────────────────────────────────── */

function Kafelek({ wezel }: { wezel: Wezel }) {
  const akcent = wezel.akcent ?? '#38bdf8'
  const t = wezel.tresc ?? {}
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        color: wezel.kolorTekstu ?? '#e8eef6',
        fontFamily: 'inherit',
        overflow: 'hidden',
        ...stylEfektu(wezel.efekt, akcent, wezel.promien ?? 18),
        ...(wezel.styl as React.CSSProperties | undefined),
      }}
    >
      {t.znaczek && (
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 999,
            color: akcent,
            background: `${akcent}1f`,
            border: `1px solid ${akcent}55`,
          }}
        >
          {t.znaczek}
        </span>
      )}
      {t.tytul && <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{t.tytul}</div>}
      {t.podtytul && <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>{t.podtytul}</div>}
      {t.cena && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{t.cena}</span>
          {t.sufiks && <span style={{ fontSize: 11, opacity: 0.55 }}>{t.sufiks}</span>}
        </div>
      )}
      {t.punkty && t.punkty.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0, display: 'grid', gap: 5 }}>
          {t.punkty.map((p, i) => (
            <li key={i} style={{ fontSize: 11, opacity: 0.78, display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: akcent, flexShrink: 0 }} />
              {p}
            </li>
          ))}
        </ul>
      )}
      {t.cta && (
        <div
          style={{
            marginTop: 'auto',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            padding: '9px 14px',
            borderRadius: 10,
            color: '#04070c',
            background: akcent,
          }}
        >
          {t.cta}
        </div>
      )}
    </div>
  )
}

function Przycisk({ wezel }: { wezel: Wezel }) {
  const akcent = wezel.akcent ?? '#38bdf8'
  const efekt = wezel.efekt ?? 'brak'
  const podstawa: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: wezel.rozmiar ?? 13,
    fontWeight: wezel.waga ?? 600,
    letterSpacing: '-0.01em',
    userSelect: 'none',
    padding: '0 18px',
    overflow: 'hidden',
  }
  const styl: React.CSSProperties =
    efekt === 'brak'
      ? {
          ...podstawa,
          borderRadius: wezel.promien ?? 12,
          background: akcent,
          color: wezel.kolorTekstu ?? '#04070c',
          border: '1px solid transparent',
          boxShadow: `0 10px 24px -14px ${akcent}`,
        }
      : {
          ...podstawa,
          color: wezel.kolorTekstu ?? '#e8eef6',
          ...stylEfektu(efekt, akcent, wezel.promien ?? 12),
        }
  return <div style={{ ...styl, ...(wezel.styl as React.CSSProperties | undefined) }}>{wezel.tekst ?? 'Przycisk'}</div>
}

function Tekst({ wezel }: { wezel: Wezel }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        fontSize: wezel.rozmiar ?? 20,
        fontWeight: wezel.waga ?? 600,
        color: wezel.kolorTekstu ?? '#e8eef6',
        lineHeight: 1.25,
        whiteSpace: 'pre-wrap',
        ...(wezel.styl as React.CSSProperties | undefined),
      }}
    >
      {wezel.tekst ?? 'Tekst'}
    </div>
  )
}

export function RenderWezla({ wezel }: { wezel: Wezel }) {
  switch (wezel.typ) {
    case 'kafelek':
      return <Kafelek wezel={wezel} />
    case 'przycisk':
      return <Przycisk wezel={wezel} />
    case 'tekst':
      return <Tekst wezel={wezel} />
    default:
      return <Wektor wezel={wezel} />
  }
}

/** Miniatura do kafelków biblioteki — skaluje węzeł do zadanego pudełka. */
export function Miniatura({ wezel, szer, wys }: { wezel: Wezel; szer: number; wys: number }) {
  const skala = Math.min(szer / wezel.w, wys / wezel.h, 1)
  return (
    <div style={{ width: szer, height: wys, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <div
        style={{
          width: wezel.w,
          height: wezel.h,
          transform: `scale(${skala})`,
          transformOrigin: 'center',
          flexShrink: 0,
          pointerEvents: 'none',
        }}
      >
        <RenderWezla wezel={wezel} />
      </div>
    </div>
  )
}
