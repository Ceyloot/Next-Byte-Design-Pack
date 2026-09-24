import React from 'react';

/* Nagłówek panelu: tytuł 15 px po lewej, gołe ikony 28 px po prawej,
   świetlna kreska pod spodem — ta sama, co pod nagłówkiem paska bocznego. */
export function NaglowekPanelu({ tytul, akcje }) {
  return (
    <div className="relative z-10 flex h-12 shrink-0 items-center justify-between px-4">
      <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{tytul}</h2>
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

