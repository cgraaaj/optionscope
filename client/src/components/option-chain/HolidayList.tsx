import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface Holiday {
  date: string;
  name: string;
}

const NSE_HOLIDAYS: Record<number, Holiday[]> = {
  2025: [
    { date: "2025-02-26", name: "Mahashivratri" },
    { date: "2025-03-14", name: "Holi" },
    { date: "2025-03-31", name: "Eid-Ul-Fitr" },
    { date: "2025-04-10", name: "Shri Mahavir Jayanti" },
    { date: "2025-04-14", name: "Dr. Ambedkar Jayanti" },
    { date: "2025-04-18", name: "Good Friday" },
    { date: "2025-05-01", name: "Maharashtra Day" },
    { date: "2025-08-15", name: "Independence Day" },
    { date: "2025-08-27", name: "Ganesh Chaturthi" },
    { date: "2025-10-02", name: "Gandhi Jayanti / Dussehra" },
    { date: "2025-10-21", name: "Diwali (Muhurat Trading)" },
    { date: "2025-10-22", name: "Diwali Balipratipada" },
    { date: "2025-11-05", name: "Guru Nanak Jayanti" },
    { date: "2025-12-25", name: "Christmas" },
  ],
  2026: [
    { date: "2026-01-26", name: "Republic Day" },
    { date: "2026-03-03", name: "Holi" },
    { date: "2026-03-26", name: "Shri Ram Navami" },
    { date: "2026-03-31", name: "Shri Mahavir Jayanti" },
    { date: "2026-04-03", name: "Good Friday" },
    { date: "2026-04-14", name: "Dr. Ambedkar Jayanti" },
    { date: "2026-05-01", name: "Maharashtra Day" },
    { date: "2026-05-28", name: "Bakri Id" },
    { date: "2026-06-26", name: "Muharram" },
    { date: "2026-09-14", name: "Ganesh Chaturthi" },
    { date: "2026-10-02", name: "Mahatma Gandhi Jayanti" },
    { date: "2026-10-20", name: "Dussehra" },
    { date: "2026-11-10", name: "Diwali Balipratipada" },
    { date: "2026-11-24", name: "Guru Nanak Jayanti" },
    { date: "2026-12-25", name: "Christmas" },
  ],
};

function formatHolidayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

interface HolidayListProps {
  selectedDate: Date;
}

export function HolidayList({ selectedDate }: HolidayListProps) {
  const [expanded, setExpanded] = useState(false);
  const year = selectedDate.getFullYear();
  const holidays = NSE_HOLIDAYS[year] ?? [];
  const todayStr = `${year}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const { upcoming, past } = useMemo(() => {
    const up: Holiday[] = [];
    const pa: Holiday[] = [];
    for (const h of holidays) {
      if (h.date >= todayStr) up.push(h);
      else pa.push(h);
    }
    return { upcoming: up, past: pa };
  }, [holidays, todayStr]);

  if (holidays.length === 0) return null;

  const isSelectedDateHoliday = holidays.some((h) => h.date === todayStr);
  const shown = expanded ? holidays : upcoming.slice(0, 3);

  return (
    <div className="border-t border-border bg-surface/60 shrink-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
            NSE Holidays {year}
          </span>
          {isSelectedDateHoliday && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red/20 text-red font-medium">
              HOLIDAY
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-muted">
          {expanded ? "Hide" : `${upcoming.length} upcoming`} ▾
        </span>
      </button>

      {(expanded || shown.length > 0) && (
        <div className="px-3 pb-2 max-h-[140px] overflow-y-auto">
          {expanded && past.length > 0 && (
            <div className="mb-1">
              {past.map((h) => (
                <div
                  key={h.date}
                  className="flex items-center justify-between py-0.5 text-[10px] text-text-muted/60 line-through"
                >
                  <span>{h.name}</span>
                  <span className="tabular-nums">{formatHolidayDate(h.date)}</span>
                </div>
              ))}
            </div>
          )}
          {(expanded ? upcoming : shown).map((h) => (
            <div
              key={h.date}
              className={cn(
                "flex items-center justify-between py-0.5 text-[10px]",
                h.date === todayStr
                  ? "text-red font-medium"
                  : "text-text-secondary"
              )}
            >
              <span>{h.name}</span>
              <span className="tabular-nums">{formatHolidayDate(h.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
