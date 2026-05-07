import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RECENT_ORDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Orders — FusionSynergy" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const groups = [
    { label: "⏳ Pending", items: RECENT_ORDERS.filter(o => o.status === "PENDING") },
    { label: "✅ Filled",  items: RECENT_ORDERS.filter(o => o.status === "FILLED") },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">📋 Orders</h1>
        {groups.map((g) => (
          <section key={g.label}>
            <h2 className="mb-2 text-sm font-semibold">{g.label}</h2>
            <div className="glass rounded-xl divide-y divide-border/50">
              {g.items.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No orders.</div>
              )}
              {g.items.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-semibold">{o.action} {o.ticker} ×{o.qty}</div>
                    <div className="text-xs text-muted-foreground">@ ${o.price} · {o.agent}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{o.ts}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
