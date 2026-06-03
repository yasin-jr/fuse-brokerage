This is a big batch. Splitting into 4 phases so you can see progress and we don't break things. Approve and I'll execute all four.

## Phase 1 — Catalog + market data

- **Expand catalog to ~250 tickers** (`src/lib/catalog.ts`): mega-caps, tech, semis, AI, robotics, quantum, biotech, dividend aristocrats, EVs, energy, finance, consumer, ETFs. Each entry: symbol, name, sector, theme tags. Logos via `LOGO_URL` (FMP CDN — already wired).
- **New server fns** in `src/lib/market.functions.ts`:
  - `getPortfolioHistory({ positions, cash, range })` — reconstructs portfolio value per timestamp by combining each holding's candles. Powers the portfolio chart with real % gain/loss for 1D / 1W / 1M / 3M / 6M / 1Y / 10Y / ALL.
  - `getQuotesBatch` already exists — reuse.
  - `getMovers` already exists — extend to return up to 25 per list.
  - `getLargestByMarketCap({ limit })` — FMP `stock-screener` sorted by marketCap, up to 50.
  - `getThemeStocks({ themeId })` — filters catalog by tag + fetches live quotes.

## Phase 2 — Portfolio tab (mock-up #1)

- **Add portfolio value chart** above existing holdings (keep everything currently there):
  - Range tabs: 1D · 1W · 1M · 3M · 6M · 1Y · 10Y · ALL.
  - SVG line chart, gradient fill, green/red based on net change.
  - Hover/touch crosshair shows `$value · timestamp` (tooltip).
  - Header shows total + absolute $ change + % for the selected range (real calc from historical candles weighted by current shares; for periods before a position was opened, that holding contributes 0 — documented behavior).
- Keep index strip, points tile, holdings list intact.

## Phase 3 — Invest tab (mock-ups #2-#5)

Sections in this order (preserves your existing search):
1. **Search bar** (existing).
2. **Daily Lists** — Top Winners / Top Losers / Top Traded. 3 cards each; "View All" → `/invest/list/$kind` showing 25.
3. **Largest by Market Cap** — 5 rows; "View All" → `/invest/market-cap` with 50.
4. **Heatmap** — restored. Grid of top 30 by market-cap, cell size ∝ marketCap, color ∝ daily change (red→green oklch scale). Tap → stock page.
5. **Themes** — restored grid with illustrations + descriptions. Themes: Top Tech, Electric Vehicles, AI & Robotics, Quantum, Biotech, Semiconductors, Dividend Aristocrats, Recession Proof, Healthcare, Food & Beverage, Energy, Financials, Consumer, ETFs. Tap → `/invest/theme/$id` (mock #5 layout: hero illustration, title, description, full stock list with live prices).
6. **Search-only catalog** — every catalog ticker is searchable but only surfaced via search / lists / themes (not in a giant grid).

New routes:
- `src/routes/invest.list.$kind.tsx` (winners | losers | actives)
- `src/routes/invest.market-cap.tsx`
- `src/routes/invest.theme.$id.tsx`

## Phase 4 — Stock page + social + settings

**Stock page (`stock.$symbol.tsx`, mock-ups #6-#8) — redesign:**
- Header: logo, symbol, name, sector, share/bookmark icons.
- Pre-market strip (uses FMP pre/post-market quote when available; else hidden).
- Big price + $ change + % for selected range (recomputed when range tab tapped).
- Chart: line + faint volume bars at bottom, **interactive crosshair** — touch/drag shows `SYMBOL — $price at HH:MM` tooltip. Background blends with chart (no hard card border).
- Range tabs: 1D 5D 1M 3M 6M 1Y 10Y All YTD — each shows the period's gain/loss next to price.
- Equity Position card (existing, keep).
- **Stats** card (mock #7): Prev Close, Open, Close, Avg Volume, P/E, Market Cap; Today range slider (low→high) with current marker; 52W range slider; period-perf grid (1W 1M 3M 6M YTD 1Y) — real values from candles.
- **About** card (mock #8): description, CEO, Sector, Industry, Market Cap, 52W High/Low, Beta — from FMP `profile` (extend `getCompanyStats` to include `description`, `ceo`, `beta`, `high52`, `low52`).
- Sticky bottom bar: Buying Power + Trade button (already present, restyle).

**Social (discussion):**
- Posts already public via Supabase. Add **likes (1 per user)** — `post_likes` table already exists, wire heart button with optimistic toggle.
- Add **comments** — new `post_comments` table (id, post_id, user_id, username, body, created_at) + RLS (anyone can read, author can write/delete own). Comment count + thread under each post.
- **Ticker tagging** in `PostComposer` — auto-detect `$NVDA` patterns, render as links to `/stock/NVDA`, store extracted tickers in `posts.tickers text[]` for filtering.

**Settings:**
- Add "Restart account" button (uses existing `restartAccount()` in `profile-store`) with confirm dialog → clears cash/positions/points/claimedBalance → redirect to `/onboarding/difficulty`.

## Files touched (rough)

New: `src/components/PortfolioChart.tsx`, `src/components/StockChart.tsx`, `src/components/Heatmap.tsx`, `src/components/ThemeCard.tsx`, `src/components/CommentList.tsx`, `src/routes/invest.list.$kind.tsx`, `src/routes/invest.market-cap.tsx`, `src/routes/invest.theme.$id.tsx`, `src/lib/themes.ts`.

Edited: `src/lib/catalog.ts`, `src/lib/market.functions.ts`, `src/lib/posts.functions.ts`, `src/lib/profile-store.ts`, `src/routes/portfolio.tsx`, `src/routes/invest.tsx`, `src/routes/stock.$symbol.tsx`, `src/routes/discussion.tsx`, `src/routes/settings.tsx`, `src/components/PostComposer.tsx`.

Migrations: 1 new — `post_comments` table + RLS + grants + realtime.

## Open questions before I start

1. **Pre-market data** — FMP pre/post-market is on paid tier. If your `FMP_KEY` is free-tier, I'll fall back to "Market closed" badge instead of fake pre-market price. Want me to also wire **Alpaca** or **Polygon** for real pre-market? (Would need a new secret.)
2. **Heatmap scope** — top 30 by market cap is the standard. Want sector-grouped (Finviz-style) instead?
3. **Catalog 250 vs 500** — 250 keeps quote-batching fast (FMP allows 50/call, so 5 calls). 500 is doable but slower. Stick with 250?

If "yes go" without answers I'll default: free-tier pre-market fallback, top-30 heatmap, 250 tickers.