interface CacheEntry {
  url: string;
  timestamp: number;
  blob?: Blob;
}

export class MapCache {
  private static instance: MapCache;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached maps

  static getInstance(): MapCache {
    if (!MapCache.instance) {
      MapCache.instance = new MapCache();
    }
    return MapCache.instance;
  }

  private generateCacheKey(
    center: { lat: number; lng: number },
    markers: Array<{ lat: number; lng: number; color: string; label: string }>,
    width: number,
    height: number,
    zoom?: number
  ): string {
    const markersString = markers
      .map(m => `${m.lat.toFixed(4)},${m.lng.toFixed(4)},${m.color},${m.label}`)
      .join('|');
    
    return `${center.lat.toFixed(4)}_${center.lng.toFixed(4)}_${markersString}_${width}x${height}_${zoom || 'auto'}`;
  }

  async get(
    center: { lat: number; lng: number },
    markers: Array<{ lat: number; lng: number; color: string; label: string }>,
    width: number,
    height: number,
    zoom?: number
  ): Promise<string | null> {
    const key = this.generateCacheKey(center, markers, width, height, zoom);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    console.log('📦 Using cached map for key:', key);
    return entry.url;
  }

  async set(
    center: { lat: number; lng: number },
    markers: Array<{ lat: number; lng: number; color: string; label: string }>,
    width: number,
    height: number,
    url: string,
    zoom?: number
  ): Promise<void> {
    const key = this.generateCacheKey(center, markers, width, height, zoom);

    // Clean up old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupOldEntries();
    }

    try {
      // Optionally cache the blob for offline access
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      this.cache.set(key, {
        url: blobUrl,
        timestamp: Date.now(),
        blob
      });

      console.log('💾 Cached map for key:', key);
    } catch (error) {
      // Fallback to URL-only caching if blob fails
      this.cache.set(key, {
        url,
        timestamp: Date.now()
      });
      
      console.warn('⚠️ Blob caching failed, using URL cache:', error);
    }
  }

  private cleanupOldEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      
      // Clean up blob URLs to prevent memory leaks
      if (entry.blob && entry.url.startsWith('blob:')) {
        URL.revokeObjectURL(entry.url);
      }
      
      this.cache.delete(key);
    }
    
    console.log(`🧹 Cleaned up ${toRemove} old cache entries`);
  }

  clear(): void {
    // Clean up all blob URLs
    for (const entry of this.cache.values()) {
      if (entry.blob && entry.url.startsWith('blob:')) {
        URL.revokeObjectURL(entry.url);
      }
    }
    
    this.cache.clear();
    console.log('🗑️ Cleared all map cache');
  }

  getStats(): { size: number; totalSize: number } {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.blob) {
        totalSize += entry.blob.size;
      }
    }
    
    return {
      size: this.cache.size,
      totalSize
    };
  }
}