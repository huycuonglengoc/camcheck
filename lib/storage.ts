/**
 * Storage layer for ad banners.
 * Uses ioredis (Railway Redis) in production, falls back to in-memory for local dev.
 */
import Redis from "ioredis";

export interface AdBanner {
  id: string;
  name: string;
  /** Raw HTML embed code (e.g. AADS iframe snippet). When set, imageUrl/linkUrl are unused. */
  embedCode?: string;
  /** Direct image URL – used when embedCode is not set */
  imageUrl?: string;
  /** Destination URL – used when embedCode is not set */
  linkUrl?: string;
  position: "top" | "bottom" | "sidebar-left" | "sidebar-right";
  isActive: boolean;
  createdAt: string;
}

// In-memory fallback for local development (resets on restart)
const memoryStore: { ads: AdBanner[] } = { ads: [] };

// Singleton Redis client to avoid creating multiple connections
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  // Railway Redis provides REDIS_URL (e.g. redis://default:password@host:port)
  const redisUrl =
    process.env.REDIS_URL ||
    process.env.REDIS_PRIVATE_URL ||
    process.env.REDIS_PUBLIC_URL;

  if (!redisUrl) return null;

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      // Retry strategy: give up after 3 retries to avoid hanging
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      // TLS support for rediss:// URLs (Railway may use this)
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    });

    redisClient.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("[Redis] Connected to Railway Redis");
    });
  }

  return redisClient;
}

const ADS_KEY = "camcheck:ads";

export async function getAds(): Promise<AdBanner[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get(ADS_KEY);
      if (!data) return [];
      return JSON.parse(data) as AdBanner[];
    } catch (err) {
      console.error("[Redis] getAds error:", err);
      return memoryStore.ads;
    }
  }
  return memoryStore.ads;
}

export async function saveAds(ads: AdBanner[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(ADS_KEY, JSON.stringify(ads));
    } catch (err) {
      console.error("[Redis] saveAds error:", err);
      memoryStore.ads = ads;
    }
  } else {
    memoryStore.ads = ads;
  }
}

export async function addAd(ad: AdBanner): Promise<void> {
  const ads = await getAds();
  ads.push(ad);
  await saveAds(ads);
}

export async function updateAd(
  id: string,
  updates: Partial<AdBanner>
): Promise<boolean> {
  const ads = await getAds();
  const idx = ads.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  ads[idx] = { ...ads[idx], ...updates };
  await saveAds(ads);
  return true;
}

export async function deleteAd(id: string): Promise<boolean> {
  const ads = await getAds();
  const filtered = ads.filter((a) => a.id !== id);
  if (filtered.length === ads.length) return false;
  await saveAds(filtered);
  return true;
}
