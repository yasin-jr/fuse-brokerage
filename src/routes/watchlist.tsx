import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { EmptyState } from "@/components/EmptyState";
import { PriceTag } from "@/components/PriceTag";
import { getQuotes } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";
import { getWatchlist, removeFromWatchlist } from "@/lib/profile-sync";
import { Heart, X } from "lucide-react";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — FusionSynergy" },
      { name: "description", content: "Track companies you're interested in with live prices." },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchQuotes = useServerFn(getQuotes);

  useEffect(() => {
    getWatchlist().then((s) => { setSymbols(s); setLoading(false); });
    const onChange = () => getWatchlist().then(setSymbols);
    window.addEventListener("fuse-watchlist-change", onChange);
    return () => window.removeEventListener("fuse-watchlist-change", onChange);
  }, []);

  const { data } = useQuery({
    queryKey: ["watchlist-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    enabled: symbols.length > 0,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const map = useMemo(() => {
    const m = new Map<string, { price: number; change: number }>();
    for (const q of data?.quotes ?? []) m.set(q.symbol, { price: q.price, change: q.change });
    return m;
  }, [data]);

  const remove = async (sym: string) => {
    setSymbols((s) => s.filter((x) => x !== sym));
    await removeFromWatchlist(sym);
    window.dispatchEvent(new Event("fuse-watchlist-change"));
  };

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2">
        <h1 className="text-2xl font-semibold">Watchlist</h1>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : symbols.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Heart className="h-6 w-6 text-muted-foreground" />}
              title="Nothing on your watchlist"
              description="Tap the heart on any stock page to track it here."
              action={<Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">Browse markets</Link>}
            />
          </div>
        ) : (
          <div className="mt-4 glass rounded-2xl divide-y divide-border/40">
            {symbols.map((sym) => {
              const v = map.get(sym);
              return (
                <div key={sym} className="flex items-center gap-3 p-3">
                  <Link to="/stock/$symbol" params={{ symbol: sym }} className="flex flex-1 items-center gap-3 hover:bg-secondary/30 rounded-lg -m-2 p-2">
                    <img src={LOGO_URL(sym)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-10 w-10 rounded bg-white p-0.5 object-contain" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{sym}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm tabular-nums">{v ? `$${v.price.toFixed(2)}` : "—"}</div>
                      {v ? <PriceTag change={v.change} /> : <span className="text-[10px] text-muted-foreground">…</span>}
                    </div>
                  </Link>
                  <button onClick={() => remove(sym)} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-rose-400" aria-label={`Remove ${sym}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
