import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteAsset } from '@/hooks/useSiteAsset';
import { getAssetUrl } from '@/lib/assetUtils';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  structuredData?: object;
  /**
   * Zakaz indeksowania tej strony. Do 03.09.2026 komponent w ogóle tego nie
   * umiał, więc strony, których nie chcemy w wyszukiwarce — 404, ukryte
   * wejścia, ekrany jednorazowe — nie miały jak tego powiedzieć.
   */
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'NextByte — Wdrożenia AI i automatyzacja biznesu',
  description = 'Polska agencja specjalizująca się w pełnych wdrożeniach sztucznej inteligencji i automatyzacji biznesu.',
  keywords = 'wdrożenia AI, automatyzacja biznesu, agencja AI, cyfrowa transformacja, sztuczna inteligencja, automatyzacja procesów, NextByte, BPA',
  image,
  url,
  type = 'website',
  article,
  structuredData,
  noindex,
}) => {
  const { data: ogImage } = useSiteAsset('og_image');

  /*
    Statyczny `description` z `index.html` to siatka bezpieczeństwa na wypadek,
    gdyby React nie wstał (08.09.2026: Google pokazał w opisie strony nasz
    ekran awarii, bo opisu nie było wcale). Gdy Helmet już działa, ten
    statyczny znacznik trzeba zdjąć — inaczej wracają DWA opisy z audytu
    03.09. Helmet stempluje swoje znaczniki atrybutem `data-rh`, więc
    usuwamy wyłącznie te bez stempla.
  */
  useEffect(() => {
    /*
      Statyczny opis znika DOPIERO, gdy Helmet wstawi własny. Helmet dopisuje
      znaczniki w klatce animacji, a w ukrytej karcie (zmierzone 08.09 na
      produkcji: `document.hidden === true`, `[data-rh]` = 0 po 16 s) ta klatka
      nie nadchodzi — usuwanie „od razu" zostawiało stronę bez żadnego opisu.
    */
    const head = document.head;
    const sprzatnij = () => {
      if (!head.querySelector('meta[name="description"][data-rh]')) return false;
      head.querySelectorAll('meta[name="description"]:not([data-rh])').forEach((el) => el.remove());
      return true;
    };
    if (sprzatnij()) return;
    const obserwator = new MutationObserver(() => {
      if (sprzatnij()) obserwator.disconnect();
    });
    obserwator.observe(head, { childList: true });
    return () => obserwator.disconnect();
  }, []);
  // Always use preferred domain (nextbyte.space) for canonical URL
  const canonicalUrl = url || (typeof window !== 'undefined' 
    ? `https://nextbyte.space${window.location.pathname}${window.location.search}${window.location.hash}`
    : 'https://nextbyte.space');
  
  // Use custom og_image if available, otherwise fallback to provided image or default
  const ogImageUrl = ogImage ? getAssetUrl(ogImage) : image;
  const finalImageUrl = ogImageUrl || '/nextbyte-logo.png';
  const fullImageUrl = finalImageUrl.startsWith('http') 
    ? finalImageUrl 
    : `${canonicalUrl.split('/').slice(0, 3).join('/')}${finalImageUrl}`;

  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NextByte',
    description: 'Polska agencja specjalizująca się w pełnych wdrożeniach AI i automatyzacji biznesu',
    url: 'https://nextbyte.space',
    logo: fullImageUrl,
    sameAs: [
      'https://twitter.com/nextbyte_ai',
    ],
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NextByte',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    url: 'https://nextbyte.space',
    description: 'Polska agencja AI oferująca pełne wdrożenia sztucznej inteligencji, automatyzację procesów biznesowych (BPA) oraz platformę produktywności z asystentem AI, chatbotem i narzędziami do zarządzania.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PLN',
      lowPrice: '0',
      highPrice: '799',
      offerCount: 3,
    },
    featureList: 'Asystent AI, Chat AI, Agenci AI, Studio Zdjęć AI, Kalendarz, Zadania Kanban, Notatki, Społeczność, Akademia',
    inLanguage: ['pl', 'en'],
  };

  /*
    `robots` z JEDNEGO miejsca. Domyślna wartość stała wcześniej na sztywno
    w `index.html`, więc strona prosząca o `noindex` (ukryte wejście, 404)
    wysyłała ją OBOK statycznego `index, follow` — dwa sprzeczne polecenia
    w jednym nagłówku.

    UWAGA: wewnątrz `<Helmet>` NIE WOLNO wstawiać komentarzy JSX ani niczego
    poza prostymi znacznikami. Komentarz wstawiony tam 03.09.2026 wyciszył
    CAŁY komponent — /cennik został bez tytułu, opisu i adresu kanonicznego,
    a `tsc` tego nie widzi, bo to błąd czasu wykonania w bibliotece.
  */
  return (
    <Helmet>
      <title>{title}</title>
      <meta
        name="robots"
        content={noindex
          ? 'noindex, nofollow'
          : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="NextByte Logo" />
      <meta property="og:site_name" content="NextByte" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@nextbyte_ai" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Article specific tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareAppSchema)}
      </script>
    </Helmet>
  );
};
