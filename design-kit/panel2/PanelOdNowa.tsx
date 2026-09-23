import { useState } from 'react'
import {
  Bot, Brain, Calendar as IkonaKalendarz, Camera, CheckSquare, Cloud, FileText,
  GraduationCap, Image as IkonaObraz, LayoutGrid, MessageSquare, PenTool, Shield,
  ShoppingBag, Sparkles, Store, Terminal, Video,
} from 'lucide-react'
import '../styles/powierzchnie.css'
import { PasekBoczny, type PozycjaMenu } from './widgety/PasekBoczny'
import { PasAktywnosci } from './widgety/Aktywnosc'
import { Kreator } from './widgety/Kreator'
import { Skrzynka, type Sprawa } from './widgety/Skrzynka'
import { Kalendarz, NicNieCzeka } from './widgety/Prawa'
import { StopkaMiejsce, StopkaTylkoOdczyt, SzybkaPodroz, TwojeChmury, type Chmura, type Skrot } from './widgety/Dol'

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PANEL 2.0 — zbudowany od zera na drabinie powierzchni
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Uklad 1:1 z Panelem Glownym platformy. Rozni sie WYLACZNIE tym, jak powstaja
 * powierzchnie: zaden komponent nie wpisuje koloru, tylko wybiera poziom
 * drabiny. Patrz `../styles/powierzchnie.css` i `README.md` obok.
 *
 * DLACZEGO OD ZERA, A NIE POPRAWKI. Panel 1.0 mial ~390 regul przypietych do
 * `[data-theme="nextbyte-light"]`, neumorficzne cienie wpisane z reki i krycia
 * dobierane per kafelek. Kazda poprawka przesuwala problem gdzie indziej.
 * Zmierzone przypadki: kafelek z wypelnieniem 0.075 pod dzieckiem 0.82, obrys
 * kart na 4% kontrastu, wytloczenie 3px/-3px na pozycjach paska bocznego.
 * Tego nie dalo sie nastroic, bo to nie byly tokeny.
 *
 * SPRAWDZIAN DLA KAZDEGO NOWEGO KAFELKA: przelacz motyw. Jesli cokolwiek
 * trzeba poprawic pod konkretny motyw — kafelek jest zle zbudowany.
 */

const MENU: PozycjaMenu[] = [
  { id: 'panel', nazwa: 'Panel Glowny', ikona: LayoutGrid, grupa: 'Pulpit' },
  { id: 'asystent', nazwa: 'Personalny Asystent', ikona: Sparkles, grupa: 'AI' },
  { id: 'chat', nazwa: 'Chat AI', ikona: MessageSquare, grupa: 'AI' },
  { id: 'promptex', nazwa: 'PromptEx', ikona: PenTool, grupa: 'AI' },
  { id: 'pamiec', nazwa: 'Pamiec AI', ikona: Brain, grupa: 'AI' },
  { id: 'redzone', nazwa: 'Red Zone', ikona: Shield, grupa: 'AI' },
  { id: 'trend', nazwa: 'Trend', ikona: Bot, grupa: 'Przypiete moduly' },
  { id: 'studio-zdjec', nazwa: 'Studio Zdjec', ikona: Camera, grupa: 'Przypiete moduly' },
  { id: 'studio-video', nazwa: 'Studio Video', ikona: Video, grupa: 'Przypiete moduly' },
  { id: 'kalendarz', nazwa: 'Kalendarz', ikona: IkonaKalendarz, grupa: 'Praca' },
  { id: 'zadania', nazwa: 'Zadania', ikona: CheckSquare, grupa: 'Praca' },
  { id: 'notatki', nazwa: 'Notatki', ikona: FileText, grupa: 'Praca' },
  { id: 'tablice', nazwa: 'Tablice', ikona: PenTool, grupa: 'Praca' },
  { id: 'nextcloud', nazwa: 'NextCloud', ikona: Cloud, grupa: 'Praca' },
  { id: 'firma', nazwa: 'Firma', ikona: ShoppingBag, grupa: 'Praca' },
  { id: 'tworca', nazwa: 'Panel Tworcy', ikona: Sparkles, grupa: 'Spolecznosc' },
  { id: 'sklep', nazwa: 'Sklep', ikona: Store, grupa: 'Spolecznosc' },
  { id: 'akademia', nazwa: 'Akademia', ikona: GraduationCap, grupa: 'Spolecznosc' },
]

