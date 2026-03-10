import { Layers, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnderlyingOverlayProps {
  showOverlay: boolean;
  onToggle: () => void;
  overlayOpacity: number;
  onOpacityChange: (opacity: number) => void;
  foreground: "option" | "equity";
  onForegroundToggle: () => void;
  isLoading: boolean;
}

export function UnderlyingOverlay({
  showOverlay,
  onToggle,
  overlayOpacity,
  onOpacityChange,
  foreground,
  onForegroundToggle,
  isLoading,
}: UnderlyingOverlayProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs transition-colors",
          showOverlay
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        )}
      >
        <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span className="hidden sm:inline">{showOverlay ? "Underlying ON" : "Show Underlying"}</span>
        <span className="sm:hidden">{showOverlay ? "ON" : "Overlay"}</span>
        {isLoading && (
          <span className="ml-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
        )}
      </button>

      {showOverlay && (
        <>
          <button
            onClick={onForegroundToggle}
            className={cn(
              "flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] sm:text-xs transition-colors",
              "hover:bg-surface-hover"
            )}
            title={
              foreground === "option"
                ? "Option chart is in front"
                : "Equity chart is in front"
            }
          >
            {foreground === "option" ? (
              <>
                <Eye className="h-3 w-3 text-green" />
                <span className="text-text-secondary">Option</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 text-accent" />
                <span className="text-text-secondary">Equity</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <EyeOff className="h-3 w-3 text-text-muted" />
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 accent-accent"
            />
            <Eye className="h-3 w-3 text-text-muted" />
          </div>
        </>
      )}
    </div>
  );
}
