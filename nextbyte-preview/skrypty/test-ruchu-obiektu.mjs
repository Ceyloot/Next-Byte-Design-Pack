#!/usr/bin/env node
/**
 * Test porównawczy: przesunięcie obiektu w obrębie JEDNEGO zdjęcia — warianty promptów i modeli Runware na tym samym zdjęciu.
 * Cel: ZNALEZIĆ DOWODEM (wynikami), który wariant naprawdę przenosi obiekt i usuwa oryginał, zamiast zgadywać.
 *
 * Użycie:
 *   1. RUNWARE_API_KEY w nextbyte-preview/.env.local (plik jest w .gitignore) albo w zmiennej środowiskowej.
 *   2. Plik konfiguracji, np. ruch.json:
 *      {
 *        "obraz": "/sciezka/do/zdjecia.jpg",
 *        "zrodlo": { "x": 0.89, "y": 0.33, "nazwa": "small hobbit house", "ramka": [0.86, 0.30, 0.93, 0.36] },
 *        "cel":    { "x": 0.32, "y": 0.69, "nazwa": "stone terrace next to the garden" },
 *        "powtorzenia": 2
 *      }
 *      "ramka" = [x0, y0, x1, y1] ułamki kadru ciasno wokół obiektu źródłowego (do maski usuwania).
 *   3. node skrypty/test-ruchu-obiektu.mjs ruch.json [--sucho] [--warianty=a,b,c]
 *      --sucho: tylko wypisuje zapytania i długości promptów, nic nie wysyła (nie kosztuje).
 *
 * Wyniki: wyniki-ruchu/<data>/ — obrazy, prompty.json i index.html (arkusz porównawczy: oryginał | wyniki).
 * Identyfikatory modeli: google:nano-banana@2-lite, google:4@3 (z aplikacji), bfl:3@1 (Kontext pro),
 * bytedance:5@0 (Seedream 4.0), bfl:flux@erase (FLUX Erase) — wg dokumentacji Runware; błąd modelu jest zapisywany w wyniku.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ENDPOINT = 'https://api.runware.ai/v1'
const katalog = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const sucho = args.includes('--sucho')
const plikKonfiguracji = args.find((a) => !a.startsWith('--'))
const filtr = (args.find((a) => a.startsWith('--warianty=')) ?? '').replace('--warianty=', '').split(',').filter(Boolean)
if (!plikKonfiguracji) {
  console.error('Podaj plik konfiguracji: node skrypty/test-ruchu-obiektu.mjs ruch.json [--sucho]')
  process.exit(1)
}

function wczytajKlucz() {
  if (process.env.RUNWARE_API_KEY) return process.env.RUNWARE_API_KEY
  const env = join(katalog, '..', '.env.local')
  if (existsSync(env)) {
    const m = readFileSync(env, 'utf8').match(/^RUNWARE_API_KEY\s*=\s*(.+)$/m)
    if (m) return m[1].trim().replace(/^["']|["']$/g, '')
  }
  return ''
}

const konfig = JSON.parse(readFileSync(resolve(plikKonfiguracji), 'utf8'))
const bajty = readFileSync(resolve(konfig.obraz))
const mime = /\.png$/i.test(konfig.obraz) ? 'image/png' : 'image/jpeg'
const dataUri = `data:${mime};base64,${bajty.toString('base64')}`

/** Wymiary z nagłówka PNG / JPEG (bez zależności). */
function wymiary(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
  let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue }
    const typ = b[i + 1]
    if (typ >= 0xc0 && typ <= 0xcf && typ !== 0xc4 && typ !== 0xc8 && typ !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  throw new Error('Nie odczytałem wymiarów obrazu')
}
const { w: szer, h: wys } = wymiary(bajty)

const DOZWOLONE = [[1024, 1024], [1264, 848], [848, 1264], [1200, 896], [896, 1200], [1152, 928], [928, 1152], [1376, 768], [768, 1376], [1584, 672], [672, 1584]]
const [width, height] = DOZWOLONE.reduce((n, p) => (Math.abs(p[0] / p[1] - szer / wys) < Math.abs(n[0] / n[1] - szer / wys) ? p : n))

