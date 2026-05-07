// Lightweight starter data for FusionSynergy. Replaced by live engine in later phases.

export type Pillar = {
  ticker: string;
  name: string;
  sector: "AI & Tech" | "Energy" | "Infrastructure";
  price: number;
  change: number;
  shares: number;
  weight: number;
  stage: "Building" | "Growing" | "Mature" | "Trimming";
};

export const PILLARS: Pillar[] = [
  { ticker: "UEC",  name: "Uranium Energy",   sector: "Energy",         price: 7.42,   change: 3.1,  shares: 190, weight: 14.2, stage: "Growing" },
  { ticker: "AMD",  name: "AMD",              sector: "AI & Tech",      price: 142.50, change: 2.3,  shares: 13,  weight: 18.5, stage: "Mature" },
  { ticker: "PATH", name: "UiPath",           sector: "AI & Tech",      price: 28.10,  change: 1.4,  shares: 65,  weight: 18.3, stage: "Growing" },
  { ticker: "SERV", name: "Serve Robotics",   sector: "AI & Tech",      price: 12.20,  change: -0.5, shares: 130, weight: 15.9, stage: "Building" },
  { ticker: "IONQ", name: "IonQ",             sector: "AI & Tech",      price: 31.50,  change: 0.0,  shares: 5,   weight: 1.5,  stage: "Building" },
  { ticker: "CIFR", name: "Cipher Mining",    sector: "Infrastructure", price: 8.20,   change: -1.8, shares: 220, weight: 17.6, stage: "Mature" },
  { ticker: "XYL",  name: "Xylem",            sector: "Infrastructure", price: 124.80, change: 4.2,  shares: 8,   weight: 9.7,  stage: "Growing" },
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

// Casual safety rules (the inner architecture calls these "the 4 bones")
export const SAFETY_RULES = [
  { id: 1, label: "Keep at least 15% in cash",     ok: true, value: "16.4% cash" },
  { id: 2, label: "Don't lose more than 5% a day", ok: true, value: "+1.46% today" },
  { id: 3, label: "No single stock above 20%",     ok: true, value: "Top: 18.5%" },
  { id: 4, label: "No sector above 50%",           ok: true, value: "Top sector: 38.8%" },
];

// Empty by default — the live engine fills these.
export const RECENT_ORDERS: Array<{
  id: string; ts: string; action: "BUY" | "SELL"; ticker: string;
  qty: number; price: number; status: "FILLED" | "PENDING";
}> = [];

export const DISCUSSION_PREVIEW: Array<{
  user: string; badge: string; text: string; sentiment: string; likes: number;
}> = [];
