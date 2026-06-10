import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/site.functions";
import { toast } from "sonner";
import { User, Mail, Phone, Music, MessageSquare, Send } from "lucide-react";

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
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label
          htmlFor="name"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold"
        >
          Full name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            className="w-full border border-muted-foreground/30 bg-muted/70 focus:bg-background px-4 py-3 pl-10 text-sm rounded-lg focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 placeholder:text-muted-foreground/60 text-foreground"
            placeholder="John Doe"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 grid gap-2">
          <label
            htmlFor="email"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              className="w-full border border-muted-foreground/30 bg-muted/70 focus:bg-background px-4 py-3 pl-10 text-sm rounded-lg focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 placeholder:text-muted-foreground/60 text-foreground"
              placeholder="john@example.com"
            />
          </div>
        </div>
        <div className="flex-1 grid gap-2">
          <label
            htmlFor="phone"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold"
          >
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              className="w-full border border-muted-foreground/30 bg-muted/70 focus:bg-background px-4 py-3 pl-10 text-sm rounded-lg focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 placeholder:text-muted-foreground/60 text-foreground"
              placeholder="+91 99999 99999"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="course_interest"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold"
        >
          Course of interest
        </label>
        <div className="relative">
          <Music className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
          <input
            id="course_interest"
            name="course_interest"
            defaultValue={courseInterest}
            maxLength={80}
            placeholder="Piano, Guitar, Voice…"
            className="w-full border border-muted-foreground/30 bg-muted/70 focus:bg-background px-4 py-3 pl-10 text-sm rounded-lg focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="message"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80 font-semibold"
        >
          Message
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3.5 top-4.5 size-4 text-muted-foreground/70" />
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1500}
            className="w-full border border-muted-foreground/30 bg-muted/70 focus:bg-background px-4 py-3 pl-10 text-sm rounded-lg focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 placeholder:text-muted-foreground/60 text-foreground"
            placeholder="Tell us about your musical goals..."
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-azure to-blue-600 hover:from-azure/95 hover:to-blue-600/95 text-azure-foreground px-8 py-4 font-bold uppercase tracking-wider text-sm rounded-lg transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="size-4" />
        {loading ? "Sending inquiry..." : "Send Inquiry"}
      </button>
    </form>
  );
}
