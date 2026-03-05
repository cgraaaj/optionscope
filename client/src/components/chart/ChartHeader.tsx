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
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-sm font-semibold text-text-primary">
        {instrument.trading_symbol}
      </span>
      <span className={`text-xs font-medium ${typeColor}`}>
        {instrument.instrument_type}
      </span>
      <span className="text-xs text-text-muted">
        Strike: {formatPrice(instrument.strike_price)}
      </span>
      {lastPrice !== undefined && (
        <span className="text-sm font-semibold tabular-nums text-text-primary">
          {formatPrice(lastPrice)}
        </span>
      )}
    </div>
  );
}
