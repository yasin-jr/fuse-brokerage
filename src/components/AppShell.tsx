import { Link, useLocation } from "@tanstack/react-router";
import { Home, BarChart3, PieChart, MessageSquare, Menu } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/invest", label: "Invest", icon: BarChart3 },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/discussion", label: "Discussion", icon: MessageSquare },
  { to: "/more", label: "More", icon: Menu },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="relative min-h-screen pb-20">
      {/* Ambient orbs — Ascend palette */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 right-0 h-[420px] w-[420px] rounded-full bg-accent/8 blur-3xl" />

      <main className="relative">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-xl">
        <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/home" ? pathname === "/home" : pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_10px_var(--primary)]" : ""}`} />
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
