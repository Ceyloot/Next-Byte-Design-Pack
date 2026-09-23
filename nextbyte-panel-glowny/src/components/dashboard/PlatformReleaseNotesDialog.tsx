import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Layers3, Rocket, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plakietka } from '@/components/ui/plakietka';
import { klasyKafelka, SZKLO } from '@/components/ui/tile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getItemMedia, getReleaseMedia, getVimeoEmbedUrl, PlatformReleaseItem, PlatformReleaseMedia, PlatformReleaseNote, PlatformReleaseBundle, useAllPlatformReleaseNotes } from '@/hooks/usePlatformReleaseNotes';

// Local fallback images for BETA 1.5.0 tiles — matched by title keywords
import imgUxImprovements from '@/assets/release-notes/ux-improvements.jpg';
import imgSpotlightSearch from '@/assets/release-notes/spotlight-search.jpg';
import imgByteSubscription from '@/assets/release-notes/byte-subscription.jpg';
import imgAiTools from '@/assets/release-notes/ai-tools.jpg';
import imgProductivity from '@/assets/release-notes/productivity.jpg';
import imgPanicButton from '@/assets/release-notes/panic-button.jpg';
import imgUxFlow from '@/assets/release-notes/ux-flow.jpg';
import imgPerformance from '@/assets/release-notes/performance.jpg';

const FALLBACK_BY_TITLE: [RegExp, string][] = [
  [/graficzn|ux.*improv/i, imgUxImprovements],
  [/spotlight|wyszukiw/i, imgSpotlightSearch],
  [/byte.*subskryp|subskryp.*byte/i, imgByteSubscription],
  [/ai\s*tool/i, imgAiTools],
  [/produktywno|nowy\s*modu/i, imgProductivity],
  [/panik|panic/i, imgPanicButton],
  [/ux.*flow|usprawnienie\s*ux/i, imgUxFlow],
  [/wydajno|performance/i, imgPerformance],
];

export const getFallbackImage = (title: string): string | null => {
  const match = FALLBACK_BY_TITLE.find(([re]) => re.test(title));
  return match ? match[1] : null;
};

export const getItemImageForPreview = (item: PlatformReleaseItem, media: PlatformReleaseMedia[], releaseVersion?: string): string | null => {
  const dbMedia = getItemMedia(media, item.id);
  if (dbMedia[0] && dbMedia[0].media_type !== 'vimeo') return dbMedia[0].url;
  // Legacy fallback tylko dla BETA 1.5.0 (starsze wydanie bez DB media)
  if (releaseVersion && /1\.5\.0/i.test(releaseVersion)) return getFallbackImage(item.title);
  return null;
};

