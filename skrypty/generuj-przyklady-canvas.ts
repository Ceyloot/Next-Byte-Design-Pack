/**
 * Generuje canvas/PRZYKLAD_PROMPTOW.md prosto z kodu (prompts/).
 * Uruchomienie: npx tsx skrypty/generuj-przyklady-canvas.ts
 */
import { writeFileSync } from 'node:fs'
import { zbudujPromptZdjeciaDocelowego, zbudujPromptOpisuSceny, skladajPrompt } from '../canvas/prompts'

const blok = (t: string) => '```text\n' + t + '\n```\n'

const pin2 = [
  { numer: 1, zdjecie: 2, nazwa: 'vase' },
  { numer: 2, zdjecie: 1, nazwa: 'lamp' },
]
const gemini1 = zbudujPromptZdjeciaDocelowego({
  liczbaZdjec: 2,
  pineski: pin2 as never,
  polecenie: 'zamień lampę na wazon z drugiego zdjęcia',
})
const gemini2 = zbudujPromptOpisuSceny({
  liczbaZdjec: 2,
  pineski: [
    { numer: 1, zdjecie: 1, nazwa: 'lamp' },
    { numer: 2, zdjecie: 2, nazwa: 'vase' },
  ] as never,
  polecenie: 'zamień lampę na wazon z drugiego zdjęcia',
})

const swap = skladajPrompt({
  polecenie: 'zamień lampę na wazon z drugiego zdjęcia',
  operacja: 'object_swap',
  pineski: [
    { numer: 1, rola: 'target', obraz: 1, x: 0.4, y: 0.6, nazwa: 'lamp', miejsce: 'on the wooden side table next to the sofa' },
    { numer: 2, rola: 'source', obraz: 2, x: 0.5, y: 0.5, nazwa: 'vase', opis: 'size: height ≈ 35 cm' },
  ],
  obrazy: [
    { numer: 1, rola: 'target' },
    { numer: 2, rola: 'donor' },
  ],
  skala: 'The vase is about 35 cm tall, roughly a third of the visible door height, so at this distance it is a small element on the table.',
  format: { szerokosc: 1200, wysokosc: 800 },
  maska: true,
})
const transfer = skladajPrompt({
  polecenie: 'przenieś chatkę bliżej',
  operacja: 'object_transfer',
  pineski: [
    { numer: 1, rola: 'source', obraz: 1, x: 0.5, y: 0.3, nazwa: 'cottage', miejsce: 'on the far meadow below the tree line' },
    { numer: 2, rola: 'target', obraz: 1, x: 0.5, y: 0.8, nazwa: 'path', miejsce: 'on the dirt path in the foreground' },
  ],
  obrazy: [{ numer: 1, rola: 'target' }],
  skala: 'The cottage is about 6 m wide; moved into the foreground it covers a larger share of the frame but keeps its real size.',
  format: { szerokosc: 1600, wysokosc: 1067 },
})

const md = `# Przykłady złożonych promptów

Wygenerowane z kodu (\`skrypty/generuj-przyklady-canvas.ts\`), więc pokazują dokładnie to, co dostają modele. Kolejność i uzasadnienia: [README](./README.md).

## 1. Prompt Gemini nr 1 — zdjęcie docelowe, operacja, role pinesek

Scenariusz: pineska 1 na wazonie (zdjęcie 2), pineska 2 na lampie (zdjęcie 1).

${blok(gemini1)}
## 2. Prompt Gemini nr 2 — tylko skala (kotwice i wymiary)

${blok(gemini2)}
## 3. Złożony prompt — \`object_swap\` (${swap.uzyteBricki.length} bricków, bricki ≈ ${Math.round((swap.sekcje.find((s) => s.klucz === 'bricks')?.tekst.length ?? 0) / 4)} tokenów)

${blok(swap.prompt)}
## 4. Złożony prompt — \`object_transfer\` w obrębie jednego zdjęcia (${transfer.uzyteBricki.length} bricków)

${blok(transfer.prompt)}`
writeFileSync(new URL('../canvas/PRZYKLAD_PROMPTOW.md', import.meta.url), md)
console.log('ok', md.length)
