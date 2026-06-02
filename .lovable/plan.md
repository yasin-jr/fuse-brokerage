
# Plan — Big feature batch

I'll split this into 6 focused workstreams. Most of this is frontend + a thin server layer using your Finnhub/FMP keys. No new tables unless we agree on persistence — for now everything user‑specific (balance, points, positions, posts) is per‑account in `profile-store` + Supabase `profiles` JSON so it survives logins. Tell me if you'd rather have proper tables for `positions`, `orders`, `posts` (recommended for "public discussions"); I flagged that below.

## 1. Difficulty → claim starting balance + points system

- On `/onboarding/difficulty`, the capital chip (`$1,000,000` / `$100,000` / `$10,000` / `$1,000`) becomes the **Claim** button. Clicking it:
  - locks that capital as `startingCapital` and `cash` on the profile
  - sets `points = 0`
  - sets `pointsMultiplier` from the tier (1 / 3 / 5 / 10 per 1% gain)
  - sets `lockedDifficulty = true` so it can't change until "Restart account" in Settings
- Settings → new "Restart account" button (confirm dialog) wipes capital, points, positions, orders.
- Points formula (matches your gamification copy):
  - On every closed trade (sell) or daily mark, award `floor(pnl% * multiplier)` points. Never negative below 0.
- Portfolio tab header gets a new **Points** stat (big number) next to Total. Starters = 0.

## 2. Real market data (Finnhub + FMP)

Server functions in `src/lib/market.functions.ts` using `process.env.FINNHUB_KEY` / `FMP_KEY` (already wired). I'll add:

- `getQuotes` — already exists, will also try FMP as a third fallback.
- `getCandles({symbol, range})` — historical OHLC for `1D/1W/1M/3M/6M/1Y/10Y/YTD/ALL` using FMP `historical-chart` (intraday) + `historical-price-full` (daily).
- `getProfile(symbol)` — company profile (logo, name, sector, marketCap, exchange) via FMP `/profile`.
- `getKeyStats(symbol)` — P/E, avg volume, open, prevClose, today's close via FMP `/quote` + Finnhub fallback.
- `searchSymbols(q)` — fuzzy search across tickers + names via FMP `/search?query=`.

All zod‑validated, all cached 30–60s via React Query.

Ticker tape already uses `getQuotes` — it'll automatically get real data once the `FINNHUB_KEY` / `FMP_KEY` secrets are set. **Action item for you: confirm those secrets are added in Lovable Cloud → Secrets** (you gave me the values previously; I can request them via `add_secret` if not yet stored — just say go).

## 3. Markets catalog + company pages

- New `src/lib/catalog.ts` with **all major US technology tickers** (as the test set you asked for): AAPL, MSFT, NVDA, GOOGL, GOOG, AMZN, META, TSLA, AVGO, ORCL, ADBE, CRM, AMD, INTC, CSCO, QCOM, TXN, IBM, NOW, INTU, AMAT, MU, LRCX, KLAC, PANW, SNOW, PLTR, SHOP, UBER, NFLX, ASML, TSM, ARM, SMCI, DELL, HPQ, ANET, MRVL, ADI, ADSK, WDAY, TEAM, DDOG, NET, CRWD, ZS, MDB, FTNT, ON, NXPI. (≈50). Logos via Financial Modeling Prep's CDN: `https://financialmodelingprep.com/image-stock/{TICKER}.png` (no key needed, real logos).
- New route `src/routes/stock.$symbol.tsx`:
  - Header: logo + name + ticker + current price + day change
  - Chart with range tabs `1D 1W 1M 3M 6M 1Y 10Y YTD ALL` driven by `getCandles`
  - **Equity position card**: if no position → "N/A"; else shares, avg entry, current value, day Δ, total Δ
  - **Buy / Sell** buttons → opens an order modal (qty + market price), updates positions + cash in profile
  - **Stats grid**: Market Cap, P/E, Avg Volume, Open, Close, Previous Close
- `/invest` page becomes the markets catalog: grid of all tickers (logo + price + change), search bar fuzzy‑matching ticker OR name (e.g. "nvi" → NVDA Nvidia). Clicking a card → `/stock/NVDA`.
- `/discover` (home) gets a **Trending** section with 6 cards (logos + live price + change). Default picks: NVDA, AAPL, TSLA, MSFT, META, AMD.

## 4. Portfolio = locked starting capital + points

- Portfolio header shows: **Total portfolio** = `cash + sum(position.shares * currentPrice)`. Live‑computed from `getQuotes` for held symbols.
- New **Points** tile (with multiplier badge).
- Holdings list replaces the mock `PILLARS` with real positions from profile.
- Sector mix still computed from positions (sector pulled from `getProfile`, cached).

## 5. Discussions — rich composer + public feed

- Replace inline textarea on `/discussion` with a **"Post something"** button that opens a full dialog matching your screenshot:
  - Title (0/200)
  - Body textarea ("Please enter text")
  - Toolbar: bold (Aa), 66 quote, emoji picker, **image upload**, video link, @mention, poll (stub), link, attach, $ticker tag, calendar, idea bulb, list
  - Footer: `# Topic` chip, "Visible to: 🔥 Public ▾", `Post` button (orange)
  - Images uploaded to Supabase Storage bucket `post-media` (I'll create with a public‑read policy).
- **Public feed**: needs a real DB table to be shared across users. Right now posts live in `localStorage` (only that browser sees them). I'll create:
  - `posts` table (id, user_id, username, title, body, media_urls[], topic, visibility, likes, created_at) + RLS: public read for `visibility='public'`, owner write.
  - `post_likes` table (user_id, post_id) for like state.
  - Realtime enabled on `posts` so the feed updates live.
- This requires a migration — I'll run it through the migration tool (you'll get an approval prompt).

## 6. Email verification

The OTP path is wired; the issue is deliverability. Two fixes:

- **Right now (free):** I'll switch the signup flow to also surface a "Didn't get the code? Resend" button with a 60s cooldown and add a clear "check spam (noreply@mail.app.supabase.io)" note. That covers 90% of "never arrived" cases on the default sender.
- **Branded "from FusionSynergy" emails:** still requires a verified sender domain (one‑time DNS step). I'll scaffold the branded OTP template the moment you confirm a domain you own.

## Technical notes

- Catalog + logos: zero key needed (FMP CDN).
- Candles/profile/quote/search: FMP first, Finnhub fallback. Both keys read server‑side only.
- New tables (`posts`, `post_likes`, `profiles` columns for `starting_capital`, `cash`, `points`, `points_multiplier`, `locked_difficulty`, `positions JSONB`, `orders JSONB`) → single migration, all with explicit GRANTs + RLS as per the security rules.
- Storage bucket `post-media` public‑read, authenticated‑write.

## What I need from you before I start

1. **Confirm secrets**: should I (re)add `FINNHUB_KEY` and `FMP_KEY` via the secrets tool now? (You shared the values earlier — same ones?)
2. **Persistence model**: OK to create the `posts`, `post_likes` tables + extend `profiles` (recommended), or keep everything in localStorage for now?
3. **Tech catalog scope**: ~50 large/mid‑cap US tech tickers as listed above — good, or do you want me to also include EU/Asia tech?
4. **Email**: do the free fix now, and you'll set up a sender domain later — sound right?

Once you answer (even just "yes to all"), I'll execute end‑to‑end.
