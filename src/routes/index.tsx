import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { FuseAiMark } from "@/components/FuseAiMark";
import { MarketStatus } from "@/components/MarketStatus";
import {
  ArrowRight, Sparkles, BarChart3, Users, Trophy, LineChart, Eye,
  ShieldCheck, Zap, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ascend — Invest Smarter. Learn Faster. Compete Better." },
      { name: "description", content: "Ascend is the AI-powered practice investing platform. Real market data, FUSE AI intelligence, and a community of investors — all risk-free." },
      { property: "og:title", content: "Ascend — Invest Smarter. Learn Faster. Compete Better." },
      { property: "og:description", content: "Practice investing with real market data, AI-powered insights, and a community of investors." },
      { property: "og:url", content: "https://ascend-invests.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://ascend-invests.lovable.app/" }],
  }),
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/home", replace: true });
      } else {
        setAuthed(false);
      }
    });
  }, [navigate]);

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Logo className="h-14 w-14 rounded-2xl ascend-glow-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />

      {/* Nav */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-bold tracking-tight">Ascend</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#preview" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#why" className="hover:text-foreground transition-colors">Why Ascend</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary/60"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Start Investing
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:gap-8 md:pt-14">
        <div>
          <div className="ascend-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
            <FuseAiMark className="h-3.5 w-3.5" />
            Powered by FUSE Intelligence
          </div>
          <h1
            className="ascend-rise mt-5 text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Invest Smarter.<br />
            Learn Faster.<br />
            <span className="text-ascend-gradient">Compete Better.</span>
          </h1>
          <p
            className="ascend-rise mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            Practice investing with real market data, AI-powered insights, and a community of investors —
            all risk-free, all in one place.
          </p>
          <div
            className="ascend-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Try For Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur hover:border-primary/60"
            >
              Sign in
            </Link>
          </div>
          <div className="ascend-rise mt-6 flex items-center gap-4 text-xs text-muted-foreground" style={{ animationDelay: "380ms" }}>
            <MarketStatus variant="full" />
            <span className="hidden items-center gap-1 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              No credit card required
            </span>
          </div>
        </div>

        {/* Phone mockup */}
        <PhoneMockup />
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-5 py-8 text-center">
          <Stat value={12800} suffix="+" label="Active Investors" />
          <Stat value={185000} suffix="+" label="Simulated Trades" />
          <Stat value={30000} suffix="+" label="Symbols Covered" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">Platform</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need to invest with confidence.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 60} />
          ))}
        </div>
      </section>

      {/* Preview */}
      <section id="preview" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="glass overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Preview</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                A real trading dashboard.<br />
                <span className="text-ascend-gradient">Without the risk.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Live quotes, sector heatmaps, extended-hours data, and AI commentary — everything a serious
                investor uses, ready for you to practice.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Real-time market data", "Pre-market & after-hours", "AI-generated stock insights", "Portfolio health scoring"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-muted-foreground">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary/20 text-primary">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="relative z-10 mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">Why Ascend</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Built for the next generation of investors.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="glass rounded-2xl p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{w.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-8">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center shadow-elegant md:p-14"
          style={{ background: "var(--gradient-ascend)" }}
        >
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%)",
          }} />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Ready to Begin?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/85 md:text-base">
              Join thousands of investors practicing on Ascend today. No fees. No risk. Just learning.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 rounded-md" />
            <span>© 2026 Ascend · A FusionSynergy company</span>
          </div>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#why" className="hover:text-foreground">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------- Feature data ----------------

const FEATURES = [
  { title: "FUSE AI Assistant", body: "Get instant insights on any stock, sector, or strategy — powered by our proprietary intelligence layer.", icon: Sparkles, tone: "berry" as const },
  { title: "Portfolio Simulator", body: "Build a real portfolio with real market prices — without spending a dollar.", icon: LineChart, tone: "sapphire" as const },
  { title: "Community Discussions", body: "See what other investors are watching. Share your thesis. Learn from the room.", icon: Users, tone: "sapphire" as const },
  { title: "Leaderboards", body: "Compete with investors worldwide. Climb the ranks by delivering real returns.", icon: Trophy, tone: "berry" as const },
  { title: "Market Research", body: "Fundamentals, news, analyst ratings — everything a professional research desk uses.", icon: BarChart3, tone: "sapphire" as const },
  { title: "Smart Watchlists", body: "Track anything from mega-caps to crypto. Get price alerts that matter.", icon: Eye, tone: "berry" as const },
];

