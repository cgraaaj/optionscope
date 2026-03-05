import { cn } from "@/lib/utils";
import type { Interval } from "@/types";

const INTERVALS: { value: Interval; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
];

interface IntervalSelectorProps {
  selected: Interval;
  onSelect: (interval: Interval) => void;
}

export function IntervalSelector({
  selected,
  onSelect,
}: IntervalSelectorProps) {
  return (
    <div className="flex items-center gap-0.5">
      {INTERVALS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            selected === value
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
