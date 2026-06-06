// Bidirectional sync between localStorage profile-store and Supabase.
// Keeps the synchronous useProfile() API while persisting across sessions.

import { supabase } from "@/integrations/supabase/client";
import { loadProfile, saveProfile, type Profile, type Position, type Order } from "./profile-store";

let hydrated = false;
let hydrating: Promise<void> | null = null;

export async function hydrateFromSupabase(): Promise<void> {
  if (hydrating) return hydrating;
  hydrating = (async () => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) return;

    const [profileRes, posRes, ordRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("positions").select("*").eq("user_id", user.id),
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(200),
    ]);

    const p = profileRes.data;
    const positions: Position[] = (posRes.data ?? []).map((r: any) => ({
      symbol: r.symbol,
      shares: Number(r.shares),
      avgPrice: Number(r.avg_price),
    }));
    const orders: Order[] = (ordRes.data ?? []).map((r: any) => ({
      id: r.id,
      ts: new Date(r.created_at).getTime(),
      action: r.action,
      symbol: r.symbol,
      qty: Number(r.qty),
      price: Number(r.price),
    }));

    const local = loadProfile();
    const merged: Profile = {
      ...local,
      username: p?.username || local.username || (user.email?.split("@")[0] ?? ""),
      bio: p?.bio ?? local.bio ?? "",
      avatar: p?.avatar ?? local.avatar ?? "",
      email: user.email ?? local.email,
      difficulty: (p?.difficulty as Profile["difficulty"]) ?? local.difficulty,
      claimedBalance: p?.claimed_balance != null ? Number(p.claimed_balance) : local.claimedBalance,
      cash: p?.cash != null ? Number(p.cash) : local.cash,
      points: p?.points != null ? Number(p.points) : local.points,
      pointsMultiplier: p?.points_multiplier != null ? Number(p.points_multiplier) : local.pointsMultiplier,
      positions,
      orders,
    };
    // Save WITHOUT triggering push-back (set flag)
    skipPush = true;
    saveProfile(merged);
    skipPush = false;
    hydrated = true;
  })();
  try { await hydrating; } finally { hydrating = null; }
}

export function isHydrated() { return hydrated; }

let skipPush = false;

export async function pushProfile(p: Profile) {
  if (skipPush) return;
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  await supabase.from("profiles").upsert({
    user_id: user.id,
    username: p.username || "",
    bio: p.bio || "",
    avatar: p.avatar || "",
    email: p.email ?? user.email,
    difficulty: p.difficulty ?? null,
    claimed_balance: p.claimedBalance ?? null,
    cash: p.cash ?? null,
    points: p.points ?? 0,
    points_multiplier: p.pointsMultiplier ?? 1,
  }, { onConflict: "user_id" });
}

export async function pushPositions(positions: Position[]) {
  if (skipPush) return;
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  // Replace all positions for this user (simple + safe for small counts)
  await supabase.from("positions").delete().eq("user_id", user.id);
  if (positions.length > 0) {
    await supabase.from("positions").insert(
      positions.map((p) => ({ user_id: user.id, symbol: p.symbol, shares: p.shares, avg_price: p.avgPrice })),
    );
  }
}

export async function pushOrder(o: Order) {
  if (skipPush) return;
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  await supabase.from("orders").insert({
    user_id: user.id,
    action: o.action,
    symbol: o.symbol,
    qty: o.qty,
    price: o.price,
  });
}

export async function clearRemoteAccount() {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  await Promise.all([
    supabase.from("positions").delete().eq("user_id", user.id),
    supabase.from("orders").delete().eq("user_id", user.id),
    supabase.from("profiles").update({
      difficulty: null, claimed_balance: null, cash: null, points: 0, points_multiplier: 1,
    }).eq("user_id", user.id),
  ]);
  hydrated = false;
}

export async function getWatchlist(): Promise<string[]> {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return [];
  const { data } = await supabase.from("watchlist").select("symbol").eq("user_id", user.id);
  return (data ?? []).map((r: any) => r.symbol);
}

export async function addToWatchlist(symbol: string) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  await supabase.from("watchlist").upsert({ user_id: user.id, symbol }, { onConflict: "user_id,symbol" });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("fuse-watchlist-change"));
}

export async function removeFromWatchlist(symbol: string) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return;
  await supabase.from("watchlist").delete().eq("user_id", user.id).eq("symbol", symbol);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("fuse-watchlist-change"));
}

export async function toggleWatchlist(symbol: string): Promise<boolean> {
  const list = await getWatchlist();
  if (list.includes(symbol)) {
    await removeFromWatchlist(symbol);
    return false;
  }
  await addToWatchlist(symbol);
  return true;
}
