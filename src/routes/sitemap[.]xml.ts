import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://fuse-brokerage.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/invest", changefreq: "daily", priority: "0.9" },
          { path: "/portfolio", changefreq: "daily", priority: "0.8" },
          { path: "/discover", changefreq: "daily", priority: "0.8" },
          { path: "/ai", changefreq: "weekly", priority: "0.9" },
          { path: "/discussion", changefreq: "daily", priority: "0.7" },
          { path: "/leaderboard", changefreq: "daily", priority: "0.6" },
          { path: "/orders", changefreq: "weekly", priority: "0.5" },
          { path: "/learn", changefreq: "weekly", priority: "0.6" },
          { path: "/projects", changefreq: "monthly", priority: "0.7" },
          { path: "/help", changefreq: "monthly", priority: "0.6" },
        ];

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
