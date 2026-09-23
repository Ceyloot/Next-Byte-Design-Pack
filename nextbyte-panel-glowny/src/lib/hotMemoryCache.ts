/**
 * Hot Memory Cache - In-Memory Cache for Frequently Accessed Data
 * 
 * Keeps hot data in RAM for 0ms access time
 */

interface CacheEntry {
  data: any;
  hits: number;
  lastAccess: number;
  size: number;
}

class HotMemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 50 * 1024 * 1024; // 50 MB
  private currentSize = 0;
  private minHitsForPromotion = 3;

  /**
   * Get data from hot cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (entry) {
      entry.hits++;
      entry.lastAccess = Date.now();
      console.log(`🔥 HOT CACHE HIT: ${key} (${entry.hits} hits)`);
      return entry.data as T;
    }
    
    return null;
  }

  /**
   * Set data in hot cache
   */
  set(key: string, data: any): void {
    const size = this.estimateSize(data);
    
    // Check if we need to evict
    if (this.currentSize + size > this.maxSize) {
      this.evictLRU(size);
    }
    
    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.currentSize -= oldEntry.size;
    }
    
    // Add new entry
    this.cache.set(key, {
      data,
      hits: 1,
      lastAccess: Date.now(),
      size
    });
    
    this.currentSize += size;
  }

  /**
   * Promote data to hot cache if accessed frequently
   */
  promote(key: string, data: any): boolean {
    const entry = this.cache.get(key);
    
    // If not in cache or not enough hits, add/update
    if (!entry) {
      this.set(key, data);
      return false;
    }
    
    // Promote if hits threshold reached
    if (entry.hits >= this.minHitsForPromotion) {
      console.log(`🔥 Promoted to HOT cache: ${key} (${entry.hits} hits)`);
      return true;
    }
    
    return false;
  }

  /**
   * Check if key exists and is hot
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete from hot cache
   */
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    console.log('🗑️ Hot cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.currentSize,
      maxSize: this.maxSize,
      entries: this.cache.size,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      avgHits: entries.length > 0 
        ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length 
        : 0,
      utilizationPercent: (this.currentSize / this.maxSize) * 100
    };
  }

  /**
   * Evict least recently used entries to make space
   */
  private evictLRU(spaceNeeded: number): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => a.lastAccess - b.lastAccess);
    
    let freedSpace = 0;
    
    for (const entry of entries) {
      if (freedSpace >= spaceNeeded) break;
      
      this.cache.delete(entry.key);
      this.currentSize -= entry.size;
      freedSpace += entry.size;
      
      console.log(`🗑️ Evicted from HOT cache: ${entry.key} (LRU)`);
    }
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // UTF-16 = 2 bytes per char
    } catch {
      return 1024; // Default 1KB if can't stringify
    }
  }

  /**
   * Get most accessed items
   */
  getHottestItems(limit = 10) {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, hits: entry.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }
}

export const hotCache = new HotMemoryCache();
