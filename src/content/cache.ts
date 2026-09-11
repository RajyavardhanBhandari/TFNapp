type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const TFN_CONTENT_CACHE_TTL_MS = 60_000;

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs = TFN_CONTENT_CACHE_TTL_MS): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearContentCache(): void {
  cache.clear();
}
