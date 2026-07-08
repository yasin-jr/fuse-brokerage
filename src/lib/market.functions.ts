import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Quote = {
  symbol: string;
  label: string;
  price: number;
  change: number; // percent
  prevClose: number;
  marketState?: "REGULAR" | "PRE" | "POST" | "CLOSED";
  extendedPrice?: number;
  extendedChangePct?: number;
};

const FINNHUB_KEY = process.env.FINNHUB_KEY ?? "";
const FMP_KEY = process.env.FMP_KEY ?? "";
const TWELVE_KEY = process.env.TWELVEDATA_API_KEY ?? "";

// Symbol remapping — some tickers use different conventions across providers.
const FMP_SYMBOL: Record<string, string> = {
  "BTC-USD": "BTCUSD",
  "ETH-USD": "ETHUSD",
  "SOL-USD": "SOLUSD",
  "GC=F": "GCUSD",
  "CL=F": "USO",   // WTI oil proxy
  "DX=F": "UUP",   // Dollar index proxy
};
const FINNHUB_SYMBOL: Record<string, string> = {
  "BTC-USD": "BINANCE:BTCUSDT",
  "ETH-USD": "BINANCE:ETHUSDT",
  "SOL-USD": "BINANCE:SOLUSDT",
};

const LABELS: Record<string, string> = {
  "BTC-USD": "BTC", "ETH-USD": "ETH", "SOL-USD": "SOL",
  "BTCUSD": "BTC", "ETHUSD": "ETH", "SOLUSD": "SOL",
  "^GSPC": "S&P 500", "^IXIC": "NASDAQ", "^DJI": "DOW", "^FTSE": "FTSE", "^RUT": "RUT",
  "GC=F": "GOLD", "GCUSD": "GOLD", "CL=F": "OIL", "DX=F": "DXY",
};

function fmpSym(s: string) { return FMP_SYMBOL[s] ?? s; }

// ---------------- Quotes ----------------

async function fetchFmpQuote(symbol: string): Promise<Quote | null> {
  if (!FMP_KEY) return null;
  try {
    const s = fmpSym(symbol);
    const r = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(s)}&apikey=${FMP_KEY}`);
    if (!r.ok) return null;
    const j: any = await r.json();
    const q = Array.isArray(j) ? j[0] : null;
    if (!q || typeof q.price !== "number") return null;
    const price = Number(q.price) || 0;
    const prev = Number(q.previousClose) || price;
    const pct = q.changePercentage != null ? Number(q.changePercentage) : (prev ? ((price - prev) / prev) * 100 : 0);
    if (!price) return null;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change: pct, prevClose: prev };
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

async function fetchTwelve(symbol: string): Promise<Quote | null> {
  if (!TWELVE_KEY) return null;
  try {
    const r = await fetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${TWELVE_KEY}`);
    if (!r.ok) return null;
    const j: any = await r.json();
    const price = Number(j?.close) || 0;
    const prev = Number(j?.previous_close) || price;
    if (!price) return null;
    return { symbol, label: LABELS[symbol] ?? symbol, price, change: prev ? ((price - prev) / prev) * 100 : 0, prevClose: prev };
  } catch { return null; }
}

