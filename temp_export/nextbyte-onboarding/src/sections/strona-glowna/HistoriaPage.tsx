import React from 'react'
import { Section, GlowButton, GhostButton, FadeIn, SecRule } from '@/sections/wspolne/shared'
import { cn } from '@/lib/utils'
import { HeroWispyBackground } from '@/grafiki/tlo-hero'
import type { HomePage as HomePageId } from './types'

/* ═══════════════════════════════════════════════════════════════
   HISTORIA — treść 1:1 z nextbyte.space/historia, forma ghost:
   bez paneli, kafelków, plakietek i kropek. Porządek niosą
   typografia i cienkie linie. Założyciele: zdjęcie naprzeciw opisu.
   ═══════════════════════════════════════════════════════════════ */

const AKTY = [
  {
    akt: 'Akt I // Iskra',
    t: 'Bariera, która zaczęła wszystko',
    p: [
      'Michał od nastoletnich lat budował automatyzacje dla firm i upraszczał ludziom technologię, której się obawiali. Z czasem został twórcą technologicznym z kilkusettysięcznym zasięgiem, ale najważniejszą pracę wykonywał poza kamerą: budował innym twórcom całe biznesy.',
      'W którymś momencie napotkał ograniczenie, które okazało się początkiem wszystkiego: doba ma 24 godziny. Mógł prowadzić jednego twórcę naraz, a zainteresowanie rosło szybciej, niż był w stanie obsłużyć.',
    ],
    cytat: '„A gdyby zamknąć to wszystko w jednym miejscu i udostępnić tysiącom?"',
  },
  {
    akt: 'Akt II // Dwa światy',
    t: 'Ten sam problem z drugiej perspektywy',
    p: [
      'Do historii dołączył Kajetan, przedsiębiorca z branży budowlanej, którego Michał znał ze współpracy. Inny świat, ta sama obserwacja: AI jest dziś czarną skrzynką dla większości firm, a nie musi być.',
      'Wniósł stronę firmową i zasadę, której zespół trzyma się do dziś: buduje się to, co rozwiązuje realny problem, a nie to, co dobrze wygląda na slajdzie.',
    ],
    cytat: '„Dwóch założycieli, dwa światy, jedna obserwacja."',
  },
  {
    akt: 'Akt III // Trzeci element',
    t: 'Most do dużego biznesu',
    p: [
      'Brakowało kogoś, kto połączy to z dużym biznesem i nada całości sens szerszy niż sam produkt. W tym miejscu dołączyła Łucja: z dwudziestu lat w Digital i e-commerce, z sal Akademii Leona Koźmińskiego, ze szkoleń dla zespołów dużych marek.',
      'Weszła w to z jednego powodu: jest przekonana, że rewolucja AI ma sens tylko wtedy, gdy służy ludziom. Wielkie modele pozostają silnikiem. Kierunek wyznaczają ludzie, którzy z nich korzystają.',
    ],
    cytat: '„Tak z bariery jednego człowieka powstało przedsięwzięcie, które miało ją usunąć dla wszystkich."',
  },
]

type Zalozyciel = {
  segment: string
  rola: string
  imie: string
  foto: string | null
  motto: string
  p: string[]
  tagi: string[]
}

