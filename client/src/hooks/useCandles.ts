import { useQuery } from "@tanstack/react-query";
import { getCandles } from "@/api/candles";
import type { Interval } from "@/types";

export function useCandles(
  instrumentId: number | undefined,
  interval: Interval,
  start?: string,
  end?: string
) {
  return useQuery({
    queryKey: ["candles", instrumentId, interval, start, end],
    queryFn: () =>
      getCandles({
        instrument_id: instrumentId!,
        interval,
        start,
        end,
        limit: 1000,
      }),
    enabled: !!instrumentId,
    staleTime: 30_000,
    select: (data) => [...data.results].reverse(),
  });
}
