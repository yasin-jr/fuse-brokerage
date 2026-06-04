import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getQuotes } from "@/lib/market.functions";

const TRENDING = ["NVDA", "AAPL", "TSLA", "MSFT", "GOOGL", "AMZN", "META", "AMD"];

function logoUrl(sym: string) {
  return `https://financialmodelingprep.com/image-stock/${sym}.png`;
}

export function TrendingStocks() {
  const fetchQuotes = useServerFn(getQuotes);
  const { data } = useQuery({
    queryKey: ["trending-row", TRENDING],
    queryFn: () => fetchQuotes({ data: { symbols: TRENDING } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const quotes = data?.quotes ?? [];

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-3 pb-2">
        {(quotes.length ? quotes : TRENDING.map((s) => ({ symbol: s, label: s, price: 0, change: 0, prevClose: 0 }))).map((q) => (
          <Link
            key={q.symbol}
            to="/stock/$symbol"
            params={{ symbol: q.symbol }}
            className="glass flex min-w-[120px] flex-col gap-1 rounded-xl p-3 hover:border-fuse-cyan/40"
          >
            <div className="flex items-center gap-2">
              <img
                src={logoUrl(q.symbol)}
                alt={q.symbol}
                className="h-6 w-6 rounded-full bg-white/90 object-contain"
                loading="lazy"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <span className="text-xs font-semibold">{q.symbol}</span>
            </div>
            <div className="text-sm font-medium">{q.price ? `$${q.price.toFixed(2)}` : "—"}</div>
            <div className={`text-[11px] ${q.change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {q.change >= 0 ? "▲" : "▼"} {Math.abs(q.change).toFixed(2)}%
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
