import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { loadProfile, saveProfile, lookupEmailByUsername } from "@/lib/profile-store";
import { Mail, Lock, Loader2, User, KeyRound } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FusionSynergy" },
      { name: "description", content: "Sign in or create your FusionSynergy account." },
    ],
  }),
  component: LoginPage,
});

type Step = "form" | "verify";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("form");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"" | "email" | "google" | "apple" | "microsoft" | "verify" | "resend">("");
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const p = loadProfile();
        navigate({ to: p.difficulty ? "/" : "/onboarding/difficulty" });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        const meta = (session.user.user_metadata || {}) as Record<string, string>;
        const p = loadProfile();
        const next = {
          ...p,
          email: session.user.email || p.email || "",
          username:
            p.username ||
            meta.username ||
            meta.preferred_username ||
            meta.name ||
            (session.user.email ? session.user.email.split("@")[0] : "user"),
        };
        saveProfile(next);
        navigate({ to: next.difficulty ? "/" : "/onboarding/difficulty" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    setMsg(null);
    try {
      if (mode === "signup") {
        if (!username.trim() || username.length < 3) throw new Error("Username must be at least 3 characters.");
        if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error("Username can only contain letters, numbers, and _");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username },
          },
        });
        if (error) throw error;
        // Persist locally so this account is permanent on this device & sign-in by username works.
        const p = loadProfile();
        saveProfile({ ...p, username, email });
        setStep("verify");
        setMsg({ type: "ok", text: `We sent a 6-digit code to ${email}. Enter it below.` });
      } else {
        let loginEmail = identifier.trim();
        if (!loginEmail.includes("@")) {
          const found = lookupEmailByUsername(loginEmail);
          if (!found) throw new Error("No account on this device for that username. Try your email.");
          loginEmail = found;
        }
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setEmail(loginEmail);
            setStep("verify");
            setMsg({ type: "ok", text: "Your email isn't verified yet. We just sent a new 6-digit code." });
            await supabase.auth.resend({ type: "signup", email: loginEmail });
            return;
          }
          throw error;
        }
      }
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Something went wrong." });
    } finally {
      setBusy("");
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("verify");
    setMsg(null);
    try {
      if (code.length !== 6) throw new Error("Enter the 6-digit code from your email.");
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" });
      if (error) throw error;
      // onAuthStateChange will route forward.
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Invalid or expired code." });
    } finally {
      setBusy("");
    }
  };

  const resend = async () => {
    setBusy("resend");
    setMsg(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setMsg({ type: "ok", text: "New code sent. Check your inbox." });
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Could not resend." });
    } finally {
      setBusy("");
    }
  };

  const oauth = async (provider: "google" | "apple" | "microsoft") => {
    setBusy(provider);
    setMsg(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw new Error(result.error.message || "Sign-in failed");
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Sign-in failed." });
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-background p-1 ring-1 ring-border">
            <Logo className="h-16 w-16 rounded-full" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            <span className="text-foreground">Fusion</span>
            <span className="bg-fuse-gradient bg-clip-text text-transparent">Synergy</span>
          </h1>
          <p className="mt-2 max-w-xs text-[11px] italic text-muted-foreground">
            “Where Intelligence Meets Finance — discipline today, freedom tomorrow.”
          </p>
        </div>

        {step === "verify" ? (
          <form onSubmit={onVerify} className="mt-8 space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Verify your email</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the 6-digit code sent to <span className="text-foreground">{email}</span>
              </p>
            </div>
            <Field
              icon={KeyRound}
              placeholder="••••••"
              value={code}
              onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={!!busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuse-gradient py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify & continue
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { setStep("form"); setMsg(null); setCode(""); }} className="text-muted-foreground hover:text-foreground">
                ← Use a different email
              </button>
              <button type="button" onClick={resend} disabled={!!busy} className="font-semibold text-foreground hover:underline disabled:opacity-50">
                {busy === "resend" ? "Sending…" : "Resend code"}
              </button>
            </div>
            {msg && (
              <p className={`text-center text-xs ${msg.type === "err" ? "text-rose-400" : "text-emerald-400"}`}>{msg.text}</p>
            )}
          </form>
        ) : (
          <>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "Welcome back. Sign in to continue." : "Create your account to start trading."}
            </p>

            <div className="mt-5 space-y-2.5">
              <button onClick={() => oauth("google")} disabled={!!busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">
                {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
              <button onClick={() => oauth("apple")} disabled={!!busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50">
                {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
                Continue with Apple
              </button>
              <button
                type="button"
                onClick={() => setMsg({ type: "err", text: "Microsoft sign-in is rolling out soon — use Google, Apple, or email for now." })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/20 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/40">
                <MicrosoftIcon />
                Continue with Microsoft
                <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wide">Soon</span>
              </button>
            </div>

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or {mode === "signin" ? "sign in with email" : "use email"}
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onEmail} className="space-y-2.5">
              {mode === "signup" && (
                <>
                  <Field icon={User} placeholder="Username" value={username} onChange={setUsername} required />
                  <Field icon={Mail} type="email" placeholder="you@email.com" value={email} onChange={setEmail} required />
                </>
              )}
              {mode === "signin" && (
                <Field icon={Mail} placeholder="Email or username" value={identifier} onChange={setIdentifier} required />
              )}
              <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />
              <button type="submit" disabled={!!busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuse-gradient py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            {msg && (
              <p className={`mt-3 text-center text-xs ${msg.type === "err" ? "text-rose-400" : "text-emerald-400"}`}>{msg.text}</p>
            )}

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
                className="font-semibold text-foreground underline-offset-2 hover:underline">
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </>
        )}

        <p className="mt-auto pt-8 text-center text-[10px] text-muted-foreground">
          By continuing, you agree to FusionSynergy's Terms & Privacy.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, type = "text", placeholder, value, onChange, required, minLength,
}: {
  icon: typeof Mail; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent py-2.5 text-sm outline-none"
        inputMode={type === "text" && placeholder.includes("•") ? "numeric" : undefined}
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.5 3.2 2.4 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.4.7-1 1.1-2 1.4-3.1-.1 0-2.7-1-2.7-3.6zM14 4.8c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
