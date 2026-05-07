// Mock data for FusionSynergy Virtual Brokerage — replaced by live engine in later phases.

export type Pillar = {
  ticker: string;
  name: string;
  sector: "AI_TECH" | "ENERGY" | "INFRA";
  price: number;
  change: number;
  shares: number;
  weight: number; // %
  stage: "ACCUMULATION" | "GROWTH" | "MATURITY" | "HARVEST" | "ROTATION";
};

export const PILLARS: Pillar[] = [
  { ticker: "UEC",  name: "Uranium Energy",   sector: "ENERGY",  price: 7.42,   change: 3.1,  shares: 190, weight: 14.2, stage: "GROWTH" },
  { ticker: "AMD",  name: "AMD",              sector: "AI_TECH", price: 142.50, change: 2.3,  shares: 13,  weight: 18.5, stage: "MATURITY" },
  { ticker: "PATH", name: "UiPath",           sector: "AI_TECH", price: 28.10,  change: 1.4,  shares: 65,  weight: 18.3, stage: "GROWTH" },
  { ticker: "SERV", name: "Serve Robotics",   sector: "AI_TECH", price: 12.20,  change: -0.5, shares: 130, weight: 15.9, stage: "ACCUMULATION" },
  { ticker: "IONQ", name: "IonQ (Locked)",    sector: "AI_TECH", price: 31.50,  change: 0.0,  shares: 5,   weight: 1.5,  stage: "ACCUMULATION" },
  { ticker: "CIFR", name: "Cipher Mining",    sector: "INFRA",   price: 8.20,   change: -1.8, shares: 220, weight: 17.6, stage: "MATURITY" },
  { ticker: "XYL",  name: "Xylem",            sector: "INFRA",   price: 124.80, change: 4.2,  shares: 8,   weight: 9.7,  stage: "GROWTH" },
];

export const PORTFOLIO = {
  total: 10247.5,
  todayPnL: 147.5,
  todayPnLPct: 1.46,
  totalPnL: 247.5,
  totalPnLPct: 2.48,
  cash: 1200,
  capitalFloor: 1537,
  health: 78,
  sharpe: 1.42,
  winRate: 68,
  avgHoldDays: 12,
};

export const BONES = [
  { id: 1, label: "Capital Floor ≥ 15%", ok: true, value: "16.4%" },
  { id: 2, label: "Daily Loss ≤ 5%",     ok: true, value: "+1.46%" },
  { id: 3, label: "Position ≤ 20%",      ok: true, value: "max 18.5%" },
  { id: 4, label: "Sector ≤ 50%",        ok: true, value: "max 38.8%" },
];

export const RECENT_ORDERS = [
  { id: "o1", ts: "14:32", action: "BUY",  ticker: "AMD",  qty: 3,  price: 142.5, status: "FILLED",  agent: "SNIPER" },
  { id: "o2", ts: "13:55", action: "SELL", ticker: "CIFR", qty: 10, price: 8.2,   status: "PENDING", agent: "MAESTRO" },
  { id: "o3", ts: "11:14", action: "BUY",  ticker: "IONQ", qty: 5,  price: 31.5,  status: "FILLED",  agent: "CEO" },
];

export const AGENT_ACTIVITY = [
  { agent: "MAESTRO", message: "Held AMD — CONVICTION_TOO_LOW for harvest", ts: "14:40" },
  { agent: "Sniper",  message: "BUY IONQ — APPROVED @ $31.50",              ts: "14:32" },
  { agent: "Scout",   message: "Sentiment shift on $UEC: BULLISH 73%",      ts: "13:58" },
];

export const DISCUSSION_PREVIEW = [
  { user: "trader42",  badge: "🟠", text: "$AMD broke resistance!", sentiment: "🐂", likes: 42 },
  { user: "alphaWolf", badge: "🔴", text: "Taking profits on $XYL", sentiment: "🐂", likes: 18 },
];
