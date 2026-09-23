import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Type, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const FONT_PRESETS = [
  {
    id: 'nextbyte',
    name: 'NextByte',
    description: 'Oryginalne czcionki platformy — Space Grotesk + Inter',
    heading: 'Space Grotesk',
    body: 'Inter',
    headingClass: "'Space Grotesk', sans-serif",
    bodyClass: "'Inter', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap',
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
  {
    id: 'alice',
    name: 'Alice Style',
    description: 'Inspirowane heyalice.app — DM Sans + Inter',
    heading: 'DM Sans',
    body: 'Inter',
    headingClass: "'DM Sans', sans-serif",
    bodyClass: "'Inter', sans-serif",
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap',
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
  {
    id: 'onest-geist',
    name: 'Miękki (Apple-like)',
    description: 'Darmowe zamienniki San Francisco — Geist + Onest',
    heading: 'Geist',
    body: 'Onest',
    headingClass: "'Geist', system-ui, sans-serif",
    bodyClass: "'Onest', system-ui, sans-serif",
    /*
      BEZ `googleFontsUrl` — i to jest różnica, nie przeoczenie.

      Oba kroje leżą lokalnie w `public/fonts` (wpisy `@font-face` w
      `fonts.css`, podzbiory `latin` i `latin-ext`, bo w tym drugim siedzą
      polskie znaki). Platforma trzyma kroje u siebie świadomie: działają bez
      sieci trzeciej strony i nie wysyłają adresów IP odwiedzających do Google.

      Dwa starsze zestawy dalej ciągną z CDN — to dług, nie wzorzec.
    */
    lokalne: true,
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
  /*
    TRZY ZESTAWY „POD CZYTANIE" (08.09.2026). Michał o Onest: „czcionka tekstu
    jest bardzo ciężka w czytaniu, taka komputerowa". Zmierzone: tekst body to
    14 px / 20 px, waga 400, antyaliasing włączony — czyli problem leży w KROJU,
    nie w ustawieniach. Onest jest geometryczny i szeroki; przy 14 px na ciemnym
    tle kreski wyglądają na grubsze niż są. Wszystkie trzy poniżej leżą lokalnie
    w `public/fonts` (pełne pliki TTF, więc polskie znaki są w środku).
  */
  {
    id: 'inter-geist',
    name: 'Czytelny',
    description: 'Geist w nagłówkach, Inter w tekście — najlepiej czytelny krój interfejsowy przy 13–14 px',
    heading: 'Geist',
    body: 'Inter',
    headingClass: "'Geist', system-ui, sans-serif",
    bodyClass: "'Inter', system-ui, sans-serif",
    lokalne: true,
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
  {
    id: 'jakarta-geist',
    name: 'Przyjazny',
    description: 'Geist + Plus Jakarta Sans — ten sam krój tekstu, co na stronie sprzedażowej; okrąglejszy, lżejszy',
    heading: 'Geist',
    body: 'Plus Jakarta Sans',
    headingClass: "'Geist', system-ui, sans-serif",
    bodyClass: "'Plus Jakarta Sans', system-ui, sans-serif",
    lokalne: true,
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
  {
    id: 'general-sans',
    name: 'Ciepły',
    description: 'General Sans w całości — jeden krój, miękkie kształty, wyraźnie lżejsza kreska',
    heading: 'General Sans',
    body: 'General Sans',
    headingClass: "'General Sans', system-ui, sans-serif",
    bodyClass: "'General Sans', system-ui, sans-serif",
    lokalne: true,
    sampleHeading: 'Nagłówek Strony',
    sampleBody: 'To jest przykładowy tekst w czcionce body. Idealne do długich treści i opisów.',
  },
];

const STORAGE_KEY = 'nextbyte_font_preset';

export const applyFontPreset = (presetId: string) => {
  const preset = FONT_PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  /* Zestaw lokalny nie potrzebuje niczego dociągać — jego `@font-face` są
     w `public/fonts/fonts.css`, wczytywanym razem ze stroną. Zostawiony
     znacznik z poprzedniego zestawu trzeba jednak usunąć, inaczej przeglądarka
     dalej trzymałaby połączenie do Google mimo przełączenia na lokalny. */
  const existingLink = document.getElementById('dynamic-font-link');
  if (existingLink) existingLink.remove();

  if (!preset.lokalne && preset.googleFontsUrl) {
    const link = document.createElement('link');
    link.id = 'dynamic-font-link';
    link.rel = 'stylesheet';
    link.href = preset.googleFontsUrl;
    document.head.appendChild(link);
  }

  // Apply CSS variables
  document.documentElement.style.setProperty('--font-heading', preset.headingClass);
  document.documentElement.style.setProperty('--font-body', preset.bodyClass);

  // Apply directly to document to override tailwind fontFamily classes
  document.documentElement.setAttribute('data-font-preset', presetId);
};

/** Fetch the global font preset from system_settings (DB-first, localStorage fallback). */
export const fetchGlobalFontPreset = async (): Promise<string> => {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'appearance')
      .eq('key', 'platform_font_preset')
      .maybeSingle();

    if (data?.value) {
      const preset = typeof data.value === 'string' ? data.value.replace(/^"|"$/g, '') : String(data.value);
      if (FONT_PRESETS.find(p => p.id === preset)) {
        // Sync to localStorage for offline/fast startup
        try { localStorage.setItem(STORAGE_KEY, preset); } catch {}
        return preset;
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to fetch global font preset from DB:', e);
  }
  // Fallback to localStorage
  try { return localStorage.getItem(STORAGE_KEY) || 'nextbyte'; } catch { return 'nextbyte'; }
};

const FontSettings = () => {
  const [activePreset, setActivePreset] = useState<string>('nextbyte');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGlobalFontPreset().then(preset => {
      setActivePreset(preset);
      applyFontPreset(preset);
    });
  }, []);

  const handleSelect = async (presetId: string) => {
    setActivePreset(presetId);
    applyFontPreset(presetId);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: JSON.stringify(presetId), updated_at: new Date().toISOString() })
        .eq('category', 'appearance')
        .eq('key', 'platform_font_preset');

      if (error) throw error;
      try { localStorage.setItem(STORAGE_KEY, presetId); } catch {}
      toast({ title: 'Sukces', description: 'Czcionka została zmieniona globalnie dla wszystkich użytkowników.' });
    } catch (e) {
      console.error('Error saving font preset:', e);
      toast({ title: 'Błąd', description: 'Nie udało się zapisać czcionki.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Card className="glass-effect border-primary/20">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Type className="w-6 h-6 text-primary" />
            </div>
            Czcionki
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2 text-base">
            Wybierz zestaw czcionek dla całej aplikacji. Zmiana jest natychmiastowa.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {FONT_PRESETS.map(preset => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset.id)}
                  className={`text-left rounded-xl border p-6 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                      : 'bg-card/50 border-border hover:border-primary/40 hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold text-foreground"
                        style={{ fontFamily: preset.headingClass }}
                      >
                        {preset.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Font Preview */}
                  <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
                    <div
                      className="text-xl font-bold text-foreground"
                      style={{ fontFamily: preset.headingClass }}
                    >
                      {preset.sampleHeading}
                    </div>
                    <div
                      className="text-sm text-muted-foreground leading-relaxed"
                      style={{ fontFamily: preset.bodyClass }}
                    >
                      {preset.sampleBody}
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="text-xs text-muted-foreground/60">
                        <span className="font-semibold text-muted-foreground">Nagłówki:</span>{' '}
                        <span style={{ fontFamily: preset.headingClass }}>{preset.heading}</span>
                      </div>
                      <div className="text-xs text-muted-foreground/60">
                        <span className="font-semibold text-muted-foreground">Tekst:</span>{' '}
                        <span style={{ fontFamily: preset.bodyClass }}>{preset.body}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground/60 text-center">
            {isSaving && <Loader2 className="w-3 h-3 inline animate-spin mr-1" />}
            Wybór czcionek jest zapisywany globalnie — wszyscy użytkownicy platformy zobaczą zmianę.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSettings;
