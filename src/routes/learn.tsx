import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

const lessons = [
  { level: "Beginner",     title: "What is a stock?",            mins: 3 },
  { level: "Beginner",     title: "Reading a P/E ratio",         mins: 2 },
  { level: "Intermediate", title: "Dollar-Cost Averaging (DCA)", mins: 4 },
  { level: "Intermediate", title: "Sector rotation explained",   mins: 5 },
  { level: "FUSE Academy", title: "How the 4 Bones protect you", mins: 6 },
  { level: "FUSE Academy", title: "Meet Scout, Orchestrator, Sniper, MAESTRO", mins: 8 },
];

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn — FusionSynergy Academy" }] }),
  component: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">📚 Learn</h1>
        <p className="text-sm text-muted-foreground">
          From "what is a stock" to mastering the FUSE O.S. — earn the 🎓 Graduate badge.
        </p>
        <div className="glass rounded-xl divide-y divide-border/50">
          {lessons.map((l) => (
            <div key={l.title} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-semibold">{l.title}</div>
                <div className="text-xs text-muted-foreground">{l.level}</div>
              </div>
              <span className="text-xs text-muted-foreground">{l.mins} min</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  ),
});
