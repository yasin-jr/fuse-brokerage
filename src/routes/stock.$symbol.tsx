import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { PriceTag } from "@/components/PriceTag";
import { getCandles, getCompanyStats, getQuotes, type Range } from "@/lib/market.functions";
import { findCatalog, LOGO_URL } from "@/lib/catalog";
import { useProfile, placeBuy, placeSell } from "@/lib/profile-store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stock/$symbol")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.symbol.toUpperCase()} — FusionSynergy` },
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

  const { data: statsData } = useQuery({
    queryKey: ["stock-stats", symbol],
    queryFn: () => fetchStats({ data: { symbol } }),
    staleTime: 60_000,
  });
  const stats = statsData?.stats ?? null;

  // Live quote fallback for instant price
  const { data: quote } = useQuery({
    queryKey: ["stock-quote", symbol],
    queryFn: () => fetchQuotes({ data: { symbols: [symbol] } }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const q = quote?.quotes?.[0];

  const { data: candleData, isFetching: candlesLoading } = useQuery({
    queryKey: ["stock-candles", symbol, range],
    queryFn: () => fetchCandles({ data: { symbol, range } }),
    staleTime: 60_000,
  });
  const candles = candleData?.candles ?? [];

  const price = stats?.price || q?.price || 0;
  const changePct = stats?.changePct ?? q?.change ?? 0;
  const name = stats?.name || catalog?.name || symbol;

  const position = profile.positions?.find((p) => p.symbol === symbol);
  const positionValue = position ? position.shares * price : 0;
  const positionPnL = position ? positionValue - position.shares * position.avgPrice : 0;
  const positionPnLPct = position ? ((price - position.avgPrice) / position.avgPrice) * 100 : 0;

  const path = useMemo(() => {
    if (candles.length < 2) return "";
    const ys = candles.map((c) => c.c);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const pad = (max - min) * 0.05 || 1;
    const lo = min - pad;
    const hi = max + pad;
    const n = candles.length;
    return candles
      .map((c, i) => {
        const x = (i / (n - 1)) * 100;
        const y = 100 - ((c.c - lo) / (hi - lo)) * 100;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [candles]);

  const lineColor =
    changePct > 0 ? "rgb(52 211 153)" : changePct < 0 ? "rgb(244 63 94)" : "rgb(148 163 184)";

  // Buy / sell modal
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
        toast.success(`Sold ${n} ${symbol} @ $${fmtMoney(price)} — earned ${r.earned} pts`);
      }
      setTradeMode(null);
      qc.invalidateQueries();
    } catch (e: any) {
      toast.error(e?.message ?? "Trade failed");
    }
  };

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2 space-y-5">
        {/* Header */}
        <header className="flex items-center gap-3">
          <img
            src={LOGO_URL(symbol)}
            alt=""
            onError={(e) => ((e.currentTarget.style.opacity = "0.2"))}
            className="h-12 w-12 rounded-lg bg-white p-1 object-contain"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground truncate">{name}</div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-semibold">{symbol}</h1>
              <span className="text-2xl font-semibold tabular-nums">${fmtMoney(price)}</span>
            </div>
            <div className="text-xs"><PriceTag change={changePct} /></div>
          </div>
        </header>

        {/* Chart */}
        <section className="glass rounded-2xl p-4">
          <div className="h-48 w-full">
            {candlesLoading && candles.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading chart…
              </div>
            ) : candles.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No data for this range
              </div>
            ) : (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${path} L100,100 L0,100 Z`} fill="url(#g)" />
                <path d={path} fill="none" stroke={lineColor} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
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
              <Stat label="Shares" value={position.shares.toLocaleString()} />
              <Stat label="Avg entry" value={`$${fmtMoney(position.avgPrice)}`} />
              <Stat label="Current value" value={`$${fmtMoney(positionValue)}`} />
              <Stat
                label="Daily change"
                value={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`}
                tone={changePct >= 0 ? "up" : "down"}
              />
              <Stat
                label="Total P&L"
                value={`${positionPnL >= 0 ? "+" : ""}$${fmtMoney(Math.abs(positionPnL))} (${positionPnLPct >= 0 ? "+" : ""}${positionPnLPct.toFixed(2)}%)`}
                tone={positionPnL >= 0 ? "up" : "down"}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">N/A — you don't hold any {symbol}.</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => { setTradeMode("BUY"); setQty("1"); }}
              disabled={!price}
              className="flex-1 rounded-lg bg-fuse-gradient py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Buy
            </button>
            <button
              onClick={() => { setTradeMode("SELL"); setQty(position?.shares?.toString() || "1"); }}
              disabled={!position}
              className="flex-1 rounded-lg border border-border bg-secondary/40 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Sell
            </button>
          </div>
        </section>

        {/* Key stats */}
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Key stats</h2>
          <div className="glass grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl p-4 text-sm">
            <Stat label="Market Cap" value={`$${fmtCompact(stats?.marketCap ?? 0)}`} />
            <Stat label="P/E Ratio" value={stats?.pe ? stats.pe.toFixed(2) : "—"} />
            <Stat label="Average Volume" value={fmtCompact(stats?.avgVolume ?? 0)} />
            <Stat label="Open" value={stats?.open ? `$${fmtMoney(stats.open)}` : "—"} />
            <Stat label="Close" value={price ? `$${fmtMoney(price)}` : "—"} />
            <Stat label="Previous Close" value={stats?.prevClose ? `$${fmtMoney(stats.prevClose)}` : (q?.prevClose ? `$${fmtMoney(q.prevClose)}` : "—")} />
          </div>
        </section>

        {!catalog && (
          <Link to="/invest" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="inline h-3 w-3 mr-1" /> Back to markets
          </Link>
        )}
      </div>

      {/* Trade modal */}
      {tradeMode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4" onClick={() => setTradeMode(null)}>
          <div className="glass w-full max-w-sm rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">{tradeMode} {symbol}</h3>
            <div className="text-xs text-muted-foreground">Price: <span className="text-foreground">${fmtMoney(price)}</span></div>
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
