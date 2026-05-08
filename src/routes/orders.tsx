import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { EmptyState } from "@/components/EmptyState";
import { RECENT_ORDERS } from "@/lib/mock-data";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — FusionSynergy" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const groups = [
    { label: "Pending",  items: RECENT_ORDERS.filter(o => o.status === "PENDING") },
    { label: "Filled",   items: RECENT_ORDERS.filter(o => o.status === "FILLED") },
  ];

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Orders</h1>

        {RECENT_ORDERS.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
            title="No orders yet"
            description="When you buy or sell, they'll show up here."
            action={
              <Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                Find a stock
              </Link>
            }
          />
        ) : (
          groups.map((g) => (
            <section key={g.label}>
              <h2 className="mb-2 text-sm font-semibold">{g.label}</h2>
              <div className="glass rounded-xl divide-y divide-border/50">
                {g.items.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">Nothing here.</div>
                )}
                {g.items.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 text-sm">
                    <div>
                      <div className="font-semibold">{o.action} {o.ticker} ×{o.qty}</div>
                      <div className="text-xs text-muted-foreground">@ ${o.price}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{o.ts}</span>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}