async function fetchOne(symbol: string): Promise<Quote | null> {
  return (await fetchFmpQuote(symbol))
      ?? (await fetchFinnhub(symbol))
      ?? (await fetchTwelve(symbol));
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

async function fmpMovers(path: string, limit: number): Promise<Mover[]> {
  if (!FMP_KEY) return [];
  try {
    const r = await fetch(`https://financialmodelingprep.com/stable/${path}?apikey=${FMP_KEY}`);
    if (!r.ok) return [];
    const j: any = await r.json();
    if (!Array.isArray(j)) return [];
    return j.slice(0, limit).map((x: any) => ({
      symbol: String(x.symbol ?? ""),
      name: String(x.name ?? x.companyName ?? ""),
      price: Number(x.price ?? 0),
      change: Number(x.changesPercentage ?? x.changePercentage ?? 0),
    })).filter((m: Mover) => m.symbol);
  } catch { return []; }
}

const MoversInput = z.object({ limit: z.number().int().min(1).max(50).default(25) }).default({ limit: 25 });

export const getMovers = createServerFn({ method: "GET" })
  .inputValidator((d) => MoversInput.parse(d))
  .handler(async ({ data }) => {
    const [gainers, losers, actives] = await Promise.all([
      fmpMovers("biggest-gainers", data.limit),
      fmpMovers("biggest-losers", data.limit),
      fmpMovers("most-actives", data.limit),
    ]);
    return { gainers, losers, actives };
  });

// ---------------- Largest by Market Cap ----------------

export type MarketCapRow = { symbol: string; name: string; price: number; marketCap: number; change: number };

// Curated top-30 US mega-caps (screener endpoint is premium-only on this plan).
const MEGA_CAPS: { symbol: string; name: string }[] = [
  { symbol: "AAPL",  name: "Apple Inc." },
  { symbol: "MSFT",  name: "Microsoft Corporation" },
  { symbol: "NVDA",  name: "NVIDIA Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN",  name: "Amazon.com, Inc." },
  { symbol: "META",  name: "Meta Platforms, Inc." },
  { symbol: "TSLA",  name: "Tesla, Inc." },
  { symbol: "AVGO",  name: "Broadcom Inc." },
  { symbol: "BRK.B", name: "Berkshire Hathaway" },
  { symbol: "LLY",   name: "Eli Lilly and Co." },
  { symbol: "JPM",   name: "JPMorgan Chase & Co." },
  { symbol: "V",     name: "Visa Inc." },
  { symbol: "WMT",   name: "Walmart Inc." },
  { symbol: "XOM",   name: "Exxon Mobil Corporation" },
  { symbol: "MA",    name: "Mastercard Incorporated" },
  { symbol: "ORCL",  name: "Oracle Corporation" },
  { symbol: "PG",    name: "Procter & Gamble" },
  { symbol: "COST",  name: "Costco Wholesale" },
  { symbol: "JNJ",   name: "Johnson & Johnson" },
  { symbol: "HD",    name: "The Home Depot, Inc." },
  { symbol: "BAC",   name: "Bank of America" },
  { symbol: "NFLX",  name: "Netflix, Inc." },
  { symbol: "ABBV",  name: "AbbVie Inc." },
  { symbol: "KO",    name: "The Coca-Cola Company" },
  { symbol: "PEP",   name: "PepsiCo, Inc." },
  { symbol: "CVX",   name: "Chevron Corporation" },
  { symbol: "TMUS",  name: "T-Mobile US, Inc." },
  { symbol: "AMD",   name: "Advanced Micro Devices" },
  { symbol: "CRM",   name: "Salesforce, Inc." },
  { symbol: "ADBE",  name: "Adobe Inc." },
];

const LargestInput = z.object({ limit: z.number().int().min(1).max(30).default(20) }).default({ limit: 20 });

export const getLargestByMarketCap = createServerFn({ method: "GET" })
  .inputValidator((d) => LargestInput.parse(d))
  .handler(async ({ data }): Promise<{ rows: MarketCapRow[] }> => {
    if (!FMP_KEY) return { rows: [] };
    const list = MEGA_CAPS.slice(0, data.limit);
    const quotes = await Promise.all(list.map(async (m) => {
      try {
        const r = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(m.symbol)}&apikey=${FMP_KEY}`);
        if (!r.ok) return null;
        const j: any = await r.json();
        const q = Array.isArray(j) ? j[0] : null;
        if (!q) return null;
        return {
          symbol: m.symbol,
          name: m.name,
          price: Number(q.price ?? 0),
          marketCap: Number(q.marketCap ?? 0),
          change: Number(q.changePercentage ?? 0),
        };
      } catch { return null; }
    }));
    const rows = quotes.filter((r): r is MarketCapRow => !!r && r.price > 0)
      .sort((a, b) => b.marketCap - a.marketCap);
    return { rows };
  });

// ---------------- Sector heatmap ----------------

export type SectorPerf = { sector: string; change: number; tone: "up" | "down" | "neutral" };

async function fetchSectorSnapshot(date: string): Promise<any[]> {
  const r = await fetch(`https://financialmodelingprep.com/stable/sector-performance-snapshot?date=${date}&apikey=${FMP_KEY}`);
  if (!r.ok) return [];
  try {
    const j: any = await r.json();
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}

export const getSectorPerformance = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ sectors: SectorPerf[] }> => {
    if (!FMP_KEY) return { sectors: [] };
    // Try today then walk back up to 5 days (weekends/holidays return empty).
    let rows: any[] = [];
    const now = new Date();
    for (let back = 0; back < 6 && rows.length === 0; back++) {
      const d = new Date(now.getTime() - back * 86400_000);
      const iso = d.toISOString().slice(0, 10);
      rows = await fetchSectorSnapshot(iso);
    }
    if (rows.length === 0) return { sectors: [] };
    // Aggregate per sector across exchanges (average).
    const agg = new Map<string, { sum: number; n: number }>();
    for (const r of rows) {
      const s = String(r.sector ?? "");
      const c = Number(r.averageChange ?? 0);
      if (!s || !Number.isFinite(c)) continue;
      const cur = agg.get(s) ?? { sum: 0, n: 0 };
      cur.sum += c; cur.n += 1;
      agg.set(s, cur);
    }
    const sectors: SectorPerf[] = [...agg.entries()].map(([sector, { sum, n }]) => {
      const change = sum / n;
      const tone: SectorPerf["tone"] = Math.abs(change) < 0.1 ? "neutral" : change >= 0 ? "up" : "down";
      return { sector, change, tone };
    }).sort((a, b) => a.sector.localeCompare(b.sector));
    return { sectors };
  });

// ---------------- Symbol search (Finnhub) ----------------

export type SymbolHit = { symbol: string; name: string; exchange: string; type: string };

const SearchInput = z.object({ q: z.string().min(1).max(64), limit: z.number().int().min(1).max(50).default(25) });

export const searchSymbols = createServerFn({ method: "GET" })
  .inputValidator((d) => SearchInput.parse(d))
  .handler(async ({ data }): Promise<{ hits: SymbolHit[] }> => {
    if (!FINNHUB_KEY) return { hits: [] };
    try {
      const r = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(data.q)}&token=${FINNHUB_KEY}`);
      if (!r.ok) return { hits: [] };
      const j: any = await r.json();
      const arr: any[] = Array.isArray(j?.result) ? j.result : [];
      const hits: SymbolHit[] = arr
        .filter((x) => x?.symbol && x?.description && !String(x.symbol).includes("."))
        .slice(0, data.limit)
        .map((x) => ({
          symbol: String(x.symbol),
          name: String(x.description),
          exchange: "",
          type: String(x.type ?? "").toLowerCase().includes("etf") ? "etf" : "stock",
        }));
      return { hits };
    } catch { return { hits: [] }; }
  });

// ---------------- Candles ----------------

export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
export type Range = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "10Y" | "YTD" | "ALL";

const CandlesInput = z.object({
  symbol: z.string().min(1).max(20),
  range: z.enum(["1D", "1W", "1M", "3M", "6M", "1Y", "10Y", "YTD", "ALL"]),
});

function fmpIntradayInterval(range: Range): string | null {
  switch (range) {
    case "1D": return "5min";
    case "1W": return "30min";
    default: return null;
  }
}

async function fetchFmpCandles(symbol: string, range: Range): Promise<Candle[]> {
  if (!FMP_KEY) return [];
  const s = fmpSym(symbol);
  try {
    const intra = fmpIntradayInterval(range);
    if (intra) {
      const r = await fetch(
        `https://financialmodelingprep.com/stable/historical-chart/${intra}?symbol=${encodeURIComponent(s)}&apikey=${FMP_KEY}`,
      );
      if (!r.ok) return [];
      const j: any = await r.json();
      if (!Array.isArray(j)) return [];
      const cutoff = Date.now() - (range === "1D" ? 86400_000 * 2 : 8 * 86400_000);
      return j
        .map((x: any) => ({
          t: new Date(String(x.date).replace(" ", "T") + "Z").getTime(),
          o: Number(x.open), h: Number(x.high), l: Number(x.low), c: Number(x.close), v: Number(x.volume ?? 0),
        }))
        .filter((c: Candle) => Number.isFinite(c.c) && c.t >= cutoff)
        .sort((a: Candle, b: Candle) => a.t - b.t);
    }
    const now = new Date();
    let fromDate = new Date(0);
    switch (range) {
      case "1M": fromDate = new Date(now.getTime() - 31 * 86400_000); break;
      case "3M": fromDate = new Date(now.getTime() - 93 * 86400_000); break;
      case "6M": fromDate = new Date(now.getTime() - 186 * 86400_000); break;
      case "1Y": fromDate = new Date(now.getTime() - 365 * 86400_000); break;
      case "10Y": fromDate = new Date(now.getTime() - 365 * 10 * 86400_000); break;
      case "YTD": fromDate = new Date(now.getFullYear(), 0, 1); break;
      case "ALL": fromDate = new Date(1995, 0, 1); break;
    }
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const r = await fetch(
      `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=${encodeURIComponent(s)}&from=${iso(fromDate)}&to=${iso(now)}&apikey=${FMP_KEY}`,
    );
    if (!r.ok) return [];
    const j: any = await r.json();
    const hist: any[] = Array.isArray(j) ? j : Array.isArray(j?.historical) ? j.historical : [];
    return hist
      .map((x: any) => ({
        t: new Date(x.date + "T00:00:00Z").getTime(),
        o: Number(x.open), h: Number(x.high), l: Number(x.low), c: Number(x.close), v: Number(x.volume ?? 0),
      }))
      .filter((c: Candle) => Number.isFinite(c.c))
      .sort((a: Candle, b: Candle) => a.t - b.t);
  } catch { return []; }
}

export const getCandles = createServerFn({ method: "GET" })
  .inputValidator((data) => CandlesInput.parse(data))
  .handler(async ({ data }) => ({ candles: await fetchFmpCandles(data.symbol, data.range as Range) }));

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
      const now = Date.now();
      return { points: [{ t: now - 86400_000, v: data.cash }, { t: now, v: data.cash }] };
    }
    const all = await Promise.all(
      data.positions.map(async (p) => ({
        shares: p.shares,
        candles: await fetchFmpCandles(p.symbol, data.range as Range),
      })),
    );
    const tsSet = new Set<number>();
    for (const x of all) for (const c of x.candles) tsSet.add(c.t);
    const tsArr = [...tsSet].sort((a, b) => a - b);
    if (!tsArr.length) {
      const now = Date.now();
      return { points: [{ t: now - 86400_000, v: data.cash }, { t: now, v: data.cash }] };
    }
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
  website: string;
  marketState: "REGULAR" | "PRE" | "POST" | "CLOSED";
};

