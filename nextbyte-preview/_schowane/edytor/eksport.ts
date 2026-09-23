import { doAtrybutuD, klatkiWlasciwosci, KRZYWE_CSS, wartoscWCzasie } from './animacja'
import { stylEfektu } from './RenderWezla'
import { wezlyWStanie } from './stany'
import { filtrSvgCieni, maWyglad, naRgba, stylWygladu, svgWypelnienie } from './wyglad'
import { WLASCIWOSCI, type Projekt, type Wezel } from './typy'

/**
 * Generatory kodu. Zasada: to, co widać na kanwie, ma dać się wkleić
 * do projektu bez poprawek — dlatego style biorą się z tych samych
 * funkcji, których używa renderer.
 */

export type FormatEksportu = 'svg' | 'react' | 'css' | 'json'

/* ── Pomocniki ───────────────────────────────────────────────────── */

const ok = (n: number) => Math.round(n * 100) / 100

/**
 * Identyfikator warstwy. Podkreślenie zamiast myślnika, bo ta sama nazwa
 * służy za klasę CSS ORAZ za klucz obiektu w wygenerowanym JS — z myślnikiem
 * `BAZA.nb-abc` jest odejmowaniem, a nie odczytem pola.
 */
function nazwaCss(wezel: Wezel): string {
  return 'nb_' + wezel.id.replace(/[^a-zA-Z0-9]/g, '')
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

  // Parametryczny wygląd wygrywa nad starymi polami — dokładnie tak samo
  // jak w rendererze, żeby plik SVG zgadzał się z tym, co widać na kanwie.
  const parametryczny = maWyglad(wezel.wyglad)
  const gradient = svgWypelnienie(parametryczny ? wezel.wyglad?.wypelnienie : undefined, `g-${nazwaCss(wezel)}`)
  const wypelnienie = parametryczny ? gradient.fill : (wezel.wypelnienie ?? 'none')
  const obrysKolor =
    parametryczny && wezel.wyglad?.obrys?.wlaczony
      ? naRgba(wezel.wyglad.obrys.kolor, wezel.wyglad.obrys.krycie)
      : (wezel.obrys ?? 'none')
  const obrysGrubosc =
    parametryczny && wezel.wyglad?.obrys?.wlaczony ? wezel.wyglad.obrys.grubosc : (wezel.grubosc ?? 0)
  const filtr = parametryczny ? filtrSvgCieni(wezel.wyglad?.cienie) : undefined

  const atrybuty =
    `fill="${wypelnienie}" stroke="${obrysKolor}" ` +
    `stroke-width="${obrysGrubosc}" stroke-linejoin="round" stroke-linecap="round"` +
    (wezel.krycie !== 1 ? ` opacity="${ok(wezel.krycie)}"` : '') +
    (filtr ? ` filter="${filtr}"` : '')

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
  const defs = gradient.defs ? `    <defs>${gradient.defs}</defs>\n` : ''
  return `  <g transform="${t}${obrot}${skala}" id="${nazwaCss(wezel)}">\n${defs}    ${ksztalt}\n  </g>`
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

/**
 * Pełny styl warstwy DOM — pozycja plus wygląd typu. Wydzielone, bo
 * ten sam obiekt potrzebny jest dwa razy: raz w JSX warstwy, raz przy
 * liczeniu różnic między stanami.
 */
function stylWezla(wezel: Wezel): Record<string, unknown> {
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
  if (!wezel.widoczny) pozycja.display = 'none'

  const parametryczny = maWyglad(wezel.wyglad) ? stylWygladu(wezel.wyglad, wezel.promien ?? 12) : {}

  if (wezel.typ === 'kafelek') {
    return {
      ...pozycja,
      boxSizing: 'border-box',
      padding: 20,
      display: wezel.widoczny ? 'flex' : 'none',
      flexDirection: 'column',
      gap: 8,
      color: wezel.kolorTekstu ?? '#e8eef6',
      ...stylEfektu(wezel.efekt, wezel.akcent ?? '#38bdf8', wezel.promien ?? 18),
      ...parametryczny,
    }
  }

  if (wezel.typ === 'przycisk') {
    const akcent = wezel.akcent ?? '#38bdf8'
    const efekt = wezel.efekt ?? 'brak'
    return {
      ...pozycja,
      boxSizing: 'border-box',
      display: wezel.widoczny ? 'flex' : 'none',
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
      ...parametryczny,
    }
  }

  if (wezel.typ === 'tekst') {
    return {
      ...pozycja,
      display: wezel.widoczny ? 'flex' : 'none',
      alignItems: 'center',
      fontSize: wezel.rozmiar ?? 20,
      fontWeight: wezel.waga ?? 600,
      color: wezel.kolorTekstu ?? '#e8eef6',
      lineHeight: 1.25,
      whiteSpace: 'pre-wrap',
    }
  }

  if (wezel.typ === 'obraz') {
    return {
      ...pozycja,
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRadius: wezel.promien ?? 0,
      objectFit:
        wezel.dopasowanie === 'zmiesc' ? 'contain' : wezel.dopasowanie === 'rozciagnij' ? 'fill' : 'cover',
      ...parametryczny,
    }
  }

  // kształt wektorowy — SVG dostaje ramkę, resztę załatwiają atrybuty
  return { ...pozycja, overflow: 'visible', ...parametryczny }
}

function wezelDoJsx(wezel: Wezel, projekt: Projekt): string {
  const w2 = '      '
  const animowany = wezel.klatki.length > 0
  const klasa = animowany ? ` className="${nazwaCss(wezel)}"` : ''
  const styl = stylWezla(wezel)
  void projekt

  if (wezel.typ === 'grupa') {
    // Grupa nie ma własnej treści — dzieci są osobnymi warstwami sceny.
    return ''
  }

  if (wezel.typ === 'kafelek') {
    return `    <div${klasa} style=${stylDoJsx(styl, '    ')}>\n${trescKafelkaJsx(wezel, w2)}\n    </div>`
  }

  if (wezel.typ === 'przycisk') {
    return `    <button${klasa} style=${stylDoJsx(styl, '    ')}>{'${wezel.tekst ?? 'Przycisk'}'}</button>`
  }

  if (wezel.typ === 'tekst') {
    return `    <div${klasa} style=${stylDoJsx(styl, '    ')}>{'${(wezel.tekst ?? '').replace(/'/g, "\\'")}'}</div>`
  }

  if (wezel.typ === 'obraz') {
    // Źródło zostaje dataURL-em — plik jest samowystarczalny. Przy dużych
    // zdjęciach warto to potem podmienić na import z `/public`.
    return `    <img${klasa} src="${wezel.zrodlo ?? ''}" alt="${wezel.nazwa}" style=${stylDoJsx(styl, '    ')} />`
  }

  const parametryczny = maWyglad(wezel.wyglad)
  const gradient = svgWypelnienie(parametryczny ? wezel.wyglad?.wypelnienie : undefined, `g-${nazwaCss(wezel)}`)
  const wypelnienie = parametryczny ? gradient.fill : (wezel.wypelnienie ?? 'none')
  const obrysKolor =
    parametryczny && wezel.wyglad?.obrys?.wlaczony
      ? naRgba(wezel.wyglad.obrys.kolor, wezel.wyglad.obrys.krycie)
      : (wezel.obrys ?? 'none')
  const obrysGrubosc =
    parametryczny && wezel.wyglad?.obrys?.wlaczony ? wezel.wyglad.obrys.grubosc : (wezel.grubosc ?? 0)

  const wspolne = `fill="${wypelnienie}" stroke="${obrysKolor}" strokeWidth={${obrysGrubosc}} strokeLinejoin="round" strokeLinecap="round"`
  let ksztalt = ''
  if (wezel.typ === 'prostokat') {
    ksztalt = `<rect width={${ok(wezel.w)}} height={${ok(wezel.h)}} rx={${ok(Math.min(wezel.promien ?? 0, Math.min(wezel.w, wezel.h) / 2))}} ${wspolne} />`
  } else if (wezel.typ === 'elipsa') {
    ksztalt = `<ellipse cx={${ok(wezel.w / 2)}} cy={${ok(wezel.h / 2)}} rx={${ok(wezel.w / 2)}} ry={${ok(wezel.h / 2)}} ${wspolne} />`
  } else {
    ksztalt = `<path d="${doAtrybutuD(wezel.punkty ?? [], !!wezel.zamknieta)}" ${wspolne} />`
  }

  const defs = gradient.defs
    ? `${w2}<defs dangerouslySetInnerHTML={{ __html: \`${gradient.defs}\` }} />\n`
    : ''
  const filtr = parametryczny ? filtrSvgCieni(wezel.wyglad?.cienie) : undefined
  const stylSvg = filtr ? { ...styl, filter: filtr } : styl

  return (
    `    <svg${klasa} style=${stylDoJsx(stylSvg, '    ')} viewBox="0 0 ${ok(wezel.w)} ${ok(wezel.h)}">\n` +
    `${defs}${w2}${ksztalt}\n    </svg>`
  )
}

/* ── Stany → komponent z przełączaniem ───────────────────────────── */

/**
 * Różnica stylu między sceną bazową a stanem. Eksportujemy tylko to, co
 * naprawdę inne — nadpisywanie całego stylu psułoby `transition`, bo
 * przeglądarka animowałaby też właściwości, które się nie zmieniły.
 */
function roznicaStylu(bazowy: Record<string, unknown>, docelowy: Record<string, unknown>): Record<string, unknown> {
  const wynik: Record<string, unknown> = {}
  for (const [klucz, wartosc] of Object.entries(docelowy)) {
    if (JSON.stringify(bazowy[klucz]) !== JSON.stringify(wartosc)) wynik[klucz] = wartosc
  }
  return wynik
}

function stanyDoJs(projekt: Projekt): string {
  const stany = projekt.stany ?? []
  if (stany.length === 0) return ''

  const bazowe: Record<string, Record<string, unknown>> = {}
  for (const w of projekt.wezly) bazowe[nazwaCss(w)] = stylWezla(w)

  // Stany bez różnic pomijamy — pusty wpis tylko zaśmiecałby wynik.
  const wpisy = stany
    .map(stan => {
      const wStanie = wezlyWStanie(projekt.wezly, stan)
      const roznice = wStanie
        .map(w => ({ klucz: nazwaCss(w), roznica: roznicaStylu(bazowe[nazwaCss(w)], stylWezla(w)) }))
        .filter(r => Object.keys(r.roznica).length > 0)
        .map(r => `    ${r.klucz}: ${stylDoJsx(r.roznica, '    ').slice(1, -1)},`)
      if (roznice.length === 0) return ''
      return `  // ${stan.nazwa}\n  ${stan.id}: {\n${roznice.join('\n')}\n  },`
    })
    .filter(Boolean)

  return `const NADPISANIA: Record<string, Record<string, React.CSSProperties>> = {\n${wpisy.join('\n')}\n}\n`
}

function przejsciaDoJs(projekt: Projekt): string {
  const przejscia = projekt.przejscia ?? []
  if (przejscia.length === 0) return ''
  const wiersze = przejscia.map(p => {
    const wezel = projekt.wezly.find(w => w.id === p.element)
    // Element zapisujemy pod tą samą nazwą co klucz stylu, żeby w kodzie
    // dało się porównać jedną wartością, bez dodatkowej mapy id → klasa.
    const element = wezel ? `'${nazwaCss(wezel)}'` : 'null'
    return (
      `  { od: '${p.od}', do: '${p.do}', wyzwalacz: '${p.wyzwalacz}', element: ${element}, ` +
      `czas: ${p.czas}, opoznienie: ${p.opoznienie}, krzywa: '${KRZYWE_CSS[p.wygladzanie]}' },`
    )
  })
  return `const PRZEJSCIA = [\n${wiersze.join('\n')}\n] as const\n`
}

export function eksportReact(projekt: Projekt): string {
  const nazwa = nazwaKomponentu(projekt.nazwa)
  const widoczne = projekt.wezly.filter(w => w.widoczny && w.typ !== 'grupa')
  const zeStanami = (projekt.stany?.length ?? 0) > 0 && (projekt.przejscia?.length ?? 0) > 0

  const warstwy = widoczne.map(w => wezelDoJsx(w, projekt)).filter(Boolean).join('\n')
  const animowane = projekt.wezly.filter(w => w.klatki.length > 0)

  const style = animowane.length
    ? `\nconst ANIMACJE = \`\n${animowane
        .map(
          w =>
            `${keyframesWezla(w, projekt)}\n.${nazwaCss(w)} { animation: ${nazwaCss(w)} ${ok(
              projekt.dlugosc / 1000,
            )}s infinite; }`,
        )
        .join('\n\n')}\n\`\n`
    : ''

  if (!zeStanami) {
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

  // Wariant ze stanami: każda warstwa dostaje styl bazowy zmieszany z
  // nadpisaniem aktywnego stanu. Przejście jest inline, bo animujemy
  // zmianę stylu inline — CSS w klasie zostałby przez nią przykryty.
  const warstwyZeStanem = widoczne
    .map(w => {
      const kod = wezelDoJsx(w, projekt)
      if (!kod) return ''
      const klucz = nazwaCss(w)
      // Podmieniamy literał stylu na mieszankę bazy, nadpisania i przejścia.
      const zeStylem = kod.replace(
        /style=\{\{[\s\S]*?\n {4}\}\}/,
        `style={{ ...BAZA.${klucz}, ...(NADPISANIA[stan]?.${klucz} ?? {}), transition: przejscie }}`,
      )
      // Warstwa wskazana jako wyzwalacz dostaje własne handlery — inaczej
      // „klik w przełącznik” reagowałby na kliknięcie gdziekolwiek.
      const wyzwalana = (projekt.przejscia ?? []).some(p => {
        const wezel = projekt.wezly.find(x => x.id === p.element)
        return wezel !== undefined && nazwaCss(wezel) === klucz
      })
      if (!wyzwalana) return zeStylem
      return zeStylem.replace(
        /^(\s*<[A-Za-z]+)/,
        `$1 onClick={e => { e.stopPropagation(); przejdz('klik', '${klucz}') }}` +
          ` onMouseEnter={() => przejdz('najechanie', '${klucz}')}`,
      )
    })
    .filter(Boolean)
    .join('\n')

  const bazaWpisy = widoczne
    .map(w => `  ${nazwaCss(w)}: ${stylDoJsx(stylWezla(w), '  ').slice(1, -1)},`)
    .join('\n')

  return (
    `// Wygenerowane w edytorze NextByte — ${projekt.nazwa}\n` +
    `// Stany: ${(projekt.stany ?? []).map(s => s.nazwa).join(', ')}\n` +
    `import React, { useEffect, useState } from 'react'\n` +
    `${style}\n` +
    `const BAZA: Record<string, React.CSSProperties> = {\n${bazaWpisy}\n}\n\n` +
    `${stanyDoJs(projekt)}\n` +
    `${przejsciaDoJs(projekt)}\n` +
    `export function ${nazwa}() {\n` +
    `  const [stan, setStan] = useState('baza')\n` +
    `  const [przejscie, setPrzejscie] = useState('none')\n\n` +
    `  const przejdz = (wyzwalacz: string, element: string | null = null) => {\n` +
    `    const p = PRZEJSCIA.find(\n` +
    `      x => x.od === stan && x.wyzwalacz === wyzwalacz && (x.element === null || x.element === element),\n` +
    `    )\n` +
    `    if (!p) return\n` +
    `    setPrzejscie(\`all \${p.czas}ms \${p.krzywa} \${p.opoznienie}ms\`)\n` +
    `    setStan(p.do)\n` +
    `  }\n\n` +
    `  // Przejścia automatyczne odpalają się same po wejściu w stan.\n` +
    `  useEffect(() => {\n` +
    `    const p = PRZEJSCIA.find(x => x.od === stan && x.wyzwalacz === 'auto')\n` +
    `    if (!p) return\n` +
    `    const id = setTimeout(() => {\n` +
    `      setPrzejscie(\`all \${p.czas}ms \${p.krzywa}\`)\n` +
    `      setStan(p.do)\n` +
    `    }, p.opoznienie)\n` +
    `    return () => clearTimeout(id)\n` +
    `  }, [stan])\n\n` +
    `  return (\n` +
    `    <div\n` +
    `      onClick={() => przejdz('klik')}\n` +
    `      onMouseEnter={() => przejdz('najechanie')}\n` +
    `      onMouseLeave={() => przejdz('najechanie')}\n` +
    `      style={{ position: 'relative', width: ${projekt.szerokosc}, height: ${projekt.wysokosc}, background: '${projekt.tlo}' }}\n` +
    `    >\n` +
    (style ? `      <style>{ANIMACJE}</style>\n` : '') +
    `${warstwyZeStanem.replace(/^ {4}/gm, '      ')}\n` +
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
