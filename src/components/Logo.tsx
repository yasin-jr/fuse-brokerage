import logoUrl from "@/assets/fusionsynergy-logo.jpeg";

export function Logo({ className = "h-8 w-8 rounded-lg" }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="FusionSynergy"
      className={`object-cover ${className}`}
    />
  );
}
