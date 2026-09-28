import React from 'react';

/* Nagłówek karty jak w NotebookLM: 56 px, tytuł 16 px, linia pod spodem —
   ten sam co w kartach Źródła i Czat. */
export function NaglowekPanelu({ tytul, akcje }) {
  return (
    <div className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-foreground/[0.08] px-5">
      <h2 className="text-[16px] font-medium text-foreground">{tytul}</h2>
      <div className="flex items-center gap-1">{akcje}</div>
    </div>
  );
}

export function PrzyciskPanelu({ ikona: Ikona, etykieta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={etykieta}
      aria-label={etykieta}
      className="nb-ikona-kafel group flex h-7 w-7 items-center justify-center rounded-lg text-foreground/70 transition-all duration-300 hover:text-primary"
    >
      <Ikona className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

