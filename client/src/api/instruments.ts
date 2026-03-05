import { apiFetch } from "./client";
import type { ApiResponse, Instrument, Expiry } from "@/types";

export function getInstruments(params: {
  stock_name?: string;
  stock_id?: string;
  instrument_type?: string;
  expiry?: string;
  nearest_strike?: number;
  limit?: number;
}) {
  return apiFetch<ApiResponse<Instrument>>("/api/v1/instruments/", params);
}

export function getExpiries(params?: { instrument_type?: string }) {
  return apiFetch<ApiResponse<Expiry>>("/api/v1/expiries/", params);
}
