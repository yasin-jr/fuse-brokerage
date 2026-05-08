import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackBar({ to = "/more", label = "Back" }: { to?: string; label?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {label}
      </Link>
    </div>
  );
}