/* ─── Single version section (collapsible) ─── */
const VersionSection = ({
  bundle,
  isExpanded,
  onToggle,
  isCurrent,
  mobilePreview = false,
}: {
  bundle: PlatformReleaseBundle;
  isExpanded: boolean;
  onToggle: () => void;
  isCurrent: boolean;
  mobilePreview?: boolean;
}) => {
  const { release, addedItems, plannedItems, media } = bundle;
  const showPlannedSection = release.show_planned_section !== false && plannedItems.length > 0;
  const nextVersion = release.next_version_label || '';

  return (
    <div className={cn(klasyKafelka({ intencja: 'akcent' }), 'relative overflow-hidden p-0')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Collapsible header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-primary/5 sm:p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{release.version}</h3>
              {isCurrent && (
                <Plakietka intencja="akcent">Aktualna</Plakietka>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{release.title}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary/15 px-4 pb-5 pt-4 sm:px-5">
              {release.summary && (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{release.summary}</p>
              )}

              {/* Release media */}
              {getReleaseMedia(media).length > 0 && (
                <div className={`mb-4 grid gap-3 ${mobilePreview ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                  {getReleaseMedia(media).map((entry) =>
                    entry.media_type === 'vimeo' ? (
                      <div key={entry.id} className={cn('overflow-hidden rounded-2xl border border-primary/25', SZKLO)}>
                        {getVimeoEmbedUrl(entry.url) ? <iframe src={getVimeoEmbedUrl(entry.url)!} title={entry.title || 'Vimeo'} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" /> : null}
                      </div>
                    ) : (
                      <img key={entry.id} src={entry.url} alt={entry.title || 'Release media'} className="max-h-64 w-full rounded-2xl border border-primary/25 object-cover" loading="lazy" />
                    )
                  )}
                </div>
              )}

              {/* Content grid */}
              <div className={`grid gap-5 ${mobilePreview ? 'grid-cols-1' : showPlannedSection ? 'lg:grid-cols-[1.15fr_0.85fr]' : 'lg:grid-cols-1'}`}>
                {/* Added items */}
                {addedItems.length > 0 && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-primary">
                      <CheckCircle2 className="h-4 w-4" /> Dodane
                    </div>
                    <div className={`grid gap-3 ${mobilePreview ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                      {addedItems.map((item, index) => {
                        const imgSrc = getItemImageForPreview(item, media, release.version);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.04 }}
                            className={cn(
                              klasyKafelka({ intencja: 'akcent' }),
                              'group relative overflow-hidden rounded-xl p-0 hover:border-primary/40',
                            )}
                          >
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            {imgSrc && (
                              <div className="relative aspect-square overflow-hidden">
                                <img src={imgSrc} alt={item.title} className="h-full w-full object-contain bg-background/50 transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/60 to-transparent" />
                              </div>
                            )}
                            <div className="p-4">
                              <div className="mb-2 flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]" /><h4 className="text-sm font-semibold text-foreground">{item.title}</h4></div>
                              {item.description && <p className="pl-6 text-xs leading-relaxed text-muted-foreground">{item.description}</p>}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Planned items */}
                {showPlannedSection && (
                  <div>
                    <div className="mb-4 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-primary">
                      <Rocket className="h-4 w-4" /> Planowane w {nextVersion}
                    </div>
                    <div className="space-y-3">
                      {plannedItems.map((item, index) => {
                        const imgSrc = getItemImageForPreview(item, media, release.version);
                        return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.12 + index * 0.05 }}
                          className={cn(
                            klasyKafelka({ intencja: 'akcent' }),
                            'group overflow-hidden rounded-xl p-0 hover:border-primary/40',
                          )}
                        >
                          {imgSrc && (
                            <div className="relative aspect-video overflow-hidden">
                              <img src={imgSrc} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background/60 to-transparent" />
                            </div>
                          )}
                          <div className="flex gap-3 p-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"><Zap className="h-3.5 w-3.5" /></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium leading-relaxed text-foreground/90">{item.title}</p>
                              {item.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>}
                            </div>
                          </div>
                        </motion.div>
                        );
                      })}
                    </div>
                    {release.transition_note && (
                      <div className={cn(klasyKafelka({ intencja: 'akcent', zwarty: true }), 'mt-4 rounded-xl')}>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">{release.version} <ArrowRight className="h-4 w-4" /> {nextVersion}</div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{release.transition_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Dialog ─── */
interface PlatformReleaseNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: PlatformReleaseNote | null;
  addedItems: PlatformReleaseItem[];
  plannedItems: PlatformReleaseItem[];
  media: PlatformReleaseMedia[];
  embedded?: boolean;
  mobilePreview?: boolean;
}

export const PlatformReleaseNotesDialog = ({ open, onOpenChange, release, addedItems, plannedItems, media, embedded = false, mobilePreview = false }: PlatformReleaseNotesDialogProps) => {
  // When embedded (editor preview), always use passed props for live updates.
  // When in dialog mode, fetch all published releases for version history.
  const { data: allBundles } = useAllPlatformReleaseNotes();

  const latestRelease = (!embedded && allBundles?.[0]?.release) || release;
  const platformVersion = latestRelease?.version || 'Beta 1.0.0';
  const releaseSummary = latestRelease?.summary || 'Aktualna wersja platformy oraz kierunek kolejnej głównej aktualizacji.';
  const releaseTitle = latestRelease?.title || 'NEXTBYTE';

  // Build bundles: embedded uses props directly; dialog uses DB data with prop fallback
  const bundles: PlatformReleaseBundle[] = embedded
    ? (release ? [{ release, addedItems, plannedItems, media }] : [])
    : allBundles?.length
      ? allBundles
      : release
      ? [{ release, addedItems, plannedItems, media }]
      : [];

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set<string>());


  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const content = (
    <div className="relative max-h-[88dvh] overflow-y-auto overflow-x-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.06) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 top-36 h-64 w-64 rounded-full bg-primary/15 blur-[90px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-primary/10 blur-[80px]" />

      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Header */}
        <DialogHeader className="space-y-5 text-left">
          <div className={cn(klasyKafelka({ intencja: 'akcent' }), 'relative overflow-hidden sm:p-7')}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <Plakietka intencja="akcent" rozmiar="srednia" ikona={Sparkles} className="w-fit">
                  Release notes
                </Plakietka>
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{releaseTitle}</DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{releaseSummary}</DialogDescription>
                </div>
              </div>
              <div className={cn(klasyKafelka({ intencja: 'akcent', zwarty: true }), 'px-5 py-4 text-left md:text-right')}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/70">Current build</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{platformVersion}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Version sections */}
        <div className="mt-6 space-y-4">
          {bundles.map((bundle, idx) => (
            <VersionSection
              key={bundle.release.id}
              bundle={bundle}
              isExpanded={expandedIds.has(bundle.release.id)}
              onToggle={() => toggleExpanded(bundle.release.id)}
              isCurrent={idx === 0}
              mobilePreview={mobilePreview}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (embedded) return <div className={cn('overflow-hidden rounded-2xl border border-primary/25', SZKLO)}>{content}</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Materiał okna = SZKLO zamiast wariantu "glass" (tamten to stary przepis
          z zaszytym odcieniem rgba); stare klasy tła i rozmycia musiały zniknąć. */}
      <DialogContent
        className={cn(
          'w-[calc(100vw-1.5rem)] max-w-5xl max-h-[88dvh] overflow-hidden border-primary/25 p-0 sm:rounded-2xl',
          SZKLO,
        )}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default PlatformReleaseNotesDialog;
