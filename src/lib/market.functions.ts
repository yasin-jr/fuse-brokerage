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
  "^GSPC": "S&P 500", "^IXIC": "NASDAQ", "^DJI": "DOW", "^FTSE": "FTSE", "^RUT": "RUT",
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
  // Prefer FMP (user's key, edge-friendly), then Finnhub, then Yahoo.
  return (await fetchFmpQuote(symbol)) ?? (await fetchFinnhub(symbol)) ?? (await fetchYahoo(symbol));
}

const QuotesInputSchema = z.object({
  symbols: z.array(z.string().min(1).max(20)).min(1).max(100),
});

export const getQuotes = createServerFn({ method: "GET" })
  .inputValidator((data) => QuotesInputSchema.parse(data))
  .handler(async ({ data }) => {
    const results = await Promise.all(data.symbols.map(fetchOne));
    return { quotes: results.filter((q): q is Quote => q !== null) };
  });

// ---------------- Movers ----------------

export type Mover = { symbol: string; name: string; price: number; change: number };

async function fmpList(path: string, limit: number): Promise<Mover[]> {
  if (!FMP_KEY) return [];
  try {
    const r = await fetch(`https://financialmodelingprep.com/api/v3/${path}?apikey=${FMP_KEY}`);
    if (!r.ok) return [];
    const j: any = await r.json();
    if (!Array.isArray(j)) return [];
    return j.slice(0, limit).map((x: any) => ({
      symbol: String(x.symbol ?? x.ticker ?? ""),
      name: String(x.name ?? x.companyName ?? ""),
      price: Number(x.price ?? 0),
      change: Number(x.changesPercentage ?? x.changePercent ?? 0),
    }));
  } catch { return []; }
}

const MoversInput = z.object({ limit: z.number().int().min(1).max(50).default(25) }).default({ limit: 25 });

export const getMovers = createServerFn({ method: "GET" })
  .inputValidator((d) => MoversInput.parse(d))
  .handler(async ({ data }) => {
    const [gainers, losers, actives] = await Promise.all([
      fmpList("stock_market/gainers", data.limit),
      fmpList("stock_market/losers", data.limit),
      fmpList("stock_market/actives", data.limit),
    ]);
    return { gainers, losers, actives };
  });

// ---------------- Largest by Market Cap ----------------

export type MarketCapRow = { symbol: string; name: string; price: number; marketCap: number; change: number };

const LargestInput = z.object({ limit: z.number().int().min(1).max(50).default(50) }).default({ limit: 50 });

export const getLargestByMarketCap = createServerFn({ method: "GET" })
  .inputValidator((d) => LargestInput.parse(d))
  .handler(async ({ data }): Promise<{ rows: MarketCapRow[] }> => {
    if (!FMP_KEY) return { rows: [] };
    try {
      const r = await fetch(
        `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=100000000000&isEtf=false&country=US&limit=${data.limit}&apikey=${FMP_KEY}`,
      );
      if (!r.ok) return { rows: [] };
      const j: any = await r.json();
      if (!Array.isArray(j)) return { rows: [] };
      const rows: MarketCapRow[] = j
        .map((x: any) => ({
          symbol: String(x.symbol ?? ""),
          name: String(x.companyName ?? ""),
          price: Number(x.price ?? 0),
          marketCap: Number(x.marketCap ?? 0),
          change: 0,
        }))
        .filter((x: MarketCapRow) => x.symbol && x.marketCap > 0)
        .sort((a: MarketCapRow, b: MarketCapRow) => b.marketCap - a.marketCap)
        .slice(0, data.limit);

      // Enrich with daily change via batched quotes (50 max per call)
      const syms = rows.map((r) => r.symbol).join(",");
      if (syms) {
        try {
          const qr = await fetch(`https://financialmodelingprep.com/api/v3/quote/${syms}?apikey=${FMP_KEY}`);
          if (qr.ok) {
            const qj: any[] = await qr.json();
            const m = new Map(qj.map((x: any) => [String(x.symbol), Number(x.changesPercentage ?? 0)]));
            for (const row of rows) row.change = m.get(row.symbol) ?? 0;
          }
        } catch {}
      }
      return { rows };
    } catch { return { rows: [] }; }
  });

// ---------------- Candles ----------------

export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
export type Range = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "10Y" | "YTD" | "ALL";

const CandlesInput = z.object({
  symbol: z.string().min(1).max(20),
  range: z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "10Y", "YTD", "ALL"]),
});

function rangeToParams(range: Range) {
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

// ---------------- Portfolio history ----------------

export type PortfolioPoint = { t: number; v: number };

const PortfolioHistoryInput = z.object({
  positions: z.array(z.object({ symbol: z.string().min(1).max(20), shares: z.number() })).max(50),
  cash: z.number().min(0),
  range: z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "10Y", "YTD", "ALL"]),
});

export const getPortfolioHistory = createServerFn({ method: "POST" })
  .inputValidator((d) => PortfolioHistoryInput.parse(d))
  .handler(async ({ data }): Promise<{ points: PortfolioPoint[] }> => {
    if (data.positions.length === 0) {
      // Flat line at cash value
      const now = Date.now();
      return { points: [{ t: now - 86400_000, v: data.cash }, { t: now, v: data.cash }] };
    }
    const all = await Promise.all(
      data.positions.map(async (p) => ({
        shares: p.shares,
        candles: await fetchYahooCandles(p.symbol, data.range as Range),
      })),
    );
    // Build union of timestamps (intersect by index ~ same range often aligns)
    const tsSet = new Set<number>();
    for (const x of all) for (const c of x.candles) tsSet.add(c.t);
    const tsArr = [...tsSet].sort((a, b) => a - b);
    if (!tsArr.length) {
      const now = Date.now();
      return { points: [{ t: now - 86400_000, v: data.cash }, { t: now, v: data.cash }] };
    }
    // Pre-index per holding for fast lookup with forward-fill
    const indexed = all.map((x) => {
      const m = new Map<number, number>();
      for (const c of x.candles) m.set(c.t, c.c);
      return { shares: x.shares, map: m };
    });
    const points: PortfolioPoint[] = [];
    const lastPrice = new Array(indexed.length).fill(0);
    for (const t of tsArr) {
      let val = data.cash;
      for (let i = 0; i < indexed.length; i++) {
        const p = indexed[i].map.get(t);
        if (p != null) lastPrice[i] = p;
        val += (lastPrice[i] || 0) * indexed[i].shares;
      }
      points.push({ t, v: val });
    }
    return { points };
  });

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
  description: string;
  ceo: string;
  beta: number;
  high52: number;
  low52: number;
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
        description: String(p?.description ?? ""),
        ceo: String(p?.ceo ?? ""),
        beta: Number(p?.beta ?? 0),
        high52: Number(q?.yearHigh ?? p?.range?.split("-")?.[1] ?? 0),
        low52: Number(q?.yearLow ?? p?.range?.split("-")?.[0] ?? 0),
      };
      return { stats };
    } catch { return { stats: null }; }
  });
