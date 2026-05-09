import { createServerFn } from "@tanstack/react-start";

export type Quote = {
  symbol: string;
  label: string;
  price: number;
  change: number; // percent
  prevClose: number;
};

// Free-tier keys provided by the project owner. Server-only file.
const FINNHUB_KEY = "d7l8s9pr01qm7o0avm60d7l8s9pr01qm7o0avm6g";
const FMP_KEY = "YMycIWJpTV1kFffzoRzIh5rQOkOVMrBR";

const LABELS: Record<string, string> = {
  "BTC-USD": "BTC",
  "ETH-USD": "ETH",
  "SOL-USD": "SOL",
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
  "^DJI": "DOW",
  "^FTSE": "FTSE",
  "GC=F": "GOLD",
  "CL=F": "OIL",
  "DX=F": "DXY",
};

// Map Yahoo symbols → Finnhub symbols where they differ
const FINNHUB_SYMBOL: Record<string, string> = {
  "BTC-USD": "BINANCE:BTCUSDT",
  "ETH-USD": "BINANCE:ETHUSDT",
  "SOL-USD": "BINANCE:SOLUSDT",
  "^GSPC": "^GSPC",
  "^IXIC": "^IXIC",
  "^DJI": "^DJI",
};

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FusionSynergy/1.0)" },
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    const meta = j?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    if (!price) return null;
    const change = prev ? ((price - prev) / prev) * 100 : 0;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change, prevClose: prev };
  } catch {
    return null;
  }
}

async function fetchFinnhub(symbol: string): Promise<Quote | null> {
  try {
    const fhSym = FINNHUB_SYMBOL[symbol] ?? symbol;
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSym)}&token=${FINNHUB_KEY}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j: any = await r.json();
    const price = Number(j?.c) || 0;
    const prev = Number(j?.pc) || price;
    if (!price) return null;
    const change = prev ? ((price - prev) / prev) * 100 : 0;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change, prevClose: prev };
  } catch {
    return null;
  }
}

async function fetchOne(symbol: string): Promise<Quote | null> {
  return (await fetchYahoo(symbol)) ?? (await fetchFinnhub(symbol));
}

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((data: { symbols: string[] }) => data)
  .handler(async ({ data }) => {
    const results = await Promise.all(data.symbols.map(fetchOne));
    return { quotes: results.filter((q): q is Quote => q !== null) };
  });

export type Mover = { symbol: string; name: string; price: number; change: number };

async function fmpList(path: string): Promise<Mover[]> {
  try {
    const r = await fetch(`https://financialmodelingprep.com/api/v3/${path}?apikey=${FMP_KEY}`);
    if (!r.ok) return [];
    const j: any = await r.json();
    if (!Array.isArray(j)) return [];
    return j.slice(0, 5).map((x: any) => ({
      symbol: String(x.symbol ?? x.ticker ?? ""),
      name: String(x.name ?? x.companyName ?? ""),
      price: Number(x.price ?? 0),
      change: Number(x.changesPercentage ?? x.changePercent ?? 0),
    }));
  } catch {
    return [];
  }
}

export const getMovers = createServerFn({ method: "GET" }).handler(async () => {
  const [gainers, losers, actives] = await Promise.all([
    fmpList("stock_market/gainers"),
    fmpList("stock_market/losers"),
    fmpList("stock_market/actives"),
  ]);
  return { gainers, losers, actives };
});
