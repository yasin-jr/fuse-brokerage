import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — FusionSynergy" }] }),
  component: LeaderboardPage,
});

const ROWS = [
  { rank: 1, user: "quantumKing",  diff: "🔴 HARD",       pts: 842, ret: "+842%" },
  { rank: 2, user: "alphaWolf",    diff: "🟠 MED-S",      pts: 612, ret: "+204%" },
  { rank: 3, user: "diamondHands", diff: "🟡 MED-L",      pts: 498, ret: "+166%" },
  { rank: 4, user: "yasin (you)",  diff: "🔴 HARD",       pts: 312, ret: "+312%", me: true },
  { rank: 5, user: "valueHunter",  diff: "🟢 EASY",       pts: 287, ret: "+28.7%" },
];

function LeaderboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">🏆 Leaderboard</h1>

        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {["🌍 Worldwide", "Followers", "Following"].map((f, i) => (
            <button key={f} className={`whitespace-nowrap rounded-full px-3 py-1.5 ${i === 0 ? "bg-fuse-gradient text-background font-semibold" : "border border-border bg-secondary/40 text-muted-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {["All", "🟢 Easy", "🟡 Med-L", "🟠 Med-S", "🔴 Hard"].map((f) => (
            <button key={f} className="whitespace-nowrap rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-muted-foreground">{f}</button>
          ))}
        </div>

        <div className="glass rounded-xl divide-y divide-border/50">
          {ROWS.map((r) => (
            <div key={r.rank} className={`flex items-center justify-between p-3 text-sm ${r.me ? "bg-fuse-cyan/5" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-semibold text-fuse-cyan">#{r.rank}</span>
                <div>
                  <div className="font-semibold">@{r.user}</div>
                  <div className="text-xs text-muted-foreground">{r.diff}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{r.pts} PTS</div>
                <div className="text-xs text-emerald-400">{r.ret}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Updated every 30 minutes — matches the FUSE cycle.
        </p>
      </div>
    </AppShell>
  );
}
