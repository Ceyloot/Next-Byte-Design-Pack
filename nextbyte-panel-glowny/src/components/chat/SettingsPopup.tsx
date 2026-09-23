import React, { useState, useEffect } from 'react';
import { NextByteModal } from '@/components/ui/nextbyte-modal';
import { Settings as SettingsIcon } from 'lucide-react';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatMarkdownToHtml } from '@/utils/markdownFormatter';
import { createSafeLessonHtml } from '@/utils/htmlSanitizer';
import { useCookieSettings } from '@/hooks/useCookieSettings';

interface SettingsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'cookies' | 'privacy' | 'terms';
}

export const SettingsPopup: React.FC<SettingsPopupProps> = ({ open, onOpenChange, defaultTab = 'cookies' }) => {
  const { settings, categories, isLoading } = useCookieSettings();

  // Build dynamic cookies content from database
  const cookiesContent = settings?.main_description || `
**Preferencje dotyczące plików cookie**

Ta aplikacja używa plików cookie w celu poprawy doświadczeń użytkownika i analizy ruchu.
  `;

  const privacyContent = `
### Polityka Prywatności

**§ 1. Zbieranie danych**

Zbieramy tylko dane niezbędne do świadczenia usług, w tym:
- Adres email
- Historia konwersacji
- Dane techniczne (adres IP, typ przeglądarki, system operacyjny)

**§ 2. Wykorzystanie danych**

Twoje dane są używane wyłącznie do:
- Świadczenia i personalizacji usług AI
- Ulepszania jakości naszych modeli
- Komunikacji z użytkownikami
- Analizy wykorzystania platformy

**§ 3. Bezpieczeństwo**

Stosujemy zaawansowane środki bezpieczeństwa:
- Szyfrowanie danych w tranzycie i w spoczynku
- Regularne audyty bezpieczeństwa
- Kontrola dostępu oparta na rolach
- Monitorowanie i wykrywanie zagrożeń

**§ 4. Udostępnianie danych**

Nie sprzedajemy Twoich danych osobowych stronom trzecim. Możemy udostępniać dane tylko:
- W celach prawnych (na żądanie organów)
- Za Twoją wyraźną zgodą
- Zaufanym dostawcom usług (z zachowaniem poufności)

**§ 5. Twoje prawa**

Przysługują Ci następujące prawa:
- Prawo dostępu do swoich danych
- Prawo do poprawiania danych
- Prawo do usunięcia danych ("prawo do bycia zapomnianym")
- Prawo do przenoszenia danych
- Prawo do sprzeciwu wobec przetwarzania
  `;

  const termsContent = `
### Regulamin Użytkowania

**§ 1. Postanowienia ogólne**

1.1. Niniejszy regulamin określa zasady korzystania z platformy AI dostępnej pod adresem nextbyte.space.

1.2. Korzystając z aplikacji, akceptujesz niniejszy regulamin w całości. Jeśli nie zgadzasz się z warunkami, nie korzystaj z aplikacji.

**§ 2. Definicje**

- **Platforma** – aplikacja webowa dostępna pod adresem nextbyte.space
- **Użytkownik** – osoba korzystająca z Platformy
- **Treści** – wszelkie dane, teksty, obrazy i inne materiały przesyłane lub generowane w Platformie
- **Usługa AI** – funkcjonalności sztucznej inteligencji oferowane przez Platformę

**§ 3. Korzystanie z usługi**

3.1. Zobowiązujesz się do legalnego i etycznego korzystania z aplikacji.

3.2. **Zabrania się:**
- Generowania treści nielegalnych, szkodliwych lub naruszających prawa innych osób
- Prób obejścia zabezpieczeń systemu
- Wykorzystywania platformy w celach spamowania
- Naruszania praw autorskich i własności intelektualnej
- Udostępniania dostępu do konta osobom trzecim

**§ 4. Własność intelektualna**

4.1. Wszystkie treści generowane przez AI są własnością użytkownika, który je wygenerował.

4.2. Platforma zachowuje prawo do wykorzystania anonimowych treści w celach:
- Ulepszania modeli AI
- Trenowania algorytmów
- Badań i rozwoju technologii

**§ 5. Odpowiedzialność**

5.1. AI może popełniać błędy i generować nieprecyzyjne informacje.

5.2. Użytkownik ponosi odpowiedzialność za:
- Weryfikację ważnych informacji przed ich wykorzystaniem
- Sposób wykorzystania wygenerowanych treści
- Konsekwencje decyzji podjętych na podstawie odpowiedzi AI

5.3. Platforma nie ponosi odpowiedzialności za:
- Szkody wynikłe z nieprawidłowych odpowiedzi AI
- Przerwy w działaniu usługi
- Utratę danych spowodowaną czynnikami zewnętrznymi

**§ 6. Zmiany regulaminu**

6.1. Zastrzegamy sobie prawo do zmiany niniejszego regulaminu w dowolnym momencie.

6.2. Zmiany wchodzą w życie po ich opublikowaniu w aplikacji.

6.3. Dalsze korzystanie z Platformy po wprowadzeniu zmian oznacza akceptację nowego regulaminu.

**§ 7. Kontakt**

7.1. W razie pytań dotyczących regulaminu, skontaktuj się z nami poprzez formularz kontaktowy w aplikacji.

7.2. Odpowiadamy na zapytania w ciągu 48 godzin roboczych.
  `;

  return (
    <NextByteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Ustawienia i Polityka"
      description="Zarządzaj preferencjami i zapoznaj się z regulaminem"
      icon={<SettingsIcon className="w-5 h-5 text-foreground" />}
      maxWidth="3xl"
    >
      <SettingsPopupTabs
        defaultTab={defaultTab}
        isLoading={isLoading}
        cookiesContent={cookiesContent}
        privacyContent={privacyContent}
        termsContent={termsContent}
        categories={categories}
      />
    </NextByteModal>
  );
};

