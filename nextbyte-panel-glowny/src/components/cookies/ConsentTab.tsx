import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { CookieCategory, CookieConsentSettings } from '@/types/cookies';

interface ConsentTabProps {
  settings: CookieConsentSettings;
  /** Kategorie z bazy — lista pod opisem mówi to samo, co przełączniki w „Szczegółach". */
  categories: CookieCategory[];
}

/**
 * Zakładka „Zgody" to sama treść — decyzje stoją w stopce okna
 * (`CookieConsentPopup`), więc tu nie ma przycisków. Opis idzie z bazy
 * (`cookie_consent_settings`, edytowalny w Zarządzie).
 */
export const ConsentTab: React.FC<ConsentTabProps> = ({ settings, categories }) => (
  <div className="space-y-3">
    <p className="text-[14px] leading-relaxed text-card-foreground/90">
      {settings.main_description}
    </p>
    {categories.length > 0 && (
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
        {categories.map((k) => (
          <li key={k.id} className="flex items-center gap-2">
            <span className={k.is_required ? 'h-1.5 w-1.5 rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-foreground/30'} />
            {k.name}{k.is_required ? ' — zawsze' : ''}
          </li>
        ))}
      </ul>
    )}
    {settings.privacy_policy_link && (
      <a
        href={settings.privacy_policy_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[13px] text-primary underline-offset-4 hover:underline"
      >
        Polityka prywatności
        <ExternalLink className="h-3 w-3" />
      </a>
    )}
  </div>
);
