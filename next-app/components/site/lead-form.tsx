"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, Music, MessageSquare, Send } from "lucide-react";

export function LeadForm({ source, courseInterest }: { source?: string; courseInterest?: string }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          course_interest: String(fd.get("course_interest") ?? courseInterest ?? ""),
          message: String(fd.get("message") ?? ""),
          source: source ?? "contact",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Submission failed");
      toast.success("Thanks \u2014 we'll be in touch within one business day.");
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
          className="font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold"
        >
          Full name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
            placeholder="John Doe"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 grid gap-2">
          <label
            htmlFor="email"
            className="font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
              placeholder="john@example.com"
            />
          </div>
        </div>
        <div className="flex-1 grid gap-2">
          <label
            htmlFor="phone"
            className="font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold"
          >
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={40}
              className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
              placeholder="+91 99999 99999"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="course_interest"
          className="font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold"
        >
          Course of interest
        </label>
        <div className="relative">
          <Music className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            id="course_interest"
            name="course_interest"
            defaultValue={courseInterest}
            maxLength={80}
            placeholder="Piano, Guitar, Voice…"
            className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label
          htmlFor="message"
          className="font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold"
        >
          Message
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3.5 top-4 size-4 text-muted-foreground/60" />
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={1500}
            className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3.5 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
            placeholder="Tell us about your musical goals..."
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-azure text-azure-foreground hover:bg-azure/90 px-8 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="size-4" />
        {loading ? "Sending inquiry..." : "Send Inquiry"}
      </button>
    </form>
  );
}
