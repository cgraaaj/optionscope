import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date();
  const isToday = formatDate(selectedDate) === formatDate(today);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-[10px] text-text-muted uppercase tracking-widest font-medium">
        Date
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelect(today)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200",
            isToday
              ? "bg-accent text-white border-accent shadow-sm shadow-accent/20"
              : "bg-surface text-text-secondary border-border/60 hover:text-text-primary hover:bg-surface-hover"
          )}
        >
          Today
        </button>
        <input
          type="date"
          value={formatDate(selectedDate)}
          onChange={(e) => {
            if (e.target.value) {
              onSelect(new Date(e.target.value + "T00:00:00"));
            }
          }}
          className={cn(
            "rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-sm text-text-primary",
            "outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200",
            "[color-scheme:dark]"
          )}
        />
      </div>
    </div>
  );
}
