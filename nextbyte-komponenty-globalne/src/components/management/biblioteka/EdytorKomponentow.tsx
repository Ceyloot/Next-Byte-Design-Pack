import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2, RotateCcw, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tile, TileHeader, TileRow, TilePill } from '@/components/ui/tile';
import { ThemeScope } from './ThemeScope';
import type { MotywPodgladu } from './useMotywyPodgladu';
import {
  useTokenyKomponentow, zJednostka, bezJednostki,
  type Komponent,
} from './useTokenyKomponentow';

/**
 * EDYTOR KOMPONENTÓW GLOBALNYCH.
 *
 * Jedyne miejsce w Bibliotece, które ZAPISUJE do bazy. Reszta zakładek jest
 * tylko do odczytu i taka zostaje.
 *
 * Trzy zasady, na których to stoi:
 *
 * 1. SANDBOX NIGDY NIE IDZIE NA `document`. Wartości z suwaków lądują jako
 *    styl na kontenerze podglądu. Gdyby szły na `documentElement`, każde
 *    ruszenie suwaka przemalowałoby cały Panel Zarządu i nie dałoby się
 *    porównać „co testuję" z „co już działa".
 *
 * 2. PODGLĄD PRZECHODZI PRZEZ MOTYW. Token to struktura, kolor to motyw —
 *    trzeba widzieć jedno na drugim, bo alfa 0.38 wygląda inaczej na Luxury
 *    niż na Śnieżnym. Dlatego przełącznik motywu siedzi obok suwaków.
 *
 * 3. PUBLIKACJA JEST OSOBNYM PRZYCISKIEM. „Zapisz" rusza tylko sandbox i nikt
 *    poza administratorem tego nie widzi. Dopiero „Publikuj" wypuszcza to na
 *    platformę. Bez tego rozdziału każda próba byłaby wdrożeniem.
 */

const KOMPONENTY: { id: Komponent; label: string; opis: string }[] = [
  { id: 'przycisk-styl-1', label: 'Styl 1 — szkło', opis: 'Główne wezwanie. Jedno na blok.' },
  { id: 'przycisk-styl-2', label: 'Styl 2 — obwódka', opis: 'Wszystko pozostałe.' },
  { id: 'kontener-kafelek', label: 'Kontener A — kafelek', opis: 'Nosi treść i akcje. Cień i refleks.' },
  { id: 'kontener-wiersz', label: 'Kontener B — wiersz', opis: 'Element listy wewnątrz kafelka.' },
];

/** Próbka — te same dwa style, na których stoi cała platforma. */
const Probka: React.FC = () => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="glass" size="sm">Zapisz zmiany</Button>
      <Button variant="obwodka" size="sm">Szczegóły</Button>
      <Button variant="usun" size="sm">Usuń</Button>
      <Button variant="cichy" size="sm">Odłóż</Button>
    </div>
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="glass" size="sm" disabled>Wyłączony</Button>
      <Button variant="obwodka" size="sm" disabled>Wyłączony</Button>
    </div>
    <Tile intencja="akcent" zwarty>
      <TileHeader ikona={Check} tytul="Kafelek z akcjami" podtytul="żeby widzieć przycisk w kontekście" />
      <TileRow>Wiersz listy wewnątrz kafelka</TileRow>
    </Tile>
  </div>
);

