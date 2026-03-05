import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted uppercase tracking-wider">
        Date
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelect(today)}
          className={cn(
            "rounded-md border border-border px-3 py-1.5 text-sm transition-colors",
            formatDate(selectedDate) === formatDate(today)
              ? "bg-accent text-white border-accent"
              : "bg-surface text-text-primary hover:bg-surface-hover"
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
            "rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary",
            "outline-none focus:border-accent transition-colors",
            "[color-scheme:dark]"
          )}
        />
      </div>
    </div>
  );
}
