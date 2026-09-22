import { doAtrybutuD, klatkiWlasciwosci, KRZYWE_CSS, wartoscWCzasie } from './animacja'
import { stylEfektu } from './RenderWezla'
import { WLASCIWOSCI, type Projekt, type Wezel } from './typy'

/**
 * Generatory kodu. Zasada: to, co widać na kanwie, ma dać się wkleić
 * do projektu bez poprawek — dlatego style biorą się z tych samych
 * funkcji, których używa renderer.
 */

export type FormatEksportu = 'svg' | 'react' | 'css' | 'json'

/* ── Pomocniki ───────────────────────────────────────────────────── */

const ok = (n: number) => Math.round(n * 100) / 100

function nazwaCss(wezel: Wezel): string {
  return 'nb-' + wezel.id.replace(/[^a-zA-Z0-9]/g, '')
}

function nazwaKomponentu(nazwa: string): string {
  const oczyszczona = nazwa
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('')
  return /^[A-Za-z]/.test(oczyszczona) ? oczyszczona : 'Scena' + oczyszczona
}

/** Obiekt stylu → literał JSX (camelCase zostaje, bo tak chce React). */
function stylDoJsx(styl: Record<string, unknown>, wciecie: string): string {
  const wpisy = Object.entries(styl).filter(([, v]) => v !== undefined && v !== '')
  if (wpisy.length === 0) return '{{}}'
  const linie = wpisy.map(([klucz, wartosc]) =>
    typeof wartosc === 'number'
      ? `${wciecie}  ${klucz}: ${ok(wartosc)},`
      : `${wciecie}  ${klucz}: '${String(wartosc).replace(/'/g, "\\'")}',`,
  )
  // Podwójny nawias, bo w JSX `style` przyjmuje obiekt w wyrażeniu.
  return `{{\n${linie.join('\n')}\n${wciecie}}}`
}

/* ── Animacja → @keyframes ───────────────────────────────────────── */

/** Momenty, w których cokolwiek na tym węźle się zmienia. */
function momentyKlatek(wezel: Wezel): number[] {
  const czasy = new Set<number>()
  for (const klatka of wezel.klatki) czasy.add(klatka.czas)
  return [...czasy].sort((a, b) => a - b)
}

function wygladzanieWCzasie(wezel: Wezel, czas: number): string {
  // Bierzemy krzywą z tej właściwości, która ma klatkę dokładnie tutaj —
  // CSS pozwala na jedną funkcję na stop, więc wybór musi być jeden.
  for (const w of WLASCIWOSCI) {
    const klatki = klatkiWlasciwosci(wezel, w.klucz)
    const trafiona = klatki.find(k => k.czas === czas)
    if (trafiona) return KRZYWE_CSS[trafiona.wygladzanie]
  }
  return 'linear'
}

export function keyframesWezla(wezel: Wezel, projekt: Projekt): string {
  const momenty = momentyKlatek(wezel)
  if (momenty.length === 0) return ''
  const d = Math.max(projekt.dlugosc, 1)
  const stopy = new Set<number>([0, ...momenty, d])

  const linie = [...stopy]
    .sort((a, b) => a - b)
    .map(czas => {
      const procent = ok((czas / d) * 100)
      const x = wartoscWCzasie(wezel, 'x', czas) - wezel.x
      const y = wartoscWCzasie(wezel, 'y', czas) - wezel.y
      const obrot = wartoscWCzasie(wezel, 'obrot', czas)
      const skala = wartoscWCzasie(wezel, 'skala', czas)
      const krycie = wartoscWCzasie(wezel, 'krycie', czas)
      const transform = `translate(${ok(x)}px, ${ok(y)}px) rotate(${ok(obrot)}deg) scale(${ok(skala)})`
      return (
        `  ${procent}% {\n` +
        `    transform: ${transform};\n` +
        `    opacity: ${ok(krycie)};\n` +
        `    animation-timing-function: ${wygladzanieWCzasie(wezel, czas)};\n` +
        `  }`
      )
    })

  return `@keyframes ${nazwaCss(wezel)} {\n${linie.join('\n')}\n}`
}

