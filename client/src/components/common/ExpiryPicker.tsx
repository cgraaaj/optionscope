import { formatExpiry } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExpiryPickerProps {
  expiries: string[];
  selectedExpiry: string | null;
  onSelect: (expiry: string) => void;
  isLoading: boolean;
}

export function ExpiryPicker({
  expiries,
  selectedExpiry,
  onSelect,
  isLoading,
}: ExpiryPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted uppercase tracking-wider">
        Expiry
      </span>
      <select
        value={selectedExpiry ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading || expiries.length === 0}
        className={cn(
          "rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary",
          "outline-none focus:border-accent transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <option value="" disabled>
          {isLoading ? "Loading..." : "Select expiry"}
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
