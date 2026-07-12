import { useMemo } from "react";

type Position = { symbol: string; shares: number; avgPrice: number };

/** Compute health scores + surface a compact visual card. */
export function PortfolioHealth({
  positions,
  cash,
  priceMap,
}: {
  positions: Position[];
  cash: number;
  priceMap: Map<string, number>;
}) {
  const metrics = useMemo(() => {
    const values = positions.map((p) => p.shares * (priceMap.get(p.symbol) ?? p.avgPrice));
    const holdings = values.reduce((s, v) => s + v, 0);
    const total = holdings + cash;
    if (total <= 0) return null;

    const weights = values.map((v) => v / total);
    // Herfindahl-Hirschman-style concentration (lower = more diversified)
    const hhi = weights.reduce((s, w) => s + w * w, 0);
    const diversification = Math.round((1 - Math.min(1, hhi * (positions.length || 1))) * 100);
    const div = Math.max(10, Math.min(100, positions.length >= 8 ? 90 : positions.length * 10 + 20 - Math.round(hhi * 50)));

    const cashPct = (cash / total) * 100;
    const largest = Math.max(0, ...weights) * 100;

    // Simple risk proxy: concentrated portfolios = higher risk
    const risk = Math.min(100, Math.round(hhi * 100 + (largest > 30 ? 15 : 0)));
    const health = Math.round(div * 0.5 + Math.max(0, 100 - risk) * 0.3 + Math.max(0, 100 - Math.abs(cashPct - 15) * 2) * 0.2);

    return {
      diversification: div,
      cashPct: Math.round(cashPct),
      largest: Math.round(largest),
      risk,
      health: Math.max(0, Math.min(100, health)),
      count: positions.length,
    };
  }, [positions, cash, priceMap]);

  if (!metrics) return null;

  const tone = metrics.health >= 75 ? "emerald" : metrics.health >= 50 ? "sapphire" : "berry";
  const ringColor = tone === "emerald" ? "#10b981" : tone === "sapphire" ? "#0F52BA" : "#990F4B";
  const label = metrics.health >= 75 ? "Strong" : metrics.health >= 50 ? "Balanced" : "Concentrated";

  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (metrics.health / 100) * c;

  return (
    <section>
      <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Portfolio Health</h2>
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r={r} stroke="currentColor" strokeOpacity="0.12" strokeWidth="7" fill="none" />
              <circle
                cx="44" cy="44" r={r}
                stroke={ringColor} strokeWidth="7" fill="none"
                strokeDasharray={`${dash} ${c}`}
                strokeLinecap="round"
                transform="rotate(-90 44 44)"
                style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold tabular-nums">{metrics.health}</span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{label}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.count} position{metrics.count === 1 ? "" : "s"} · {metrics.cashPct}% cash
            </p>
            {metrics.largest > 30 && (
              <p className="mt-1 text-[10px] text-amber-400">⚠ Largest holding is {metrics.largest}% of portfolio</p>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Diversification" value={`${metrics.diversification}`} />
          <Stat label="Risk" value={`${metrics.risk}`} />
          <Stat label="Cash" value={`${metrics.cashPct}%`} />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 py-2">
      <div className="text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