const ZALOZYCIELE: Zalozyciel[] = [
  {
    segment: 'Twórcy',
    rola: 'Pomysłodawca, Founder',
    imie: 'Michał',
    foto: '/assets/zalozyciele/michal.jpg',
    motto: '„Wyprzedza rynek w adopcji AI, bo żyje tym na co dzień, kosztem snu."',
    p: [
      'Od nastoletnich lat budował automatyzacje dla firm i upraszczał technologię ludziom, którzy się jej obawiali. Z czasem został twórcą technologicznym z kilkusettysięcznym zasięgiem na TikToku, Instagramie i YouTube, tłumacząc AI tak, jak nie robił tego nikt z „technicznej" strony.',
      'Równolegle stawiał innym twórcom całe biznesy: strony sprzedażowe, automatyzacje, zaplecze pod kursy, od trenerów keto po coachów. Z realnym skutkiem: ich marki zarabiały na poważną skalę. Ale doba ma 24 godziny. Mógł obsłużyć jednego twórcę naraz.',
      'NextByte to jego odpowiedź na ten limit: zamknąć metodologię w narzędziu i oddać tysiącom twórców naraz.',
    ],
    tagi: ['B2P', 'Twórcy', 'Adopcja AI', 'Społeczność'],
  },
  {
    segment: 'Firmy',
    rola: 'Współzałożyciel, strona firmowa',
    imie: 'Kajetan',
    foto: '/assets/zalozyciele/kajetan.jpg',
    motto: '„Wdrożył AI u siebie i wie, co działa w praktyce, nie na slajdzie."',
    p: [
      'Prowadzi wiodącą w swoim regionie firmę usługową w branży budowlanej. Zbudował ją od zera i z sukcesem skaluje. Nie jest entuzjastą technologii, który przeczytał o AI. To przedsiębiorca, który zna z pierwszej ręki, gdzie zacina się mała i średnia firma, bo sam taką prowadzi.',
      'Wniósł do projektu rzecz, której nie da się odtworzyć kodem: wdrożył AI we własnej, realnie działającej firmie. Z tego doświadczenia powstała warstwa B2B i Plug&Go, budowana pod konkretny problem MSP, a nie pod kolejne demo.',
      'Aktywny członek klubu biznesowego, zna potrzeby przedsiębiorców w regionie z rozmów, nie z badań. To dzięki niemu NextByte mówi do firm językiem konkretu, nie obietnic.',
    ],
    tagi: ['B2B', 'MSP', 'Plug&Go', 'Pipeline'],
  },
  {
    segment: 'Most do dużego biznesu',
    rola: 'Współzałożycielka, strona ludzka i rynkowa',
    imie: 'Łucja',
    foto: null,
    motto: '„Głos człowieka w projekcie. Rewolucja AI ma sens tylko wtedy, gdy służy ludziom."',
    p: [
      'Ekspertka Digital i e-commerce z 20-letnim doświadczeniem, w tym po stronie korporacji i dużego biznesu. Wykłada transformację cyfrową i AI na Akademii Leona Koźmińskiego, szkoli zespoły dużych marek, m.in. Decathlon i Kompanii Piwowarskiej.',
      'Wnosi profesjonalizację: przełożenie produktu na język rynku, strategii i wdrożeń. I drugą rzecz, dla tej marki kluczową: jest w projekcie głosem człowieka.',
      'Skoro technologią rządzą dziś wielkie koncerny, warto budować miejsce, w którym decydujący głos ma społeczność, a nie roadmapa zarządu odpowiadającego przed inwestorami. Wielkie modele zostają silnikiem. Kierunek wyznaczają ludzie, którzy z nich korzystają.',
    ],
    tagi: ['Korporacje', 'Edukacja', 'Strategia', 'Misja'],
  },
]

const WARTOSCI = [
  { t: 'AI musi służyć ludziom', d: 'Rewolucja AI ma sens tylko wtedy, gdy służy ich pracy i życiu, a nie odwrotnie. Głos człowieka jest w tym projekcie kierunkiem, nie dodatkiem.' },
  { t: 'Konkret, nie obietnica', d: 'Budujemy to, co rozwiązuje realny problem małej i średniej firmy, a nie kolejną funkcję pod demo. Zasada wniesiona z prawdziwego wdrożenia AI w działającej firmie.' },
  { t: 'Społeczność wyznacza kierunek', d: 'Wielkie modele zostają silnikiem. Kierunek wyznaczają ludzie, którzy z nich korzystają, a nie roadmapa zarządu odpowiadającego przed inwestorami.' },
]

const linia = 'border-t border-foreground/[0.1]'
const akapit = 'font-sans text-[15px] font-light leading-relaxed text-foreground/65'
const h2 = 'font-heading text-[clamp(26px,3.2vw,38px)] font-light tracking-[-1.2px] text-foreground'

