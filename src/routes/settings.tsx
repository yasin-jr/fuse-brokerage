import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, saveProfile, loadProfile, clearAccountData } from "@/lib/profile-store";
import { X, Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FusionSynergy" }] }),
  component: SettingsPage,
});

type EditField = null | "username" | "email" | "password";

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
  const [editing, setEditing] = useState<EditField>(null);

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
            <Row label="Username" value={profile.username ? `@${profile.username}` : "—"} onClick={() => setEditing("username")} />
            <Row label="Email" value={profile.email || "—"} onClick={() => setEditing("email")} />
            <Row label="Password" value="••••••••" onClick={() => setEditing("password")} />
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
            <Row label="Replay onboarding" onClick={() => navigate({ to: "/onboarding/difficulty" })} />
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

      {editing && <EditDialog field={editing} onClose={() => setEditing(null)} currentEmail={profile.email || ""} />}

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

function EditDialog({ field, onClose, currentEmail }: { field: Exclude<EditField, null>; onClose: () => void; currentEmail: string }) {
  const [val, setVal] = useState("");
  const [val2, setVal2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  const title = field === "username" ? "Change username" : field === "email" ? "Change email" : "Change password";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (field === "username") {
        if (val.length < 3 || !/^[a-zA-Z0-9_]+$/.test(val)) throw new Error("Letters, numbers, _ — min 3 chars.");
        const p = loadProfile();
        saveProfile({ ...p, username: val });
        await supabase.auth.updateUser({ data: { username: val } });
        setMsg({ type: "ok", text: "Username updated." });
        setTimeout(onClose, 700);
      } else if (field === "email") {
        const { error } = await supabase.auth.updateUser({ email: val });
        if (error) throw error;
        setMsg({ type: "ok", text: "Confirm the change from the link sent to your new email." });
      } else {
        if (val.length < 6) throw new Error("Password must be at least 6 characters.");
        if (val !== val2) throw new Error("Passwords don't match.");
        const { error } = await supabase.auth.updateUser({ password: val });
        if (error) throw error;
        setMsg({ type: "ok", text: "Password updated." });
        setTimeout(onClose, 700);
      }
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-sm rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button type="button" onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        {field === "email" && (
          <p className="text-xs text-muted-foreground">Current: {currentEmail || "—"}</p>
        )}
        <input
          type={field === "password" ? "password" : field === "email" ? "email" : "text"}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={field === "username" ? "newusername" : field === "email" ? "new@email.com" : "New password"}
          required
          className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
        />
        {field === "password" && (
          <input
            type="password"
            value={val2}
            onChange={(e) => setVal2(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
          />
        )}
        {msg && <p className={`text-xs ${msg.type === "err" ? "text-rose-400" : "text-emerald-400"}`}>{msg.text}</p>}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-secondary/50 py-2 text-sm">Cancel</button>
          <button disabled={busy} className="flex items-center justify-center gap-1 rounded-lg bg-fuse-gradient py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      </form>
    </div>
  );
}