export function eksportCss(projekt: Projekt): string {
  const bloki = projekt.wezly
    .filter(w => w.klatki.length > 0)
    .map(w => {
      const uzycie =
        `.${nazwaCss(w)} {\n` +
        `  animation: ${nazwaCss(w)} ${ok(projekt.dlugosc / 1000)}s infinite;\n` +
        `}`
      return `${keyframesWezla(w, projekt)}\n\n${uzycie}`
    })
  if (bloki.length === 0) return '/* Brak klatek kluczowych — dodaj animację na osi czasu. */'
  return `/* ${projekt.nazwa} — animacje */\n\n${bloki.join('\n\n')}\n`
}

/* ── SVG ─────────────────────────────────────────────────────────── */

function wezelDoSvg(wezel: Wezel): string {
  const t = `translate(${ok(wezel.x)} ${ok(wezel.y)})`
  const obrot = wezel.obrot ? ` rotate(${ok(wezel.obrot)} ${ok(wezel.w / 2)} ${ok(wezel.h / 2)})` : ''
  const skala = wezel.skala !== 1 ? ` scale(${ok(wezel.skala)})` : ''
  const atrybuty =
    `fill="${wezel.wypelnienie ?? 'none'}" stroke="${wezel.obrys ?? 'none'}" ` +
    `stroke-width="${wezel.grubosc ?? 0}" stroke-linejoin="round" stroke-linecap="round"` +
    (wezel.krycie !== 1 ? ` opacity="${ok(wezel.krycie)}"` : '')

  let ksztalt = ''
  if (wezel.typ === 'prostokat') {
    ksztalt = `<rect width="${ok(wezel.w)}" height="${ok(wezel.h)}" rx="${ok(Math.min(wezel.promien ?? 0, Math.min(wezel.w, wezel.h) / 2))}" ${atrybuty} />`
  } else if (wezel.typ === 'elipsa') {
    ksztalt = `<ellipse cx="${ok(wezel.w / 2)}" cy="${ok(wezel.h / 2)}" rx="${ok(wezel.w / 2)}" ry="${ok(wezel.h / 2)}" ${atrybuty} />`
  } else if (wezel.typ === 'sciezka') {
    ksztalt = `<path d="${doAtrybutuD(wezel.punkty ?? [], !!wezel.zamknieta)}" ${atrybuty} />`
  } else if (wezel.typ === 'tekst') {
    ksztalt =
      `<text x="0" y="${ok((wezel.rozmiar ?? 20) * 0.85)}" font-size="${wezel.rozmiar ?? 20}" ` +
      `font-weight="${wezel.waga ?? 600}" fill="${wezel.kolorTekstu ?? '#e8eef6'}">${escapeXml(wezel.tekst ?? '')}</text>`
  } else {
    return ''
  }
  return `  <g transform="${t}${obrot}${skala}" id="${nazwaCss(wezel)}">\n    ${ksztalt}\n  </g>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function eksportSvg(projekt: Projekt): string {
  const widoczne = projekt.wezly.filter(w => w.widoczny)
  const grupy = widoczne.map(wezelDoSvg).filter(Boolean)
  const pominiete = widoczne.filter(w => w.typ === 'kafelek' || w.typ === 'przycisk')
  const komentarz = pominiete.length
    ? `\n<!-- Pominięto ${pominiete.length} warstw DOM (kafelki/przyciski) — te eksportuj jako React/HTML. -->`
    : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${projekt.szerokosc}" height="${projekt.wysokosc}" ` +
    `viewBox="0 0 ${projekt.szerokosc} ${projekt.wysokosc}" fill="none">${komentarz}\n${grupy.join('\n')}\n</svg>\n`
  )
}

/* ── React ───────────────────────────────────────────────────────── */

