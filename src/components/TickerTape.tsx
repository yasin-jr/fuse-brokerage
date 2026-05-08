import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getQuotes } from "@/lib/market.functions";

const SYMBOLS = [
  "BTC-USD", "ETH-USD", "SOL-USD",
  "^GSPC", "^IXIC", "^DJI", "^FTSE",
  "GC=F", "CL=F",
  "NVDA", "AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "META", "AMD", "NFLX", "JPM", "V",
];

const FALLBACK = SYMBOLS.map((s) => ({ symbol: s, label: s, price: 0, change: 0, prevClose: 0 }));

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toFixed(2);
}

export function TickerTape() {
  const fetchQuotes = useServerFn(getQuotes);
  const { data } = useQuery({
    queryKey: ["ticker-tape", SYMBOLS],
    queryFn: () => fetchQuotes({ data: { symbols: SYMBOLS } }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const quotes = data?.quotes?.length ? data.quotes : FALLBACK;
  const items = [...quotes, ...quotes];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-background/40 py-2">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap font-mono text-[11px] tracking-wider">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground/90">{t.label}</span>
            <span>{t.price ? `$${fmt(t.price)}` : "—"}</span>
            {t.price > 0 && (
              <span className={t.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {t.change >= 0 ? "▲" : "▼"} {Math.abs(t.change).toFixed(2)}%
              </span>
            )}
            <span className="text-border">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
