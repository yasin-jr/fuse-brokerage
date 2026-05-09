import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { PILLARS } from "@/lib/mock-data";
import { getQuotes, getMovers } from "@/lib/market.functions";
import {
  Search, Sparkles,
  Cpu, Landmark, HeartPulse, Factory, Radio, ShoppingBag, Zap, Lightbulb, Pickaxe,
  Code2, HardDrive, Network, Bot, Banknote, Dna, Atom, Rocket, Battery, ShieldCheck,
  Microscope, Eye, Brain, type LucideIcon,
  Car, Utensils, Gem, PiggyBank, Layers, TrendingUp, Trophy,
  ArrowUp, ArrowDown, Activity,
} from "lucide-react";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — FusionSynergy" },
      { name: "description", content: "Live sector maps, themes, and trending stocks powered by FUSE Intelligence." },
    ],
  }),
  component: InvestPage,
});

// ---------------- Sector definitions ----------------

type Sector = { name: string; etf: string | null; icon: LucideIcon };

const SECTORS: Sector[] = [
  { name: "Technology", etf: "XLK", icon: Cpu },
  { name: "Financials", etf: "XLF", icon: Landmark },
  { name: "Healthcare", etf: "XLV", icon: HeartPulse },
  { name: "Industrials", etf: "XLI", icon: Factory },
  { name: "Comm Services", etf: "XLC", icon: Radio },
  { name: "Consumer Disc.", etf: "XLY", icon: ShoppingBag },
  { name: "Energy", etf: "XLE", icon: Zap },
  { name: "Utilities", etf: "XLU", icon: Lightbulb },
  { name: "Materials", etf: "XLB", icon: Pickaxe },
];

const SPECIAL: Sector[] = [
  { name: "Software", etf: "IGV", icon: Code2 },
  { name: "Hardware", etf: "SOXX", icon: HardDrive },
  { name: "Networking", etf: "IGN", icon: Network },
  { name: "Artificial Intelligence", etf: "BOTZ", icon: Bot },
  { name: "Fintech", etf: "FINX", icon: Banknote },
  { name: "BioTech", etf: "IBB", icon: Dna },
  { name: "Quantum", etf: "QTUM", icon: Atom },
  { name: "Space Economy", etf: "UFO", icon: Rocket },
  { name: "Next-Gen Energy", etf: "ICLN", icon: Battery },
  { name: "Cybersecurity", etf: "HACK", icon: ShieldCheck },
  { name: "Semiconductors", etf: "SOXX", icon: Cpu },
  { name: "Nanotechnology", etf: null, icon: Microscope },
  { name: "Spatial Computing", etf: null, icon: Eye },
  { name: "Neuromorphic", etf: null, icon: Brain },
  { name: "Agentic Economy", etf: null, icon: Bot },
];

const THEMES: { name: string; desc: string; icon: LucideIcon }[] = [
  { name: "Electric Vehicles", desc: "EV makers, battery tech and the supply chain powering the transition.", icon: Car },
  { name: "Food & Beverage", desc: "Everyday brands you eat and drink — defensive consumer staples.", icon: Utensils },
  { name: "Technology", desc: "Big tech, software and the platforms shaping how we live and work.", icon: Cpu },
  { name: "Healthcare", desc: "Pharma, biotech and medical devices keeping the world healthy.", icon: HeartPulse },
  { name: "Precious Metals", desc: "Gold, silver and miners — plus ETFs that track them.", icon: Gem },
  { name: "Dividend Stocks", desc: "Companies that pay you to hold them. Steady cash flow.", icon: PiggyBank },
  { name: "Energy", desc: "Oil, gas and the companies that fuel the global economy.", icon: Zap },
  { name: "Exchange Traded Funds", desc: "Baskets of stocks in a single ticker — easy diversification.", icon: Layers },
  { name: "Growth Stocks", desc: "Fast-moving names with high upside (and higher volatility).", icon: TrendingUp },
  { name: "Artificial Intelligence", desc: "The companies building, selling and running on AI.", icon: Bot },
  { name: "Sports", desc: "Teams, leagues, apparel and the broader sports economy.", icon: Trophy },
];

// ---------------- Color helpers ----------------

function tone(change: number | undefined) {
  if (change === undefined) return { bg: "bg-secondary/40", text: "text-muted-foreground", ring: "border-border" };
  if (change > 0.05) return { bg: "bg-emerald-500/15", text: "text-emerald-300", ring: "border-emerald-500/30" };
  if (change < -0.05) return { bg: "bg-rose-500/15", text: "text-rose-300", ring: "border-rose-500/30" };
  return { bg: "bg-secondary/40", text: "text-muted-foreground", ring: "border-border" };
}

