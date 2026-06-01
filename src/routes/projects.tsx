import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import {
  ExternalLink, Sparkles, LineChart, Brain, Globe,
  Atom, Bot, FlaskConical, ShieldCheck, Radio, Network, Telescope,
} from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — FusionSynergy" },
      { name: "description", content: "Explore FusionSynergy's flagship projects and what's coming next at the intersection of quantum computing, AI, and frontier science." },
      { property: "og:title", content: "Our Projects — FusionSynergy" },
      { property: "og:description", content: "Flagship and upcoming FusionSynergy projects across fintech, quantum, and AI." },
      { property: "og:url", content: "https://fuse-brokerage.lovable.app/projects" },
    ],
    links: [{ rel: "canonical", href: "https://fuse-brokerage.lovable.app/projects" }],
  }),
  component: ProjectsPage,
});

const FUSIONSYNERGY_URL = "https://fusionsynergy.base44.app";

const PROJECTS = [
  {
    icon: Sparkles,
    name: "FUSE App",
    tag: "Flagship",
    desc: "An AI-powered fintech platform democratizing financial intelligence — for beginners and experts alike.",
    href: FUSIONSYNERGY_URL,
  },
  {
    icon: Brain,
    name: "FUSE AI",
    tag: "Intelligence Engine",
    desc: "Conversational market intelligence: real-time analysis, geopolitics, and tactical breakdowns of any ticker.",
    href: FUSIONSYNERGY_URL,
  },
  {
    icon: LineChart,
    name: "Practice Trading",
    tag: "Risk-free",
    desc: "Trade live markets with virtual capital. Climb the leaderboard before risking a single dollar.",
    href: FUSIONSYNERGY_URL,
  },
  {
    icon: Globe,
    name: "FusionSynergy Research",
    tag: "Public reports",
    desc: "Macro notes, sector deep-dives, and quantitative dashboards — published openly.",
    href: FUSIONSYNERGY_URL,
  },
];

const FUTURE = [
  {
    icon: Atom,
    name: "Quantum + Fintech",
    desc: "Quantum-accelerated portfolio optimization, risk modeling, and arbitrage detection at scales classical compute can't touch. The next frontier of market intelligence.",
  },
  {
    icon: Bot,
    name: "Quantum + Multi-Agent AI",
    desc: "Swarms of specialized AI agents running on quantum-augmented infrastructure — collaborating to research, reason, and act across domains in parallel.",
  },
  {
    icon: FlaskConical,
    name: "Quantum + BioTech",
    desc: "Drug discovery, protein folding, and genomic analysis are bottlenecked by computational limits. Quantum processing changes the equation — enabling simulations of molecular interactions at true atomic resolution.",
  },
  {
    icon: ShieldCheck,
    name: "Quantum + Cybersecurity",
    desc: "Post-quantum cryptography frameworks and AI-driven threat detection that adapt faster than any attacker. Security built for the quantum era, not retrofitted into it.",
  },
  {
    icon: Radio,
    name: "Telecom + AI",
    desc: "Self-optimizing networks that predict congestion, route around failures, and allocate bandwidth in real time — turning telecom infrastructure into a living, learning system.",
  },
  {
    icon: Network,
    name: "Networking & Cybersecurity",
    desc: "As quantum computing matures, today's encryption becomes vulnerable. We're building quantum-resilient network infrastructure — proactive, adaptive, and ready for what's next.",
  },
  {
    icon: Telescope,
    name: "AI + Scientific Research",
    desc: "Large-scale AI agents trained on scientific literature and real-world data, autonomously generating hypotheses and accelerating discovery across physics, chemistry, and materials science.",
  },
];

function ProjectsPage() {
  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Our Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything FusionSynergy is building under one roof.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group rounded-2xl p-4 transition hover:bg-secondary/40"
            >
              <div className="flex items-start gap-3">
                <div className="bg-fuse-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <p.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-semibold">{p.name}</h2>
                    <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {p.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* What's Next */}
        <section className="space-y-4">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-fuse-cyan">What's next</div>
            <h2 className="mt-1 text-xl font-semibold">
              More projects coming soon <span className="text-fuse-gradient">✦</span>
            </h2>
          </div>

          <div className="glass rounded-2xl p-5 text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              FusionSynergy is just getting started. We're quietly building at the intersection of
              quantum computing, AI, and industries that matter — from biotech to cybersecurity.
            </p>
            <p>
              FusionSynergy was never just a fintech platform. It's a long-term bet on what happens
              when quantum computing, multi-agent AI, and frontier science collide. What you see
              today is version one. What we're building next operates at a different level entirely.
            </p>
            <p>
              These aren't distant dreams — they're active research tracks. Some will ship in 2026.
              Some are still raw hypotheses being stress-tested. All of them point toward the same
              north star: making the most powerful technologies in human history accessible,
              understandable, and useful for everyone — not just institutions with
              billion-dollar R&amp;D budgets.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {FUTURE.map((f) => (
              <article key={f.name} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/40">
                    <f.icon className="h-5 w-5 text-fuse-cyan" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold">{f.name}</h3>
                      <span className="rounded-full border border-fuse-cyan/30 bg-fuse-cyan/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-fuse-cyan">
                        Soon
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">And many more…</p>
        </section>

        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Want more? Get the full picture on our website.
          </p>
          <a
            href={FUSIONSYNERGY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-fuse-gradient px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Visit FusionSynergy <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </AppShell>
  );
}
