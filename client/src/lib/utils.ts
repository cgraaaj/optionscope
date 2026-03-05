import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toUnixSeconds(isoString: string | number): number {
  if (typeof isoString === "number") {
    return isoString > 1e12 ? Math.floor(isoString / 1000) : isoString;
  }
  const ms = new Date(isoString).getTime();
  if (Number.isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
}

export function formatPrice(price: number): string {
  return price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Return YYYY-MM-DD from a Date using its local calendar date (no UTC shift). */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Start of the given calendar date in IST (Asia/Kolkata), as ISO string for API.
 * Ensures "30 June" always means 30 June 00:00 IST regardless of user's timezone.
 */
export function startOfDayIST(date: Date): string {
  return new Date(`${formatDate(date)}T00:00:00+05:30`).toISOString();
}

/**
 * End of the given calendar date in IST, as ISO string for API.
 */
export function endOfDayIST(date: Date): string {
  return new Date(`${formatDate(date)}T23:59:59.999+05:30`).toISOString();
}

export function formatExpiry(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const INTERVAL_TO_UPSTOX: Record<string, string> = {
  "1m": "1minute",
  "5m": "1minute",
  "15m": "1minute",
  "30m": "30minute",
  "1h": "30minute",
  "4h": "day",
  "1d": "day",
};

export function mapIntervalToUpstox(interval: string): string {
  return INTERVAL_TO_UPSTOX[interval] ?? "1minute";
}

const INTERVAL_MINUTES: Record<string, number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "4h": 240,
  "1d": 1440,
};

/**
 * Aggregate candles into larger intervals.
 * Groups by flooring each candle's timestamp to the interval boundary
 * (same epoch-alignment as PostgreSQL time_bucket), then computes OHLCV.
 */
export function aggregateCandles(
  candles: import("@/types").Candle[],
  targetInterval: string
): import("@/types").Candle[] {
  const minutes = INTERVAL_MINUTES[targetInterval];
  if (!minutes || minutes <= 1 || candles.length === 0) return candles;

  const bucketSec = minutes * 60;
  const groups = new Map<number, import("@/types").Candle[]>();

  for (const c of candles) {
    const sec = toUnixSeconds(c.bucket);
    if (sec <= 0) continue;
    const key = Math.floor(sec / bucketSec) * bucketSec;
    const arr = groups.get(key);
    if (arr) arr.push(c);
    else groups.set(key, [c]);
  }

  const result: import("@/types").Candle[] = [];
  for (const [key, bars] of groups) {
    result.push({
      bucket: new Date(key * 1000).toISOString(),
      open: bars[0].open,
      high: Math.max(...bars.map((b) => b.high)),
      low: Math.min(...bars.map((b) => b.low)),
      close: bars[bars.length - 1].close,
      volume: bars.reduce((s, b) => s + b.volume, 0),
      open_interest: bars[bars.length - 1].open_interest,
    });
  }

  return result.sort((a, b) => toUnixSeconds(a.bucket) - toUnixSeconds(b.bucket));
}