// ---------------- Page ----------------

function InvestPage() {
  const fetchQuotes = useServerFn(getQuotes);
  const fetchMovers = useServerFn(getMovers);

  const allEtfs = Array.from(new Set([...SECTORS, ...SPECIAL].map(s => s.etf).filter(Boolean) as string[]));

  const { data: sectorQ } = useQuery({
    queryKey: ["sector-quotes", allEtfs],
    queryFn: () => fetchQuotes({ data: { symbols: allEtfs } }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: movers } = useQuery({
    queryKey: ["movers"],
    queryFn: () => fetchMovers(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const changeFor = (etf: string | null) => {
    if (!etf) return undefined;
    return sectorQ?.quotes.find(q => q.symbol === etf)?.change;
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-7">
        <h1 className="text-2xl font-semibold">Invest</h1>

        <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search any stock…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <Link to="/ai" className="block rounded-xl bg-fuse-gradient p-[1px] text-sm font-semibold">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-card py-2.5 text-fuse-cyan">
            <Sparkles className="h-4 w-4" /> Chat with FUSE Intelligence
          </span>
        </Link>

        {/* ---------- Market Map ---------- */}
        <Section title="Market Map" hint="Live sector performance">
          <SectorGrid sectors={SECTORS} changeFor={changeFor} />
        </Section>

        {/* ---------- Special Market Map ---------- */}
        <Section title="Special Market Map" hint="Frontier & thematic sectors">
          <SectorGrid sectors={SPECIAL} changeFor={changeFor} />
        </Section>

        {/* ---------- Themes ---------- */}
        <Section title="Themes" hint="Tap a theme to learn more">
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <div key={t.name} className="glass rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-fuse-gradient text-primary-foreground">
                    <t.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-semibold">{t.name}</span>
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- Trending ---------- */}
        <Section title="Trending Stocks">
          {PILLARS.length === 0 ? (
            <Empty msg="Live prices light up here once a market-data feed is connected." />
          ) : (
            <div className="glass rounded-xl divide-y divide-border/50">
              {PILLARS.map(p => (
                <div key={p.ticker} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-semibold">{p.ticker}</div>
                    <div className="text-xs text-muted-foreground">{p.name}</div>
                  </div>
                  <div className="text-right">
                    <div>${p.price.toFixed(2)}</div>
                    <PriceTag change={p.change} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <MoverList title="Top Winners" icon={ArrowUp} accent="text-emerald-400" data={movers?.gainers} />
        <MoverList title="Top Losers" icon={ArrowDown} accent="text-rose-400" data={movers?.losers} />
        <MoverList title="Most Traded" icon={Activity} accent="text-fuse-cyan" data={movers?.actives} />
      </div>
    </AppShell>
  );
}

// ---------------- Reusable ----------------

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function SectorGrid({ sectors, changeFor }: { sectors: Sector[]; changeFor: (etf: string | null) => number | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {sectors.map(s => {
        const c = changeFor(s.etf);
        const t = tone(c);
        return (
          <div
            key={s.name}
            className={`rounded-xl border ${t.ring} ${t.bg} p-3 text-center transition-colors`}
          >
            <s.icon className={`mx-auto h-5 w-5 ${t.text}`} />
            <div className="mt-1.5 text-[11px] font-semibold leading-tight">{s.name}</div>
            <div className={`mt-0.5 text-[10px] font-mono ${t.text}`}>
              {c === undefined ? "—" : `${c >= 0 ? "+" : ""}${c.toFixed(2)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MoverList({
  title, icon: Icon, accent, data,
}: { title: string; icon: LucideIcon; accent: string; data?: { symbol: string; name: string; price: number; change: number }[] }) {
  return (
    <Section title={title}>
      {!data || data.length === 0 ? (
        <Empty msg="Live prices light up here once a market-data feed is connected." />
      ) : (
        <div className="glass rounded-xl divide-y divide-border/50">
          {data.map(m => (
            <div key={m.symbol} className="flex items-center justify-between p-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
                <div className="min-w-0">
                  <div className="font-semibold">{m.symbol}</div>
                  <div className="truncate text-xs text-muted-foreground max-w-[180px]">{m.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div>${m.price.toFixed(2)}</div>
                <PriceTag change={m.change} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center text-xs text-muted-foreground">{msg}</div>
  );
}
