import { Link } from "@tanstack/react-router";

export type HeatCell = { symbol: string; name: string; marketCap: number; change: number };

/** Treemap-ish responsive grid where size ~ marketCap and color ~ change. */
export function Heatmap({ cells }: { cells: HeatCell[] }) {
  if (!cells.length) {
    return <div className="glass rounded-xl p-6 text-center text-xs text-muted-foreground">Loading heatmap…</div>;
  }
  const total = cells.reduce((s, c) => s + c.marketCap, 0);
  return (
    <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
      {cells.map((c) => {
        const share = c.marketCap / total;
        // size class buckets
        const span =
          share > 0.08 ? "col-span-3 row-span-2" :
          share > 0.045 ? "col-span-2 row-span-2" :
          share > 0.025 ? "col-span-2 row-span-1" :
          "col-span-1 row-span-1";
        const ch = Math.max(-5, Math.min(5, c.change));
        const intensity = Math.min(1, Math.abs(ch) / 4);
        const bg = ch >= 0
          ? `color-mix(in oklab, rgb(16 185 129) ${20 + intensity * 50}%, rgb(15 23 42))`
          : `color-mix(in oklab, rgb(244 63 94) ${20 + intensity * 50}%, rgb(15 23 42))`;
        return (
          <Link
            key={c.symbol}
            to="/stock/$symbol"
            params={{ symbol: c.symbol }}
            className={`${span} flex flex-col items-center justify-center rounded-md p-1.5 text-center transition-transform hover:scale-[1.03]`}
            style={{ background: bg, minHeight: 56 }}
          >
            <div className="text-xs font-bold text-white drop-shadow-sm">{c.symbol}</div>
            <div className={`text-[10px] tabular-nums ${c.change >= 0 ? "text-emerald-100" : "text-rose-100"}`}>
              {c.change >= 0 ? "+" : ""}{c.change.toFixed(2)}%
            </div>
          </Link>
        );
      })}
    </div>
  );
}
