import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { Send, TrendingUp, Trash2 } from "lucide-react";
import { fuseChat } from "@/lib/chat.functions";
import { Logo } from "@/components/Logo";
import { loadChat, saveChat, clearChat, type ChatMsg } from "@/lib/profile-store";

type Msg = ChatMsg;

const SUGGESTIONS = [
  "What's moving the market today?",
  "Explain $NVDA in simple terms",
  "What is FusionSynergy?",
  "How do I start practice trading?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey! I'm **FUSE**, your FusionSynergy sidekick. Ask me about a stock, what's moving the market today, or how anything in the app works. Where do you want to start?",
};

export function FuseChat() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendFn = useServerFn(fuseChat);

  // Restore history on mount
  useEffect(() => {
    const saved = loadChat();
    if (saved.length > 0) setMessages(saved);
  }, []);

  // Persist on every change (skip the lone greeting)
  useEffect(() => {
    if (messages.length > 1 || messages[0]?.content !== GREETING.content) {
      saveChat(messages);
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const reset = () => {
    clearChat();
    setMessages([GREETING]);
  };

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { content } = await sendFn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setMessages([...next, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass shadow-soft mx-auto flex h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="shadow-glow ring-fuse-cyan/40 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ring-1">
            <Logo className="h-10 w-10 rounded-xl" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">FUSE AI</h2>
            <p className="text-xs text-muted-foreground">FusionSynergy Intelligence Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            aria-label="Clear chat"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
          <div className="hidden items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
            <span className="bg-fuse-cyan h-1.5 w-1.5 animate-pulse rounded-full" />
            Online
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
        )}
        {messages.length <= 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="group flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
              >
                <TrendingUp className="h-3 w-3 text-fuse-cyan" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border/60 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FUSE AI about markets, tech, or FusionSynergy…"
          className="flex-1 rounded-xl bg-input/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-fuse-gradient shadow-glow flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground transition disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-fuse-gradient text-primary-foreground"
            : "bg-secondary/70 text-foreground border border-border/50"
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-foreground">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
