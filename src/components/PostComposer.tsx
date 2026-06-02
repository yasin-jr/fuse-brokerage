import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createPost } from "@/lib/posts.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Type, Quote, Smile, ImageIcon, PlayCircle, AtSign, BarChart3,
  Link2, Paperclip, DollarSign, CalendarDays, Lightbulb, ListOrdered, Hash,
  Loader2, X,
} from "lucide-react";

const TOOLBAR = [
  { icon: Type, label: "Style" },
  { icon: Quote, label: "Quote" },
  { icon: Smile, label: "Emoji" },
  { icon: ImageIcon, label: "Image" },
  { icon: PlayCircle, label: "Video" },
  { icon: AtSign, label: "Mention" },
  { icon: BarChart3, label: "Poll" },
  { icon: Link2, label: "Link" },
  { icon: Paperclip, label: "Attach" },
  { icon: DollarSign, label: "Ticker" },
  { icon: CalendarDays, label: "Date" },
  { icon: Lightbulb, label: "Idea" },
  { icon: ListOrdered, label: "List" },
];

export function PostComposer({ trigger }: { trigger?: React.ReactNode }) {
  const qc = useQueryClient();
  const create = useServerFn(createPost);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) throw new Error("Please sign in to post.");
      const media_paths: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${sess.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("post-media").upload(path, file, { contentType: file.type });
        if (error) throw new Error(error.message);
        media_paths.push(path);
      }
      return create({
        data: {
          title: title.trim() || undefined,
          body: body.trim(),
          media_paths,
          topic: topic.trim() || undefined,
          visibility: "public",
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-posts"] });
      setOpen(false);
      setTitle(""); setBody(""); setTopic(""); setFiles([]); setError(null);
    },
    onError: (e: any) => setError(e?.message ?? "Couldn't post."),
  });

  const onPick = (label: string) => {
    if (label === "Image" || label === "Attach") imgInput.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-card border-border">
        <DialogHeader className="border-b border-border/60 px-4 py-3">
          <DialogTitle className="text-center text-sm font-semibold">Write a post</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-border/60 px-3 py-2">
          {TOOLBAR.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => onPick(t.label)}
              title={t.label}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []).slice(0, 8 - files.length);
              setFiles((f) => [...f, ...list]);
              e.target.value = "";
            }}
          />
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder="Title"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground/60"
            />
            <span className="shrink-0 pt-2 text-xs text-muted-foreground tabular-nums">{title.length} / 200</span>
          </div>
          <div className="h-px bg-border/60" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 4000))}
            placeholder="Please enter text"
            rows={10}
            className="min-h-[220px] w-full resize-y bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border bg-secondary/30">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <label className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Hash className="h-3.5 w-3.5" />
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 40))}
              placeholder="Topic"
              className="w-20 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            Visible to:
            <span className="inline-flex items-center gap-1 text-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-fuse-gradient" /> Public
            </span>
          </div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || body.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-fuse-gradient px-5 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Post
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
