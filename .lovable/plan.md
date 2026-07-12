# Ascend Platform V2 — Refinement & Identity Upgrade

## 1. Brand & Design System (foundation for everything else)

**Rename FusionSynergy → Ascend** everywhere in-product (headers, titles, meta, onboarding, auth, chat, empty states). Keep "FusionSynergy" only in About, Legal, Footer, Company sections as parent-company reference.

**Rewrite `src/styles.css` design tokens:**
- Dark: bg `#040406` (Midnight), primary `#0F52BA` (Sapphire), accent `#990F4B` (Berry)
- Light: bg `#EDF4F5` (Ice White), same Sapphire + Berry
- Kill the current teal/purple `--fuse-gradient`; replace with a Sapphire→Berry gradient used sparingly (CTA, logo mark, AI accents only)
- Refine card surfaces, border, muted, ring tokens for both modes so light mode gets proper depth (layered surfaces, softer shadows, not flat)
- Typography scale + spacing tokens standardized

**Global sweep:** every component using hardcoded emerald/rose/indigo/purple utilities gets swapped to semantic tokens. Buy = Sapphire, Sell = Berry, gains = emerald token, losses = rose token (kept for readability).

## 2. Ascend Logo & FUSE AI Mark

- Use uploaded Ascend "A" logo in `src/components/Logo.tsx` (via lovable-assets pointer from `/mnt/user-uploads/photo_2026-07-08_23.32.56.jpeg`)
- Generate a distinct FUSE AI mark (minimal geometric spark/node icon, Berry accent) — used in FuseChat, AI insight cards, nav. Clearly a *sub-brand* of Ascend, not a company logo.

## 3. Public Landing Page (new `/` route, unauthenticated)

Restructure routing: unauthenticated users hit landing at `/`, authenticated users are redirected to `/home` (rename current `index.tsx` → `home.tsx`, move `AuthGate` off the root and into an `_app` layout).

Landing sections (eToro-inspired, Ascend palette):
1. **Nav** — logo, Markets / Learn / Company dropdowns, Sign in, "Start Investing" CTA
2. **Hero** — "Invest Smarter. Learn Faster. Compete Better." + phone mockup with animated dashboard preview
3. **Feature grid** — AI Assistant, Simulator, Community, Leaderboards, Research, Watchlists
4. **Platform preview** — desktop + mobile screenshots
5. **Why Ascend** — 4 value props
6. **Animated stats counters** — Active Investors / Trades / Market Coverage
7. **Final CTA** + footer (FusionSynergy parent-company reference lives here)

**Motion system** (Framer Motion, already available via Motion for React patterns):
- Hero staggered fade+slide (600–1200ms total)
- Subtle animated bg: low-opacity flowing lines / particles (canvas, respects `prefers-reduced-motion`, disabled on mobile)
- Scroll-reveal for feature cards, hover lift on buttons/cards
- Phone mockup loop: watchlist tick, chart pulse, market-status flip, AI card appear
- Counters animate once on viewport enter

Light + dark parity throughout.

## 4. Market Status System

New `src/components/MarketStatus.tsx` — global pill showing Open / Pre / After / Closed / Holiday with countdown to next transition. Mounted in AppShell header and on stock pages. Uses existing `marketState` helper; extend for holiday calendar (US market holidays hardcoded list).

## 5. Stock Page Expansion

Extend `src/routes/stock.$symbol.tsx` and `market.functions.ts`:
- Sessions: Regular / Pre-Market / After-Hours sub-cards with own price+change (FMP `/stable/quote` + `/stable/quote-short` extended-hours fields)
- Stats grid: Market Cap, P/E, 52W range, Sector, Industry, Volume, Avg Volume, Dividend, Beta
- **Recent News** — FMP `/stable/news/stock`
- **Analyst Ratings** — FMP `/stable/ratings-snapshot`
- **FUSE AI Summary card** — Berry-accented, calls Lovable AI Gateway with symbol + key stats, returns 2-sentence take
- **Related Stocks** — same-sector peers
- **Buy/Sell dock** — sticky, opens Trade modal (already exists — polish confirmation w/ estimated cost, portfolio impact %, remaining cash, position size after)

## 6. Fix All Dead Interactions

Audit pass — every button either acts or shows a "Coming Soon" toast:
- Invest tab "View all" links → verify routes exist and load
- Theme tiles → clickable → theme detail page (see §7)
- Home tab quick actions
- Settings placeholder rows
- Discover / Discussion / Leaderboard nav
- More menu

## 7. Theme Detail Pages

Complete `invest.theme.$themeId.tsx`:
- Header w/ gradient + description
- Constituent stocks grid w/ live quotes
- Top performers / worst performers (today)
- Theme news (FMP news filtered by constituents)
- FUSE AI commentary (Lovable AI, one-shot summary of theme momentum)
- Theme aggregate perf chart (equal-weight)

## 8. Portfolio Health

New section on `/portfolio`:
- Diversification score (Herfindahl index across positions)
- Sector exposure bars (color-coded)
- Cash allocation %
- Concentration warning (any single position >25%)
- Risk score (weighted beta)
- Overall Health score (0–100) w/ ring visual

## 9. Empty States

Rewrite every empty state with title + guidance + primary CTA:
- Watchlist, Positions, Orders, Community, Discussion, Notifications

## 10. Home Tab Cleanup

- Remove "Practice Cash" pill (gamification already handles it)
- Wire Ticker Tape to live Finnhub WebSocket for real-time mini-chart movement (fallback to 15s polling)
- Recent Orders section reads from Supabase `orders` table
- Market Movers row + Market Status pill in header

## 11. Light Mode Polish

Pass over every route in light mode:
- Layered surface tokens (bg / card / elevated card)
- Softer shadows using Sapphire-tinted color-mix
- Increased text contrast
- Verify charts, heatmap, badges legible

## 12. Consistency Sweep

Final pass — visit every route, confirm: Ascend logo/wordmark, unified card style, unified button style, Sapphire primary, Berry AI accents, no lingering FusionSynergy strings, no purple/teal remnants.

---

## Technical Notes

- **New route structure:** `src/routes/index.tsx` (landing), `src/routes/_app.tsx` (AuthGate layout), `src/routes/_app/home.tsx`, `_app/invest.tsx`, etc. Redirect `/` → `/home` when session exists.
- **Motion lib:** add `motion` (Framer Motion successor) via `bun add motion`.
- **New server fns in `market.functions.ts`:** `getStockNews`, `getAnalystRatings`, `getExtendedHoursQuote`, `getPeers`, `getFuseInsight` (Lovable AI).
- **Market holidays:** static US calendar constant in `src/lib/market-hours.ts`.
- **Logo asset:** register `photo_2026-07-08_23.32.56.jpeg` via lovable-assets, import as JSON pointer.
- **AI Gateway:** use existing Lovable AI connector for FUSE insights (no new secret).
- **APIs already keyed:** FMP `/stable`, Finnhub. No new keys required for this scope.

## Out of scope for this turn
Social copy-trading, options, crypto onboarding, mobile native app, education center — design tokens will make them drop-in later.
