import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { EmptyState } from "@/components/EmptyState";
import { PILLARS, PORTFOLIO } from "@/lib/mock-data";
import { getQuotes } from "@/lib/market.functions";
import { PieChart } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — FusionSynergy" },
      { name: "description", content: "Your holdings, sector mix and live performance versus the major indices." },
    ],
  }),
  component: PortfolioPage,
});

const INDEX_SYMBOLS = ["^IXIC", "^GSPC", "^DJI", "^RUT"];
const INDEX_NAMES: Record<string, string> = {
  "^IXIC": "NASDAQ",
  "^GSPC": "S&P 500",
  "^DJI": "DOW",
  "^RUT": "RUT",
};

const RANGES = ["1D", "1W", "1M", "3M", "6M", "1Y", "YTD", "All"] as const;

function PortfolioPage() {
  const hasHoldings = PILLARS.length > 0;
  const [range, setRange] = useState<typeof RANGES[number]>("1D");

  const fetchQuotes = useServerFn(getQuotes);
  const { data } = useQuery({
    queryKey: ["indices", INDEX_SYMBOLS],
    queryFn: () => fetchQuotes({ data: { symbols: INDEX_SYMBOLS } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const indices = data?.quotes ?? [];

  const sectorMap = PILLARS.reduce<Record<string, number>>((acc, p) => {
    acc[p.sector] = (acc[p.sector] || 0) + p.weight;
    return acc;
  }, {});

  // Unrealized P&L: sum of per-position P&L for current holdings.
  const unrealized = useMemo(() => {
    return PILLARS.reduce((sum, p) => {
      const cost = p.shares * p.price * (1 - p.change / 100);
      return sum + (p.shares * p.price - cost);
    }, 0);
  }, []);

  // Neutral flat line until first trade — 24 sample points across the chosen range.
  const chartPoints = useMemo(() => {
    const n = 24;
    return Array.from({ length: n }, (_, i) => ({ x: (i / (n - 1)) * 100, y: 50 }));
  }, [range]);

  const lineColor =
    PORTFOLIO.totalPnL > 0 ? "hsl(var(--success, 142 71% 45%))"
    : PORTFOLIO.totalPnL < 0 ? "hsl(var(--destructive, 0 72% 51%))"
    : "hsl(var(--muted-foreground))";

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Live indices */}
        <section>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Markets right now
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {INDEX_SYMBOLS.map((sym) => {
              const q = indices.find((x) => x.symbol === sym);
              return (
                <div key={sym} className="glass rounded-xl p-3">
                  <div className="text-[11px] text-muted-foreground">{INDEX_NAMES[sym]}</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {q ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                  </div>
                  {q ? <PriceTag change={q.change} /> : <span className="text-[11px] text-muted-foreground">…</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Total portfolio + chart */}
        <section className="glass rounded-2xl p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total portfolio</p>
              <h1 className="text-3xl font-semibold tabular-nums">
                ${PORTFOLIO.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className={PORTFOLIO.totalPnL > 0 ? "text-emerald-400 font-medium" : PORTFOLIO.totalPnL < 0 ? "text-rose-400 font-medium" : "text-muted-foreground"}>
                  {PORTFOLIO.totalPnL >= 0 ? "+" : ""}${PORTFOLIO.totalPnL.toFixed(2)}
                </span>
                <PriceTag change={PORTFOLIO.totalPnLPct} />
                <span className="text-xs text-muted-foreground">{range}</span>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-muted-foreground">Cash available</div>
              <div className="text-base font-semibold tabular-nums">
                ${PORTFOLIO.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="mt-4 h-32 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="portFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke={lineColor}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              />
              <polygon
                fill="url(#portFill)"
                points={`${chartPoints.map((p) => `${p.x},${p.y}`).join(" ")} 100,100 0,100`}
              />
            </svg>
          </div>

          {/* Range tabs */}
          <div className="mt-2 flex flex-wrap gap-1">
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

          {!hasHoldings && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Your line stays flat until your first trade — then it moves with your holdings.
            </p>
          )}
        </section>

        {/* Unrealized P&L */}
        <section className="grid grid-cols-2 gap-2">
          <div className="glass rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground">Unrealized gain / loss</div>
            <div className={`text-lg font-semibold tabular-nums ${unrealized > 0 ? "text-emerald-400" : unrealized < 0 ? "text-rose-400" : ""}`}>
              {unrealized >= 0 ? "+" : ""}${unrealized.toFixed(2)}
            </div>
            <div className="text-[11px] text-muted-foreground">Across all open positions</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-[11px] text-muted-foreground">Today</div>
            <div className={`text-lg font-semibold tabular-nums ${PORTFOLIO.todayPnL > 0 ? "text-emerald-400" : PORTFOLIO.todayPnL < 0 ? "text-rose-400" : ""}`}>
              {PORTFOLIO.todayPnL >= 0 ? "+" : ""}${PORTFOLIO.todayPnL.toFixed(2)}
            </div>
            <PriceTag change={PORTFOLIO.todayPnLPct} />
          </div>
        </section>

        {/* Holdings */}
        <section>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Holdings</h2>
          {hasHoldings ? (
            <div className="glass rounded-xl divide-y divide-border/50">
              {PILLARS.map((p) => (
                <div key={p.ticker} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-semibold">{p.ticker}</div>
                    <div className="text-xs text-muted-foreground">{p.name} · {p.sector}</div>
                  </div>
                  <div className="text-right">
                    <div>{p.weight.toFixed(1)}%</div>
                    <PriceTag change={p.change} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<PieChart className="h-6 w-6 text-muted-foreground" />}
              title="No positions yet"
              description="Once you start practice trading, your holdings and sector mix will live here."
              action={
                <Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                  Find a stock
                </Link>
              }
            />
          )}
        </section>

        {hasHoldings && (
          <section>
            <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Sector mix</h2>
            <div className="space-y-2">
              {Object.entries(sectorMap).map(([s, w]) => (
                <div key={s}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{s}</span><span>{w.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-fuse-gradient" style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