const WHY = [
  { icon: Zap, title: "Learn by doing", body: "Practice makes the difference. Ascend gives you a live market to explore, safely." },
  { icon: TrendingUp, title: "Track your growth", body: "Detailed analytics show how your skill improves over time." },
  { icon: ShieldCheck, title: "Build confidence", body: "Make mistakes here, so you don't make them with your real money." },
  { icon: Trophy, title: "Compete with peers", body: "Real leaderboards. Real rankings. Real bragging rights." },
];

// ---------------- Little components ----------------

function FeatureCard({ title, body, icon: Icon, tone, delay }: {
  title: string; body: string; icon: any; tone: "sapphire" | "berry"; delay: number;
}) {
  const bg = tone === "sapphire" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent";
  return (
    <div
      className="glass ascend-rise group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-elegant"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${bg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const dur = 1400;
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref}>
      <div className="text-2xl font-bold tabular-nums text-foreground md:text-4xl">
        {n.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">{label}</div>
    </div>
  );
}

function PhoneMockup() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2400);
    return () => clearInterval(id);
  }, []);
  const price = 68229.77 + Math.sin(tick / 2) * 42;
  const delta = 14297.33 + Math.sin(tick / 3) * 60;

  return (
    <div className="relative mx-auto flex justify-center ascend-rise" style={{ animationDelay: "220ms" }}>
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ background: "var(--gradient-ascend)", opacity: 0.25 }}
      />
      <div
        className="relative aspect-[9/19] w-[280px] rounded-[42px] border border-border bg-card p-3 shadow-elegant md:w-[320px]"
        style={{ boxShadow: "0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)" }}
      >
        <div className="h-full overflow-hidden rounded-[32px] bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">9:41</span>
            <MarketStatus />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-muted-foreground">Account Value</p>
            <p className="text-2xl font-bold tabular-nums">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-emerald-400 tabular-nums">+{delta.toFixed(2)} (26.93%) Today</p>
          </div>
          <MiniChart tick={tick} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/60 p-2">
              <p className="text-[9px] text-muted-foreground">Available</p>
              <p className="text-xs font-semibold tabular-nums">${(price * 0.85).toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-2">
              <p className="text-[9px] text-muted-foreground">Invested</p>
              <p className="text-xs font-semibold tabular-nums text-primary">+1,725.41</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-accent/40 bg-accent/10 p-2.5">
            <div className="flex items-center gap-1.5">
              <FuseAiMark className="h-3 w-3" />
              <span className="text-[9px] font-semibold text-accent">FUSE AI</span>
            </div>
            <p className="mt-1 text-[10px] leading-tight text-foreground/85">
              NVDA continues leading semis on AI demand — momentum remains strong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ tick }: { tick: number }) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const y = 40 - Math.sin((i + tick) / 4) * 10 - i * 0.4;
    return `${(i / 39) * 100},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 50" className="mt-3 h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="mc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F52BA" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0F52BA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,50 ${points} 100,50`} fill="url(#mc)" />
      <polyline points={points} fill="none" stroke="#0F52BA" strokeWidth="1.2" />
    </svg>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="glass overflow-hidden rounded-2xl border border-border p-4 shadow-elegant">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-semibold">Portfolio · 1M</span>
          </div>
          <span className="text-emerald-400">+8.24%</span>
        </div>
        <svg viewBox="0 0 200 80" className="mt-3 h-32 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0F52BA" stopOpacity="0.4" />
              <stop offset="1" stopColor="#0F52BA" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="0,80 0,60 20,55 40,58 60,45 80,48 100,35 120,40 140,25 160,30 180,15 200,20 200,80" fill="url(#dg)" />
          <polyline points="0,60 20,55 40,58 60,45 80,48 100,35 120,40 140,25 160,30 180,15 200,20" fill="none" stroke="#0F52BA" strokeWidth="1.5" />
        </svg>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          {["AAPL", "NVDA", "MSFT"].map((s, i) => (
            <div key={s} className="rounded-lg bg-secondary/50 p-2">
              <div className="font-semibold">{s}</div>
              <div className={`text-[10px] tabular-nums ${i === 1 ? "text-emerald-400" : "text-muted-foreground"}`}>
                {i === 1 ? "+3.2%" : i === 0 ? "+0.8%" : "-0.4%"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Very subtle animated network grid, dark-mode aware. */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-ascend)" }}
      />
      <div
        className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "#990F4B" }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
