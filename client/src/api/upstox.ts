import { apiFetch } from "./client";
import type { ApiResponse, Candle } from "@/types";
import { formatDate } from "@/lib/utils";

export function getEquityCandles(
  instrumentKey: string,
  interval: string,
  fromDate: Date,
  toDate: Date
) {
  const from = formatDate(fromDate);
  const to = formatDate(toDate);
  const encodedKey = encodeURIComponent(instrumentKey);
  return apiFetch<ApiResponse<Candle>>(
    `/upstox/historical-candle/${encodedKey}/${interval}/${to}/${from}`
  );
}