const z = konfig.zrodlo
const c = konfig.cel
const proc = (v) => Math.round(v * 100)
function polozenie(x, y) {
  const poziom = x < 0.15 ? 'at the far left edge' : x < 0.35 ? 'in the left part' : x < 0.65 ? 'in the horizontal middle' : x < 0.85 ? 'in the right part' : 'at the far right edge'
  const pion = y < 0.15 ? 'at the very top' : y < 0.35 ? 'in the upper part' : y < 0.65 ? 'around the vertical middle' : y < 0.85 ? 'in the lower part' : 'at the very bottom'
  return `${pion} and ${poziom} of the frame, ${proc(x)}% from the left edge and ${proc(y)}% down from the top (x=${x.toFixed(2)}, y=${y.toFixed(2)})`
}
/** Krótko: „upper right”, „lower left”… (styl promptów z poradników: Move the person to the left side). */
function krotko(x, y) {
  const h = x < 0.35 ? 'left' : x < 0.65 ? 'center' : 'right'
  const v = y < 0.35 ? 'upper' : y < 0.65 ? 'middle' : 'lower'
  return v === 'middle' && h === 'center' ? 'center of the image' : `${v === 'middle' ? '' : v + ' '}${h} part of the image`.trim()
}

// --- maska PNG (biały prostokąt na czarnym) bez zależności ---
function crc32(buf) {
  let c32, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c32 = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c32 = c32 & 1 ? 0xedb88320 ^ (c32 >>> 1) : c32 >>> 1
    crc = (crc >>> 8) ^ c32
  }
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(typ, dane) {
  const t = Buffer.from(typ)
  const len = Buffer.alloc(4); len.writeUInt32BE(dane.length)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dane])))
  return Buffer.concat([len, t, dane, crc])
}
function maskaPng(W, H, ramka, margines = 0.18) {
  const [x0, y0, x1, y1] = ramka
  const dw = (x1 - x0) * margines, dh = (y1 - y0) * margines
  const px0 = Math.max(0, Math.floor((x0 - dw) * W)), px1 = Math.min(W, Math.ceil((x1 + dw) * W))
  const py0 = Math.max(0, Math.floor((y0 - dh) * H)), py1 = Math.min(H, Math.ceil((y1 + dh) * H))
  const surowe = Buffer.alloc((W + 1) * H)
  for (let y = 0; y < H; y++) {
    surowe[y * (W + 1)] = 0
    if (y >= py0 && y < py1) surowe.fill(255, y * (W + 1) + 1 + px0, y * (W + 1) + 1 + px1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 0
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(surowe)), chunk('IEND', Buffer.alloc(0))])
}

const NAZWA = z.nazwa || 'object'
const CALOSC = 'Everything else stays exactly as it is: the same colours, grade, grain, light, crop, framing, every other object and all text.'
const P_XY = [
  '[TASK]',
  'Edit Image 1: MOVE one object within the photo.',
  `THE OBJECT stands ${polozenie(z.x, z.y)}.`,
  `IT MUST END UP ${polozenie(c.x, c.y)}: the middle of its footprint exactly on that x / y point, in that very part of the frame.`,
  'At its old position nothing of it remains. Everything else in the photo stays exactly as it is.',
].join('\n')
const P_KONTEXT = `Move the ${NAZWA} from the ${krotko(z.x, z.y)} to ${c.nazwa ? `the ${c.nazwa}, in the ${krotko(c.x, c.y)}` : `the ${krotko(c.x, c.y)}`}. Remove it from its original position and fill that spot with the natural background. Keep the camera angle, framing, lighting and everything else unchanged.`
const P_KROTKI = `Move the ${NAZWA} from the ${krotko(z.x, z.y)} to the ${krotko(c.x, c.y)} of the image, and leave nothing at the original spot.`
const P_DODAJ = `Edit Image 1: ADD one more ${NAZWA}, identical to the one that stands ${polozenie(z.x, z.y)}, at ${polozenie(c.x, c.y)}${c.nazwa ? ` (${c.nazwa})` : ''}. The middle of its footprint lands exactly on that x / y point; scaled for its distance from the camera, lit like the scene, with a contact shadow. Leave the original exactly where it is. ${CALOSC}`
const P_USUN = `Edit Image 1: REMOVE exactly one object and change nothing else: the ${NAZWA} that stands ${polozenie(z.x, z.y)}. Any other structure close to it stays untouched. Delete it completely and rebuild that spot with what would naturally be there without it, continuing the surrounding texture, light and grain. Add nothing. ${CALOSC}`

