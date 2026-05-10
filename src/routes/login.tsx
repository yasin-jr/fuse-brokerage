import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/Logo";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FusionSynergy" },
      { name: "description", content: "Sign in or create your FusionSynergy account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"" | "email" | "google" | "apple">("");
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMsg({ type: "ok", text: "Check your email to confirm your account." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Something went wrong." });
    } finally {
      setBusy("");
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setBusy(provider);
    setMsg(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message || "Sign-in failed");
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Sign-in failed." });
      setBusy("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">
          <Logo className="h-14 w-14" />
          <h1 className="mt-4 text-2xl font-semibold">
            <span className="text-foreground">Fusion</span>
            <span className="bg-fuse-gradient bg-clip-text text-transparent">Synergy</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => oauth("google")}
            disabled={!!busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            onClick={() => oauth("apple")}
            disabled={!!busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-foreground py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {busy === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AppleIcon />}
            Continue with Apple
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmail} className="space-y-3">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!!busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuse-gradient py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {msg && (
          <p className={`mt-3 text-center text-xs ${msg.type === "err" ? "text-rose-400" : "text-emerald-400"}`}>
            {msg.text}
          </p>
        )}

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>

        <p className="mt-auto pt-8 text-center text-[10px] text-muted-foreground">
          By continuing, you agree to FusionSynergy's Terms & Privacy.
        </p>
      </div>
    </div>
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
