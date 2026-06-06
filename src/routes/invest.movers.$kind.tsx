import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { PriceTag } from "@/components/PriceTag";
import { getMovers } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";

const TITLES: Record<string, string> = {
  gainers: "Top winners",
  losers: "Top losers",
  actives: "Top traded",
};

export const Route = createFileRoute("/invest/movers/$kind")({
  head: ({ params }) => ({
    meta: [
      { title: `${TITLES[params.kind] ?? "Movers"} — FusionSynergy` },
      { name: "description", content: `Today's ${TITLES[params.kind]?.toLowerCase() ?? "market movers"} across US equities.` },
    ],
  }),
  component: MoversPage,
  errorComponent: () => <AppShell><BackBar /><p className="p-6 text-sm text-muted-foreground">Couldn't load movers.</p></AppShell>,
  notFoundComponent: () => <AppShell><BackBar /><p className="p-6 text-sm text-muted-foreground">Unknown movers list.</p></AppShell>,
});

function MoversPage() {
  const { kind } = useParams({ from: "/invest/movers/$kind" });
  if (!TITLES[kind]) throw notFound();
  const fetchMovers = useServerFn(getMovers);
  const { data } = useQuery({
    queryKey: ["movers-full"],
    queryFn: () => fetchMovers({ data: { limit: 50 } }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
  const list = (kind === "gainers" ? data?.gainers : kind === "losers" ? data?.losers : data?.actives) ?? [];

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2">
        <h1 className="text-2xl font-semibold">{TITLES[kind]}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Updates every minute during market hours.</p>

        <div className="mt-4 glass rounded-2xl divide-y divide-border/40">
          {list.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
          {list.map((m, i) => (
            <Link key={m.symbol} to="/stock/$symbol" params={{ symbol: m.symbol }} className="flex items-center gap-3 p-3 hover:bg-secondary/30">
              <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
              <img src={LOGO_URL(m.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-10 w-10 rounded bg-white p-0.5 object-contain" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{m.symbol}</div>
                <div className="truncate text-[11px] text-muted-foreground">{m.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm tabular-nums">${m.price.toFixed(2)}</div>
                <PriceTag change={m.change} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
