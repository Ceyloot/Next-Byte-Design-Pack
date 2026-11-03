/**
 * ══════════════════════════════════════════════════════════════════════════
 *  ZNAKI DOSTAWCÓW MODELI — 09.09.2026
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Michał: „fajnie jak byś tutaj utworzył grafiki tych modeli zamiast ikon,
 * to jak by ich loga".
 *
 * DLACZEGO TO NIE JEST KOSMETYKA. Lista modeli miała dotąd ikony z biblioteki:
 * korona przy Ultrze, korona przy Opusie, iskierka przy Pro, rakieta przy Groku.
 * Dwie korony w jednej liście to nie jest znak rozpoznawczy, tylko ozdoba —
 * a przy wyborze modelu człowiek szuka wzrokiem DOSTAWCY („gdzie tu jest ten
 * od OpenAI"), nie nastroju ikony. Ta sama uwaga stoi już w bibliotece przy
 * propsie `monogram`: „korona, błyskawica i iskierka nie mówią NIC o modelu".
 * Monogram był krokiem w tę stronę; znak dostawcy jest krokiem docelowym.
 *
 * ZASADY, KTÓRE TU OBOWIĄZUJĄ:
 *
 * 1. `currentColor`, nigdy barwa marki. Znaki żyją w dziewięciu motywach
 *    platformy i w dwóch stanach wiersza (wybrany / nie). Wbita barwa marki
 *    znaczyłaby, że w połowie motywów logo albo znika w tle, albo krzyczy
 *    mocniej niż nazwa modelu. Kolor bierze się z kafelka, tak jak przy
 *    monogramie.
 *
 * 2. `viewBox="0 0 24 24"` u wszystkich i podobna masa optyczna. Znaki stoją
 *    jeden pod drugim w kolumnie — gdyby jeden wypełniał kwadrat, a drugi
 *    ledwie połowę, lista wyglądałaby na źle złożoną, a nie na zróżnicowaną.
 *
 * 3. To są UPROSZCZENIA znaków firmowych do 20 pikseli, nie kopie plików
 *    źródłowych. Przy tej wielkości i tak nie widać detalu; liczy się
 *    sylwetka, po której oko rozpoznaje dostawcę.
 *
 * 4. `aria-hidden`, bo nazwa dostawcy stoi obok słowami. Znak jest skrótem
 *    dla oka, nie jedynym nośnikiem informacji — czytnik ekranu dostaje
 *    „Claude 5 · Anthropic", nie „grafika".
 */
import React from 'react';

type Props = { className?: string };

const wspolne = (className?: string) => ({
  viewBox: '0 0 24 24',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true as const,
  focusable: 'false' as const,
  className,
});

/**
 * NextByte — DRABINKA POZIOMU, nie logo.
 *
 * SAMOKRYTYKA, 09.09.2026. Pierwsza wersja dawała Szybkiemu, Pro i Ultrze ten
 * sam znak NextByte (głowę robota z `nextbyte-logo.png`). Na zrzucie widać
 * było natychmiast, że to ten sam błąd, który tą zmianą naprawiałem: wcześniej
 * lista miała dwie identyczne korony, teraz miała trzy identyczne roboty.
 * Znak, który powtarza się w każdym wierszu sekcji, nie odróżnia niczego —
 * powtarza informację, którą niesie już nagłówek „NEXTBYTE" nad nimi.
 *
 * Marka jest więc powiedziana raz, w nagłówku. Wewnątrz sekcji znak mówi to,
 * czego nagłówek nie powie: KTÓRY to poziom. Trzy słupki rosnące w prawo,
 * z zapalonymi tyloma, ile wynosi poziom — czyta się bez legendy i bez
 * czytania opisu, a to jest dokładnie cel Michała: „aby ktoś nie musiał się
 * zastanawiać nad modelem".
 *
 * Wygaszone słupki mają `opacity`, nie inny kolor: kafelek zmienia barwę przy
 * wyborze i podświetleniu, więc druga barwa musiałaby gonić tamtą w dziewięciu
 * motywach. Przezroczystość idzie za `currentColor` sama.
 */
