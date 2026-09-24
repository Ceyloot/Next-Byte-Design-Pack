/**
 * Backend Next Scribe jako wtyczka Vite — `/api/transcript`, `/api/scrape`
 * i magazyn `/api/projects/...` (notatniki, źródła, czat, notatki, Studio).
 *
 * Powód istnienia: makieta notatnika woła te ścieżki (utils/youtube.js,
 * utils/webScraper.js), a podgląd nie miał serwera, który by na nie
 * odpowiadał. Vite oddawał wtedy `index.html` ze statusem 200, parsowanie
 * JSON padało i w konsoli stało „Błąd serwera 200" — mylące, bo to nie
 * był błąd YouTube, tylko brak backendu.
 *
 * YouTube nie wpuszcza przeglądarki (CORS), więc napisy pobieramy tutaj:
 *   1. InnerTube `player` z klientem ANDROID — zwraca ścieżki napisów bez
 *      tokenu PO, którego wymaga dziś klient WEB,
 *   2. sama ścieżka napisów (XML: stary `<text>` albo srv3 `<p t d>`),
 *   3. odpowiedź w kształcie, którego oczekuje `fetchYoutubeTranscript`.
 *
 * Przy wdrożeniu ten sam kontrakt przenosi się do funkcji serwerowej.
 */
import type { Plugin, Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import path from 'path'

const UA_ANDROID = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip'

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function idFilmu(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(url) ? url : null)
}

const ENCJE: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" }
const odkoduj = (t: string) =>
  t.replace(/&(amp|lt|gt|quot|#39|apos);/g, (m) => ENCJE[m] ?? m)
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
   .replace(/<[^>]+>/g, '')
   .replace(/\s+/g, ' ')
   .trim()

const czas = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

interface Wpis { text: string; start: number; duration: number; timeStr: string }

function parsujNapisy(xml: string): Wpis[] {
  const wynik: Wpis[] = []
  // srv3: <p t="ms" d="ms">…</p>
  for (const m of xml.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = odkoduj(m[3])
    if (text) wynik.push({ text, start: Number(m[1]) / 1000, duration: Number(m[2] ?? 0) / 1000, timeStr: czas(Number(m[1]) / 1000) })
  }
  if (wynik.length) return wynik
  // klasyczny: <text start="s" dur="s">…</text>
  for (const m of xml.matchAll(/<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) {
    const text = odkoduj(m[3])
    if (text) wynik.push({ text, start: Number(m[1]), duration: Number(m[2] ?? 0), timeStr: czas(Number(m[1])) })
  }
  return wynik
}

async function pobierzTranskrypcje(videoId: string) {
  const r = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA_ANDROID },
    body: JSON.stringify({
      videoId,
      context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 34, hl: 'pl', gl: 'PL' } },
    }),
  })
  if (!r.ok) throw new Error(`YouTube odrzucił zapytanie (${r.status}).`)
  const dane: any = await r.json()

  const status = dane?.playabilityStatus?.status
  if (status && status !== 'OK') throw new Error(dane.playabilityStatus.reason || 'Film jest niedostępny.')

  const tytul: string = dane?.videoDetails?.title || 'Film YouTube'
  const autor: string = dane?.videoDetails?.author || 'YouTube'
  const dlugosc = Number(dane?.videoDetails?.lengthSeconds || 0)
  const sciezki: any[] = dane?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
  if (!sciezki.length) throw new Error('Ten film nie ma napisów — nie da się go przeczytać.')

  // Kolejność: polskie ręczne, polskie automatyczne, angielskie, cokolwiek.
  const wybor =
    sciezki.find((t) => t.languageCode?.startsWith('pl') && t.kind !== 'asr') ||
    sciezki.find((t) => t.languageCode?.startsWith('pl')) ||
    sciezki.find((t) => t.languageCode?.startsWith('en') && t.kind !== 'asr') ||
    sciezki.find((t) => t.languageCode?.startsWith('en')) ||
    sciezki[0]

  const xml = await fetch(String(wybor.baseUrl).replace(/&fmt=[^&]*/, ''), { headers: { 'User-Agent': UA_ANDROID } }).then((x) => x.text())
  const transcript = parsujNapisy(xml)
  if (!transcript.length) throw new Error('Napisy są puste albo YouTube ich nie wydał.')

  return {
    videoId,
    title: tytul,
    author: autor,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: dlugosc,
    language: wybor.languageCode,
    transcript,
    rawText: transcript.map((t) => `[${t.timeStr}] ${t.text}`).join('\n'),
    hasTranscript: true,
  }
}

