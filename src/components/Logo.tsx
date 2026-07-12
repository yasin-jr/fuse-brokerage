import logoAsset from "@/assets/ascend-logo.jpg.asset.json";

export function Logo({ className = "h-8 w-8 rounded-lg" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Ascend"
      className={`object-cover ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
