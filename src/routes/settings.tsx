import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { ThemeToggle } from "@/components/ThemeToggle";

const sections = [
  ["Account", ["Account info", "Username", "Email & password"]],
  ["Trading", ["Trading preferences", "Risk settings", "Tax method (FIFO/LIFO/Highest)"]],
  ["FUSE",    ["AI permissions", "Auto-Invest / DCA", "Notifications"]],
  ["App",     ["Currency", "Paper vs Live trading", "Replay onboarding"]],
  ["Danger",  ["Reset account", "Export data", "Sign out"]],
] as const;

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FusionSynergy" }] }),
  component: () => (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">⚙️ Settings</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Theme <ThemeToggle />
          </div>
        </div>
        {sections.map(([title, items]) => (
          <section key={title}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
            <div className="glass rounded-xl divide-y divide-border/50">
              {items.map((i) => (
                <button key={i} className="flex w-full items-center justify-between p-3 text-left text-sm hover:bg-secondary/40">
                  <span>{i}</span><span className="text-muted-foreground">›</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  ),
});