function trescKafelkaJsx(wezel: Wezel, wciecie: string): string {
  const t = wezel.tresc ?? {}
  const akcent = wezel.akcent ?? '#38bdf8'
  const czesci: string[] = []
  if (t.znaczek) {
    czesci.push(
      `${wciecie}<span style=${stylDoJsx(
        {
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
        },
        wciecie,
      )}>{'${t.znaczek}'}</span>`,
    )
  }
  if (t.tytul) {
    czesci.push(`${wciecie}<div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{'${t.tytul}'}</div>`)
  }
  if (t.podtytul) {
    czesci.push(`${wciecie}<div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>{'${t.podtytul}'}</div>`)
  }
  if (t.cena) {
    czesci.push(
      `${wciecie}<div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>\n` +
        `${wciecie}  <span style={{ fontSize: 30, fontWeight: 800 }}>{'${t.cena}'}</span>\n` +
        (t.sufiks ? `${wciecie}  <span style={{ fontSize: 11, opacity: 0.55 }}>{'${t.sufiks}'}</span>\n` : '') +
        `${wciecie}</div>`,
    )
  }
  if (t.punkty?.length) {
    const li = t.punkty
      .map(
        p =>
          `${wciecie}    <li style={{ fontSize: 11, opacity: 0.78, display: 'flex', gap: 7, alignItems: 'center' }}>\n` +
          `${wciecie}      <span style={{ width: 5, height: 5, borderRadius: 999, background: '${akcent}' }} />\n` +
          `${wciecie}      {'${p}'}\n` +
          `${wciecie}    </li>`,
      )
      .join('\n')
    czesci.push(
      `${wciecie}<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 5 }}>\n${li}\n${wciecie}</ul>`,
    )
  }
  if (t.cta) {
    czesci.push(
      `${wciecie}<button style=${stylDoJsx(
        {
          marginTop: 'auto',
          fontSize: 12,
          fontWeight: 600,
          padding: '9px 14px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          color: '#04070c',
          background: akcent,
        },
        wciecie,
      )}>{'${t.cta}'}</button>`,
    )
  }
  return czesci.join('\n')
}

function wezelDoJsx(wezel: Wezel, projekt: Projekt): string {
  const w2 = '      '
  const pozycja: Record<string, unknown> = {
    position: 'absolute',
    left: ok(wezel.x),
    top: ok(wezel.y),
    width: ok(wezel.w),
    height: ok(wezel.h),
    opacity: wezel.krycie,
  }
  if (wezel.obrot || wezel.skala !== 1) {
    pozycja.transform = `rotate(${ok(wezel.obrot)}deg) scale(${ok(wezel.skala)})`
  }
  const animowany = wezel.klatki.length > 0
  const klasa = animowany ? ` className="${nazwaCss(wezel)}"` : ''

  if (wezel.typ === 'kafelek') {
    const styl = {
      ...pozycja,
      boxSizing: 'border-box',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      color: wezel.kolorTekstu ?? '#e8eef6',
      ...stylEfektu(wezel.efekt, wezel.akcent ?? '#38bdf8', wezel.promien ?? 18),
    } as Record<string, unknown>
    return `    <div${klasa} style=${stylDoJsx(styl, '    ')}>\n${trescKafelkaJsx(wezel, w2)}\n    </div>`
  }

  if (wezel.typ === 'przycisk') {
    const akcent = wezel.akcent ?? '#38bdf8'
    const efekt = wezel.efekt ?? 'brak'
    const styl = {
      ...pozycja,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: wezel.rozmiar ?? 13,
      fontWeight: wezel.waga ?? 600,
      cursor: 'pointer',
      padding: '0 18px',
      ...(efekt === 'brak'
        ? {
            borderRadius: wezel.promien ?? 12,
            background: akcent,
            color: wezel.kolorTekstu ?? '#04070c',
            border: '1px solid transparent',
            boxShadow: `0 10px 24px -14px ${akcent}`,
          }
        : { color: wezel.kolorTekstu ?? '#e8eef6', ...stylEfektu(efekt, akcent, wezel.promien ?? 12) }),
    } as Record<string, unknown>
    return `    <button${klasa} style=${stylDoJsx(styl, '    ')}>{'${wezel.tekst ?? 'Przycisk'}'}</button>`
  }

  if (wezel.typ === 'tekst') {
    const styl = {
      ...pozycja,
      display: 'flex',
      alignItems: 'center',
      fontSize: wezel.rozmiar ?? 20,
      fontWeight: wezel.waga ?? 600,
      color: wezel.kolorTekstu ?? '#e8eef6',
      lineHeight: 1.25,
      whiteSpace: 'pre-wrap',
    } as Record<string, unknown>
    return `    <div${klasa} style=${stylDoJsx(styl, '    ')}>{'${(wezel.tekst ?? '').replace(/'/g, "\\'")}'}</div>`
  }

  // kształty wektorowe
  const wspolne = `fill="${wezel.wypelnienie ?? 'none'}" stroke="${wezel.obrys ?? 'none'}" strokeWidth={${wezel.grubosc ?? 0}} strokeLinejoin="round" strokeLinecap="round"`
  let ksztalt = ''
  if (wezel.typ === 'prostokat') {
    ksztalt = `<rect width={${ok(wezel.w)}} height={${ok(wezel.h)}} rx={${ok(Math.min(wezel.promien ?? 0, Math.min(wezel.w, wezel.h) / 2))}} ${wspolne} />`
  } else if (wezel.typ === 'elipsa') {
    ksztalt = `<ellipse cx={${ok(wezel.w / 2)}} cy={${ok(wezel.h / 2)}} rx={${ok(wezel.w / 2)}} ry={${ok(wezel.h / 2)}} ${wspolne} />`
  } else {
    ksztalt = `<path d="${doAtrybutuD(wezel.punkty ?? [], !!wezel.zamknieta)}" ${wspolne} />`
  }
  const styl = { ...pozycja, overflow: 'visible' } as Record<string, unknown>
  void projekt
  return (
    `    <svg${klasa} style=${stylDoJsx(styl, '    ')} viewBox="0 0 ${ok(wezel.w)} ${ok(wezel.h)}">\n` +
    `${w2}${ksztalt}\n    </svg>`
  )
}