const zapytanie = (model, prompt, obrazy, extra = {}) => ({
  taskType: 'imageInference', taskUUID: crypto.randomUUID(), model, positivePrompt: prompt,
  inputs: { referenceImages: obrazy }, width, height, numberResults: 1, outputType: 'URL', outputFormat: 'JPG', outputQuality: 95, deliveryMethod: 'sync', includeCost: true, ...extra,
})
const erase = (obraz) => ({
  taskType: 'imageInference', taskUUID: crypto.randomUUID(), model: 'bfl:flux@erase',
  inputs: { image: obraz, mask: `data:image/png;base64,${maskaPng(szer, wys, z.ramka ?? [z.x - 0.04, z.y - 0.04, z.x + 0.04, z.y + 0.04]).toString('base64')}` },
  settings: { dilatePixels: 12 }, numberResults: 1, outputType: 'URL', outputFormat: 'JPG', outputQuality: 95, deliveryMethod: 'sync', includeCost: true,
})

/** Każdy wariant: kroki wykonywane po kolei; krok może użyć wyniku poprzedniego (obraz = 'POPRZEDNI'). */
const WARIANTY = [
  { id: 'a_lite_xy', opis: 'Nano Banana 2 Lite, prompt tylko z pozycjami x/y (obecny)', kroki: [{ model: 'google:nano-banana@2-lite', prompt: P_XY }] },
  { id: 'b_nb31_xy', opis: 'Nano Banana 2 (Gemini 3.1), prompt tylko z pozycjami x/y', kroki: [{ model: 'google:4@3', prompt: P_XY }] },
  { id: 'c_lite_krotki', opis: 'Lite, krótki prompt w stylu poradników (Move … from … to …)', kroki: [{ model: 'google:nano-banana@2-lite', prompt: P_KROTKI }] },
  { id: 'd_kontext_pro', opis: 'FLUX.1 Kontext [pro], prompt z czasownikiem Move + usunięcie + zachowanie kadru', kroki: [{ model: 'bfl:3@1', prompt: P_KONTEXT }] },
  { id: 'e_seedream4', opis: 'Seedream 4.0, prompt z czasownikiem Move + usunięcie + zachowanie kadru', kroki: [{ model: 'bytedance:5@0', prompt: P_KONTEXT }] },
  { id: 'f_dwa_lite', opis: 'Dwa zadania na Lite: 1) dodaj kopię, 2) usuń oryginał promptem', kroki: [{ model: 'google:nano-banana@2-lite', prompt: P_DODAJ }, { model: 'google:nano-banana@2-lite', prompt: P_USUN, poprzedni: true }] },
  { id: 'g_dodaj_erase', opis: 'Dodaj kopię (Gemini 3.1) → usuń oryginał dedykowanym FLUX Erase po masce', kroki: [{ model: 'google:4@3', prompt: P_DODAJ }, { erase: true, poprzedni: true }] },
]

const wybrane = filtr.length ? WARIANTY.filter((v) => filtr.includes(v.id) || filtr.some((f) => v.id.startsWith(f))) : WARIANTY
const powtorzenia = konfig.powtorzenia ?? 1