async function pobierzStrone(url: string) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36', 'Accept-Language': 'pl,en;q=0.8' },
    redirect: 'follow',
  })
  if (!r.ok) throw new Error(`Strona odpowiedziała ${r.status}.`)
  const html = await r.text()
  const title = odkoduj(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '') || 'Strona WWW'
  const glowna = html.match(/<(article|main)[^>]*>([\s\S]*?)<\/\1>/i)?.[2] || html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html
  const rawText = glowna
    .replace(/<(script|style|nav|footer|header|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|apos);/g, (m) => ENCJE[m] ?? m)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()
  return { title, rawText }
}


/* ═══ MAGAZYN PROJEKTÓW ═══════════════════════════════════════════
   Kontrakt 1:1 z `utils/api.js`. Dane w jednym pliku JSON obok
   projektu (`.notatnik-dane.json`, w .gitignore) — przetrwają
   przeładowanie i restart serwera. Na produkcji to samo API stoi na
   bazie; front się nie zmienia. */

interface Projekt {
  id: string
  name: string
  created_at: string
  sources: any[]
  selected: string[]
  chat: any[]
  notes: any[]
  canvas: any
  studio: any[]
}

const PLIK = path.resolve(process.cwd(), '.notatnik-dane.json')
let baza: Record<string, Projekt> | null = null

function wczytaj(): Record<string, Projekt> {
  if (baza) return baza
  try { baza = JSON.parse(fs.readFileSync(PLIK, 'utf-8')) } catch { baza = {} }
  return baza!
}

let czasomierz: NodeJS.Timeout | null = null
function zapisz() {
  // Zapis z opóźnieniem: czat i zaznaczenia potrafią przyjść kilka razy na sekundę.
  if (czasomierz) clearTimeout(czasomierz)
  czasomierz = setTimeout(() => {
    try { fs.writeFileSync(PLIK, JSON.stringify(baza)) } catch (e) { console.error('[notatnik] zapis:', e) }
  }, 300)
}

/** Projekt tworzy się sam przy pierwszym zapisie — np. domyślny „Mój Notatnik". */
function projekt(id: string, nazwa = 'Mój Notatnik'): Projekt {
  const b = wczytaj()
  b[id] ??= { id, name: nazwa, created_at: new Date().toISOString(), sources: [], selected: [], chat: [], notes: [], canvas: null, studio: [] }
  return b[id]
}

function cialo(req: IncomingMessage): Promise<any> {
  return new Promise((ok, zle) => {
    let d = ''
    req.setEncoding('utf8')
    req.on('data', (c) => { d += c })
    req.on('end', () => { try { ok(d ? JSON.parse(d) : undefined) } catch (e) { zle(e) } })
    req.on('error', zle)
  })
}