function Modul({ z, i }: { z: Zalozyciel; i: number }) {
  const zdjecieLewo = i % 2 === 0
  // Zdjęcie, które się nie wczyta, zastępujemy inicjałem zamiast pustej ramki.
  const [fotoBlad, setFotoBlad] = React.useState(false)
  const foto = fotoBlad ? null : z.foto
  return (
    <FadeIn className="py-12 sm:py-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <div className={cn('lg:col-span-5', !zdjecieLewo && 'lg:order-2')}>
          <div className="mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-lg bg-foreground/[0.03]">
            {foto ? (
              <img src={foto} alt={z.imie} loading="lazy" onError={() => setFotoBlad(true)} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-heading text-[140px] font-extralight text-foreground/15">{z.imie[0]}</span>
              </div>
            )}
          </div>
        </div>

        <div className={cn('lg:col-span-7', !zdjecieLewo && 'lg:order-1')}>
          <SecRule label={`0${i + 1} // ${z.segment}`} />
          <h3 className="font-heading text-[clamp(40px,5vw,64px)] font-light leading-none tracking-[-2px] text-foreground">
            {z.imie}
          </h3>
          <p className="mt-2 font-sans text-[14px] text-foreground/45">{z.rola}</p>
          <p className="mt-6 font-heading text-[clamp(18px,1.8vw,22px)] font-light italic leading-snug text-primary">
            {z.motto}
          </p>
          <div className={cn(linia, 'mt-8 space-y-4 pt-6')}>
            {z.p.map((t, k) => <p key={k} className={akapit}>{t}</p>)}
          </div>
          <div className={cn(linia, 'mt-6 flex flex-wrap gap-x-6 gap-y-2 pt-5')}>
            {z.tagi.map(t => (
              <span key={t} className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

export function HistoriaPage({ onNavigate }: { onNavigate: (p: HomePageId) => void }) {
  return (
    <div className="flex w-full flex-col">

      {/* ══════════ HERO ══════════
          To samo tło z falami co na stronie głównej, podciągnięte pod
          sticky navbar (ujemny margines o jego wysokość). */}
      <div className="relative overflow-hidden" style={{ marginTop: 'calc(var(--nb-navbar-h, 49px) * -1)' }}>
        <HeroWispyBackground />
        <section className="relative px-4 pb-16 pt-[130px] sm:px-6 sm:pb-24 sm:pt-[160px] lg:px-8">
          <FadeIn className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/75">Historia // Początek</div>
            <h1 className="font-heading text-[clamp(40px,6vw,76px)] font-light leading-[1.02] tracking-[-2.5px] text-foreground">
              Od pytania <br />
              <span className="font-normal text-primary drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]">do platformy.</span>
            </h1>
            <p className="mt-6 max-w-xl font-sans text-[16px] font-light leading-relaxed text-foreground/70">
              Wszystko zaczęło się od jednej bariery i jednego pytania. Dziś odpowiadają na nie trzy osoby z trzech różnych światów: twórców, firm i korporacji.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <GlowButton size="lg" onClick={() => onNavigate('rejestracja')}>Dołącz do NextByte</GlowButton>
              <GhostButton size="lg" onClick={() => onNavigate('cennik')}>Zobacz plany</GhostButton>
            </div>
          </FadeIn>
        </section>
      </div>

      {/* ══════════ MANIFEST ══════════
          Ma być dobrze widoczny: pełnej szerokości pas między liniami
          w kolorze akcentu, poświata pośrodku, duży tekst na osi. */}
      <Section className="pb-16 sm:pb-24">
        <FadeIn>
          <figure className="relative overflow-hidden border-y border-primary/25 px-2 py-16 text-center sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[120px]"
            />
            <div aria-hidden className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div aria-hidden className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative mx-auto max-w-4xl">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Nasz manifest</div>
              <blockquote className="mt-8 font-heading text-[clamp(28px,4.2vw,52px)] font-light leading-[1.15] tracking-[-1.4px] text-foreground">
                AI nie powinno być kolejną zakładką w przeglądarce. Powinno być{' '}
                <span className="font-normal text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.45)]">niewidoczną warstwą</span>, dzięki której każda praca idzie prościej.
              </blockquote>
              <figcaption className="mt-10 flex items-center justify-center gap-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/55">
                <span aria-hidden className="h-px w-10 bg-primary/60" />
                Zespół NextByte
                <span aria-hidden className="h-px w-10 bg-primary/60" />
              </figcaption>
            </div>
          </figure>
        </FadeIn>
      </Section>

      {/* ══════════ GENEZA ══════════ */}
      <Section className="pb-16 sm:pb-24">
        <FadeIn>
          <SecRule label="Rozdział 01 // Geneza" />
          <h2 className={cn(h2, 'mb-8')}>
            Trzy drogi, <span className="font-normal text-primary">jeden wniosek.</span>
          </h2>
          {/* Szachownica czytana z góry na dół: numer i nazwa aktu stoją na
              zmianę po lewej i prawej, naprzeciw nich opowieść. Środkiem
              biegnie cienka oś. */}
          <div className="relative mt-14">
            <div aria-hidden className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-primary/40 via-foreground/[0.1] to-transparent md:block" />
            {AKTY.map((a, i) => {
              const numerLewo = i % 2 === 0
              return (
                <FadeIn key={a.t} className="relative grid grid-cols-1 gap-6 py-10 md:grid-cols-2 md:gap-0 md:py-16">
                  {/* numer i nazwa aktu */}
                  <div className={cn('md:px-14', numerLewo ? 'md:text-right' : 'md:order-2')}>
                    <div className="font-heading text-[clamp(64px,8vw,112px)] font-extralight leading-none tracking-[-4px] text-primary">
                      0{i + 1}
                    </div>
                    <div className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/45">
                      {a.akt}
                    </div>
                  </div>

                  {/* opowieść */}
                  <div className={cn('md:px-14 md:pt-3', !numerLewo && 'md:order-1 md:text-right')}>
                    <h3 className="font-heading text-[clamp(22px,2.2vw,28px)] font-medium leading-snug tracking-[-0.5px] text-foreground">{a.t}</h3>
                    <div className="mt-4 space-y-4">
                      {a.p.map((t, k) => <p key={k} className={akapit}>{t}</p>)}
                    </div>
                    <p className="mt-6 font-heading text-[clamp(18px,1.8vw,22px)] font-light italic leading-snug text-foreground/90">
                      {a.cytat}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      </Section>

      {/* ══════════ ZAŁOŻYCIELE ══════════ */}
      <Section className="pb-8">
        <FadeIn>
          <SecRule label="Założyciele // Trio" />
          <h2 className={h2}>
            Ludzie <span className="font-normal text-primary">za projektem.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-[15px] font-light leading-relaxed text-foreground/60">
            Trzy perspektywy, trzy segmenty, jedna obserwacja: AI jest dziś czarną skrzynką dla większości ludzi. A nie musi nią być.
          </p>
        </FadeIn>
        <div className="divide-y divide-foreground/[0.08]">
          {ZALOZYCIELE.map((z, i) => <Modul key={z.imie} z={z} i={i} />)}
        </div>
      </Section>

      {/* ══════════ WARTOŚCI ══════════ */}
      <Section className="py-16 sm:py-24">
        <FadeIn>
          <SecRule label="Filozofia // Wartości" />
          <h2 className={cn(h2, 'mb-8')}>
            W co <span className="font-normal text-primary">wierzymy.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-10">
            {WARTOSCI.map((w, i) => (
              <div key={w.t} className={cn(linia, 'py-6')}>
                <span className="font-mono text-[12px] text-primary">0{i + 1}</span>
                <div className="mt-3 font-heading text-[20px] font-medium tracking-[-0.3px] text-foreground">{w.t}</div>
                <p className="mt-2 font-sans text-[14.5px] font-light leading-relaxed text-foreground/60">{w.d}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-heading text-[clamp(18px,2.4vw,26px)] font-light leading-[1.45] tracking-[-0.3px] text-foreground/70">
            NextByte nie jest kolejnym czatem AI. Jest tym, czym jest, bo zbudowali go ludzie, którzy{' '}
            <span className="font-normal text-primary">nie zgodzili się, by ktokolwiek został z tyłu</span>.
          </p>
        </FadeIn>
      </Section>

      {/* ══════════ CTA ══════════ */}
      <Section className="py-16 sm:py-24">
        <FadeIn className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="font-heading text-[clamp(28px,5vw,48px)] font-light leading-[1.08] tracking-[-2px] text-foreground">
            Przestań gonić AI. <br />
            <span className="font-normal text-primary">Zacznij go używać.</span>
          </h2>
          <p className="mt-4 max-w-lg font-sans text-[15px] font-light leading-relaxed text-foreground/60">
            Dołącz do NextByte i dostawaj konkret zamiast szumu. Bez spamu, bez korpo-gadki. Możesz wyjść jednym kliknięciem.
          </p>
          <div className="mt-8">
            <GlowButton onClick={() => onNavigate('rejestracja')}>Dołączam do NextByte</GlowButton>
          </div>
        </FadeIn>
      </Section>
    </div>
  )
}
