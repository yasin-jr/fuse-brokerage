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
    window.dispatchEvent(new Event("fuse-profile-change"));
  } catch {}
}

export function clearAccountData() {
  try {
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
