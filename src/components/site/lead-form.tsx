import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/site.functions";
import { toast } from "sonner";

export function LeadForm({ source, courseInterest }: { source?: string; courseInterest?: string }) {
  const submit = useServerFn(submitLead);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          course_interest: String(fd.get("course_interest") ?? courseInterest ?? ""),
          message: String(fd.get("message") ?? ""),
          source: source ?? "contact",
        },
      });
      toast.success("Thanks — we'll be in touch within one business day.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Full name</label>
        <input id="name" name="name" required maxLength={120} className="border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-azure" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
          <input id="email" name="email" type="email" required maxLength={255} className="border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-azure" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="phone" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Phone</label>
          <input id="phone" name="phone" type="tel" maxLength={40} className="border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-azure" />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="course_interest" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Course of interest</label>
        <input id="course_interest" name="course_interest" defaultValue={courseInterest} maxLength={80} placeholder="Piano, Guitar, Voice…" className="border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-azure" />
      </div>
      <div className="grid gap-2">
        <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Message</label>
        <textarea id="message" name="message" rows={4} maxLength={1500} className="border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-azure" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-azure text-azure-foreground px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-navy hover:text-navy-foreground transition-colors disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send Inquiry"}
      </button>
    </form>
  );
}
