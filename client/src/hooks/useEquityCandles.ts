import { useQuery } from "@tanstack/react-query";
import { getEquityCandles } from "@/api/upstox";
import { mapIntervalToUpstox, aggregateCandles } from "@/lib/utils";

export function useEquityCandles(
  instrumentKey: string | undefined,
  chartInterval: string,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  enabled: boolean
) {
  const upstoxInterval = mapIntervalToUpstox(chartInterval);

  return useQuery({
    queryKey: [
      "equityCandles",
      instrumentKey,
      chartInterval,
      fromDate?.toISOString(),
      toDate?.toISOString(),
    ],
    queryFn: () =>
      getEquityCandles(instrumentKey!, upstoxInterval, fromDate!, toDate!),
    enabled: enabled && !!instrumentKey && !!fromDate && !!toDate,
    staleTime: 60_000,
    select: (data) => aggregateCandles(data.results, chartInterval),
  });
}
