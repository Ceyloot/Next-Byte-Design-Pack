import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChannelConfig {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
}

interface ChannelData {
  channel: RealtimeChannel;
  subscribers: Set<(payload: any) => void>;
  config: ChannelConfig;
  reconnectAttempts: number;
}

/**
 * Realtime Channel Manager
 * 
 * Manages shared Realtime channels to reduce connection overhead.
 * Multiple components can subscribe to the same channel.
 */
class RealtimeChannelManager {
  private channels = new Map<string, ChannelData>();
  private maxReconnectAttempts = 5;

  subscribe(
    channelName: string,
    config: ChannelConfig,
    callback: (payload: any) => void
  ): () => void {
    const key = this.getChannelKey(channelName, config);

    if (!this.channels.has(key)) {
      // Create new channel
      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes' as any,
          {
            event: config.event,
            schema: 'public',
            table: config.table,
            filter: config.filter,
          } as any,
          (payload) => {
            // Broadcast to all subscribers
            const channelData = this.channels.get(key);
            if (channelData) {
              channelData.subscribers.forEach((cb) => cb(payload));
            }
          }
        )
        .subscribe();

      this.channels.set(key, {
        channel,
        subscribers: new Set(),
        config,
        reconnectAttempts: 0,
      });

      console.log(`✅ Channel ${channelName} subscribed`);
    }

    // Add subscriber
    const channelData = this.channels.get(key)!;
    channelData.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      const data = this.channels.get(key);
      if (!data) return;

      data.subscribers.delete(callback);

      // Cleanup if last subscriber
      if (data.subscribers.size === 0) {
        console.log(`🧹 Removing unused channel: ${channelName}`);
        supabase.removeChannel(data.channel);
        this.channels.delete(key);
      }
    };
  }

  private getChannelKey(name: string, config: ChannelConfig): string {
    return `${name}-${config.table}-${config.event}-${config.filter || 'all'}`;
  }

  // Get active channels count (for monitoring)
  getActiveChannelsCount(): number {
    return this.channels.size;
  }

  // Get total subscribers count (for monitoring)
  getTotalSubscribersCount(): number {
    let total = 0;
    this.channels.forEach((data) => {
      total += data.subscribers.size;
    });
    return total;
  }
}

export const realtimeManager = new RealtimeChannelManager();

/*
 * ════════════════════════════════════════════════════════════════════════════
 *  JEDEN KANAŁ NA NAZWĘ — WSPÓLNY DLA WSZYSTKICH INSTANCJI HAKA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Ten sam mechanizm, co licznik referencji w `useWallet` — tam opisany szerzej.
 * `supabase.channel(nazwa)` ODDAJE ISTNIEJĄCY kanał o tej nazwie, więc hak
 * wołany przez kilka komponentów naraz dokładał `postgres_changes` do kanału
 * już po `subscribe()`, co realtime-js kwituje wyjątkiem i wywala render.
 * Drugie oblicze tego samego: odmontowanie jednego konsumenta robiło
 * `removeChannel` i gasiło realtime wszystkim pozostałym.
 *
 * Tutaj pierwszy konsument zakłada kanał, ostatni go zamyka, a każde zdarzenie
 * budzi wszystkich zapisanych.
 */
type Sluchacz = () => void;

interface NasluchTabeli {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
}

const wspolneKanaly = new Map<
  string,
  { kanal: RealtimeChannel; sluchacze: Set<Sluchacz> }
>();

export function dolaczDoKanalu(
  nazwa: string,
  nasluchy: NasluchTabeli[],
  sluchacz: Sluchacz,
): () => void {
  let wpis = wspolneKanaly.get(nazwa);

  if (!wpis) {
    const sluchacze = new Set<Sluchacz>();
    const obudz = () => sluchacze.forEach((s) => s());

    let kanal = supabase.channel(nazwa);
    for (const n of nasluchy) {
      kanal = kanal.on(
        'postgres_changes' as any,
        { event: n.event ?? '*', schema: 'public', table: n.table, filter: n.filter } as any,
        obudz,
      );
    }
    kanal.subscribe();

    wpis = { kanal, sluchacze };
    wspolneKanaly.set(nazwa, wpis);
  }

  wpis.sluchacze.add(sluchacz);

  return () => {
    const biezacy = wspolneKanaly.get(nazwa);
    if (!biezacy) return;
    biezacy.sluchacze.delete(sluchacz);
    if (biezacy.sluchacze.size === 0) {
      wspolneKanaly.delete(nazwa);
      supabase.removeChannel(biezacy.kanal);
    }
  };
}

// Legacy channels for backward compatibility
let siteAssetsChannel: ReturnType<typeof supabase.channel> | null = null;
let siteAssetsJoined = false;
const siteAssetsListeners = new Set<(assetKey: string) => void>();

export const getSiteAssetsChannel = () => {
  if (!siteAssetsChannel) {
    siteAssetsChannel = supabase.channel('site_assets');
  }
  return siteAssetsChannel;
};

/**
 * One shared `site_assets` channel for every `useSiteAsset` caller.
 * A Realtime channel can be joined exactly once, so `.subscribe()` is called
 * here a single time and the `asset-updated` broadcast is fanned out to the
 * hooks; each hook only adds and removes its own listener.
 */
export const onSiteAssetUpdated = (listener: (assetKey: string) => void): (() => void) => {
  const channel = getSiteAssetsChannel();

  if (!siteAssetsJoined) {
    siteAssetsJoined = true;
    channel
      .on('broadcast', { event: 'asset-updated' }, (payload: { payload?: { assetKey?: string } }) => {
        const assetKey = payload?.payload?.assetKey;
        if (!assetKey) return;
        siteAssetsListeners.forEach((cb) => cb(assetKey));
      })
      .subscribe();
  }

  siteAssetsListeners.add(listener);
  return () => {
    siteAssetsListeners.delete(listener);
  };
};

export const sendAssetUpdated = (assetKey: string) => {
  const channel = getSiteAssetsChannel();
  channel.send({
    type: 'broadcast',
    event: 'asset-updated',
    payload: { assetKey },
  });
};

let systemSettingsChannel: ReturnType<typeof supabase.channel> | null = null;

export const getSystemSettingsChannel = () => {
  if (!systemSettingsChannel) {
    systemSettingsChannel = supabase.channel('system_settings');
  }
  return systemSettingsChannel;
};

export const sendSystemSettingUpdated = (category: string, key: string) => {
  const channel = getSystemSettingsChannel();
  channel.send({
    type: 'broadcast',
    event: 'setting-updated',
    payload: { category, key },
  });
};

let friendshipsChannel: ReturnType<typeof supabase.channel> | null = null;

export const getFriendshipsChannel = () => {
  if (!friendshipsChannel) {
    friendshipsChannel = supabase.channel('friendships');
  }
  return friendshipsChannel;
};

export const sendFriendshipUpdated = (userId: string, friendId: string) => {
  const channel = getFriendshipsChannel();
  channel.send({
    type: 'broadcast',
    event: 'friendship-updated',
    payload: { userId, friendId },
  });
};
