import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, clearAccountData } from "@/lib/profile-store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FusionSynergy" }] }),
  component: SettingsPage,
});

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between p-3 text-left text-sm hover:bg-secondary/40"
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {value && <span className="max-w-[180px] truncate text-xs">{value}</span>}
        <span>›</span>
      </span>
    </button>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const resetAccount = async () => {
    setBusy(true);
    clearAccountData();
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">⚙️ Settings</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Theme <ThemeToggle />
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            <Row label="Username" value={profile.username ? `@${profile.username}` : "—"} />
            <Row label="Email" value={profile.email || "—"} />
            <Row label="Password" value="••••••••" />
            <Row label="Difficulty" value={profile.difficulty?.toUpperCase() || "—"} />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trading</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            <Row label="Trading preferences" value="Default" />
            <Row label="Risk settings" value="Balanced" />
            <Row label="Tax method" value="FIFO" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">FUSE</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            <Row label="AI permissions" value="On" />
            <Row label="Auto-Invest / DCA" value="Off" />
            <Row label="Notifications" value="On" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">App</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            <Row label="Currency" value="USD" />
            <Row label="Paper vs Live trading" value="Paper" />
            <Row label="Replay onboarding" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danger</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            <Row label="Reset account" onClick={() => setConfirmReset(true)} />
            <Row label="Sign out" onClick={signOut} />
          </div>
        </section>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass w-full max-w-sm rounded-2xl p-5">
            <h3 className="text-base font-semibold">Reset your account?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure? This deletes all your trading activity, account info, and difficulty level. You'll need to pick a new difficulty and start fresh.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-border bg-secondary/50 py-2 text-sm hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={resetAccount}
                className="rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
