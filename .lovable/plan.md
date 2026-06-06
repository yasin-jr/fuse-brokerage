# Turns 2 + 3 — Invest redesign, Stock detail, Orders, Watchlist

Picking up from Turn 1 (Supabase persistence + live data layer + Home cleanup already shipped). All four of your API keys (FMP, Finnhub, Twelve Data, Massive) are stored server-side and will be used with automatic fallback.

---

## Turn 2 — Invest tab redesign + full symbol catalog

### New server functions (`src/lib/market.functions.ts`)
- `getSymbolIndex()` — fetches FMP `/stock/list` once, caches in module-level Map keyed by symbol + lowercased name. Refreshed every 24h. Powers search across 30k+ tickers.
- `searchSymbols(q)` — substring match against the index, ranks exact-symbol > symbol-prefix > name-prefix > name-substring. Returns top 25.
- `getTopMovers({ kind: "gainers"|"losers"|"actives" })` — FMP `/stock_market/{gainers|losers|actives}`, cached 60s, falls back to Finnhub.
- `getLargestByCap(limit)` — FMP `/stock-screener?marketCapMoreThan=...&limit=...`, cached 10m.
- `getSectorHeatmap()` — FMP `/sectors-performance` (today + week), normalized to `{sector, change, tone}` where tone = up/down/neutral (±0.1%).
- `getThemeQuotes(themeId)` — pulls quotes for the curated symbol list of one theme.

### New routes
- `src/routes/invest.tsx` — **rebuilt** as a sectioned scroll page:
  1. Search bar (iOS-style, full-width, dark pill). Empty state = sections below. Typing = full-screen results overlay matching your screenshot (logo + symbol + name rows from `searchSymbols`).
  2. *Largest by Market Cap* — horizontal scroll of 6 tiles + "View all" → `/invest/largest-cap`.
  3. *Top Winners* + *Top Losers* + *Top Traded* — three stacked sections, 3 rows each + "View all" → `/invest/movers/gainers`, `/movers/losers`, `/movers/actives`.
  4. *Market Heat Map* — sector tile grid (green/red/grey by % change). Tap a sector → filtered stock list.
  5. *Themes* — horizontal row of 6 theme cards + "View all" → `/invest/themes`.
- `src/routes/invest.largest-cap.tsx` — top 20 by market cap, refreshes daily.
- `src/routes/invest.movers.$kind.tsx` — dynamic for gainers/losers/actives.
- `src/routes/invest.themes.tsx` — grid of all 12 themes.
- `src/routes/invest.theme.$themeId.tsx` — hero image + theme description + full company list with live quotes.

### Themes data (`src/lib/themes.ts` — extend existing)
12 themes you listed, each with `{ id, name, blurb, heroImage, symbols[] }`. Symbol lists curated per theme (20–60 each). Hero images generated once via imagegen.

### Search overlay component
`src/components/SearchOverlay.tsx` — full-screen modal triggered from the Invest search bar. Matches your reference screenshot exactly: dark pill search input at top, "Done" button, scrollable list of `{logo, symbol, badge, name}` rows. Each row links to `/stock/$symbol`.

---

## Turn 3 — Stock detail + Orders + Watchlist

### Stock detail redesign (`src/routes/stock.$symbol.tsx`)
Rebuilt top-to-bottom:
1. **Header** — logo, name, big price, **PRE MARKET / AFTER HOURS** badge (from FMP `/v4/pre-post-market/{symbol}`), $ change + % change with arrow.
2. **Interactive chart** — replaced static SVG with `InteractiveChart` enhanced for crosshair + volume bars under the line. Drag finger/mouse to see price-at-time tooltip. Line color: emerald (up) / rose (down) / slate (±0.05%).
3. **Range buttons** (1D · 1W · 1M · 3M · 6M · 1Y · 10Y · YTD · ALL) — each computes its own $ + % change vs first candle in range and shows it next to the active range.
4. **Equity Position card** — current value, shares, daily change, total change, avg entry, **portfolio weight** (position value ÷ total portfolio value). N/A if no position.
5. **Stats grid** — prev close, open, close, avg volume, P/E, market cap, today's range, 52W range, plus 1W/1M/3M/6M/YTD/1Y % cards (computed from candles).
6. **About** — CEO, sector, industry, market cap, 52W H/L, beta, full description (FMP `/profile`).
7. **Heart icon** in header — toggles watchlist via new `toggleWatchlist` server fn.
8. **Bottom dock** — sticky bar with "Buying Power: $X,XXX" + full-width Trade button (opens existing buy/sell modal, modal shows available cash).

New server fn `getCompanyProfile(symbol)` → FMP `/profile/{symbol}` for About section.
Extended `getCompanyStats` → adds 52W H/L, beta, 1W/1M/3M/6M/YTD/1Y % changes.

### Orders page (`src/routes/orders.tsx`)
- Reads from `orders` table via new `getMyOrders` server fn (`requireSupabaseAuth`).
- Lists every BUY/SELL with date, symbol logo, side badge, qty, price, total.
- Empty state with link to Invest.

### Watchlist page (`src/routes/watchlist.tsx` — new)
- Reads `watchlist` table via `getMyWatchlist` server fn, joins with live `getQuotes` for prices.
- Each row: logo, symbol, name, live price, % change, swipe/long-press to remove.
- Linked from Portfolio tab and from heart toggle on Stock page.

### Profile/auth wiring (closes the "I keep redoing onboarding" bug)
- `getMyProfile` / `updateMyProfile` server fns (Supabase via `requireSupabaseAuth`).
- `useProfile()` becomes a TanStack Query subscription to `getMyProfile`.
- All mutations (`placeBuy`, `placeSell`, `toggleWatchlist`, `setDifficulty`, `restartAccount`) become server fns that write to Supabase AND invalidate the profile query.
- `AuthGate`: signed in + `difficulty` set → `/`; signed in + no difficulty → `/onboarding/difficulty`; signed out → `/login`.

---

## Technical notes

- Catalog cache: in-memory Map on the server worker; warm on first request, refresh after 24h. No DB write needed — FMP `/stock/list` is the source of truth.
- All `getQuotes` calls already fan out FMP → Finnhub → Twelve Data → Massive (Turn 1).
- Pre/post-market quote merges into the same `Quote` shape with an extra `marketState: "REGULAR"|"PRE"|"POST"|"CLOSED"` field.
- Charts use FMP `/historical-chart/{interval}/{symbol}` for intraday and `/historical-price-full/{symbol}` for daily+; intervals chosen per range.
- Heart icon optimistic update via TanStack Query mutation.

---

## API keys — do I need anything else?
The four you gave (FMP, Finnhub, Twelve Data, Massive) cover everything in Turns 2 + 3. No new keys needed. **Heads up: please rotate the Massive + Twelve Data keys you pasted in chat yesterday — they're now stored in the server env, but treat the chat-pasted versions as compromised.**

---

Reply **"go"** when you want me to execute. I'll ship Turn 2 first (smaller blast radius), then Turn 3 in the next message so each one stays a clean reviewable diff.
