import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { PriceTag } from "@/components/PriceTag";
import { findTheme } from "@/lib/themes";
import { byTheme, LOGO_URL } from "@/lib/catalog";
import { getQuotes } from "@/lib/market.functions";

export const Route = createFileRoute("/invest/theme/$themeId")({
  head: ({ params }) => {
    const t = findTheme(params.themeId);
    return {
      meta: [
        { title: `${t?.name ?? "Theme"} — Ascend` },
        { name: "description", content: t?.description ?? "Theme detail" },
      ],
    };
  },
  component: ThemePage,
  errorComponent: () => <AppShell><BackBar /><p className="p-6 text-sm text-muted-foreground">Couldn't load this theme.</p></AppShell>,
  notFoundComponent: () => <AppShell><BackBar /><p className="p-6 text-sm text-muted-foreground">Unknown theme.</p></AppShell>,
});

function ThemePage() {
  const { themeId } = useParams({ from: "/invest/theme/$themeId" });
  const theme = findTheme(themeId);
  if (!theme) throw notFound();
  const stocks = byTheme(themeId);
  const symbols = useMemo(() => stocks.map((s) => s.symbol), [stocks]);
  const fetchQuotes = useServerFn(getQuotes);
  const { data } = useQuery({
    queryKey: ["theme-quotes", themeId, symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    enabled: symbols.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const map = new Map<string, { price: number; change: number }>();
  for (const q of data?.quotes ?? []) map.set(q.symbol, { price: q.price, change: q.change });

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2 space-y-5">
        <div
          className="rounded-2xl p-6 text-white shadow-elegant"
          style={{ background: theme.gradient }}
        >
          <div className="text-5xl">{theme.emoji}</div>
          <h1 className="mt-3 text-2xl font-semibold">{theme.name}</h1>
          <p className="mt-2 text-sm opacity-90">{theme.description}</p>
        </div>

        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {stocks.length} companies
        </h2>
        <div className="glass rounded-2xl divide-y divide-border/40">
          {stocks.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No companies tagged for this theme yet.</div>}
          {stocks.map((c) => {
            const v = map.get(c.symbol);
            return (
              <Link key={c.symbol} to="/stock/$symbol" params={{ symbol: c.symbol }} className="flex items-center gap-3 p-3 hover:bg-secondary/30">
                <img src={LOGO_URL(c.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-10 w-10 rounded bg-white p-0.5 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{c.symbol}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{c.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular-nums">{v ? `$${v.price.toFixed(2)}` : "—"}</div>
                  {v ? <PriceTag change={v.change} /> : <span className="text-[10px] text-muted-foreground">…</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
