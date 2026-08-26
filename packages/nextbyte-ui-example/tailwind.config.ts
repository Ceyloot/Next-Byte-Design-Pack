import type { Config } from 'tailwindcss'
import nextbytePreset from '@nextbyte/ui/tailwind-preset'

export default {
  presets: [nextbytePreset],
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextbyte/ui/dist/**/*.js',
  ],
} satisfies Config
