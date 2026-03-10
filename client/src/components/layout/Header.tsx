import { RefreshCw } from "lucide-react";
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
    <header className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 border-b border-border bg-surface shrink-0">
      <div className="flex items-center gap-1">
        <span className="text-sm sm:text-base font-semibold text-accent tracking-tight">
          OptionScope
        </span>
      </div>

      <div className="hidden sm:block h-5 w-px bg-border" />

      <StockSearch
        stocks={stocks}
        selectedStock={selectedStock}
        onSelect={onStockSelect}
        isLoading={stocksLoading}
      />

      <div className="hidden sm:block h-5 w-px bg-border" />

      <ExpiryPicker
        expiries={expiries}
        selectedExpiry={selectedExpiry}
        onSelect={onExpirySelect}
        isLoading={expiriesLoading}
      />

      <div className="hidden sm:block h-5 w-px bg-border" />

      <DatePicker selectedDate={selectedDate} onSelect={onDateSelect} />

      <div className="ml-auto">
        <button
          onClick={onRefresh}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-border px-2 sm:px-3 py-1.5",
            "text-xs sm:text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover",
            "transition-colors"
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
