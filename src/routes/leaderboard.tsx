import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { useFollows, saveFollows, useStreak } from "@/lib/profile-store";
import { Flame, Trophy } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — FusionSynergy" }] }),
  component: LeaderboardPage,
});

const TABS = ["Worldwide", "Followers", "Following"] as const;
type Tab = typeof TABS[number];

function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("Worldwide");
  const follows = useFollows();
  const streak = useStreak();

  const counts = {
    Worldwide: 0,
    Followers: follows.followers.length,
    Following: follows.following.length,
  };

  const toggleFollow = () => {
    // demo toggle for the only existing user
    const isFollowing = follows.following.includes("you");
    saveFollows({
      ...follows,
      following: isFollowing ? follows.following.filter((u) => u !== "you") : [...follows.following, "you"],
    });
  };

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">🏆 Leaderboard</h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-orange-400" /> Current streak
            </div>
            <div className="mt-1 text-2xl font-semibold">{streak.current} <span className="text-sm font-normal text-muted-foreground">days</span></div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Personal best
            </div>
            <div className="mt-1 text-2xl font-semibold">{streak.best} <span className="text-sm font-normal text-muted-foreground">days</span></div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 ${
                t === tab
                  ? "bg-fuse-gradient text-primary-foreground font-semibold"
                  : "border border-border bg-secondary/40 text-muted-foreground"
              }`}
            >
              {t} {t !== "Worldwide" && `(${counts[t]})`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={toggleFollow} className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs">
            {follows.following.includes("you") ? "Unfollow demo" : "Follow demo"}
          </button>
        </div>

        <div className="glass rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">🌱</div>
          <h2 className="text-base font-semibold">No rankings yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The leaderboard fills up once people start trading. Be one of the first.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
