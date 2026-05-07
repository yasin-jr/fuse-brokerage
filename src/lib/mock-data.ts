// Starter data shapes for FusionSynergy. New accounts start clean — the live engine fills these.

export type Pillar = {
  ticker: string;
  name: string;
  sector: "AI & Tech" | "Energy" | "Infrastructure" | "Healthcare" | "Fintech";
  price: number;
  change: number;
  shares: number;
  weight: number;
  stage: "Building" | "Growing" | "Mature" | "Trimming";
};

// New users start with no holdings.
export const PILLARS: Pillar[] = [];

export const PORTFOLIO = {
  total: 0,
  todayPnL: 0,
  todayPnLPct: 0,
  totalPnL: 0,
  totalPnLPct: 0,
  cash: 0,
  capitalFloor: 0,
  health: 100,
  sharpe: 0,
  winRate: 0,
  avgHoldDays: 0,
};

// Casual safety rules — always shown so users know the guardrails.
export const SAFETY_RULES = [
  { id: 1, label: "Keep at least 15% in cash",     ok: true, value: "—" },
  { id: 2, label: "Don't lose more than 5% a day", ok: true, value: "—" },
  { id: 3, label: "No single stock above 20%",     ok: true, value: "—" },
  { id: 4, label: "No sector above 50%",           ok: true, value: "—" },
];

export const RECENT_ORDERS: Array<{
  id: string; ts: string; action: "BUY" | "SELL"; ticker: string;
  qty: number; price: number; status: "FILLED" | "PENDING";
}> = [];

export const DISCUSSION_PREVIEW: Array<{
  user: string; badge: string; text: string; sentiment: string; likes: number;
}> = [];

// Public ticker tape — mirrors the marketing site. Static for now; swap for live feed
// once a market-data connector (e.g. Yahoo / Finnhub / Alpha Vantage) is wired in.
export const TICKER_TAPE = [
  { symbol: "BTC",     price: "67,842.30", change:  2.4 },
  { symbol: "ETH",     price: "3,456.12",  change:  1.8 },
  { symbol: "S&P 500", price: "5,321.41",  change:  0.8 },
  { symbol: "NASDAQ",  price: "18,450.22", change:  0.5 },
  { symbol: "GOLD",    price: "2,348.60",  change:  1.2 },
  { symbol: "NVDA",    price: "924.79",    change: -0.3 },
  { symbol: "AAPL",    price: "189.84",    change:  0.5 },
  { symbol: "MSFT",    price: "415.30",    change: -0.7 },
  { symbol: "TSLA",    price: "177.40",    change:  3.1 },
];
