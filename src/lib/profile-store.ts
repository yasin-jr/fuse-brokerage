import { useEffect, useState } from "react";

export type Difficulty = "easy" | "medium-long" | "medium-short" | "hard";

export type Profile = {
  username: string;
  bio: string;
  avatar: string; // data URL
  email?: string;
  difficulty?: Difficulty;
};

const KEY = "fuse-profile";
const ACCOUNTS_KEY = "fuse-accounts"; // username -> email map (device-local)
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
  } catch {}
}

export function loadAccounts(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function lookupEmailByUsername(username: string): string | null {
  const accounts = loadAccounts();
  return accounts[username.toLowerCase()] || null;
}

export function clearAccountData() {
  try {
    // Clear profile + activity but keep accounts map so user can re-sign-in by username elsewhere
    ["fuse-profile", "fuse-posts", "fuse-follows", "fuse-portfolio", "fuse-orders", "fuse-trades", "fuse-points"].forEach(
      (k) => localStorage.removeItem(k),
    );
    window.dispatchEvent(new Event("fuse-profile-change"));
  } catch {}
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

// ---------- posts ----------

export type Post = {
  id: string;
  user: string;
  text: string;
  ts: number;
  likes: number;
};

const POSTS_KEY = "fuse-posts";

export function loadPosts(): Post[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
  } catch {
    return [];
  }
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
  try {
    return { ...DEFAULT_FOLLOW, ...JSON.parse(localStorage.getItem(FOLLOW_KEY) || "{}") };
  } catch {
    return DEFAULT_FOLLOW;
  }
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

// ---------- streak engine ----------

const STREAK_KEY = "fuse-streak";
type StreakState = { current: number; best: number; lastDay: string };
const DEFAULT_STREAK: StreakState = { current: 0, best: 0, lastDay: "" };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function loadStreak(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  try {
    return { ...DEFAULT_STREAK, ...JSON.parse(localStorage.getItem(STREAK_KEY) || "{}") };
  } catch {
    return DEFAULT_STREAK;
  }
}

/** Call once per app session. Bumps streak if a new day; resets if a day was missed. */
export function pingStreak(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  const s = loadStreak();
  const today = todayKey();
  if (s.lastDay === today) return s;
  const next: StreakState =
    s.lastDay === yesterdayKey()
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

// ---------- chat history ----------

const CHAT_KEY = "fuse-chat";
export type ChatMsg = { role: "user" | "assistant"; content: string };

export function loadChat(): ChatMsg[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveChat(msgs: ChatMsg[]) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-100)));
  } catch {}
}
export function clearChat() {
  try { localStorage.removeItem(CHAT_KEY); } catch {}
}