const SettingsPopupTabs: React.FC<{
  defaultTab: 'cookies' | 'privacy' | 'terms';
  isLoading: boolean;
  cookiesContent: string;
  privacyContent: string;
  termsContent: string;
  categories: any[];
}> = ({ defaultTab, isLoading, cookiesContent, privacyContent, termsContent, categories }) => {
  const [activeTab, setActiveTab] = useState<'cookies' | 'privacy' | 'terms'>(defaultTab);
  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab]);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="flex-shrink-0">
        <AnimatedTabs
          layoutId="settings-popup-tabs"
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as any)}
          tabs={[
            { value: 'cookies', label: 'Cookies' },
            { value: 'privacy', label: 'Prywatność' },
            { value: 'terms', label: 'Regulamin' },
          ]}
        />
      </div>

      {activeTab === 'cookies' && (
        <div className="mt-4 flex-1 min-h-0">
          <ScrollArea className="h-full max-h-[60dvh] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Ładowanie...</p>
              </div>
            ) : (
              <>
                <div
                  className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={createSafeLessonHtml(formatMarkdownToHtml(cookiesContent))}
                />

                <div className="space-y-3 mt-6">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/50">
                      <div>
                        <h4 className="font-medium text-foreground">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      {category.is_required ? (
                        <span className="text-sm text-green-500">Zawsze aktywne</span>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </ScrollArea>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="mt-4 flex-1 min-h-0">
          <ScrollArea className="h-full max-h-[60dvh] pr-4">
            <div
              className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={createSafeLessonHtml(formatMarkdownToHtml(privacyContent))}
            />
          </ScrollArea>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="mt-4 flex-1 min-h-0">
          <ScrollArea className="h-full max-h-[60dvh] pr-4">
            <div
              className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={createSafeLessonHtml(formatMarkdownToHtml(termsContent))}
            />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
