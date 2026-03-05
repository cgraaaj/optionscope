import { useQuery } from "@tanstack/react-query";
import { getInstruments } from "@/api/instruments";
import type { OptionChainRow } from "@/types";

export function useInstruments(
  stockName: string | undefined,
  expiry: string | undefined
) {
  return useQuery({
    queryKey: ["instruments", stockName, expiry],
    queryFn: () =>
      getInstruments({
        stock_name: stockName,
        expiry,
        limit: 2000,
      }),
    enabled: !!stockName && !!expiry,
    staleTime: 60_000,
    select: (data) => {
      const strikeMap = new Map<number, OptionChainRow>();

      for (const inst of data.results) {
        const sp = inst.strike_price;
        if (!strikeMap.has(sp)) {
          strikeMap.set(sp, { strikePrice: sp });
        }
        const row = strikeMap.get(sp)!;
        if (inst.instrument_type === "CE") {
          row.ce = inst;
        } else if (inst.instrument_type === "PE") {
          row.pe = inst;
        }
      }

      return Array.from(strikeMap.values())
        .filter((row) => row.strikePrice > 0)
        .sort((a, b) => a.strikePrice - b.strikePrice);
    },
  });
}
