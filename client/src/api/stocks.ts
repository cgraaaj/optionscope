import { apiFetch } from "./client";
import type { ApiResponse, Stock } from "@/types";

export function getStocks(params?: { include_inactive?: boolean; search?: string }) {
  return apiFetch<ApiResponse<Stock>>("/api/v1/stocks/", {
    include_inactive: params?.include_inactive ? "true" : undefined,
    search: params?.search,
  });
}
