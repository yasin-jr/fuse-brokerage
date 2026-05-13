import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { ExternalLink, Sparkles, LineChart, Brain, Globe } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Our Projects — FusionSynergy" },
      { name: "description", content: "Explore FusionSynergy's flagship projects: FUSE App, FUSE AI, and the Intelligence Engine." },
    ],
  }),
  component: ProjectsPage,
});

const PROJECTS = [
  {
    icon: Sparkles,
    name: "FUSE App",
    tag: "Flagship",
    desc: "An AI-powered fintech platform democratizing financial intelligence — for beginners and experts alike.",
    href: "https://fusionsynergy.org",
  },
  {
    icon: Brain,
    name: "FUSE AI",
    tag: "Intelligence Engine",
    desc: "Conversational market intelligence: real-time analysis, geopolitics, and tactical breakdowns of any ticker.",
    href: "https://fusionsynergy.org",
  },
  {
    icon: LineChart,
    name: "Practice Trading",
    tag: "Risk-free",
    desc: "Trade live markets with virtual capital. Climb the leaderboard before risking a single dollar.",
    href: "https://fusionsynergy.org",
  },
  {
    icon: Globe,
    name: "FusionSynergy Research",
    tag: "Public reports",
    desc: "Macro notes, sector deep-dives, and quantitative dashboards — published openly.",
    href: "https://fusionsynergy.org",
  },
];

function ProjectsPage() {
  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
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

        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Want more? Get the full picture on our website.
          </p>
          <a
            href="https://fusionsynergy.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-fuse-gradient px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Visit fusionsynergy.org <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </AppShell>
  );
}
