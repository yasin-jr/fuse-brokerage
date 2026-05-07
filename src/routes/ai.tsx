import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { FuseChat } from "@/components/FuseChat";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "FUSE AI — Intelligence Engine" },
      { name: "description", content: "Chat with FUSE AI: market analysis, geopolitics, FusionSynergy knowledge." },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-4 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-fuse-cyan" /> Powered by Scout + Orchestrator
          </div>
          <h1 className="text-3xl font-semibold"><span className="text-fuse-gradient">FUSE AI</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Where Intelligence Meets Finance.</p>
        </header>
        <FuseChat />
      </div>
    </AppShell>
  );
}
