import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

mkdirSync(join(root, 'dist'), { recursive: true })

// `@tailwind base/components/utilities` są tu wycięte — konsument ma własne
// dyrektywy @tailwind w swoim pliku CSS. Ten plik dostarcza tylko: import
// fontów, 14 motywów jako [data-theme="..."] i klasy glassmorphizmu.
// Konsument musi zaimportować ten plik PRZED swoimi dyrektywami @tailwind —
// @import w CSS musi poprzedzać wszystkie inne reguły.
const src = readFileSync(join(root, 'src/styles/index.css'), 'utf8')
const stripped = src
  .split('\n')
  .filter((line) => !/^@tailwind (base|components|utilities);\s*$/.test(line.trim()))
  .join('\n')

writeFileSync(join(root, 'dist/styles.css'), stripped)

console.log('✓ dist/styles.css skopiowany (bez dyrektyw @tailwind)')