export function eksportReact(projekt: Projekt): string {
  const nazwa = nazwaKomponentu(projekt.nazwa)
  const widoczne = projekt.wezly.filter(w => w.widoczny)
  const warstwy = widoczne.map(w => wezelDoJsx(w, projekt)).join('\n')
  const css = projekt.wezly.filter(w => w.klatki.length > 0)

  const style = css.length
    ? `\nconst ANIMACJE = \`\n${css
        .map(
          w =>
            `${keyframesWezla(w, projekt)}\n.${nazwaCss(w)} { animation: ${nazwaCss(w)} ${ok(
              projekt.dlugosc / 1000,
            )}s infinite; }`,
        )
        .join('\n\n')}\n\`\n`
    : ''

  return (
    `// Wygenerowane w edytorze NextByte — ${projekt.nazwa}\n` +
    `${style}\n` +
    `export function ${nazwa}() {\n` +
    `  return (\n` +
    `    <div style={{ position: 'relative', width: ${projekt.szerokosc}, height: ${projekt.wysokosc}, background: '${projekt.tlo}' }}>\n` +
    (style ? `      <style>{ANIMACJE}</style>\n` : '') +
    `${warstwy.replace(/^ {4}/gm, '      ')}\n` +
    `    </div>\n` +
    `  )\n` +
    `}\n`
  )
}

/* ── Wejście ─────────────────────────────────────────────────────── */

export function wygenerujKod(projekt: Projekt, format: FormatEksportu): string {
  switch (format) {
    case 'svg':   return eksportSvg(projekt)
    case 'react': return eksportReact(projekt)
    case 'css':   return eksportCss(projekt)
    case 'json':  return JSON.stringify(projekt, null, 2)
  }
}

export function rozszerzenie(format: FormatEksportu): string {
  return format === 'react' ? 'tsx' : format
}

/** Zapis do pliku bez zależności — czysty Blob + <a download>. */
export function pobierzPlik(nazwa: string, tresc: string, typMime: string) {
  const blob = new Blob([tresc], { type: typMime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nazwa
  a.click()
  URL.revokeObjectURL(url)
}
