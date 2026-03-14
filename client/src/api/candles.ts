import { apiFetch } from "./client";
import type { CandleApiResponse, TickApiResponse, Tick } from "@/types";

const MAX_TICK_BATCH = 50;

export function getCandles(params: {
  instrument_id: number;
  interval: string;
  start?: string;
  end?: string;
  limit?: number;
}) {
  return apiFetch<CandleApiResponse>("/api/v1/candles/", params);
}

export function getTicks(params: {
  instrument_ids: string;
  start?: string;
  end?: string;
  limit?: number;
}) {
  return apiFetch<TickApiResponse>("/api/v1/ticks/", params);
}

/**
 * Batch-fetch ticks for many instruments (API allows max 50 per request).
 * start/end should be IST day boundaries in UTC (e.g. from startOfDayIST/endOfDayIST).
 * Empty results mean TickerFlow has no tick data for that date (e.g. future or not ingested).
 */
export async function getTicksBatched(
  instrumentIds: number[],
  options?: { start?: string; end?: string; limitPerInstrument?: number }
): Promise<{ results: Tick[] }> {
  if (instrumentIds.length === 0) {
    return { results: [] };
  }
  const chunks: number[][] = [];
  for (let i = 0; i < instrumentIds.length; i += MAX_TICK_BATCH) {
    chunks.push(instrumentIds.slice(i, i + MAX_TICK_BATCH));
  }
  const limit = options?.limitPerInstrument ?? 100;
  const all = await Promise.all(
    chunks.map((ids) =>
      getTicks({
        instrument_ids: ids.join(","),
        start: options?.start,
        end: options?.end,
        limit: Math.min(ids.length * limit, 50000),
      })
    )
  );
  const results = all.flatMap((r) => r.results);
  return { results };
}
