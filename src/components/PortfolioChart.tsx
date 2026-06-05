import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPortfolioHistory, type Range } from "@/lib/market.functions";
import { InteractiveChart } from "@/components/InteractiveChart";

const RANGES: Range[] = ["1D", "1W", "1M", "6M", "1Y", "YTD", "ALL"];

type Props = {
  positions: { symbol: string; shares: number }[];
  cash: number;
};

export function PortfolioChart({ positions, cash }: Props) {
  const [range, setRange] = useState<Range>("1M");
  const fetchHistory = useServerFn(getPortfolioHistory);

  const { data, isFetching } = useQuery({
    queryKey: ["portfolio-history", range, positions.map((p) => `${p.symbol}:${p.shares}`).join("|"), cash],
    queryFn: () => fetchHistory({ data: { positions, cash, range } }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const points = (data?.points ?? []).map((p) => ({ t: p.t, v: p.v }));
  const first = points[0]?.v ?? 0;
  const last = points[points.length - 1]?.v ?? 0;
  const delta = last - first;
  const pct = first ? (delta / first) * 100 : 0;
  const neutral = Math.abs(pct) < 0.05;
  const tone = neutral ? "text-muted-foreground" : delta >= 0 ? "text-emerald-400" : "text-rose-400";
  const arrow = neutral ? "•" : delta >= 0 ? "▲" : "▼";

  return (
    <section className="glass rounded-2xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Portfolio chart</h2>
        <span className={`text-xs ${tone}`}>
          {arrow} {delta >= 0 ? "+" : ""}${Math.abs(delta).toFixed(2)} ({delta >= 0 ? "+" : ""}{pct.toFixed(2)}%)
        </span>
      </div>
      <InteractiveChart points={points} height={180} loading={isFetching} symbol="PORTFOLIO" />
      <div className="mt-3 flex flex-wrap gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3 py-1 text-xs ${
              range === r ? "bg-fuse-gradient text-primary-foreground" : "bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </section>
  );
}
