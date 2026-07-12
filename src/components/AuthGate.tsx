import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { loadProfile } from "@/lib/profile-store";
import { hydrateFromSupabase } from "@/lib/profile-sync";

/** Routes that render without an authenticated user. */
const PUBLIC = ["/", "/login", "/onboarding/difficulty"];

function isPublicPath(path: string) {
  if (path === "/") return true;
  return PUBLIC.some((p) => p !== "/" && path.startsWith(p));
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const isPublic = isPublicPath(path);
      if (cancelled) return;
      if (!data.session) {
        // No session — only redirect if user tried to reach a protected route.
        if (!isPublic) navigate({ to: "/login" });
        return;
      }
      // Signed in — hydrate cache, then route by difficulty.
      await hydrateFromSupabase();
      if (cancelled) return;
      setTick((n) => n + 1);
      const p = loadProfile();
      if (!p.difficulty && !path.startsWith("/onboarding")) {
        navigate({ to: "/onboarding/difficulty" });
      }
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
