import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/site.functions";
import { toast } from "sonner";

export function NewsletterForm() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success("You're subscribed.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-0 border border-border/60 bg-card/40 backdrop-blur-sm rounded-lg overflow-hidden focus-within:border-azure focus-within:ring-1 focus-within:ring-azure/30 transition-all duration-200"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/40"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-azure text-azure-foreground px-6 text-xs font-bold uppercase tracking-widest hover:bg-azure/90 active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "..." : "Join"}
      </button>
    </form>
  );
}
