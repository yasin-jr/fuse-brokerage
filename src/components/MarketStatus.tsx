import { useEffect, useState } from "react";

type State = "PRE" | "REGULAR" | "POST" | "CLOSED" | "HOLIDAY";

// US market holidays — hardcoded through 2027 (approx). Format: YYYY-MM-DD.
const HOLIDAYS = new Set([
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
  "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31",
  "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
]);

/** Returns market state + a short countdown label ("Opens in 2h 14m"). */
function compute(): { state: State; label: string; sub: string } {
  const now = new Date();
  // NY time is UTC-4/UTC-5. Simple approximation using UTC hours; US markets run 09:30-16:00 ET.
  const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const day = now.getUTCDay();
  const iso = now.toISOString().slice(0, 10);

  // ET offset ~ 4 or 5 hours behind UTC. Use 4 (EDT). For simplicity: regular = 13:30-20:00 UTC.
  const preOpen = 8 * 60;      // 08:00 UTC = 04:00 ET pre-market start
  const regOpen = 13 * 60 + 30; // 13:30 UTC = 09:30 ET
  const regClose = 20 * 60;    // 20:00 UTC = 16:00 ET
  const postClose = 24 * 60;   // 24:00 UTC = 20:00 ET

  if (day === 0 || day === 6) return { state: "CLOSED", label: "Market Closed", sub: "Weekend" };
  if (HOLIDAYS.has(iso)) return { state: "HOLIDAY", label: "Market Holiday", sub: "US Holiday" };

  const fmtDur = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (utcMin < preOpen) return { state: "CLOSED", label: "Market Closed", sub: `Pre-market in ${fmtDur(preOpen - utcMin)}` };
  if (utcMin < regOpen) return { state: "PRE", label: "Pre-Market", sub: `Opens in ${fmtDur(regOpen - utcMin)}` };
  if (utcMin < regClose) return { state: "REGULAR", label: "Market Open", sub: `Closes in ${fmtDur(regClose - utcMin)}` };
  if (utcMin < postClose) return { state: "POST", label: "After Hours", sub: `Ends in ${fmtDur(postClose - utcMin)}` };
  return { state: "CLOSED", label: "Market Closed", sub: "Reopens tomorrow" };
}

const DOT: Record<State, string> = {
  REGULAR: "bg-emerald-400",
  PRE: "bg-amber-400",
  POST: "bg-amber-400",
  CLOSED: "bg-rose-400",
  HOLIDAY: "bg-rose-400",
};

export function MarketStatus({ variant = "pill" }: { variant?: "pill" | "full" }) {
  const [info, setInfo] = useState(compute);
  useEffect(() => {
    const id = setInterval(() => setInfo(compute()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (variant === "full") {
    return (
      <div className="glass flex items-center gap-3 rounded-full px-4 py-2">
        <span className={`h-2 w-2 rounded-full ${DOT[info.state]} ascend-glow-pulse`} />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold">{info.label}</span>
          <span className="text-[10px] text-muted-foreground">{info.sub}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      title={info.sub}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[info.state]} ascend-glow-pulse`} />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{info.label}</span>
    </div>
  );
}
