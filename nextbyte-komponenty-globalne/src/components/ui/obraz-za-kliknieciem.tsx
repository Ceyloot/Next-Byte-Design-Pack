/**
 * ════════════════════════════════════════════════════════════════════════
 *  OBRAZ ZA KLIKNIĘCIEM — obraz z treści modelu spoza naszych hostów
 * ════════════════════════════════════════════════════════════════════════
 *
 * Odpowiedź modelu może zawierać obraz z dowolnego serwera, a jego adres
 * składa model — po wstrzyknięciu poleceń razem z danymi użytkownika.
 * Przeglądarka pobrałaby go bez pytania. Zamiast obrazu stoi przycisk
 * „Pokaż obraz z domena.pl” (STYL 2 biblioteki, te same klasy co przycisk
 * w HTML-u odpowiedzi — `KLASY_PRZYCISKU_OBRAZU`); żądanie idzie dopiero
 * po kliknięciu. Obrazy z listy (`dozwoloneObrazy.ts`) rysują się od razu.
 *
 * Trzy wejścia, jedno zachowanie:
 *   • `ObrazZaKliknieciem` — React (zwykły tekst odpowiedzi czatu),
 *   • `KOMPONENTY_MARKDOWNU_MODELU` — `components` dla `react-markdown`,
 *   • `odslonObrazModelu` — `onClick` kontenera z HTML-em po
 *     `sanitizeModelHtml` (przycisk w `dangerouslySetInnerHTML`).
 *
 * Tylko treść modelu. Obraz wpisany przez człowieka (notatka, e-book, kurs)
 * dalej rysuje się normalnie.
 */
import React, { useMemo, useState } from 'react';
import { Image as IkonaObrazu } from 'lucide-react';
import type { Components, ExtraProps } from 'react-markdown';
import {
  ATRYBUT_ADRESU_OBRAZU,
  ATRYBUT_OPISU_OBRAZU,
  KLASA_ZASTEPNIKA_OBRAZU,
  KLASY_ODSLONIETEGO_OBRAZU,
  KLASY_PRZYCISKU_OBRAZU,
  napisPrzyciskuObrazu,
  ocenObrazModelu,
} from '@/lib/chat-ai/dozwoloneObrazy';

const skrocAdres = (adres: string) => (adres.length > 300 ? `${adres.slice(0, 300)}…` : adres);

const domyslnyObraz = (url: string, alt: string) => (
  <img src={url} alt={alt} className={KLASY_ODSLONIETEGO_OBRAZU} referrerPolicy="no-referrer" />
);

export interface ObrazZaKliknieciemProps {
  url: string;
  alt?: string;
  /** Jak narysować obraz — z listy od razu, spoza listy po kliknięciu. Domyślnie `<img>`. */
  pokaz?: (url: string, alt: string) => React.ReactNode;
}

export function ObrazZaKliknieciem({ url, alt = '', pokaz = domyslnyObraz }: ObrazZaKliknieciemProps) {
  const ocena = useMemo(() => ocenObrazModelu(url), [url]);
  const [odsloniety, setOdsloniety] = useState<string | null>(null);

  if (ocena.dozwolony || odsloniety === url) return <>{pokaz(url, alt)}</>;
  // `javascript:`, `ftp:` albo adres nieczytelny — nie ma czego wczytywać.
  if (!ocena.domena) return alt ? <>{alt}</> : null;

  return (
    <button data-w-odczycie=""
      type="button"
      className={KLASY_PRZYCISKU_OBRAZU}
      title={skrocAdres(url)}
      onClick={(e) => {
        // Obraz bywa w linku — klik ma odsłonić obraz, nie otworzyć kartę.
        e.preventDefault();
        e.stopPropagation();
        setOdsloniety(url);
      }}
    >
      <IkonaObrazu aria-hidden="true" />
      <span className="truncate">{napisPrzyciskuObrazu(ocena.domena)}</span>
    </button>
  );
}

type PropsObrazuMarkdownu = JSX.IntrinsicElements['img'] & ExtraProps;

/** `img` dla `react-markdown` w widokach treści modelu. */
export function ObrazMarkdownuModelu({ node: _node, src, alt, ...reszta }: PropsObrazuMarkdownu) {
  return (
    <ObrazZaKliknieciem
      url={typeof src === 'string' ? src : ''}
      alt={alt ?? ''}
      pokaz={(u, a) => <img {...reszta} src={u} alt={a} referrerPolicy="no-referrer" />}
    />
  );
}

export const KOMPONENTY_MARKDOWNU_MODELU: Components = { img: ObrazMarkdownuModelu };

/**
 * `onClick` kontenera z HTML-em po `sanitizeModelHtml`: klik w „Pokaż obraz z …”
 * podmienia przycisk na obraz. Działa przez delegację Reacta, więc łapie
 * przyciski wstawione `dangerouslySetInnerHTML`.
 */
export function odslonObrazModelu(e: React.MouseEvent<HTMLElement>) {
  const cel = e.target as Element | null;
  const przycisk = cel?.closest?.(`.${KLASA_ZASTEPNIKA_OBRAZU}[${ATRYBUT_ADRESU_OBRAZU}]`);
  if (!przycisk || !e.currentTarget.contains(przycisk)) return;
  e.preventDefault();
  e.stopPropagation();

  const adres = przycisk.getAttribute(ATRYBUT_ADRESU_OBRAZU) || '';
  const opis = przycisk.getAttribute(ATRYBUT_OPISU_OBRAZU) || '';
  const img = document.createElement('img');
  img.alt = opis;
  img.className = KLASY_ODSLONIETEGO_OBRAZU;
  img.setAttribute('referrerpolicy', 'no-referrer');
  img.setAttribute('decoding', 'async');
  img.addEventListener('error', () => {
    const link = document.createElement('a');
    link.href = adres;
    link.target = '_blank';
    link.rel = 'noopener noreferrer nofollow';
    link.className = 'text-primary hover:underline break-all';
    link.textContent = 'Nie udało się wczytać obrazu';
    img.replaceWith(link);
  }, { once: true });
  img.src = adres;
  przycisk.replaceWith(img);
}