const DrabinkaNextByte: React.FC<Props & { poziom: 1 | 2 | 3 }> = ({ className, poziom }) => (
  <svg {...wspolne(className)} fill="currentColor">
    {[
      { x: 3.4, y: 14.4, h: 6.2 },
      { x: 9.9, y: 10.2, h: 10.4 },
      { x: 16.4, y: 5.4, h: 15.2 },
    ].map((s, i) => (
      <rect
        key={s.x}
        x={s.x}
        y={s.y}
        width="4.2"
        height={s.h}
        rx="1.6"
        opacity={i < poziom ? 1 : 0.22}
      />
    ))}
  </svg>
);

export const ZnakSzybki: React.FC<Props> = (p) => <DrabinkaNextByte {...p} poziom={1} />;
export const ZnakPro: React.FC<Props> = (p) => <DrabinkaNextByte {...p} poziom={2} />;
export const ZnakUltra: React.FC<Props> = (p) => <DrabinkaNextByte {...p} poziom={3} />;

/**
 * Google Gemini — czteroramienna iskra o wklęsłych bokach.
 *
 * Wklęsłość jest tu całym znakiem: gwiazda o PROSTYCH bokach to zwykły romb
 * i wygląda jak dowolny „sparkle" z biblioteki ikon. Krzywe Béziera ciągną
 * boki do środka, więc ramiona wychodzą smukłe i ostre.
 */
export const ZnakGemini: React.FC<Props> = ({ className }) => (
  <svg {...wspolne(className)} fill="currentColor">
    <path d="M12 1.6c.42 5.4 4.6 9.58 10 10v.8c-5.4.42-9.58 4.6-10 10h-.8c-.42-5.4-4.6-9.58-10-10v-.8c5.4-.42 9.58-4.6 10-10h.8Z" />
  </svg>
);

/**
 * OpenAI — węzeł z trzech splecionych pętli.
 *
 * SAMOKRYTYKA, 09.09.2026. Pierwsza wersja rysowała sześciokąt z trzema
 * szprychami do środka i na zrzucie wyglądała jak SZEŚCIAN — ikona paczki,
 * pudełka albo modułu. Stała w wierszu obok gwiazdy Claude'a i iksa xAI,
 * czyli obok dwóch znaków, które rozpoznaje się od razu, i psuła cały rząd.
 *
 * Znak OpenAI to nie sześciokąt, tylko WĘZEŁ: pętle przechodzące jedna przez
 * drugą wokół wspólnego środka. Trzy owalne pętle obrócone co 60° dają tę samą
 * sylwetkę — sześciolistną rozetę z pustym środkiem — a przy dwudziestu
 * pikselach to jest dokładnie to, co widać z oryginału.
 *
 * Kontur, nie wypełnienie: wypełniona rozeta zlewa się w plamę, a to właśnie
 * prześwity między pętlami niosą rozpoznawalność.
 */
