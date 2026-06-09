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
    <form onSubmit={onSubmit} className="flex gap-0 border border-border">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-navy text-navy-foreground px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-azure hover:text-azure-foreground disabled:opacity-50"
      >
        {loading ? "..." : "Join"}
      </button>
    </form>
  );
}
