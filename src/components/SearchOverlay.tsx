import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { searchSymbols } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchSearch = useServerFn(searchSymbols);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQ("");
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["symbol-search", q],
    queryFn: () => fetchSearch({ data: { q, limit: 30 } }),
    enabled: q.trim().length >= 1,
    staleTime: 60_000,
  });

  if (!open) return null;
  const hits = data?.hits ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-secondary/60 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search any stock or company"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="rounded-full bg-muted/60 p-1">
              <X className="h-3 w-3" />
            </button>
          )}
        </label>
        <button onClick={onClose} className="px-2 text-sm font-medium text-fuse-cyan">Done</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!q.trim() ? (
          <p className="p-6 text-center text-xs text-muted-foreground">Start typing — ticker or company name.</p>
        ) : isFetching && hits.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">Searching…</p>
        ) : hits.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">No matches for "{q}".</p>
        ) : (
          <ul className="mx-3 mt-2 overflow-hidden rounded-2xl bg-card/40 divide-y divide-border/40">
            {hits.map((h) => (
              <li key={`${h.symbol}-${h.exchange}`}>
                <Link
                  to="/stock/$symbol"
                  params={{ symbol: h.symbol }}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 hover:bg-secondary/40"
                >
                  <img
                    src={LOGO_URL(h.symbol)}
                    alt=""
                    onError={(e) => { e.currentTarget.style.opacity = "0.15"; }}
                    className="h-10 w-10 rounded-full bg-white p-1 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold uppercase">{h.symbol}</span>
                      {h.type === "etf" && (
                        <span className="rounded-full bg-fuse-cyan/20 px-1.5 py-0.5 text-[9px] font-bold text-fuse-cyan">ETF</span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{h.name}</div>
                  </div>
                  {h.exchange && (
                    <span className="text-[10px] text-muted-foreground">{h.exchange}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
