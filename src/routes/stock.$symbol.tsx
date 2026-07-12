import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { PriceTag } from "@/components/PriceTag";
import { InteractiveChart } from "@/components/InteractiveChart";
import { getCandles, getCompanyStats, getQuotes, type Range } from "@/lib/market.functions";
import { findCatalog, LOGO_URL } from "@/lib/catalog";
import { useProfile, placeBuy, placeSell } from "@/lib/profile-store";
import { getWatchlist, toggleWatchlist } from "@/lib/profile-sync";
import { Loader2, Heart, Globe } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stock/$symbol")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.symbol.toUpperCase()} — Ascend` },
      { name: "description", content: `Live chart, equity position and full stats for ${params.symbol.toUpperCase()}.` },
    ],
  }),
  component: StockPage,
});

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "10Y", "YTD", "ALL"];

function fmtMoney(n: number, opts: Intl.NumberFormatOptions = {}) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2, ...opts });
}
function fmtCompact(n: number) {
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2 });
}

function StockPage() {
  const { symbol: raw } = useParams({ from: "/stock/$symbol" });
  const symbol = raw.toUpperCase();
  const catalog = findCatalog(symbol);
  const profile = useProfile();
  const qc = useQueryClient();

  const fetchStats = useServerFn(getCompanyStats);
  const fetchCandles = useServerFn(getCandles);
  const fetchQuotes = useServerFn(getQuotes);

  const [range, setRange] = useState<Range>("1D");
  const [watched, setWatched] = useState(false);
  useEffect(() => { getWatchlist().then((list) => setWatched(list.includes(symbol))); }, [symbol]);

  const { data: statsData } = useQuery({
    queryKey: ["stock-stats", symbol],
    queryFn: () => fetchStats({ data: { symbol } }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const stats = statsData?.stats ?? null;

  const { data: quote } = useQuery({
    queryKey: ["stock-quote", symbol],
    queryFn: () => fetchQuotes({ data: { symbols: [symbol] } }),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });
  const q = quote?.quotes?.[0];

  const { data: candleData, isFetching: candlesLoading } = useQuery({
    queryKey: ["stock-candles", symbol, range],
    queryFn: () => fetchCandles({ data: { symbol, range } }),
    staleTime: 60_000,
  });
  const candles = candleData?.candles ?? [];

  const price = stats?.price || q?.price || 0;
  const name = stats?.name || catalog?.name || symbol;

  // Range-specific change ($ and %)
  const rangeMetrics = useMemo(() => {
    if (candles.length < 2) return { delta: stats?.change ?? 0, deltaPct: stats?.changePct ?? 0 };
    const first = candles[0].c;
    const last = candles[candles.length - 1].c;
    const delta = last - first;
    const deltaPct = first ? (delta / first) * 100 : 0;
    return { delta, deltaPct };
  }, [candles, stats]);

  const position = profile.positions?.find((p) => p.symbol === symbol);

  // Portfolio weight (need total portfolio)
  const positions = profile.positions ?? [];
  const cash = profile.cash ?? 0;
  const heldSymbols = positions.map((p) => p.symbol);
  const { data: pf } = useQuery({
    queryKey: ["portfolio-prices", heldSymbols],
    queryFn: () => fetchQuotes({ data: { symbols: heldSymbols } }),
    enabled: heldSymbols.length > 0,
    refetchInterval: 60_000,
  });
  const pfMap = new Map<string, number>();
  for (const x of pf?.quotes ?? []) pfMap.set(x.symbol, x.price);
  const totalPortfolio = cash + positions.reduce((s, p) => s + p.shares * (pfMap.get(p.symbol) ?? p.avgPrice), 0);

  const positionValue = position ? position.shares * price : 0;
  const positionPnL = position ? positionValue - position.shares * position.avgPrice : 0;
  const positionPnLPct = position ? ((price - position.avgPrice) / position.avgPrice) * 100 : 0;
  const dailyChangeOnPos = position ? position.shares * (price * (stats?.changePct ?? q?.change ?? 0) / 100) : 0;
  const portfolioWeight = position && totalPortfolio > 0 ? (positionValue / totalPortfolio) * 100 : 0;

  const [tradeMode, setTradeMode] = useState<"BUY" | "SELL" | null>(null);
  const [qty, setQty] = useState("1");

  const submitTrade = () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter a valid quantity");
    try {
      if (tradeMode === "BUY") {
        placeBuy(symbol, n, price);
        toast.success(`Bought ${n} ${symbol} @ $${fmtMoney(price)}`);
      } else if (tradeMode === "SELL") {
        const r = placeSell(symbol, n, price);
        toast.success(`Sold ${n} ${symbol} — earned ${r.earned} pts`);
      }
      setTradeMode(null);
      qc.invalidateQueries();
    } catch (e: any) {
      toast.error(e?.message ?? "Trade failed");
    }
  };

  const onToggleWatch = async () => {
    try {
      const now = await toggleWatchlist(symbol);
      setWatched(now);
      toast.success(now ? "Added to watchlist" : "Removed from watchlist");
    } catch { toast.error("Sign in to use watchlist"); }
  };

  const stateLabel =
    stats?.marketState === "PRE" ? "PRE MARKET" :
    stats?.marketState === "POST" ? "AFTER HOURS" :
    stats?.marketState === "CLOSED" ? "CLOSED" : null;

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-28 pt-2 space-y-5">
        {/* Header */}
        <header className="flex items-start gap-3">
          <img
            src={LOGO_URL(symbol)}
            alt=""
            onError={(e) => ((e.currentTarget.style.opacity = "0.2"))}
            className="h-12 w-12 rounded-lg bg-white p-1 object-contain"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground truncate">{name}</div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-semibold">{symbol}</h1>
              {stateLabel && (
                <span className="rounded-full bg-fuse-cyan/15 px-2 py-0.5 text-[9px] font-bold text-fuse-cyan tracking-wider">{stateLabel}</span>
              )}
            </div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">${fmtMoney(price)}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs">
              <span className={rangeMetrics.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {rangeMetrics.delta >= 0 ? "+" : ""}${fmtMoney(Math.abs(rangeMetrics.delta))}
              </span>
              <PriceTag change={rangeMetrics.deltaPct} />
              <span className="text-muted-foreground">{range}</span>
            </div>
          </div>
          <button onClick={onToggleWatch} className="rounded-full p-2 hover:bg-secondary/60" aria-label="Toggle watchlist">
            <Heart className={`h-5 w-5 ${watched ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>
        </header>

        {/* Chart */}
        <section className="glass rounded-2xl p-3">
          {candlesLoading && candles.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart…
            </div>
          ) : (
            <InteractiveChart
              points={candles.map((c) => ({ t: c.t, v: c.c }))}
              volumes={candles.map((c) => c.v)}
              showVolume
              height={200}
              symbol={symbol}
            />
          )}
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

        {/* Equity position */}
        <section className="glass rounded-2xl p-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Equity position</h2>
          {position ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Stat label="Current value" value={`$${fmtMoney(positionValue)}`} />
              <Stat label="Shares" value={position.shares.toLocaleString()} />
              <Stat label="Daily change" value={`${dailyChangeOnPos >= 0 ? "+" : ""}$${fmtMoney(Math.abs(dailyChangeOnPos))}`} tone={dailyChangeOnPos >= 0 ? "up" : "down"} />
              <Stat label="Total change" value={`${positionPnL >= 0 ? "+" : ""}$${fmtMoney(Math.abs(positionPnL))} (${positionPnLPct >= 0 ? "+" : ""}${positionPnLPct.toFixed(2)}%)`} tone={positionPnL >= 0 ? "up" : "down"} />
              <Stat label="Avg entry" value={`$${fmtMoney(position.avgPrice)}`} />
              <Stat label="Portfolio weight" value={`${portfolioWeight.toFixed(1)}%`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">N/A — you don't hold any {symbol}.</p>
          )}
        </section>

        {/* Stats */}
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Key stats</h2>
          <div className="glass grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl p-4 text-sm">
            <Stat label="Previous close" value={stats?.prevClose ? `$${fmtMoney(stats.prevClose)}` : "—"} />
            <Stat label="Open" value={stats?.open ? `$${fmtMoney(stats.open)}` : "—"} />
            <Stat label="Day low" value={stats?.dayLow ? `$${fmtMoney(stats.dayLow)}` : "—"} />
            <Stat label="Day high" value={stats?.dayHigh ? `$${fmtMoney(stats.dayHigh)}` : "—"} />
            <Stat label="52W low" value={stats?.low52 ? `$${fmtMoney(stats.low52)}` : "—"} />
            <Stat label="52W high" value={stats?.high52 ? `$${fmtMoney(stats.high52)}` : "—"} />
            <Stat label="Market cap" value={`$${fmtCompact(stats?.marketCap ?? 0)}`} />
            <Stat label="P/E ratio" value={stats?.pe ? stats.pe.toFixed(2) : "—"} />
            <Stat label="Avg volume" value={fmtCompact(stats?.avgVolume ?? 0)} />
            <Stat label="Beta" value={stats?.beta ? stats.beta.toFixed(2) : "—"} />
          </div>
        </section>

        {/* About */}
        {stats && (stats.description || stats.ceo || stats.sector) && (
          <section className="glass rounded-2xl p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">About {symbol}</h2>
            {stats.description && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-6">{stats.description}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              {stats.ceo && <Stat label="CEO" value={stats.ceo} />}
              {stats.sector && <Stat label="Sector" value={stats.sector} />}
              {stats.industry && <Stat label="Industry" value={stats.industry} />}
              {stats.exchange && <Stat label="Exchange" value={stats.exchange} />}
            </div>
            {stats.website && (
              <a href={stats.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-fuse-cyan">
                <Globe className="h-3 w-3" /> {stats.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </section>
        )}
      </div>

      {/* Sticky trade dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Buying power</div>
            <div className="text-sm font-semibold tabular-nums">${fmtMoney(cash)}</div>
          </div>
          <div className="ml-auto flex gap-2">
            {position && (
              <button onClick={() => { setTradeMode("SELL"); setQty(String(position.shares)); }} className="rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold">
                Sell
              </button>
            )}
            <button onClick={() => { setTradeMode("BUY"); setQty("1"); }} disabled={!price} className="rounded-lg bg-fuse-gradient px-6 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              Trade
            </button>
          </div>
        </div>
      </div>

      {!catalog && (
        <Link to="/invest" className="hidden">back</Link>
      )}

      {/* Trade modal */}
      {tradeMode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4" onClick={() => setTradeMode(null)}>
          <div className="glass w-full max-w-sm rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{tradeMode} {symbol}</h3>
            <div className="text-xs text-muted-foreground">Price: <span className="text-foreground">${fmtMoney(price)}</span></div>
            <div className="text-xs text-muted-foreground">Buying power: <span className="text-foreground">${fmtMoney(cash)}</span></div>
            <label className="block">
              <div className="text-[11px] text-muted-foreground mb-1">Quantity</div>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-fuse-cyan"
              />
            </label>
            <div className="text-xs text-muted-foreground">
              {tradeMode === "BUY" ? "Cost" : "Proceeds"}: <span className="text-foreground tabular-nums">${fmtMoney((Number(qty) || 0) * price)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTradeMode(null)} className="flex-1 rounded-lg border border-border bg-secondary/40 py-2 text-sm">Cancel</button>
              <button onClick={submitTrade} className="flex-1 rounded-lg bg-fuse-gradient py-2 text-sm font-semibold text-primary-foreground">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`tabular-nums ${tone === "up" ? "text-emerald-400" : tone === "down" ? "text-rose-400" : ""}`}>{value}</div>
    </div>
  );
}
