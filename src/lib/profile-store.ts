import { useEffect, useState } from "react";

export type Difficulty = "easy" | "medium-long" | "medium-short" | "hard";

export const DIFFICULTY_TIERS: Record<Difficulty, { capital: number; multiplier: number; label: string }> = {
  "easy":          { capital: 1_000_000, multiplier: 1,  label: "Easy" },
  "medium-long":   { capital: 100_000,   multiplier: 3,  label: "Medium-Long" },
  "medium-short":  { capital: 10_000,    multiplier: 5,  label: "Medium-Short" },
  "hard":          { capital: 1_000,     multiplier: 10, label: "Hard" },
};

export type Position = {
  symbol: string;
  shares: number;
  avgPrice: number; // average entry
};

export type Order = {
  id: string;
  ts: number;
  action: "BUY" | "SELL";
  symbol: string;
  qty: number;
  price: number;
};

export type Profile = {
  username: string;
  bio: string;
  avatar: string;
  email?: string;
  difficulty?: Difficulty;
  // gamification + paper trading
  claimedBalance?: number;   // locked starting capital, never changes until restart
  cash?: number;             // available cash
  points?: number;           // gamification points
  pointsMultiplier?: number; // points per 1% gain
  positions?: Position[];
  orders?: Order[];
};

const KEY = "fuse-profile";
const ACCOUNTS_KEY = "fuse-accounts";
const DEFAULT: Profile = { username: "", bio: "", avatar: "" };

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    if (p.username && p.email) {
      const accounts = loadAccounts();
      accounts[p.username.toLowerCase()] = p.email;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    window.dispatchEvent(new Event("fuse-profile-change"));
    // Fire-and-forget push to Supabase (no-op if not signed in or during hydration)
    import("./profile-sync").then((m) => m.pushProfile(p).catch(() => {}));
  } catch {}
}

export function loadAccounts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}"); } catch { return {}; }
}

export function lookupEmailByUsername(username: string): string | null {
  const accounts = loadAccounts();
  return accounts[username.toLowerCase()] || null;
}

export function clearAccountData() {
  try {
    ["fuse-profile", "fuse-posts", "fuse-follows", "fuse-portfolio", "fuse-orders", "fuse-trades", "fuse-points"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.dispatchEvent(new Event("fuse-profile-change"));
  } catch {}
}

/** Wipe difficulty + capital + positions but keep username/email/bio/avatar */
export function restartAccount() {
  const p = loadProfile();
  saveProfile({
    username: p.username,
    bio: p.bio,
    avatar: p.avatar,
    email: p.email,
  });
}

/** Apply the difficulty pick: locks starting capital, resets points/positions. */
export function claimDifficulty(difficulty: Difficulty) {
  const tier = DIFFICULTY_TIERS[difficulty];
  const p = loadProfile();
  saveProfile({
    ...p,
    difficulty,
    claimedBalance: tier.capital,
    cash: tier.capital,
    points: 0,
    pointsMultiplier: tier.multiplier,
    positions: [],
    orders: [],
  });
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT);
  useEffect(() => {
    setProfile(loadProfile());
    const handler = () => setProfile(loadProfile());
    window.addEventListener("fuse-profile-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("fuse-profile-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return profile;
}

// ---------- trading ----------

export function placeBuy(symbol: string, qty: number, price: number) {
  const p = loadProfile();
  const cost = qty * price;
  const cash = p.cash ?? 0;
  if (cost > cash) throw new Error(`Not enough cash. Need $${cost.toFixed(2)}, have $${cash.toFixed(2)}.`);
  const positions = [...(p.positions ?? [])];
  const existing = positions.find((x) => x.symbol === symbol);
  if (existing) {
    const totalShares = existing.shares + qty;
    const totalCost = existing.shares * existing.avgPrice + cost;
    existing.shares = totalShares;
    existing.avgPrice = totalCost / totalShares;
  } else {
    positions.push({ symbol, shares: qty, avgPrice: price });
  }
  const order: Order = { id: Math.random().toString(36).slice(2), ts: Date.now(), action: "BUY", symbol, qty, price };
  saveProfile({ ...p, cash: cash - cost, positions, orders: [order, ...(p.orders ?? [])].slice(0, 200) });
}

export function placeSell(symbol: string, qty: number, price: number) {
  const p = loadProfile();
  const positions = [...(p.positions ?? [])];
  const existing = positions.find((x) => x.symbol === symbol);
  if (!existing || existing.shares < qty) throw new Error(`You only have ${existing?.shares ?? 0} shares of ${symbol}.`);
  // points: gain % over avg, times multiplier
  const gainPct = ((price - existing.avgPrice) / existing.avgPrice) * 100;
  const mult = p.pointsMultiplier ?? 1;
  const earned = Math.max(0, Math.floor(gainPct * mult));
  existing.shares -= qty;
  const cleaned = positions.filter((x) => x.shares > 0.000001);
  const order: Order = { id: Math.random().toString(36).slice(2), ts: Date.now(), action: "SELL", symbol, qty, price };
  saveProfile({
    ...p,
    cash: (p.cash ?? 0) + qty * price,
    positions: cleaned,
    orders: [order, ...(p.orders ?? [])].slice(0, 200),
    points: (p.points ?? 0) + earned,
  });
  return { earned };
}

// ---------- posts (legacy localStorage — kept for compat, new feed uses DB) ----------

export type Post = { id: string; user: string; text: string; ts: number; likes: number };
const POSTS_KEY = "fuse-posts";

export function loadPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]"); } catch { return []; }
}
export function savePosts(posts: Post[]) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    window.dispatchEvent(new Event("fuse-posts-change"));
  } catch {}
}
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    setPosts(loadPosts());
    const handler = () => setPosts(loadPosts());
    window.addEventListener("fuse-posts-change", handler);
    return () => window.removeEventListener("fuse-posts-change", handler);
  }, []);
  return posts;
}

