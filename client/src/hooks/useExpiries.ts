import { useQuery } from "@tanstack/react-query";
import { getExpiries } from "@/api/instruments";

export function useExpiries(instrumentType?: string) {
  return useQuery({
    queryKey: ["expiries", instrumentType],
    queryFn: () => getExpiries({ instrument_type: instrumentType }),
    staleTime: 5 * 60_000,
    select: (data) => data.results.map((e) => e.expiry),
  });
}
