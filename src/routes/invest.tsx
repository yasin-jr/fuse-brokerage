import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { SearchOverlay } from "@/components/SearchOverlay";
import { getLargestByMarketCap, getMovers, getSectorPerformance } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";
import { THEMES } from "@/lib/themes";
import { Search, Sparkles, ChevronRight, TrendingUp, TrendingDown, Activity } from "lucide-react";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — Ascend" },
      { name: "description", content: "Browse the largest companies, top movers, sector heatmap, and curated themes. Search any of 30,000+ tickers." },
      { property: "og:title", content: "Invest — Ascend" },
      { property: "og:description", content: "Largest companies, top movers, sector heatmap and curated themes." },
      { property: "og:url", content: "https://ascend-invests.lovable.app/invest" },
    ],
    links: [{ rel: "canonical", href: "https://ascend-invests.lovable.app/invest" }],
  }),
  component: InvestPage,
});

function InvestPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const fetchLargest = useServerFn(getLargestByMarketCap);
  const fetchMovers = useServerFn(getMovers);
  const fetchSectors = useServerFn(getSectorPerformance);

  const { data: largestData } = useQuery({
    queryKey: ["largest-cap", 20],
    queryFn: () => fetchLargest({ data: { limit: 20 } }),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
  const { data: moversData } = useQuery({
    queryKey: ["movers"],
    queryFn: () => fetchMovers({ data: { limit: 5 } }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const { data: sectorData } = useQuery({
    queryKey: ["sectors"],
    queryFn: () => fetchSectors(),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });

  const largest = (largestData?.rows ?? []).slice(0, 6);
  const gainers = (moversData?.gainers ?? []).slice(0, 3);
  const losers = (moversData?.losers ?? []).slice(0, 3);
  const actives = (moversData?.actives ?? []).slice(0, 3);
  const sectors = sectorData?.sectors ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Invest</h1>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-left"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search any stock — NVDA, Apple, BTC…</span>
        </button>

        <Link to="/ai" className="block rounded-xl bg-fuse-gradient p-[1px] text-sm font-semibold">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-card py-2.5 text-fuse-cyan">
            <Sparkles className="h-4 w-4" /> Chat with FUSE Intelligence
          </span>
        </Link>

        {/* Largest by Market Cap */}
        <SectionHeader title="Largest by market cap" viewAllTo="/invest/largest-cap" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {largest.length === 0 ? <SkeletonRow count={6} /> : largest.map((c) => <StockCard key={c.symbol} symbol={c.symbol} name={c.name} price={c.price} change={c.change} />)}
        </div>

        {/* Movers */}
        <MoverSection title="Top winners" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} viewAllTo="/invest/movers/$kind" params={{ kind: "gainers" }} items={gainers} />
        <MoverSection title="Top losers"  icon={<TrendingDown className="h-4 w-4 text-rose-400" />} viewAllTo="/invest/movers/$kind" params={{ kind: "losers" }}  items={losers} />
        <MoverSection title="Top traded"  icon={<Activity className="h-4 w-4 text-fuse-cyan" />} viewAllTo="/invest/movers/$kind" params={{ kind: "actives" }} items={actives} />

        {/* Sector heatmap */}
        <div>
          <h2 className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Market heat map
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sectors.length === 0 ? (
              <div className="col-span-full glass rounded-xl p-4 text-center text-xs text-muted-foreground">Loading sectors…</div>
            ) : sectors.map((s) => {
              const bg = s.tone === "up"
                ? `color-mix(in oklab, rgb(16 185 129) ${30 + Math.min(40, Math.abs(s.change) * 12)}%, rgb(15 23 42))`
                : s.tone === "down"
                ? `color-mix(in oklab, rgb(244 63 94) ${30 + Math.min(40, Math.abs(s.change) * 12)}%, rgb(15 23 42))`
                : `rgb(51 65 85)`;
              return (
                <div key={s.sector} className="rounded-lg p-3" style={{ background: bg }}>
                  <div className="text-xs font-semibold text-white drop-shadow">{s.sector}</div>
                  <div className="mt-1 text-sm tabular-nums text-white">
                    {s.tone === "neutral" ? "•" : s.change >= 0 ? "▲" : "▼"} {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Themes */}
        <SectionHeader title="Themes" viewAllTo="/invest/themes" />
        <div className="-mx-4 overflow-x-auto px-4 pb-2">
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {THEMES.slice(0, 8).map((t) => (
              <Link
                key={t.id}
                to="/invest/theme/$themeId"
                params={{ themeId: t.id }}
                className="block w-40 rounded-2xl p-4 text-white shadow-elegant"
                style={{ background: t.gradient }}
              >
                <div className="text-2xl">{t.emoji}</div>
                <div className="mt-2 text-sm font-semibold leading-tight">{t.name}</div>
                <div className="mt-1 line-clamp-2 text-[10px] opacity-80">{t.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </AppShell>
  );
}

function SectionHeader({ title, viewAllTo }: { title: string; viewAllTo: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
      <Link to={viewAllTo as any} className="flex items-center gap-0.5 text-xs text-fuse-cyan">
        View all <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function StockCard({ symbol, name, price, change }: { symbol: string; name: string; price: number; change: number }) {
  return (
    <Link to="/stock/$symbol" params={{ symbol }} className="glass rounded-xl p-3 transition-colors hover:bg-secondary/40">
      <div className="flex items-center gap-2">
        <img
          src={LOGO_URL(symbol)}
          alt=""
          onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
          className="h-8 w-8 rounded bg-white p-0.5 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold leading-tight">{symbol}</div>
          <div className="truncate text-[10px] text-muted-foreground">{name}</div>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-sm tabular-nums">${price.toFixed(2)}</div>
        <PriceTag change={change} />
      </div>
    </Link>
  );
}

function MoverSection({ title, icon, viewAllTo, params, items }: { title: string; icon: React.ReactNode; viewAllTo: string; params: any; items: { symbol: string; name: string; price: number; change: number }[] }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {icon} {title}
        </h2>
        <Link to={viewAllTo as any} params={params} className="flex items-center gap-0.5 text-xs text-fuse-cyan">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="glass rounded-xl divide-y divide-border/40">
        {items.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground">Loading…</div>
        ) : items.map((m) => (
          <Link key={m.symbol} to="/stock/$symbol" params={{ symbol: m.symbol }} className="flex items-center gap-3 p-3 hover:bg-secondary/30">
            <img src={LOGO_URL(m.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-9 w-9 rounded bg-white p-0.5 object-contain" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{m.symbol}</div>
              <div className="truncate text-[10px] text-muted-foreground">{m.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm tabular-nums">${m.price.toFixed(2)}</div>
              <PriceTag change={m.change} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SkeletonRow({ count }: { count: number }) {
  return <>{Array.from({ length: count }).map((_, i) => <div key={i} className="glass h-20 animate-pulse rounded-xl" />)}</>;
}
