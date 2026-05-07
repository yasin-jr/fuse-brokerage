import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, PieChart, MessageSquare, Menu } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/invest", label: "Invest", icon: BarChart3 },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/discussion", label: "Discussion", icon: MessageSquare },
  { to: "/more", label: "More", icon: Menu },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-screen pb-20">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-fuse-cyan/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-fuse-violet/10 blur-3xl" />

      <div className="relative">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                    active ? "text-fuse-cyan" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_8px_var(--fuse-cyan)]" : ""}`} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
