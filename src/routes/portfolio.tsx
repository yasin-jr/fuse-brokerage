import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { PILLARS, PORTFOLIO, BONES } from "@/lib/mock-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — FusionSynergy" },
      { name: "description", content: "Your 7 pillars, sector allocation, risk dashboard and performance." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const sectorMap = PILLARS.reduce<Record<string, number>>((acc, p) => {
    acc[p.sector] = (acc[p.sector] || 0) + p.weight;
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <header>
          <p className="text-sm text-muted-foreground">Total portfolio</p>
          <h1 className="text-3xl font-semibold">
            ${PORTFOLIO.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="mt-1 flex gap-3 text-sm">
            <span className="text-emerald-400 font-medium">+${PORTFOLIO.totalPnL.toFixed(2)}</span>
            <PriceTag change={PORTFOLIO.totalPnLPct} />
            <span className="text-muted-foreground text-xs">all-time</span>
          </div>
        </header>

        <section>
          <h2 className="mb-2 text-sm font-semibold">7 Pillars</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            {PILLARS.map((p) => (
              <div key={p.ticker} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-semibold">{p.ticker}</div>
                  <div className="text-xs text-muted-foreground">{p.stage} · {p.sector}</div>
                </div>
                <div className="text-right">
                  <div>{p.weight.toFixed(1)}%</div>
                  <PriceTag change={p.change} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Sector Allocation</h2>
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

        <section>
          <h2 className="mb-2 text-sm font-semibold">🛡️ Risk — The 4 Bones</h2>
          <div className="grid grid-cols-2 gap-2">
            {BONES.map((b) => (
              <div key={b.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Bone {b.id}</span>
                  <span className={b.ok ? "text-emerald-400" : "text-rose-400"}>{b.ok ? "✅" : "❌"}</span>
                </div>
                <div className="mt-1 text-sm">{b.label}</div>
                <div className="mt-1 text-xs text-fuse-cyan">{b.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">Performance</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Health" value={`${PORTFOLIO.health}/100`} />
            <Stat label="Sharpe" value={PORTFOLIO.sharpe.toFixed(2)} />
            <Stat label="Win Rate" value={`${PORTFOLIO.winRate}%`} />
            <Stat label="Avg Hold" value={`${PORTFOLIO.avgHoldDays}d`} />
            <Stat label="Cash" value={`$${PORTFOLIO.cash}`} />
            <Stat label="Floor 15%" value={`$${PORTFOLIO.capitalFloor}`} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
