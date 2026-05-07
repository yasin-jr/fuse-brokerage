export function PriceTag({ change }: { change: number }) {
  const positive = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        positive ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {positive ? "▲" : "▼"} {positive ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
}
