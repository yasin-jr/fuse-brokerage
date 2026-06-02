import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Quote = {
  symbol: string;
  label: string;
  price: number;
  change: number; // percent
  prevClose: number;
};

const FINNHUB_KEY = process.env.FINNHUB_KEY ?? "";
const FMP_KEY = process.env.FMP_KEY ?? "";

const LABELS: Record<string, string> = {
  "BTC-USD": "BTC", "ETH-USD": "ETH", "SOL-USD": "SOL",
  "^GSPC": "S&P 500", "^IXIC": "NASDAQ", "^DJI": "DOW", "^FTSE": "FTSE",
  "GC=F": "GOLD", "CL=F": "OIL", "DX=F": "DXY",
};
const FINNHUB_SYMBOL: Record<string, string> = {
  "BTC-USD": "BINANCE:BTCUSDT",
  "ETH-USD": "BINANCE:ETHUSDT",
  "SOL-USD": "BINANCE:SOLUSDT",
};

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FusionSynergy/1.0)" } });
    if (!r.ok) return null;
    const j: any = await r.json();
    const meta = j?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    if (!price) return null;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change: prev ? ((price - prev) / prev) * 100 : 0, prevClose: prev };
  } catch { return null; }
}

async function fetchFinnhub(symbol: string): Promise<Quote | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const fhSym = FINNHUB_SYMBOL[symbol] ?? symbol;
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSym)}&token=${FINNHUB_KEY}`);
    if (!r.ok) return null;
    const j: any = await r.json();
    const price = Number(j?.c) || 0;
    const prev = Number(j?.pc) || price;
    if (!price) return null;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change: prev ? ((price - prev) / prev) * 100 : 0, prevClose: prev };
  } catch { return null; }
}

async function fetchFmpQuote(symbol: string): Promise<Quote | null> {
  if (!FMP_KEY) return null;
  try {
    const r = await fetch(`https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${FMP_KEY}`);
    if (!r.ok) return null;
    const arr: any = await r.json();
    const j = Array.isArray(arr) ? arr[0] : null;
    if (!j) return null;
    const price = Number(j.price) || 0;
    const prev = Number(j.previousClose) || price;
    if (!price) return null;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change: prev ? ((price - prev) / prev) * 100 : 0, prevClose: prev };
  } catch { return null; }
}

async function fetchOne(symbol: string): Promise<Quote | null> {
  return (await fetchYahoo(symbol)) ?? (await fetchFmpQuote(symbol)) ?? (await fetchFinnhub(symbol));
}

const QuotesInputSchema = z.object({
  symbols: z.array(z.string().min(1).max(20)).min(1).max(50),
});

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((data) => QuotesInputSchema.parse(data))
  .handler(async ({ data }) => {
    const results = await Promise.all(data.symbols.map(fetchOne));
    return { quotes: results.filter((q): q is Quote => q !== null) };
  });

// ---------------- Movers ----------------

export type Mover = { symbol: string; name: string; price: number; change: number };

async function fmpList(path: string): Promise<Mover[]> {
  if (!FMP_KEY) return [];
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
  } catch { return []; }
}

export const getMovers = createServerFn({ method: "GET" }).handler(async () => {
  const [gainers, losers, actives] = await Promise.all([
    fmpList("stock_market/gainers"),
    fmpList("stock_market/losers"),
    fmpList("stock_market/actives"),
  ]);
  return { gainers, losers, actives };
});

// ---------------- Candles ----------------

export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
export type Range = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "10Y" | "YTD" | "ALL";

const CandlesInput = z.object({
  symbol: z.string().min(1).max(20),
  range: z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "10Y", "YTD", "ALL"]),
});

function rangeToParams(range: Range) {
  // Returns { interval, from, to } compatible with Yahoo
  const now = new Date();
  const to = Math.floor(now.getTime() / 1000);
  let from = to;
  let interval = "1d";
  switch (range) {
    case "1D":  interval = "5m";  from = to - 60 * 60 * 24; break;
    case "1W":  interval = "30m"; from = to - 60 * 60 * 24 * 7; break;
    case "1M":  interval = "1d";  from = to - 60 * 60 * 24 * 31; break;
    case "3M":  interval = "1d";  from = to - 60 * 60 * 24 * 93; break;
    case "6M":  interval = "1d";  from = to - 60 * 60 * 24 * 186; break;
    case "1Y":  interval = "1d";  from = to - 60 * 60 * 24 * 365; break;
    case "10Y": interval = "1wk"; from = to - 60 * 60 * 24 * 365 * 10; break;
    case "YTD": interval = "1d";  from = Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000); break;
    case "ALL": interval = "1mo"; from = 0; break;
  }
  return { interval, from, to };
}

async function fetchYahooCandles(symbol: string, range: Range): Promise<Candle[]> {
  const { interval, from, to } = rangeToParams(range);
  const periodPart = from > 0 ? `period1=${from}&period2=${to}` : `range=max`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&${periodPart}`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; FusionSynergy/1.0)" } });
  if (!r.ok) return [];
  const j: any = await r.json();
  const result = j?.chart?.result?.[0];
  if (!result) return [];
  const ts: number[] = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0] ?? {};
  const out: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = q.close?.[i];
    if (c == null) continue;
    out.push({
      t: ts[i] * 1000,
      o: q.open?.[i] ?? c, h: q.high?.[i] ?? c, l: q.low?.[i] ?? c, c,
      v: q.volume?.[i] ?? 0,
    });
  }
  return out;
}

