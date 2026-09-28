import type React from 'react'
import { useId } from 'react'

/**
 * Pinezka w stylu map — biała kropla z ostrym końcem, numer w środku.
 *
 * Prosta i uniwersalna: bez kolorów, bo kolor na zdjęciu gryzie się z tym,
 * co pod nim leży, a dziesięć barw i tak trzeba było odczytywać z legendy.
 * Pineski rozróżnia numer, chronioną — kłódka. Biel z miękkim cieniem
 * czyta się na każdym zdjęciu, jasnym i ciemnym.
 *
 * Punktem pineski jest ostry koniec kropli — obiekt pod nim zostaje
 * widoczny, a numer siedzi wyżej. Układ: (0, 0) to koniec kropli, czyli
 * dokładnie `pozycjaPineski`. Wymiary w pikselach ekranu; rodzic skaluje
 * całość odwrotnością zoomu, więc pinezka ma stały rozmiar.
 */

/** Koniec kropli w układzie SVG — tu przypada punkt pineski. */
const SZPIC = { x: 18, y: 40 }
/** Środek główki kropli w układzie SVG. */
const GLOWKA = { x: 18, y: 16, r: 13 }
const SZER = 36
const WYS = 44

/**
 * Kształt kropli w proporcjach markera map: okrągła główka, boki
 * wybrzuszone na wysokości środka i krótki ogon (koniec ~1,85 promienia
 * pod środkiem). Pierwsza wersja z dłuższym ogonem wyglądała jak stożek.
 */
const KROPLA =
  'M 18 3 C 10.81 3 5 8.81 5 16 C 5 25.75 18 40 18 40 C 18 40 31 25.75 31 16 C 31 8.81 25.19 3 18 3 Z'

/** Przesunięcie środka główki względem końca — do kotwiczenia dymków i karty. */
export const PRZESUNIECIE_LEBKA = { x: GLOWKA.x - SZPIC.x, y: GLOWKA.y - SZPIC.y }

/** Grafit na numer i obrys — stały, bo pinezka leży na zdjęciu, nie na motywie. */
const GRAFIT = '#1f2937'

interface Props {
  numer: number
  chroniona?: boolean
  aktywna?: boolean
  najechana?: boolean
  przeciagana?: boolean
  analizowana?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function ZnacznikPineski({
  numer,
  chroniona,
  aktywna,
  najechana,
  przeciagana,
  analizowana,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const id = useId().replace(/:/g, '')

  // Kropla rośnie od końca — punkt, w który wbito pineskę, się nie rusza.
  const skala = przeciagana ? 1.16 : aktywna ? 1.12 : najechana ? 1.06 : 1

  return (
    <div
      onPointerDown={onPointerDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: 'absolute', left: -SZPIC.x, top: -SZPIC.y, width: SZER, height: WYS, pointerEvents: 'none' }}
    >
      {/* Fala wokół końca przy zaznaczeniu — pokazuje dokładny punkt */}
      {aktywna && (
        <span
          className="nb-pinezka-fala"
          style={{
            position: 'absolute',
            left: SZPIC.x - 9,
            top: SZPIC.y - 9,
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.35)',
          }}
        />
      )}

      <svg
        width={SZER}
        height={WYS}
        viewBox={`0 0 ${SZER} ${WYS}`}
        className="nb-pinezka-wbicie"
        style={{ overflow: 'visible', transformOrigin: `${SZPIC.x}px ${SZPIC.y}px` }}
        aria-label={chroniona ? `Pineska ${numer} — obszar chroniony` : `Pineska ${numer}`}
        role="img"
      >
        <defs>
          <filter id={`cien-${id}`} x="-60%" y="-40%" width="220%" height="200%">
            <feDropShadow
              dx="0"
              dy={przeciagana ? 5 : 1.5}
              stdDeviation={przeciagana ? 3.5 : 1.6}
              floodColor="#000000"
              floodOpacity={przeciagana ? 0.3 : 0.38}
            />
          </filter>
        </defs>

        {/* Ślad na podłożu pod końcem — pinezka stoi, nie wisi */}
        <ellipse cx={SZPIC.x} cy={SZPIC.y + 0.5} rx={przeciagana ? 7 : 5} ry={przeciagana ? 2.2 : 1.6} fill="rgba(0,0,0,0.3)" />

        <g
          style={{
            transform: `scale(${skala})`,
            transformOrigin: `${SZPIC.x}px ${SZPIC.y}px`,
            transition: 'transform 160ms cubic-bezier(.3,1.4,.5,1)',
          }}
        >
          {/* Wybrana pinezka jest odwrócona — grafit z białym numerem.
              Sam ciemny obrys ginął na ciemnych zdjęciach. */}
          <path
            d={KROPLA}
            fill={aktywna ? GRAFIT : '#ffffff'}
            stroke={aktywna ? '#ffffff' : 'rgba(0,0,0,0.22)'}
            strokeWidth={aktywna ? 1.5 : 1}
            filter={`url(#cien-${id})`}
          />

          {chroniona ? (
            // Kłódka zamiast numeru — „nie ruszaj” czytelne w sekundę
            <g stroke={aktywna ? '#ffffff' : GRAFIT} strokeWidth={1.9} fill="none" strokeLinecap="round">
              <path d={`M ${GLOWKA.x - 3.2} ${GLOWKA.y - 0.5} v -2.4 a 3.2 3.2 0 0 1 6.4 0 v 2.4`} />
              <rect
                x={GLOWKA.x - 5}
                y={GLOWKA.y - 0.5}
                width={10}
                height={7.5}
                rx={1.8}
                fill={aktywna ? '#ffffff' : GRAFIT}
                stroke="none"
              />
            </g>
          ) : (
            <text
              x={GLOWKA.x}
              y={GLOWKA.y + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={numer > 9 ? 11.5 : 13.5}
              fontWeight={800}
              fill={aktywna ? '#ffffff' : GRAFIT}
              style={{ fontFamily: 'inherit', userSelect: 'none' }}
            >
              {numer}
            </text>
          )}

          {/* Rozpoznawanie w toku — obracający się pierścień wokół główki */}
          {analizowana && (
            <circle
              cx={GLOWKA.x}
              cy={GLOWKA.y}
              r={GLOWKA.r + 3.5}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2}
              strokeDasharray="6 5"
              strokeLinecap="round"
              filter={`url(#cien-${id})`}
              className="nb-pinezka-obrot"
              style={{ transformOrigin: `${GLOWKA.x}px ${GLOWKA.y}px` }}
            />
          )}
        </g>

        {/* Pole trafienia — cała kropla z zapasem, żeby łatwo ją chwycić */}
        <path
          d={KROPLA}
          fill="transparent"
          stroke="transparent"
          strokeWidth={8}
          style={{ pointerEvents: 'auto', cursor: przeciagana ? 'grabbing' : 'grab' }}
        />
      </svg>
    </div>
  )
}