const SPRAWY: Sprawa[] = [
  { id: '1', tytul: 'INSTERUKCJA', zrodlo: 'Notatka', kiedy: 'niedz.', grupa: 'Ten tydzien', ikona: FileText },
  { id: '2', tytul: 'wygeneruj tego miniaturowego konia jedzacego zupke chinska', zrodlo: 'Studio Zdjec', kiedy: 'sob.', grupa: 'Ten tydzien', ikona: IkonaObraz },
  { id: '3', tytul: 'Roadmapa studio zdjec', zrodlo: 'Notatka', kiedy: '2 dni temu', grupa: 'Wczesniej', ikona: FileText },
  { id: '4', tytul: 'Jakie umiejetnosci potrzebuje aby bez problemu', zrodlo: 'Rozmowa', kiedy: '31 lip', grupa: 'Wczesniej', ikona: MessageSquare },
  { id: '5', tytul: 'zamien D na J', zrodlo: 'Studio Zdjec', kiedy: '30 lip', grupa: 'Wczesniej', ikona: Camera },
]

const CHMURY: Chmura[] = [
  { id: 'system', nazwa: 'System', akcent: 'Cloud', opis: 'Notatki, prompty, pamiec AI i studio zdjec — spiete z platforma, w jednym drzewie.', stopka: <StopkaTylkoOdczyt /> },
  { id: 'private', nazwa: 'Private', akcent: 'Cloud', opis: 'Twoje pliki i foldery. Zasady ustalasz sam — nic tu nie jest z gory ustalone.', stopka: <StopkaMiejsce uzyte="0,0 GB" cale="1,0 GB" plikow={2} /> },
]

const SKROTY: Skrot[] = [
  { id: 's1', nazwa: 'Co trzeba w kambipo zro...', ikona: MessageSquare },
  { id: 's2', nazwa: 'Kalendarz', ikona: IkonaKalendarz, odcien: 'ostrzezenie' },
  { id: 's3', nazwa: 'Studio Zdjec v2.1', ikona: Camera },
  { id: 's4', nazwa: 'Prompty AI Master', ikona: Terminal },
]

export function PanelOdNowa({ onWyjscie }: { onWyjscie?: () => void }) {
  const [sekcja, setSekcja] = useState('panel')

  return (
    <div className="p2 flex h-full min-h-0 w-full overflow-hidden">
      <PasekBoczny pozycje={MENU} aktywna={sekcja} onWybor={setSekcja} />

      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* WYMIARY 1:1 Z ORYGINALEM (`pages/Dashboard.tsx:250`):
            max-w-[1600px], gap-4, px-4 py-4 / md:px-6 md:py-5. */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-5">
          <PasAktywnosci saldo={0} dni={0} />

          {/* SIATKA 3-KOLUMNOWA, LEWA NA `col-span-2` — dokladnie jak oryginal
              (`Dashboard.tsx:337`). To daje stosunek 2:1, a nie 1.6:1:
              przy `grid-cols-3` z `gap-4` lewa kolumna to dwie trzecie SZEROKOSCI
              plus jedna przerwa, czego zapis `[2fr_1fr]` nie odtwarza. */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
              <Kreator koszt={2} posiadane={0} />
              {/* `min-h-[15rem]` z oryginalu — gwarantuje cztery pozycje,
                  inaczej lista zapada sie do samego naglowka. */}
              <Skrzynka sprawy={SPRAWY} className="min-h-[15rem]" />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <NicNieCzeka />
              <Kalendarz />
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TwojeChmury chmury={CHMURY} />
            </div>
            <SzybkaPodroz skroty={SKROTY} />
          </div>

          {onWyjscie && (
            <button type="button" onClick={onWyjscie} className="p2-kontrolka mx-auto mt-2 px-4 py-2 text-sm">
              Wroc do podgladu
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
