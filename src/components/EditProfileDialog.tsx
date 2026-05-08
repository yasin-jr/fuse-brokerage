import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { loadProfile, saveProfile, type Profile } from "@/lib/profile-store";

export function EditProfileDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [p, setP] = useState<Profile>({ username: "", bio: "", avatar: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setP(loadProfile());
  }, [open]);

  if (!open) return null;

  const onPick = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setP((prev) => ({ ...prev, avatar: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    saveProfile(p);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-border bg-secondary">
              {p.avatar ? (
                <img src={p.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">👤</div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-fuse-gradient text-primary-foreground shadow-glow"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
            />
          </div>
          <span className="text-xs text-muted-foreground">Tap to change profile picture</span>
        </div>

        <label className="block text-xs text-muted-foreground mb-1">Username</label>
        <input
          value={p.username}
          onChange={(e) => setP({ ...p, username: e.target.value })}
          placeholder="yourname"
          className="mb-3 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-fuse-cyan"
        />

        <label className="block text-xs text-muted-foreground mb-1">Bio</label>
        <textarea
          value={p.bio}
          onChange={(e) => setP({ ...p, bio: e.target.value })}
          placeholder="Tell people what you're into…"
          rows={3}
          className="mb-4 w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-fuse-cyan resize-none"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border bg-secondary/50 py-2 text-sm">Cancel</button>
          <button onClick={submit} className="flex-1 rounded-lg bg-fuse-gradient py-2 text-sm font-semibold text-primary-foreground shadow-glow">Save</button>
        </div>
      </div>
    </div>
  );
}