/**
 * Mała pinezka — do list, chipów i karty.
 *
 * Ta sama biała kropla co na płótnie, żeby w czacie i w karcie pineska
 * wyglądała jak ta wbita w zdjęcie. Obrys jest mocniejszy niż na płótnie,
 * bo tu kropla leży na jasnym szkle panelu, nie na zdjęciu.
 */
export function LebekPinezki({
  numer,
  chroniona,
  rozmiar = 20,
}: {
  numer?: number
  chroniona?: boolean
  rozmiar?: number
}) {
  return (
    <svg width={rozmiar * (24 / 28)} height={rozmiar} viewBox="0 0 24 28" className="shrink-0" aria-hidden="true">
      <path
        d="M 12 1.5 C 7.03 1.5 3 5.53 3 10.5 C 3 17.25 12 27 12 27 C 12 27 21 17.25 21 10.5 C 21 5.53 16.97 1.5 12 1.5 Z"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1.2}
      />
      {chroniona ? (
        <g stroke={GRAFIT} strokeWidth={1.8} fill="none" strokeLinecap="round">
          <path d="M 9.6 10.6 v -2 a 2.4 2.4 0 0 1 4.8 0 v 2" />
          <rect x="8.2" y="10.4" width="7.6" height="5.8" rx="1.4" fill={GRAFIT} stroke="none" />
        </g>
      ) : (
        numer !== undefined && (
          <text
            x="12"
            y="11"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={numer > 9 ? 9 : 11}
            fontWeight={800}
            fill={GRAFIT}
            style={{ fontFamily: 'inherit' }}
          >
            {numer}
          </text>
        )
      )}
    </svg>
  )
}

/** Animacje pinezki — wstawiane raz, przy płótnie. */
export const STYL_PINEZKI = `
@keyframes nb-pinezka-wbicie {
  0%   { transform: translateY(-22px); opacity: 0 }
  60%  { transform: translateY(2px); opacity: 1 }
  100% { transform: translateY(0) }
}
@keyframes nb-pinezka-fala {
  0%   { transform: scale(0.6); opacity: 0.9 }
  100% { transform: scale(2.4); opacity: 0 }
}
@keyframes nb-pinezka-obrot { to { transform: rotate(360deg) } }
.nb-pinezka-wbicie { animation: nb-pinezka-wbicie 360ms cubic-bezier(.3,1.5,.5,1) both }
.nb-pinezka-fala { animation: nb-pinezka-fala 1.6s ease-out infinite }
.nb-pinezka-obrot { animation: nb-pinezka-obrot 1.4s linear infinite }
@media (prefers-reduced-motion: reduce) {
  .nb-pinezka-wbicie, .nb-pinezka-fala, .nb-pinezka-obrot { animation: none }
}
`
