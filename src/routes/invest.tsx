import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { getQuotes } from "@/lib/market.functions";
import { CATALOG, LOGO_URL, searchCatalog } from "@/lib/catalog";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — FusionSynergy" },
      { name: "description", content: "Browse markets and search any company by ticker or name. Live prices, charts and trading." },
      { property: "og:title", content: "Invest — FusionSynergy" },
      { property: "og:description", content: "Browse markets, search by ticker or name, and trade with live data." },
      { property: "og:url", content: "https://fuse-brokerage.lovable.app/invest" },
    ],
    links: [{ rel: "canonical", href: "https://fuse-brokerage.lovable.app/invest" }],
  }),
  component: InvestPage,
});

function InvestPage() {
  const [q, setQ] = useState("");
  const fetchQuotes = useServerFn(getQuotes);

  const symbols = useMemo(() => CATALOG.map((c) => c.symbol), []);
  const { data } = useQuery({
    queryKey: ["catalog-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const quoteMap = useMemo(() => {
    const m = new Map<string, { price: number; change: number }>();
    for (const x of data?.quotes ?? []) m.set(x.symbol, { price: x.price, change: x.change });
    return m;
  }, [data]);

  const results = q.trim() ? searchCatalog(q) : CATALOG;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <h1 className="text-2xl font-semibold">Invest</h1>

        <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search NVDA, Nvidia, AAPL, Apple…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <Link to="/ai" className="block rounded-xl bg-fuse-gradient p-[1px] text-sm font-semibold">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-card py-2.5 text-fuse-cyan">
            <Sparkles className="h-4 w-4" /> Chat with FUSE Intelligence
          </span>
        </Link>

        <section>
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-sm font-semibold">Technology</h2>
            <span className="text-[11px] text-muted-foreground">{results.length} companies · live</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {results.map((c) => {
              const v = quoteMap.get(c.symbol);
              return (
                <Link
                  key={c.symbol}
                  to="/stock/$symbol"
                  params={{ symbol: c.symbol }}
                  className="glass rounded-xl p-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={LOGO_URL(c.symbol)}
                      alt=""
                      onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                      className="h-8 w-8 rounded bg-white p-0.5 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold leading-tight">{c.symbol}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{c.name}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="text-sm tabular-nums">{v ? `$${v.price.toFixed(2)}` : "—"}</div>
                    {v ? <PriceTag change={v.change} /> : <span className="text-[10px] text-muted-foreground">…</span>}
                  </div>
                </Link>
              );
            })}
            {results.length === 0 && (
              <div className="col-span-full glass rounded-xl p-6 text-center text-sm text-muted-foreground">
                No matches for "{q}".
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
