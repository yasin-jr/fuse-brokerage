import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/profile-store";

const PUBLIC = ["/login", "/onboarding/difficulty"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const isPublic = PUBLIC.some((p) => path.startsWith(p));
      if (cancelled) return;
      if (!data.session && !isPublic) {
        navigate({ to: "/login" });
      } else if (data.session && !isPublic) {
        const p = loadProfile();
        if (!p.difficulty) navigate({ to: "/onboarding/difficulty" });
      }
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [path, navigate]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  return <>{children}</>;
}
