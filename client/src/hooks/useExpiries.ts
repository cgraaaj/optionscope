import { useQuery } from "@tanstack/react-query";
import { getInstruments } from "@/api/instruments";

export function useExpiries(stockName?: string) {
  return useQuery({
    queryKey: ["expiries", stockName],
    queryFn: () =>
      getInstruments({ stock_name: stockName, limit: 2000 }),
    enabled: !!stockName,
    staleTime: 5 * 60_000,
    select: (data) => {
      const set = new Set<string>();
      for (const inst of data.results) {
        if (inst.expiry) set.add(inst.expiry);
      }
      return Array.from(set).sort();
    },
  });
}