export const ZnakOpenAI: React.FC<Props> = ({ className }) => (
  <svg
    {...wspolne(className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {[0, 60, 120].map((kat) => (
      <rect
        key={kat}
        x="2.4"
        y="7.6"
        width="19.2"
        height="8.8"
        rx="4.4"
        transform={`rotate(${kat} 12 12)`}
      />
    ))}
  </svg>
);

/**
 * Anthropic / Claude — gwiazda o jedenastu zwężających się promieniach.
 *
 * Geometria policzona, nie rysowana ręcznie: promienie rozstawione co
 * 360/11 stopnia, każdy zwęża się od 2.0 do 10.4 jednostki. Ręczne
 * ustawianie jedenastu ramion kończy się gwiazdą, która „gdzieś się
 * przekrzywia", a przy 20 px widać to natychmiast — nierówny rytm ramion
 * czyta się jako niechlujstwo, zanim człowiek zdąży rozpoznać znak.
 */
export const ZnakAnthropic: React.FC<Props> = ({ className }) => (
  <svg {...wspolne(className)} fill="currentColor">
    <path d="M11.35 10.11L11.45 1.61L12.55 1.61L12.65 10.11ZM12.47 10.06L17.15 2.97L18.08 3.56L13.57 10.76ZM13.45 10.62L21.22 7.18L21.68 8.19L13.99 11.81ZM13.96 11.62L22.36 12.93L22.20 14.02L13.78 12.91ZM13.86 12.75L20.21 18.38L19.49 19.22L13.00 13.73ZM13.16 13.63L15.46 21.81L14.40 22.12L11.91 14.00ZM12.09 14.00L9.60 22.12L8.54 21.81L10.84 13.63ZM11.00 13.73L4.51 19.22L3.79 18.38L10.14 12.75ZM10.22 12.91L1.80 14.02L1.64 12.93L10.04 11.62ZM10.01 11.81L2.32 8.19L2.78 7.18L10.55 10.62ZM10.43 10.76L5.92 3.56L6.85 2.97L11.53 10.06Z" />
  </svg>
);

/**
 * xAI — przecięty iks.
 *
 * Znak nie jest literą „X": jedna belka biegnie całą przekątną, a druga jest
 * PRZERWANA w miejscu przecięcia, na dwa osobne kliny. Narysowanie zwykłego
 * iksa dałoby symbol zamknięcia okna, a nie znak dostawcy.
 */
export const ZnakXai: React.FC<Props> = ({ className }) => (
  <svg {...wspolne(className)} fill="currentColor">
    <path d="M3.4 2.2h5.1L21 21.8h-5.1Z" />
    <path d="M15.6 2.2h5L15.3 10.2 12.8 6.3Z" />
    <path d="M3 21.8h5L11.2 16.8 8.7 12.9Z" />
  </svg>
);

/**
 * Lokalny AI — to jedyny wiersz BEZ znaku firmowego, bo za nim nie stoi
 * żaden dostawca: model chodzi na maszynie użytkownika. Zamiast logo idzie
 * obudowa serwera z diodą. Zostawienie tu ikony z biblioteki, gdy wszystkie
 * sąsiednie wiersze mają znaki, wyglądałoby na niedokończoną robotę.
 */
export const ZnakLokalny: React.FC<Props> = ({ className }) => (
  <svg {...wspolne(className)} fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.6 3.4h14.8A2.2 2.2 0 0 1 21.6 5.6v3.6a2.2 2.2 0 0 1-2.2 2.2H4.6a2.2 2.2 0 0 1-2.2-2.2V5.6a2.2 2.2 0 0 1 2.2-2.2Zm2 2.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm3.6.35a.75.75 0 0 0 0 1.5h7.2a.75.75 0 0 0 0-1.5h-7.2Z"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.6 12.8h14.8a2.2 2.2 0 0 1 2.2 2.2v3.6a2.2 2.2 0 0 1-2.2 2.2H4.6a2.2 2.2 0 0 1-2.2-2.2V15a2.2 2.2 0 0 1 2.2-2.2Zm2 2.7a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm3.6.35a.75.75 0 0 0 0 1.5h7.2a.75.75 0 0 0 0-1.5h-7.2Z"
    />
  </svg>
);

/**
 * Mapa `speed_mode` → znak. Trzyma się tu, a nie w `ModelSelector`, bo znak
 * musi być TEN SAM w liście i na zwiniętym przycisku — inaczej wybierasz
 * model oznaczony gwiazdą, a w pasku widzisz co innego. Ta sama zasada, którą
 * biblioteka opisuje przy monogramie.
 *
 * Sekcja NEXTBYTE dostaje DRABINKĘ POZIOMU (Szybki/Pro/Ultra), sekcja INNE
 * MODELE — znaki dostawców. Podział wynika z tego, co w danej sekcji jest
 * pytaniem: przy trybach NextByte człowiek wybiera MOC, przy innych modelach
 * wybiera DOSTAWCĘ. Znak ma odpowiadać na to pytanie, które człowiek właśnie
 * zadaje, a nie powtarzać to, co już wie z nagłówka.
 */
export const ZNAKI_MODELI: Record<string, React.FC<Props>> = {
  local: ZnakLokalny,
  fast: ZnakSzybki,
  pro: ZnakPro,
  ultra: ZnakUltra,
  gemini31pro: ZnakGemini,
  grok43: ZnakXai,
  gpt54: ZnakOpenAI,
  sonnet46: ZnakAnthropic,
  opus47: ZnakAnthropic,
};
