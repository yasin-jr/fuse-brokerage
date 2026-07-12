import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";
import { EmptyState } from "@/components/EmptyState";
import { useProfile } from "@/lib/profile-store";
import { LOGO_URL } from "@/lib/catalog";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Ascend" },
      { name: "description", content: "Your full trade history on Ascend — every buy and sell across your portfolio." },
      { property: "og:title", content: "Orders — Ascend" },
      { property: "og:description", content: "Track every order across your Ascend portfolio." },
      { property: "og:url", content: "https://ascend-invests.lovable.app/orders" },
    ],
    links: [{ rel: "canonical", href: "https://ascend-invests.lovable.app/orders" }],
  }),
  component: OrdersPage,
});

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function OrdersPage() {
  const profile = useProfile();
  const orders = profile.orders ?? [];

  return (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">Orders</h1>

        {orders.length === 0 ? (
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
          <div className="glass rounded-2xl divide-y divide-border/40">
            {orders.map((o) => {
              const total = o.qty * o.price;
              const isBuy = o.action === "BUY";
              return (
                <Link
                  key={o.id}
                  to="/stock/$symbol"
                  params={{ symbol: o.symbol }}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/30"
                >
                  <img src={LOGO_URL(o.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-10 w-10 rounded bg-white p-0.5 object-contain" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{o.symbol}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isBuy ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {o.action}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {o.qty} sh @ ${o.price.toFixed(2)} · {fmtTime(o.ts)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm tabular-nums">${total.toFixed(2)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
