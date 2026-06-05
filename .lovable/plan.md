# Plan: Brokerage App Rebuild

This is too big for one turn without quality loss. I'll split into 3 focused turns. Each turn ends with a working app — nothing half-finished.

## Turn 1 (this turn) — Foundation: persistence + live data layer + Home

**Why first:** Nothing else works right (saved trades, saved difficulty, live tape, portfolio chart) until profile state lives in Supabase and live-data server fns are using your new keys.

1. **Profile/trade persistence in Supabase** — new tables: `profiles` (cash, points, difficulty, level), `positions`, `orders`, `watchlist`. RLS per `auth.uid()`. Migrate `profile-store.ts` to read/write Supabase via server fns. Difficulty is saved → onboarding only shows once.
2. **Live market data layer** — extend `src/lib/market.functions.ts` to fan out across **FMP → Finnhub → Twelve Data → Massive** with automatic fallback. Adds pre/post-market quotes via Finnhub `/quote` + FMP `/pre-post-market`.
3. **Home tab cleanup** — remove "Practice Cash" card. Fix `TickerTape` to refresh every 5s with live quotes (works pre/post-market and after close = last known + frozen flag).
4. **Portfolio tab chart restored** — `PortfolioChart` component above Points card, ranges 1D/1W/1M/6M/1Y/YTD/ALL, replays user's holdings against historical candles. Indexes back to BTC/SPY/NDX/DJI strip (RUT removed, BTC added).

## Turn 2 — Invest tab full redesign

5. **Sections:** Largest by Market Cap (top 20), Top Winners / Top Losers / Top Traded (daily, auto-refreshes day-over-day), Market Heat Map (sectors, green/red/grey), Themes row → Themes page → Theme detail page (12 themes you listed). Each has "View all" → dedicated route.
6. **Catalog expansion:** Load full FMP `/stock/list` (30k+ symbols) into a server-side cached symbol index. Search hits the full list; listing pages stay curated.

## Turn 3 — Stock detail page + Orders + Watchlist UI

7. **Stock detail redesign** (matches pic 7–10): Pre/After-market badge, big price + change $ + %, interactive chart with crosshair + volume bars, range buttons each showing their own % and $ change, Equity Position card (current value, shares, daily change, total change, avg entry, portfolio weight), full Stats grid (prev close/open/close/avg vol/PE/cap/today range/52W range/1W/1M/3M/6M/YTD/1Y % cards), About section (CEO, sector, industry, market cap, 52W H/L, beta, description from FMP profile), bottom dock with Buying Power + Trade button. Heart icon (watchlist toggle).
8. **Orders page** populated from `orders` table with full trade history.
9. **Watchlist page** with live prices.

---

## Technical notes (for me)

- Reuse existing `posts` migration pattern for RLS + grants.
- `useProfile()` becomes a TanStack Query subscription to `getMyProfile` server fn; mutations (`placeBuy`, `placeSell`, `toggleWatchlist`, `setDifficulty`, `restartAccount`) become server fns that invalidate the profile query.
- AuthGate flow: if signed in AND profile.difficulty is set → straight to `/`; if signed in AND no difficulty → `/onboarding/difficulty`; if not signed in → `/login`.
- Live chart line color: emerald when last ≥ first, rose when <, slate when within ±0.05%.
- Pre/post-market: FMP `/v4/pre-post-market/{symbol}` returns extended-hours quote; show "PRE MARKET" / "AFTER HOURS" badge when `marketState !== "REGULAR"`.

---

**Ready to execute Turn 1 right after you approve.** Turns 2 and 3 will follow in subsequent messages.