const SymbolInput = z.object({ symbol: z.string().min(1).max(20) });

function computeMarketState(): "REGULAR" | "PRE" | "POST" | "CLOSED" {
  const now = new Date();
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return "CLOSED";
  if (utc >= 480 && utc < 810) return "PRE";
  if (utc >= 810 && utc < 1200) return "REGULAR";
  if (utc >= 1200 && utc < 1440) return "POST";
  return "CLOSED";
}

export const getCompanyStats = createServerFn({ method: "GET" })
  .inputValidator((data) => SymbolInput.parse(data))
  .handler(async ({ data }): Promise<{ stats: CompanyStats | null }> => {
    if (!FMP_KEY) return { stats: null };
    const s = fmpSym(data.symbol);
    try {
      const [profileRes, quoteRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/stable/profile?symbol=${encodeURIComponent(s)}&apikey=${FMP_KEY}`),
        fetch(`https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(s)}&apikey=${FMP_KEY}`),
      ]);
      const profileArr: any = profileRes.ok ? await profileRes.json() : [];
      const quoteArr: any = quoteRes.ok ? await quoteRes.json() : [];
      const p = Array.isArray(profileArr) ? profileArr[0] : null;
      const q = Array.isArray(quoteArr) ? quoteArr[0] : null;
      if (!p && !q) return { stats: null };
      const rangeStr = String(p?.range ?? "");
      const [rLow, rHigh] = rangeStr.split("-").map((x) => Number(x.trim()));
      const stats: CompanyStats = {
        symbol: data.symbol.toUpperCase(),
        name: p?.companyName ?? q?.name ?? data.symbol,
        logo: p?.image ?? `https://financialmodelingprep.com/image-stock/${data.symbol.toUpperCase()}.png`,
        exchange: p?.exchange ?? q?.exchange ?? "",
        sector: p?.sector ?? "",
        industry: p?.industry ?? "",
        marketCap: Number(p?.marketCap ?? q?.marketCap ?? 0),
        pe: Number(q?.pe ?? 0),
        avgVolume: Number(p?.averageVolume ?? q?.avgVolume ?? 0),
        open: Number(q?.open ?? 0),
        prevClose: Number(q?.previousClose ?? 0),
        dayLow: Number(q?.dayLow ?? 0),
        dayHigh: Number(q?.dayHigh ?? 0),
        price: Number(q?.price ?? p?.price ?? 0),
        change: Number(q?.change ?? p?.change ?? 0),
        changePct: Number(q?.changePercentage ?? p?.changePercentage ?? 0),
        description: String(p?.description ?? ""),
        ceo: String(p?.ceo ?? ""),
        beta: Number(p?.beta ?? 0),
        high52: Number(q?.yearHigh ?? (Number.isFinite(rHigh) ? rHigh : 0)),
        low52: Number(q?.yearLow ?? (Number.isFinite(rLow) ? rLow : 0)),
        website: String(p?.website ?? ""),
        marketState: computeMarketState(),
      };
      return { stats };
    } catch { return { stats: null }; }
  });