if (sucho) {
  for (const v of wybrane) {
    console.log(`\n=== ${v.id} — ${v.opis}`)
    v.kroki.forEach((k, i) => console.log(`  krok ${i + 1}: ${k.erase ? 'bfl:flux@erase (maska z ramki)' : `${k.model} | ${k.prompt.length} znaków`}`))
  }
  mkdirSync(join(katalog, '..', 'wyniki-ruchu'), { recursive: true })
  writeFileSync(join(katalog, '..', 'wyniki-ruchu', 'maska-test.png'), maskaPng(szer, wys, z.ramka ?? [z.x - 0.04, z.y - 0.04, z.x + 0.04, z.y + 0.04]))
  console.log(`\nMaska usuwania (podgląd): wyniki-ruchu/maska-test.png`)
  console.log(`\nObraz ${szer}x${wys} → zapytanie ${width}x${height}. Tryb --sucho: nic nie wysłano.`)
  process.exit(0)
}

const klucz = wczytajKlucz()
if (!klucz) { console.error('Brak RUNWARE_API_KEY (.env.local albo zmienna środowiskowa).'); process.exit(1) }

async function wyslij(zad) {
  const r = await fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' }, body: JSON.stringify([zad]) })
  const j = await r.json()
  const blad = j.errors?.[0]?.message
  if (blad) throw new Error(blad)
  const d = j.data?.[0]
  if (!d?.imageURL) throw new Error('brak obrazu w odpowiedzi')
  return { url: d.imageURL, koszt: d.cost ?? 0 }
}
async function pobierzJakoDataUri(url) {
  const o = await fetch(url)
  return `data:${o.headers.get('content-type') || 'image/jpeg'};base64,${Buffer.from(await o.arrayBuffer()).toString('base64')}`
}

const wyjscie = join(katalog, '..', 'wyniki-ruchu', new Date().toISOString().replace(/[:.]/g, '-'))
mkdirSync(wyjscie, { recursive: true })
writeFileSync(join(wyjscie, 'oryginal' + (mime === 'image/png' ? '.png' : '.jpg')), bajty)
const log = []
for (const v of wybrane) {
  for (let p = 1; p <= powtorzenia; p++) {
    const etykieta = `${v.id}_${p}`
    let poprzedni = dataUri
    let koszt = 0
    let blad = ''
    let plik = ''
    try {
      for (const k of v.kroki) {
        const wej = k.poprzedni ? poprzedni : dataUri
        const zad = k.erase ? erase(wej) : zapytanie(k.model, k.prompt, [wej])
        const w = await wyslij(zad)
        koszt += w.koszt
        poprzedni = await pobierzJakoDataUri(w.url)
      }
      plik = `${etykieta}.jpg`
      writeFileSync(join(wyjscie, plik), Buffer.from(poprzedni.split(',')[1], 'base64'))
    } catch (e) {
      blad = e instanceof Error ? e.message : String(e)
    }
    console.log(`${blad ? 'BŁĄD ' : 'ok   '} ${etykieta}  $${koszt.toFixed(4)} ${blad}`)
    log.push({ id: v.id, powtorzenie: p, opis: v.opis, kroki: v.kroki.map((k) => (k.erase ? { model: 'bfl:flux@erase' } : { model: k.model, dlugoscPromptu: k.prompt.length, prompt: k.prompt })), plik, blad, kosztUSD: koszt })
  }
}
writeFileSync(join(wyjscie, 'prompty.json'), JSON.stringify(log, null, 2))
const kafelki = log
  .map((l) => `<figure><img src="${l.plik || ''}" alt=""><figcaption><b>${l.id} #${l.powtorzenie}</b><br>${l.opis}<br>${l.blad ? `<span style="color:#c00">${l.blad}</span>` : `$${l.kosztUSD.toFixed(4)}`}</figcaption></figure>`)
  .join('\n')
writeFileSync(join(wyjscie, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Test ruchu obiektu</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:16px}.g{display:flex;flex-wrap:wrap;gap:12px}figure{margin:0;width:340px}img{width:100%;border-radius:8px}</style><h2>Oryginał i wyniki</h2><div class="g"><figure><img src="oryginal${mime === 'image/png' ? '.png' : '.jpg'}"><figcaption>oryginał — źródło (${z.x}, ${z.y}) → cel (${c.x}, ${c.y})</figcaption></figure>${kafelki}</div>`)
console.log(`\nGotowe: ${wyjscie}/index.html`)
