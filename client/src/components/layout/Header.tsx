import { RefreshCw, Activity } from "lucide-react";
import { StockSearch } from "@/components/common/StockSearch";
import { ExpiryPicker } from "@/components/common/ExpiryPicker";
import { DatePicker } from "@/components/common/DatePicker";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types";

interface HeaderProps {
  stocks: Stock[];
  stocksLoading: boolean;
  selectedStock: Stock | null;
  onStockSelect: (stock: Stock) => void;
  expiries: string[];
  expiriesLoading: boolean;
  selectedExpiry: string | null;
  onExpirySelect: (expiry: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onRefresh: () => void;
}

export function Header({
  stocks,
  stocksLoading,
  selectedStock,
  onStockSelect,
  expiries,
  expiriesLoading,
  selectedExpiry,
  onExpirySelect,
  selectedDate,
  onDateSelect,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-b border-border bg-gradient-to-r from-surface to-surface-elevated shrink-0">
      <div className="flex items-center gap-1.5">
        <Activity className="h-4 w-4 text-accent" />
        <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent tracking-tight">
          OptionScope
        </span>
      </div>

      <div className="hidden sm:block h-5 w-px bg-border/60" />

      <StockSearch
        stocks={stocks}
        selectedStock={selectedStock}
        onSelect={onStockSelect}
        isLoading={stocksLoading}
      />

      <div className="hidden sm:block h-5 w-px bg-border/60" />

      <ExpiryPicker
        expiries={expiries}
        selectedExpiry={selectedExpiry}
        onSelect={onExpirySelect}
        isLoading={expiriesLoading}
        disabled={!selectedStock}
      />

      <div className="hidden sm:block h-5 w-px bg-border/60" />

      <DatePicker selectedDate={selectedDate} onSelect={onDateSelect} />

      <div className="ml-auto">
        <button
          onClick={onRefresh}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-border/60 px-2 sm:px-3 py-1.5",
            "text-xs sm:text-sm text-text-secondary hover:text-accent hover:border-accent/40 hover:bg-accent/5",
            "transition-all duration-200"
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
