import { createFileRoute } from "@tanstack/react-router";
import { FuseChat } from "@/components/FuseChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FUSE AI — FusionSynergy Intelligence Engine" },
      {
        name: "description",
        content:
          "Chat with FUSE AI, FusionSynergy's AI-powered fintech intelligence engine. Markets, geopolitics, and the future of finance.",
      },
      { property: "og:title", content: "FUSE AI — FusionSynergy" },
      {
        property: "og:description",
        content: "Where Intelligence Meets Finance. Ask FUSE AI anything about markets and tech.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-fuse-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuse-violet/15 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col px-4 py-8 sm:py-12">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-fuse-cyan" />
            FusionSynergy · 2026
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="text-fuse-gradient">FUSE AI</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Where Intelligence Meets Finance. Real-time market data, geopolitical analysis, and
            autonomous AI — built to make Wall Street's tools available to everyone.
          </p>
        </header>

        <FuseChat />

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Educational content, not financial advice. © FusionSynergy 2026
        </footer>
      </div>
    </main>
  );
}
