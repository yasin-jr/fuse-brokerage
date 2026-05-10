import { useState } from "react";
import { Copy, Check, X } from "lucide-react";

type Net = {
  key: string;
  label: string;
  href?: (u: string, t: string) => string;
  copyOnly?: boolean;
  bg: string;
};

const NETS: Net[] = [
  { key: "wa",  label: "WhatsApp",  bg: "bg-[#25D366]", href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { key: "tg",  label: "Telegram",  bg: "bg-[#229ED9]", href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: "x",   label: "X",         bg: "bg-black",     href: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: "fb",  label: "Facebook",  bg: "bg-[#1877F2]", href: (u)    => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { key: "li",  label: "LinkedIn",  bg: "bg-[#0A66C2]", href: (u)    => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { key: "rd",  label: "Reddit",    bg: "bg-[#FF4500]", href: (u, t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}` },
  { key: "em",  label: "Email",     bg: "bg-slate-600", href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
  { key: "ig",  label: "Instagram", bg: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]", copyOnly: true },
  { key: "tt",  label: "TikTok",    bg: "bg-black",     copyOnly: true },
  { key: "sc",  label: "Snapchat",  bg: "bg-[#FFFC00] text-black", copyOnly: true },
];

export function ShareProfileDialog({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!open) return null;

  const copy = async (note?: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(note ?? "link");
      setTimeout(() => setCopied(null), 1600);
    } catch {}
  };

  const onPick = (n: Net) => {
    if (n.copyOnly) {
      copy(n.label);
      return;
    }
    const href = n.href!(url, title);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-md rounded-t-2xl border border-border p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Share profile</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {NETS.map((n) => (
            <button
              key={n.key}
              onClick={() => onPick(n)}
              className="flex flex-col items-center gap-1.5"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold text-white ${n.bg}`}>
                {n.label[0]}
              </span>
              <span className="text-[10px] text-muted-foreground">{n.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-transparent px-1 text-xs text-muted-foreground outline-none"
          />
          <button
            onClick={() => copy()}
            className="flex items-center gap-1 rounded-md bg-fuse-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
          </button>
        </div>

        {copied && copied !== "link" && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {copied} doesn't allow direct web links — your link is copied, paste it in the app.
          </p>
        )}
      </div>
    </div>
  );
}