export const EdytorKomponentow: React.FC<{ motywy: MotywPodgladu[] }> = ({ motywy }) => {
  const [komponent, setKomponent] = useState<Komponent>('przycisk-styl-1');
  const [motywId, setMotywId] = useState<string | null>(null);
  const [komunikat, setKomunikat] = useState<string | null>(null);

  const {
    sandbox, live, rozne, ladowanie, blad, zapisywanie,
    ustaw, zapiszSandbox, publikuj, przywrocZLive, stylPodgladu,
  } = useTokenyKomponentow(komponent);

  const motyw = motywy.find(m => m.id === motywId) ?? motywy[0];

  const pokaz = (t: string) => { setKomunikat(t); window.setTimeout(() => setKomunikat(null), 4000); };

  if (ladowanie) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (blad && sandbox.length === 0) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
        <p className="font-semibold">Nie udało się wczytać tokenów.</p>
        <p className="mt-1 opacity-90">{blad}</p>
        <p className="mt-2 text-xs opacity-75">
          Jeśli tabela <code>component_tokens</code> jeszcze nie istnieje, platforma korzysta
          z wartości zapasowych z <code>index.css</code> i wygląda dokładnie jak dotąd.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* wybór komponentu */}
      <div className="flex flex-wrap gap-2">
        {KOMPONENTY.map(k => (
          <button
            key={k.id}
            onClick={() => setKomponent(k.id)}
            className={`h-9 rounded-xl border px-3.5 text-xs font-medium transition-colors ${
              komponent === k.id
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-card-foreground'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* ── SUWAKI ── */}
        <div className="nb-szklo nb-szklo-plynne rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">
                {KOMPONENTY.find(k => k.id === komponent)?.label}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {KOMPONENTY.find(k => k.id === komponent)?.opis}
              </p>
            </div>
            {rozne.length > 0 && (
              <TilePill intencja="akcent">{rozne.length} do publikacji</TilePill>
            )}
          </div>

          <div className="space-y-4">
            {sandbox.map(t => {
              const liczba = bezJednostki(t.wartosc);
              const opublikowana = live[t.token];
              const zmieniony = opublikowana !== undefined && opublikowana !== t.wartosc;
              return (
                <div key={t.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <label className="text-xs font-medium text-card-foreground">
                      {t.etykieta}
                      {zmieniony && (
                        <span className="ml-2 font-mono text-[10px] text-primary">
                          {opublikowana} → {t.wartosc}
                        </span>
                      )}
                    </label>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {t.wartosc}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={t.min_wartosc ?? 0}
                    max={t.max_wartosc ?? 1}
                    step={t.krok ?? 0.01}
                    value={Number.isFinite(liczba) ? liczba : 0}
                    onChange={e => ustaw(t.token, zJednostka(Number(e.target.value), t.jednostka))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-primary"
                    aria-label={t.etykieta}
                  />
                  {t.opis && (
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground/80">{t.opis}</p>
                  )}
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/50">{t.token}</p>
                </div>
              );
            })}
          </div>

          {/* akcje */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              variant="obwodka" size="sm" disabled={zapisywanie}
              onClick={async () => { if (await zapiszSandbox()) pokaz('Sandbox zapisany. Użytkownicy nic nie widzą.'); }}
            >
              {zapisywanie ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Zapisz sandbox
            </Button>
            <Button
              variant="glass" size="sm" disabled={zapisywanie || rozne.length === 0}
              onClick={async () => { if (await publikuj()) pokaz('Opublikowane. Cała platforma korzysta.'); }}
            >
              <Upload className="h-3.5 w-3.5" />
              Publikuj{rozne.length > 0 ? ` (${rozne.length})` : ''}
            </Button>
            <Button
              variant="cichy" size="sm" disabled={zapisywanie}
              onClick={async () => { if (await przywrocZLive()) pokaz('Sandbox cofnięty do opublikowanych wartości.'); }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Przywróć z live
            </Button>
          </div>

          {komunikat && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-primary">
              <Check className="h-3.5 w-3.5" />{komunikat}
            </p>
          )}
          {blad && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{blad}
            </p>
          )}
        </div>

        {/* ── PODGLĄD ── */}
        <div className="space-y-3">
          <select
            value={motyw?.id ?? ''}
            onChange={e => setMotywId(e.target.value)}
            className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs text-card-foreground"
            aria-label="Motyw podglądu"
          >
            {motywy.map(m => (
              <option key={m.id} value={m.id}>{m.displayName}</option>
            ))}
          </select>

          {motyw && (
            <ThemeScope motyw={motyw} className="rounded-2xl border border-border p-4">
              {/* Tokeny sandboxa TYLKO tutaj — nie na documentElement. */}
              <div style={stylPodgladu}>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  sandbox · {motyw.displayName}
                </p>
                <Probka />
              </div>
            </ThemeScope>
          )}

          {motyw && (
            <ThemeScope motyw={motyw} className="rounded-2xl border border-border/60 p-4 opacity-90">
              {/* Bez stylu — czyli wartości opublikowane albo zapasowe. */}
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                obecnie na platformie
              </p>
              <Probka />
            </ThemeScope>
          )}
        </div>
      </div>
    </div>
  );
};
