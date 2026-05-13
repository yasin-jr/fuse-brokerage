import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { ShareProfileDialog } from "@/components/ShareProfileDialog";
import { useProfile, useFollows } from "@/lib/profile-store";
import { Bot, Compass, ListOrdered, Trophy, GraduationCap, HelpCircle, Settings, Share2, Pencil, LogIn, User, FolderKanban } from "lucide-react";

function DefaultAvatar() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary/60">
      <User className="h-7 w-7 text-muted-foreground" />
    </div>
  );
}
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
  { to: "/projects", label: "Our Projects", icon: FolderKanban },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/help", label: "Help & FAQ", icon: HelpCircle },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/login", label: "Sign in / Sign up", icon: LogIn, highlight: true },
];

function MorePage() {
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const profile = useProfile();
  const follows = useFollows();

  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://fuse-brokerage.lovable.app";
  const shareTitle = profile.username
    ? `Check out @${profile.username} on FusionSynergy`
    : "Check out FusionSynergy";

  const openShare = async () => {
    // Prefer native share sheet on mobile; fall back to in-app dialog.
    const data = { title: shareTitle, text: profile.bio || shareTitle, url: shareUrl };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(data);
        return;
      }
    } catch {}
    setSharing(true);
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
              <DefaultAvatar />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {profile.username ? `@${profile.username}` : "Set your username"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile.bio || (profile.email || "Tap edit to set up your profile")}
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
            <button onClick={openShare} className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 py-2 text-xs hover:bg-secondary">
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
      <ShareProfileDialog open={sharing} onClose={() => setSharing(false)} url={shareUrl} title={shareTitle} />
    </AppShell>
  );
}
