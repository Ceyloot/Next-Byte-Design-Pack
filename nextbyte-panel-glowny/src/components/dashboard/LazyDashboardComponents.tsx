import React, { Suspense } from 'react';
import { Tile } from '@/components/ui/tile';
import { Szkielet } from '@/components/ui/stany';

const RELOAD_FLAG = 'lov:dashboard-chunk-reloaded';

function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 2,
  delay = 600
): React.LazyExoticComponent<T> {
  return React.lazy(() => {
    const attempt = (remaining: number): Promise<{ default: T }> =>
      importFn().catch((err) => {
        const msg = String(err?.message || err);
        const isChunkError =
          /Failed to fetch dynamically imported module/i.test(msg) ||
          /Importing a module script failed/i.test(msg) ||
          /ChunkLoadError/i.test(msg);

        if (remaining > 0) {
          return new Promise<{ default: T }>((resolve) =>
            setTimeout(() => resolve(attempt(remaining - 1)), delay)
          );
        }

        if (isChunkError && typeof window !== 'undefined') {
          try {
            if (!sessionStorage.getItem(RELOAD_FLAG)) {
              sessionStorage.setItem(RELOAD_FLAG, '1');
              window.location.reload();
              return new Promise<{ default: T }>(() => {});
            }
          } catch {}
        }

        throw err;
      });

    return attempt(retries);
  });
}

if (typeof window !== 'undefined') {
  try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
}

// Lazy load heavy dashboard components
const AIInsightCard = lazyWithRetry(() => import('@/components/dashboard/AIInsightCard').then(module => ({
  default: module.AIInsightCard
})));

const RealtimeActivity = lazyWithRetry(() => import('@/components/dashboard/RealtimeActivity').then(module => ({
  default: module.RealtimeActivity
})));

const EventRewardPanel = lazyWithRetry(() => import('@/components/dashboard/EventRewardPanel').then(module => ({
  default: module.default
})));

const QuickActions = lazyWithRetry(() => import('@/components/dashboard/QuickActions').then(module => ({
  default: module.QuickActions
})));

// Loading fallback component — kształt docelowej karty: ikona + tytuł, potem akapit
const DashboardSkeleton = () => (
  <Tile>
    <div className="flex items-center gap-3">
      <Szkielet wierszy={1} ksztalt="kolo" />
      <Szkielet wierszy={1} className="w-32" />
    </div>
    <Szkielet wierszy={3} className="mt-4" />
  </Tile>
);

// Lazy wrapped components with suspense boundaries
export const LazyAIInsightCard = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <AIInsightCard />
  </Suspense>
);

export const LazyRealtimeActivity = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <RealtimeActivity />
  </Suspense>
);

export const LazyEventRewardPanel = ({ eventId }: { eventId: string }) => (
  <Suspense fallback={<DashboardSkeleton />}>
    <EventRewardPanel eventId={eventId} />
  </Suspense>
);

export const LazyQuickActions = () => (
  <Suspense fallback={<DashboardSkeleton />}>
    <QuickActions />
  </Suspense>
);