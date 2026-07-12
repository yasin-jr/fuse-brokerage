/** FUSE AI sub-brand mark — a distilled spark/node icon. Berry-tinted. */
export function FuseAiMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fuse-ai-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F52BA" />
          <stop offset="1" stopColor="#990F4B" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L14.2 9.8 L22 12 L14.2 14.2 L12 22 L9.8 14.2 L2 12 L9.8 9.8 Z"
        fill="url(#fuse-ai-grad)"
      />
      <circle cx="12" cy="12" r="2.2" fill="#040406" />
      <circle cx="12" cy="12" r="1" fill="#EDF4F5" />
    </svg>
  );
}
