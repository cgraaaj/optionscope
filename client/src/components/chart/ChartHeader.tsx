import { cn, formatPrice } from "@/lib/utils";
import type { Instrument } from "@/types";

interface ChartHeaderProps {
  instrument: Instrument | null;
  lastPrice?: number;
}

export function ChartHeader({ instrument, lastPrice }: ChartHeaderProps) {
  if (!instrument) {
    return (
      <div className="px-4 py-2 text-xs text-text-muted/70">
        Select a strike to view chart
      </div>
    );
  }

  const isCE = instrument.instrument_type === "CE";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-1.5 sm:py-2 flex-wrap min-w-0">
      <span className="text-xs sm:text-sm font-semibold text-text-primary truncate max-w-[120px] sm:max-w-none">
        {instrument.trading_symbol}
      </span>
      <span
        className={cn(
          "text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded",
          isCE
            ? "bg-green/15 text-green"
            : "bg-red/15 text-red"
        )}
      >
        {instrument.instrument_type}
      </span>
      <span className="hidden sm:inline text-[10px] text-text-muted tabular-nums">
        Strike {formatPrice(instrument.strike_price)}
      </span>
      {lastPrice !== undefined && (
        <span className="text-xs sm:text-sm font-bold tabular-nums text-text-primary ml-1">
          {formatPrice(lastPrice)}
        </span>
      )}
    </div>
  );
}
