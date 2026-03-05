import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTicksBatched } from "@/api/candles";
import { cn, formatPrice } from "@/lib/utils";
import type { Instrument, OptionChainRow } from "@/types";

interface OptionChainTableProps {
  rows: OptionChainRow[];
  isLoading: boolean;
  onInstrumentSelect: (instrument: Instrument) => void;
  selectedInstrumentId?: string;
  /** ISO date range for the selected trade date – option chain LTP/OI/volume use ticks for this day */
  startOfDay?: string;
  endOfDay?: string;
}

export function OptionChainTable({
  rows,
  isLoading,
  onInstrumentSelect,
  selectedInstrumentId,
  startOfDay,
  endOfDay,
}: OptionChainTableProps) {
  const allInstrumentSeqs = rows
    .flatMap((r) => [r.ce?.instrument_seq, r.pe?.instrument_seq])
    .filter((id): id is number => id !== undefined);

  const { data: ticksData } = useQuery({
    queryKey: [
      "optionChainTicks",
      allInstrumentSeqs.join(","),
      startOfDay ?? "",
      endOfDay ?? "",
    ],
    queryFn: () =>
      getTicksBatched(allInstrumentSeqs, {
        start: startOfDay,
        end: endOfDay,
        limitPerInstrument: 400,
      }),
    enabled: allInstrumentSeqs.length > 0 && !!startOfDay && !!endOfDay,
    staleTime: 30_000,
  });

  const tickMap = useMemo(() => {
    const map = new Map<number, { close: number; volume: number; oi: number }>();
    if (!ticksData?.results?.length) return map;
    const latestByInstrument = new Map<number, (typeof ticksData.results)[0]>();
    for (const tick of ticksData.results) {
      const existing = latestByInstrument.get(tick.instrument_id);
      if (!existing || tick.time_stamp > existing.time_stamp) {
        latestByInstrument.set(tick.instrument_id, tick);
      }
    }
    for (const [id, tick] of latestByInstrument) {
      map.set(id, {
        close: tick.close,
        volume: Number(tick.volume),
        oi: Number(tick.open_interest),
      });
    }
    return map;
  }, [ticksData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Loading option chain...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Select a stock and expiry to view the option chain
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface">
            <th
              colSpan={4}
              className="text-center text-green font-medium py-2 border-b border-border"
            >
              CALLS
            </th>
            <th className="text-center text-text-muted font-medium py-2 border-b border-border border-x border-border-light">
              STRIKE
            </th>
            <th
              colSpan={4}
              className="text-center text-red font-medium py-2 border-b border-border"
            >
              PUTS
            </th>
          </tr>
          <tr className="bg-surface text-text-muted">
            <th className="py-1.5 px-2 text-right font-normal">OI</th>
            <th className="py-1.5 px-2 text-right font-normal">Volume</th>
            <th className="py-1.5 px-2 text-right font-normal">LTP</th>
            <th className="py-1.5 px-2 text-right font-normal border-r border-border-light">
              Chg%
            </th>
            <th className="py-1.5 px-3 text-center font-semibold text-text-primary border-x border-border-light">
              Strike
            </th>
            <th className="py-1.5 px-2 text-left font-normal border-l border-border-light">
              Chg%
            </th>
            <th className="py-1.5 px-2 text-left font-normal">LTP</th>
            <th className="py-1.5 px-2 text-left font-normal">Volume</th>
            <th className="py-1.5 px-2 text-left font-normal">OI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ceData = row.ce
              ? tickMap.get(row.ce.instrument_seq)
              : undefined;
            const peData = row.pe
              ? tickMap.get(row.pe.instrument_seq)
              : undefined;

            return (
              <tr
                key={row.strikePrice}
                className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors"
              >
                <td className="py-1.5 px-2 text-right text-text-secondary tabular-nums">
                  {ceData?.oi ? ceData.oi.toLocaleString() : "-"}
                </td>
                <td className="py-1.5 px-2 text-right text-text-secondary tabular-nums">
                  {ceData?.volume ? ceData.volume.toLocaleString() : "-"}
                </td>
                <td
                  onClick={() => row.ce && onInstrumentSelect(row.ce)}
                  className={cn(
                    "py-1.5 px-2 text-right tabular-nums",
                    row.ce && "cursor-pointer hover:text-green",
                    row.ce?.id === selectedInstrumentId && "text-green font-semibold",
                    ceData?.close ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  {ceData?.close ? formatPrice(ceData.close) : "-"}
                </td>
                <td className="py-1.5 px-2 text-right text-text-muted border-r border-border-light">
                  -
                </td>

                <td className="py-1.5 px-3 text-center font-semibold text-text-primary bg-surface/80 border-x border-border-light tabular-nums">
                  {formatPrice(row.strikePrice)}
                </td>

                <td className="py-1.5 px-2 text-left text-text-muted border-l border-border-light">
                  -
                </td>
                <td
                  onClick={() => row.pe && onInstrumentSelect(row.pe)}
                  className={cn(
                    "py-1.5 px-2 text-left tabular-nums",
                    row.pe && "cursor-pointer hover:text-red",
                    row.pe?.id === selectedInstrumentId && "text-red font-semibold",
                    peData?.close ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  {peData?.close ? formatPrice(peData.close) : "-"}
                </td>
                <td className="py-1.5 px-2 text-left text-text-secondary tabular-nums">
                  {peData?.volume ? peData.volume.toLocaleString() : "-"}
                </td>
                <td className="py-1.5 px-2 text-left text-text-secondary tabular-nums">
                  {peData?.oi ? peData.oi.toLocaleString() : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
