import { useMemo, useRef, useState } from "react";

export type ChartPoint = { t: number; v: number };

type Props = {
  points: ChartPoint[];
  symbol?: string;
  height?: number;
  showVolume?: boolean;
  volumes?: number[]; // aligned with points
  loading?: boolean;
};

function fmtMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}
function fmtTime(t: number) {
  const d = new Date(t);
  const sameDay = (Date.now() - t) < 1000 * 60 * 60 * 36;
  return sameDay
    ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

/**
 * Interactive line chart with crosshair tooltip and optional volume strip.
 * Pure SVG, no deps.
 */
export function InteractiveChart({ points, symbol, height = 220, showVolume = false, volumes, loading }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ idx: number; x: number; y: number } | null>(null);

  const { path, area, lineColor, min, max, first, last } = useMemo(() => {
    if (points.length < 2) {
      return { path: "", area: "", lineColor: "rgb(148 163 184)", min: 0, max: 0, first: 0, last: 0 };
    }
    const ys = points.map((p) => p.v);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.06 || 1;
    const min = lo - pad;
    const max = hi + pad;
    const n = points.length;
    const first = ys[0];
    const last = ys[n - 1];
    const color = last >= first ? "rgb(52 211 153)" : "rgb(244 63 94)";
    const path = points
      .map((p, i) => {
        const x = (i / (n - 1)) * 100;
        const y = 100 - ((p.v - min) / (max - min)) * 100;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
    const area = `${path} L100,100 L0,100 Z`;
    return { path, area, lineColor: color, min, max, first, last };
  }, [points]);

  const onMove = (clientX: number) => {
    const el = ref.current;
    if (!el || points.length < 2) return;
    const rect = el.getBoundingClientRect();
    const rel = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(rel * (points.length - 1));
    const x = (idx / (points.length - 1)) * 100;
    const y = 100 - ((points[idx].v - min) / (max - min)) * 100;
    setHover({ idx, x, y });
  };

  if (loading && points.length === 0) {
    return <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>Loading chart…</div>;
  }
  if (points.length < 2) {
    return <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>No chart data</div>;
  }

  const maxVol = showVolume && volumes ? Math.max(1, ...volumes) : 1;

  return (
    <div
      ref={ref}
      className="relative w-full select-none touch-none"
      style={{ height }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => onMove(e.clientX)}
      onTouchStart={(e) => onMove(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={() => setHover(null)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`grad-${symbol ?? "p"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {showVolume && volumes && (
          <g opacity="0.25">
            {volumes.map((v, i) => {
              const x = (i / (volumes.length - 1)) * 100;
              const h = Math.max(0.5, (v / maxVol) * 18);
              return <rect key={i} x={x - 0.3} y={100 - h} width={0.6} height={h} fill="currentColor" />;
            })}
          </g>
        )}
        <path d={area} fill={`url(#grad-${symbol ?? "p"})`} />
        <path d={path} fill="none" stroke={lineColor} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
        {hover && (
          <g>
            <line x1={hover.x} y1={0} x2={hover.x} y2={100} stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" opacity="0.5" />
            <circle cx={hover.x} cy={hover.y} r="1.2" fill={lineColor} />
          </g>
        )}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-md border border-border bg-card/95 px-2 py-1 text-[11px] shadow-lg backdrop-blur"
          style={{ left: `${hover.x}%`, top: 4 }}
        >
          {symbol ? <span className="text-muted-foreground">{symbol} · </span> : null}
          <span className="font-semibold tabular-nums">${fmtMoney(points[hover.idx].v)}</span>
          <span className="ml-1 text-muted-foreground">{fmtTime(points[hover.idx].t)}</span>
        </div>
      )}
    </div>
  );
}