async function obslugaProjektow(req: IncomingMessage, res: ServerResponse, sciezka: string): Promise<boolean> {
  const m = sciezka.match(/^\/api\/projects(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?\/?$/)
  if (!m) return false
  const [, pid, zasob, sid] = m.map((x) => (x ? decodeURIComponent(x) : x)) as (string | undefined)[]
  const metoda = req.method || 'GET'
  const b = wczytaj()

  // /api/projects
  if (!pid) {
    if (metoda === 'GET') {
      json(res, 200, Object.values(b).map((p) => ({ id: p.id, name: p.name, created_at: p.created_at, source_count: p.sources.length })))
      return true
    }
    if (metoda === 'POST') {
      const { id, name } = (await cialo(req)) || {}
      const p = projekt(id || crypto.randomUUID(), name || 'Nowy notatnik')
      zapisz(); json(res, 201, { id: p.id, name: p.name, created_at: p.created_at, source_count: 0 })
      return true
    }
  }

  // /api/projects/:id
  if (pid && !zasob) {
    if (metoda === 'PATCH') { const { name } = (await cialo(req)) || {}; projekt(pid).name = name ?? projekt(pid).name; zapisz(); json(res, 200, { ok: true }); return true }
    if (metoda === 'DELETE') { delete b[pid]; zapisz(); res.statusCode = 204; res.end(); return true }
    if (metoda === 'GET') { const p = projekt(pid); json(res, 200, { id: p.id, name: p.name, created_at: p.created_at, source_count: p.sources.length }); return true }
  }

  // /api/projects/:id/sources[/:sid]
  if (pid && zasob === 'sources') {
    const p = projekt(pid)
    if (!sid && metoda === 'GET') { json(res, 200, p.sources); return true }
    if (!sid && metoda === 'POST') { const src = await cialo(req); p.sources = p.sources.filter((x) => x.id !== src.id).concat(src); zapisz(); json(res, 201, src); return true }
    if (sid && metoda === 'PUT') { const dane = await cialo(req); p.sources = p.sources.map((x) => (x.id === sid ? { ...x, ...dane } : x)); zapisz(); json(res, 200, { ok: true }); return true }
    if (sid && metoda === 'DELETE') { p.sources = p.sources.filter((x) => x.id !== sid); p.selected = p.selected.filter((x) => x !== sid); zapisz(); res.statusCode = 204; res.end(); return true }
  }

  // /api/projects/:id/(selected|chat|notes|canvas|studio) — cały zasób naraz
  const POLA: Record<string, keyof Projekt> = { selected: 'selected', chat: 'chat', notes: 'notes', canvas: 'canvas', studio: 'studio' }
  if (pid && zasob && POLA[zasob] && !sid) {
    const p = projekt(pid) as any
    const pole = POLA[zasob]
    if (metoda === 'GET') { json(res, 200, p[pole] ?? (pole === 'canvas' ? null : [])); return true }
    if (metoda === 'PUT') { p[pole] = await cialo(req); zapisz(); json(res, 200, { ok: true }); return true }
    if (metoda === 'DELETE') { p[pole] = pole === 'canvas' ? null : []; zapisz(); res.statusCode = 204; res.end(); return true }
  }

  // eksport DOCX nie istnieje w podglądzie — mówimy to wprost zamiast 404
  if (pid && zasob === 'export') { json(res, 501, { error: 'Eksport DOCX działa dopiero na serwerze produkcyjnym.' }); return true }

  json(res, 404, { error: `Nieznana ścieżka: ${metoda} ${sciezka}` })
  return true
}

const obsluga: Connect.NextHandleFunction = async (req, res, next) => {
  const url = new URL(req.url || '', 'http://localhost')
  try {
    if (url.pathname.startsWith('/api/projects') && await obslugaProjektow(req, res, url.pathname)) return
    if (url.pathname === '/api/transcript') {
      const id = idFilmu(url.searchParams.get('videoUrl') || '')
      if (!id) return json(res, 400, { error: 'Nieprawidłowy adres filmu YouTube.' })
      return json(res, 200, await pobierzTranskrypcje(id))
    }
    if (url.pathname === '/api/scrape') {
      const cel = url.searchParams.get('url') || ''
      if (!/^https?:\/\//i.test(cel)) return json(res, 400, { error: 'Nieprawidłowy adres strony.' })
      return json(res, 200, await pobierzStrone(cel))
    }
  } catch (e: any) {
    return json(res, 502, { error: e?.message || 'Nie udało się pobrać źródła.' })
  }
  next()
}

export function notatnikProxy(): Plugin {
  return {
    name: 'next-scribe-proxy',
    configureServer(server) { server.middlewares.use(obsluga) },
    configurePreviewServer(server) { server.middlewares.use(obsluga) },
  }
}
