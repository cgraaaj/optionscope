import { formatPrice } from "@/lib/utils";
import type { Instrument } from "@/types";

interface ChartHeaderProps {
  instrument: Instrument | null;
  lastPrice?: number;
}

export function ChartHeader({ instrument, lastPrice }: ChartHeaderProps) {
  if (!instrument) {
    return (
      <div className="px-4 py-2 text-sm text-text-muted">
        Click a strike price in the option chain to view chart
      </div>
    );
  }

  const typeColor =
    instrument.instrument_type === "CE" ? "text-green" : "text-red";

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 flex-wrap min-w-0">
      <span className="text-xs sm:text-sm font-semibold text-text-primary truncate max-w-[120px] sm:max-w-none">
        {instrument.trading_symbol}
      </span>
      <span className={`text-[10px] sm:text-xs font-medium ${typeColor}`}>
        {instrument.instrument_type}
      </span>
      <span className="hidden sm:inline text-xs text-text-muted">
        Strike: {formatPrice(instrument.strike_price)}
      </span>
      {lastPrice !== undefined && (
        <span className="text-xs sm:text-sm font-semibold tabular-nums text-text-primary">
          {formatPrice(lastPrice)}
        </span>
      )}
    </div>
  );
}
