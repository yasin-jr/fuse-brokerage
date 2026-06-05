import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/profile-store";
import { hydrateFromSupabase } from "@/lib/profile-sync";

const PUBLIC = ["/login", "/onboarding/difficulty"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const isPublic = PUBLIC.some((p) => path.startsWith(p));
      if (cancelled) return;
      if (!data.session) {
        if (!isPublic) navigate({ to: "/login" });
        return;
      }
      // Signed in — hydrate Supabase → local cache, then route by difficulty.
      await hydrateFromSupabase();
      if (cancelled) return;
      setTick((n) => n + 1); // re-render any subscribers after hydration
      const p = loadProfile();
      if (!p.difficulty && !isPublic) navigate({ to: "/onboarding/difficulty" });
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") check();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [path, navigate]);

  return <>{children}</>;
}
