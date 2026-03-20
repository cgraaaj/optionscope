import { formatExpiry } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExpiryPickerProps {
  expiries: string[];
  selectedExpiry: string | null;
  onSelect: (expiry: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ExpiryPicker({
  expiries,
  selectedExpiry,
  onSelect,
  isLoading,
  disabled,
}: ExpiryPickerProps) {
  const isDisabled = disabled || isLoading || expiries.length === 0;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-[10px] text-text-muted uppercase tracking-widest font-medium">
        Expiry
      </span>
      <select
        value={selectedExpiry ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isDisabled}
        className={cn(
          "rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-sm text-text-primary",
          "outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200",
          "disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        <option value="" disabled>
          {isLoading
            ? "Loading..."
            : disabled
              ? "Select stock first"
              : "Select expiry"}
        </option>
        {expiries.map((exp) => (
          <option key={exp} value={exp}>
            {formatExpiry(exp)}
          </option>
        ))}
      </select>
    </div>
  );
}