export const getCandles = createServerFn({ method: "GET" })
  .inputValidator((data) => CandlesInput.parse(data))
  .handler(async ({ data }) => ({ candles: await fetchYahooCandles(data.symbol, data.range as Range) }));

// ---------------- Profile + key stats ----------------

export type CompanyStats = {
  symbol: string;
  name: string;
  logo: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  pe: number;
  avgVolume: number;
  open: number;
  prevClose: number;
  dayLow: number;
  dayHigh: number;
  price: number;
  change: number;
  changePct: number;
};

const SymbolInput = z.object({ symbol: z.string().min(1).max(20) });

export const getCompanyStats = createServerFn({ method: "GET" })
  .inputValidator((data) => SymbolInput.parse(data))
  .handler(async ({ data }): Promise<{ stats: CompanyStats | null }> => {
    if (!FMP_KEY) return { stats: null };
    try {
      const [profileRes, quoteRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(data.symbol)}?apikey=${FMP_KEY}`),
        fetch(`https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(data.symbol)}?apikey=${FMP_KEY}`),
      ]);
      const profileArr: any = profileRes.ok ? await profileRes.json() : [];
      const quoteArr: any = quoteRes.ok ? await quoteRes.json() : [];
      const p = Array.isArray(profileArr) ? profileArr[0] : null;
      const q = Array.isArray(quoteArr) ? quoteArr[0] : null;
      if (!p && !q) return { stats: null };
      const stats: CompanyStats = {
        symbol: data.symbol.toUpperCase(),
        name: p?.companyName ?? q?.name ?? data.symbol,
        logo: p?.image ?? `https://financialmodelingprep.com/image-stock/${data.symbol.toUpperCase()}.png`,
        exchange: p?.exchangeShortName ?? q?.exchange ?? "",
        sector: p?.sector ?? "",
        industry: p?.industry ?? "",
        marketCap: Number(p?.mktCap ?? q?.marketCap ?? 0),
        pe: Number(q?.pe ?? p?.pe ?? 0),
        avgVolume: Number(q?.avgVolume ?? 0),
        open: Number(q?.open ?? 0),
        prevClose: Number(q?.previousClose ?? 0),
        dayLow: Number(q?.dayLow ?? 0),
        dayHigh: Number(q?.dayHigh ?? 0),
        price: Number(q?.price ?? 0),
        change: Number(q?.change ?? 0),
        changePct: Number(q?.changesPercentage ?? 0),
      };
      return { stats };
    } catch { return { stats: null }; }
  });
