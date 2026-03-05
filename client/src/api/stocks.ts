import { apiFetch } from "./client";
import type { ApiResponse, Stock } from "@/types";

export function getStocks() {
  return apiFetch<ApiResponse<Stock>>("/api/v1/stocks/");
}
