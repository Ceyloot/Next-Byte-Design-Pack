/* ═══════════════════════════════════════════════════════════════
   UKŁAD KAFELKOWY NEXT SCRIBE — język ekranów platformy

   ┌ pasek platformy ┐┌ nazwa notatnika ···· [Czat | Źródła | Studio] ···· akcje ┐
   │ ‹ Next Scribe   ││                                                         │
   │ + Nowy notatnik ││            treść zakładki (kafelki / czat)              │
   │ notatniki…      ││                                                         │
   │ źródła…         ││            pływające pole na dole                       │
   └─────────────────┘└─────────────────────────────────────────────────────────┘
   Tło przezroczyste — prześwituje siatka platformy, jak na Tablicach
   i w Studio Video. Żadnych dodatkowych kart dookoła treści.
   ═══════════════════════════════════════════════════════════════ */

import React from 'react';
import { MessageSquare, Library, Wand2 } from 'lucide-react';
import { Zakladki } from './kafelki';

export default function UkladKafelkowy({
  pasek, zakladka, onZakladka, liczbaZrodel = 0, liczbaDokumentow = 0,
  nazwa, podpis, akcje, nakladka, czat, zrodla, studio,
}) {
  const pozycje = [
    { id: 'czat', etykieta: 'Czat', ikona: MessageSquare },
    { id: 'zrodla', etykieta: 'Źródła', ikona: Library, licznik: liczbaZrodel },
    { id: 'studio', etykieta: 'Studio', ikona: Wand2, licznik: liczbaDokumentow },
  ];

  return (
    <div className="flex h-full min-h-0 w-full">
      {pasek}
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 pb-4 pt-5">
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">{nazwa}</h1>
            {podpis && <p className="truncate text-[12.5px] text-foreground/50">{podpis}</p>}
          </div>
          <Zakladki pozycje={pozycje} aktywna={zakladka} onZmien={onZakladka} />
          <div className="flex items-center justify-end gap-1.5">{akcje}</div>
        </header>
        {nakladka}
        <div className="relative min-h-0 flex-1">
          {zakladka === 'czat' && czat}
          {zakladka === 'zrodla' && zrodla}
          {zakladka === 'studio' && studio}
        </div>
      </main>
    </div>
  );
}
