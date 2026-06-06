import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { THEMES } from "@/lib/themes";

export const Route = createFileRoute("/invest/themes")({
  head: () => ({
    meta: [
      { title: "Themes — FusionSynergy" },
      { name: "description", content: "Curated investment themes — AI, EVs, Energy, Healthcare, Dividends and more." },
    ],
  }),
  component: ThemesPage,
});

function ThemesPage() {
  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2">
        <h1 className="text-2xl font-semibold">Themes</h1>
        <p className="mt-1 text-xs text-muted-foreground">Curated baskets of companies sharing a story.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEMES.map((t) => (
            <Link
              key={t.id}
              to="/invest/theme/$themeId"
              params={{ themeId: t.id }}
              className="block rounded-2xl p-4 text-white shadow-elegant"
              style={{ background: t.gradient, minHeight: 120 }}
            >
              <div className="text-3xl">{t.emoji}</div>
              <div className="mt-2 text-sm font-semibold leading-tight">{t.name}</div>
              <div className="mt-1 line-clamp-2 text-[10px] opacity-80">{t.blurb}</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
