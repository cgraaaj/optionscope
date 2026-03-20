import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types";

interface StockSearchProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelect: (stock: Stock) => void;
  isLoading: boolean;
}

export function StockSearch({
  stocks,
  selectedStock,
  onSelect,
  isLoading,
}: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? stocks.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
    : stocks;

  const activeFirst = [...filtered].sort((a, b) => {
    if (a.is_active === b.is_active) return a.name.localeCompare(b.name);
    return a.is_active ? -1 : 1;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface px-3 py-1.5",
          "focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 transition-all duration-200"
        )}
      >
        <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={isLoading ? "Loading..." : "Search stock..."}
          value={open ? query : selectedStock?.name ?? query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          className="bg-transparent text-text-primary text-sm outline-none w-24 sm:w-36 placeholder:text-text-muted/70"
        />
        {!open && selectedStock && !selectedStock.is_active && (
          <span className="shrink-0 text-[9px] font-medium px-1 py-0.5 rounded bg-yellow-500/15 text-yellow-500 leading-none">
            OLD
          </span>
        )}
      </div>

      {open && activeFirst.length > 0 && (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-72 overflow-y-auto rounded-lg border border-border/60 bg-surface-elevated shadow-xl shadow-black/30 z-50 backdrop-blur-sm">
          {activeFirst.slice(0, 50).map((stock) => (
            <button
              key={stock.id}
              onClick={() => {
                onSelect(stock);
                setQuery("");
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                selectedStock?.id === stock.id
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <span className="truncate">{stock.name}</span>
              {!stock.is_active && (
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-500">
                  DELISTED
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
