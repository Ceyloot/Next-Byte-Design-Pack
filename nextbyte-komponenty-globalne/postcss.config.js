import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import wyspaMotywu from './scripts/postcss-wyspa-motywu.mjs'

export default {
  plugins: [
    tailwindcss(),
    /* Łatki jasnego motywu omijają ciemną wyspę motywu (okno Asystenta nad
       ciemnym płótnem przy jasnej platformie) — uzasadnienie w pliku dodatku. */
    wyspaMotywu(),
    autoprefixer(),
  ],
}
