/**
 * Kontrola polecenia przed wysyłką.
 *
 * Pomysł z `higgsfield-prompt-template`: zanim prompt pójdzie do modelu,
 * przejdź po macierzy znanych konfliktów i pokaż je autorowi. Generacja
 * kosztuje i trwa, a większość nieudanych wyników bierze się z polecenia,
 * które było sprzeczne albo niepełne już w momencie kliknięcia.
 *
 * Każda reguła powstała z konkretnej przegranej generacji, nie z teorii.
 */
import { etykietaPineski, type Pineska, type Warstwa } from './typy'
import type { Intencja } from './tryby-edycji'

export interface Uwaga {
  id: string
  /** `blokada` wstrzymuje generację, `ostrzezenie` tylko informuje */
  waga: 'blokada' | 'ostrzezenie'
  tresc: string
}

/** Słowa, którymi wskazuje się palcem — bez pineski nie mają desygnatu. */
const WSKAZUJACE = /\b(to|tego|tym|tę|te|ten|ta|tutaj|tu|tam|stąd|stamtąd|taki|taką|takie)\b/g

export function sprawdzPolecenie(
  tekst: string,
  pineski: Pineska[],
  warstwy: Warstwa[],
  intencja: Intencja,
): Uwaga[] {
  const uwagi: Uwaga[] = []
  const t = tekst.trim().toLowerCase()
  if (!t) return uwagi

  const wskazan = (t.match(WSKAZUJACE) ?? []).length
  const uchwyty = pineski.filter(p => !p.chroniona)

  // „przenieś to tutaj” bez pinesek nie znaczy nic: model nie wie, co jest
  // „tym”, a co „tutaj”. To najczęstsza przyczyna wyniku obok tematu.
  if (wskazan > 0 && uchwyty.length === 0) {
    uwagi.push({
      id: 'wskazanie-bez-pineski',
      waga: 'blokada',
      tresc: 'Polecenie wskazuje palcem („to”, „tutaj”), ale nie ma żadnej pineski. Ctrl+klik na zdjęciu wbija pineskę.',
    })
  } else if (wskazan >= 2 && uchwyty.length === 1) {
    uwagi.push({
      id: 'za-malo-pinesek',
      waga: 'ostrzezenie',
      tresc: 'Zdanie wskazuje dwie różne rzeczy, a pineska jest jedna. Drugie wskazanie model musi zgadnąć.',
    })
  }

  // Uchwyt bez nazwy trafia do polecenia jako „obiekt 1” — dla modelu to
  // tyle samo, co nic.
  const bezNazwy = uchwyty.filter(p => !(p.label ?? '').trim())
  if (bezNazwy.length > 0) {
    uwagi.push({
      id: 'pineska-bez-nazwy',
      waga: 'ostrzezenie',
      tresc:
        bezNazwy.length === 1
          ? 'Jedna pineska nie ma nazwy — do modelu pójdzie jako „obiekt”, czyli bez znaczenia.'
          : `${bezNazwy.length} pineski nie mają nazw — do modelu pójdą jako „obiekt”, czyli bez znaczenia.`,
    })
  }

  // Ta sama nazwa na dwóch pineskach. W prompcie je rozróżniamy numerem
  // zdjęcia, ale gdy siedzą na tym samym, zostaje dwuznaczność.
  const nazwy = uchwyty.map((p, i) => etykietaPineski(p, i + 1))
  const powtorki = nazwy.filter((n, i) => nazwy.indexOf(n) !== i)
  if (powtorki.length > 0) {
    const naTymSamym = uchwyty.some(a =>
      uchwyty.some(
        b =>
          a !== b &&
          a.layerId === b.layerId &&
          etykietaPineski(a, 1).toLowerCase() === etykietaPineski(b, 1).toLowerCase(),
      ),
    )
    uwagi.push({
      id: 'powtorzona-nazwa',
      waga: naTymSamym ? 'ostrzezenie' : 'ostrzezenie',
      tresc: naTymSamym
        ? `Dwie pineski na tym samym zdjęciu nazywają się „${powtorki[0]}”. Nadaj im różne nazwy, inaczej model zgaduje.`
        : `Nazwa „${powtorki[0]}” powtarza się na dwóch zdjęciach — w poleceniu rozróżniamy je numerem zdjęcia.`,
    })
  }

  // Tryby, które bez celu nie mają sensu.
  if ((intencja === 'przenies' || intencja === 'zamien') && uchwyty.length === 0) {
    uwagi.push({
      id: 'brak-celu',
      waga: 'blokada',
      tresc:
        intencja === 'przenies'
          ? 'Przeniesienie potrzebuje dwóch pinesek: co przenieść i dokąd.'
          : 'Podmiana potrzebuje pineski na elemencie, który ma zostać zastąpiony.',
    })
  }

  if (intencja === 'przenies' && uchwyty.length === 1) {
    uwagi.push({
      id: 'przenies-jedna-pineska',
      waga: 'ostrzezenie',
      tresc: 'Przy przenoszeniu wbij drugą pineskę w miejsce docelowe — inaczej model sam wybierze, dokąd.',
    })
  }

  // Materiał z drugiego zdjęcia bez pineski na nim: model nie wie, co stamtąd wziąć.
  const zdjeciaZPineskami = new Set(pineski.map(p => p.layerId))
  if (warstwy.length > 1 && zdjeciaZPineskami.size === 1 && /\b(taki|taką|takie|stamtąd|z drugiego)\b/.test(t)) {
    uwagi.push({
      id: 'material-bez-pineski',
      waga: 'ostrzezenie',
      tresc: 'Zdanie odsyła do drugiego zdjęcia, ale nie ma na nim pineski — samo zdjęcie nie pojedzie do modelu.',
    })
  }

  // Żądania zgodności pikselowej. Model generatywny przerysowuje cały kadr,
  // więc takiej obietnicy nie spełni — a jej obecność psuje resztę promptu.
  if (/piksel|pixel|1:1|identyczn|dok[łl]adnie (ten|to) sam/.test(t)) {
    uwagi.push({
      id: 'zgodnosc-pikselowa',
      waga: 'ostrzezenie',
      tresc:
        'Model przerysowuje cały kadr i nie zachowa pikseli. Jeśli fragment ma zostać nietknięty, ' +
        'oznacz go pineską „Nie ruszaj” zamiast prosić o zgodność co do piksela.',
    })
  }

  // Sprzeczność: „nic nie zmieniaj” przy trybie, który z definicji zmienia.
  if (/nic nie zmieniaj|niczego nie zmieniaj|zostaw wszystko/.test(t) && intencja !== 'popraw') {
    uwagi.push({
      id: 'sprzecznosc-zakresu',
      waga: 'ostrzezenie',
      tresc: 'Polecenie prosi jednocześnie o zmianę i o brak zmian. Doprecyzuj, co konkretnie ma zostać nietknięte.',
    })
  }

  // Bardzo krótkie polecenie przy trybie wymagającym opisu.
  if (t.split(/\s+/).length < 3 && intencja !== 'usun') {
    uwagi.push({
      id: 'za-krotkie',
      waga: 'ostrzezenie',
      tresc: 'Bardzo krótkie polecenie — im konkretniej opiszesz efekt, tym mniej model zgaduje.',
    })
  }

  return uwagi
}

/** Czy któraś uwaga wstrzymuje generację. */
export function czyBlokuje(uwagi: Uwaga[]): boolean {
  return uwagi.some(u => u.waga === 'blokada')
}
