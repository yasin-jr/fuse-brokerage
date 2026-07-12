import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { PriceTag } from "@/components/PriceTag";
import { getLargestByMarketCap } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";

export const Route = createFileRoute("/invest/largest-cap")({
  head: () => ({
    meta: [
      { title: "Largest by market cap — Ascend" },
      { name: "description", content: "The 20 largest US-listed companies by market capitalization, updated daily." },
    ],
  }),
  component: LargestCapPage,
});

function fmtCap(n: number) {
  return n.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 2 });
}

function LargestCapPage() {
  const fetchLargest = useServerFn(getLargestByMarketCap);
  const { data } = useQuery({
    queryKey: ["largest-cap-full"],
    queryFn: () => fetchLargest({ data: { limit: 20 } }),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  });
  const rows = data?.rows ?? [];

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2">
        <h1 className="text-2xl font-semibold">Largest by market cap</h1>
        <p className="mt-1 text-xs text-muted-foreground">The 20 most valuable US-listed companies.</p>

        <div className="mt-4 glass rounded-2xl divide-y divide-border/40">
          {rows.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
          {rows.map((c, i) => (
            <Link key={c.symbol} to="/stock/$symbol" params={{ symbol: c.symbol }} className="flex items-center gap-3 p-3 hover:bg-secondary/30">
              <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
              <img src={LOGO_URL(c.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-10 w-10 rounded bg-white p-0.5 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{c.symbol}</div>
                <div className="truncate text-[11px] text-muted-foreground">{c.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm tabular-nums">${c.price.toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">${fmtCap(c.marketCap)}</div>
              </div>
              <div className="w-16 text-right"><PriceTag change={c.change} /></div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