// ---------- follow ----------

const FOLLOW_KEY = "fuse-follows";
type FollowState = { followers: string[]; following: string[] };
const DEFAULT_FOLLOW: FollowState = { followers: [], following: [] };

export function loadFollows(): FollowState {
  if (typeof window === "undefined") return DEFAULT_FOLLOW;
  try { return { ...DEFAULT_FOLLOW, ...JSON.parse(localStorage.getItem(FOLLOW_KEY) || "{}") }; } catch { return DEFAULT_FOLLOW; }
}
export function saveFollows(f: FollowState) {
  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(f));
    window.dispatchEvent(new Event("fuse-follows-change"));
  } catch {}
}
export function useFollows() {
  const [f, setF] = useState<FollowState>(DEFAULT_FOLLOW);
  useEffect(() => {
    setF(loadFollows());
    const handler = () => setF(loadFollows());
    window.addEventListener("fuse-follows-change", handler);
    return () => window.removeEventListener("fuse-follows-change", handler);
  }, []);
  return f;
}

// ---------- streak ----------

const STREAK_KEY = "fuse-streak";
type StreakState = { current: number; best: number; lastDay: string };
const DEFAULT_STREAK: StreakState = { current: 0, best: 0, lastDay: "" };
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function yesterdayKey() { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }

export function loadStreak(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  try { return { ...DEFAULT_STREAK, ...JSON.parse(localStorage.getItem(STREAK_KEY) || "{}") }; } catch { return DEFAULT_STREAK; }
}
export function pingStreak(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  const s = loadStreak();
  const today = todayKey();
  if (s.lastDay === today) return s;
  const next: StreakState = s.lastDay === yesterdayKey()
    ? { current: s.current + 1, best: Math.max(s.best, s.current + 1), lastDay: today }
    : { current: 1, best: Math.max(s.best, 1), lastDay: today };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("fuse-streak-change"));
  } catch {}
  return next;
}
export function useStreak() {
  const [s, setS] = useState<StreakState>(DEFAULT_STREAK);
  useEffect(() => {
    setS(pingStreak());
    const handler = () => setS(loadStreak());
    window.addEventListener("fuse-streak-change", handler);
    return () => window.removeEventListener("fuse-streak-change", handler);
  }, []);
  return s;
}

// ---------- chat ----------

const CHAT_KEY = "fuse-chat";
export type ChatMsg = { role: "user" | "assistant"; content: string };

export function loadChat(): ChatMsg[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]"); } catch { return []; }
}
export function saveChat(msgs: ChatMsg[]) {
  try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-100))); } catch {}
}
export function clearChat() {
  try { localStorage.removeItem(CHAT_KEY); } catch {}
}
