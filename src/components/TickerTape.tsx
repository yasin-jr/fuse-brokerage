import { TICKER_TAPE } from "@/lib/mock-data";

export function TickerTape() {
  const items = [...TICKER_TAPE, ...TICKER_TAPE]; // duplicate for seamless loop
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-background/40 py-2">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap font-mono text-[11px] tracking-wider">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground/90">{t.symbol}</span>
            <span>${t.price}</span>
            <span className={t.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {t.change >= 0 ? "▲" : "▼"} {Math.abs(t.change).toFixed(1)}%
            </span>
            <span className="text-border">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
