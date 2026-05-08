import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { useProfile, useFollows } from "@/lib/profile-store";
import { Bot, Compass, ListOrdered, Trophy, GraduationCap, HelpCircle, Settings, Share2, Pencil } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — FusionSynergy" },
      { name: "description", content: "Profile, FUSE AI, Discover, Orders, Leaderboard, Learn, Help, Settings." },
    ],
  }),
  component: MorePage,
});

type Item = { to: string; label: string; icon: typeof Bot; highlight?: boolean };
const items: Item[] = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/ai", label: "FUSE AI", icon: Bot, highlight: true },
  { to: "/orders", label: "Orders", icon: ListOrdered },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/help", label: "Help & FAQ", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: Settings },
];

function MorePage() {
  const [editing, setEditing] = useState(false);
  const profile = useProfile();
  const follows = useFollows();

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://fuse-brokerage.lovable.app";
    const data = {
      title: profile.username ? `${profile.username} on FusionSynergy` : "FusionSynergy",
      text: profile.bio || "Check out my FusionSynergy profile.",
      url,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        alert("Profile link copied to clipboard");
      }
    } catch {}
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Profile card */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="h-14 w-14 rounded-full object-cover border border-border" />
            ) : (
              <Logo className="h-14 w-14 rounded-full" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {profile.username ? `@${profile.username}` : "Welcome 👋"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile.bio || "Set up your profile to get started"}
              </div>
              <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
                <span><b className="text-foreground">{follows.followers.length}</b> followers</span>
                <span><b className="text-foreground">{follows.following.length}</b> following</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setEditing(true)} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 py-2 text-xs hover:bg-secondary">
              <Pencil className="h-3.5 w-3.5" /> Edit profile
            </button>
            <button onClick={share} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 py-2 text-xs hover:bg-secondary">
              <Share2 className="h-3.5 w-3.5" /> Share profile
            </button>
          </div>
        </div>

        <nav className="glass rounded-2xl divide-y divide-border/50">
          {items.map(({ to, label, icon: Icon, highlight }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between p-4 text-sm transition-colors hover:bg-secondary/40"
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${highlight ? "text-fuse-cyan" : "text-muted-foreground"}`} />
                {label}
              </span>
              <span className="text-muted-foreground">›</span>
            </Link>
          ))}
        </nav>
      </div>

      <EditProfileDialog open={editing} onClose={() => setEditing(false)} />
    </AppShell>
  );
}
