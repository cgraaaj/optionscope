import { useQuery } from "@tanstack/react-query";
import { getStocks } from "@/api/stocks";

export function useStocks() {
  return useQuery({
    queryKey: ["stocks"],
    queryFn: () => getStocks({ include_inactive: true }),
    staleTime: 5 * 60_000,
    select: (data) => data.results,
  });
}
