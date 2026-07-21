import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/lead-form";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

type ContactSearch = {
  course?: string;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    course: typeof search.course === "string" && search.course ? search.course : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Zahau Music School" },
      {
        name: "description",
        content: "Reach our admissions team and book a free trial online music session.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { course } = Route.useSearch();
  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">
            Contact
          </span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Let's
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              begin.
            </span>
          </h1>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-[1.3fr_1fr] gap-16 relative">
        <div className="glowing-blob top-1/2 right-10 w-[300px] h-[300px]" />

        <div className="glass-panel border border-border/60 p-8 rounded-3xl shadow-xl bg-card/30 dark:bg-card/10 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">
            Consultation
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">
            Free consultation
          </h2>
          <p className="mt-3 text-muted-foreground font-light text-sm sm:text-base mb-8">
            We'll respond within one business day with a recommended faculty and trial class slot.
          </p>
          <div>
            <LeadForm source="contact-page" courseInterest={course} />
          </div>
        </div>

        <aside className="space-y-6 relative z-10">
          <a
            href="tel:+916360777933"
            className="block glass-panel border border-border/60 p-6 rounded-2xl hover-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center border border-azure/20 shrink-0">
                <Phone className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
                  Admissions Hotline
                </span>
                <span className="font-mono font-bold text-sm text-foreground group-hover:text-azure transition-colors block mt-1">
                  +91 63607 77933
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light">
              Available for calls Monday to Saturday, 10 AM – 6 PM IST.
            </p>
          </a>

          <a
            href="tel:+919911053332"
            className="block glass-panel border border-border/60 p-6 rounded-2xl hover-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center border border-azure/20 shrink-0">
                <Phone className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
                  Mobile
                </span>
                <span className="font-mono font-bold text-sm text-foreground group-hover:text-azure transition-colors block mt-1">
                  +91 99110 53332
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light">
              Available for calls Monday to Saturday, 10 AM – 6 PM IST.
            </p>
          </a>

          <a
            href="mailto:hello@zahau.school"
            className="block glass-panel border border-border/60 p-6 rounded-2xl hover-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center border border-azure/20 shrink-0">
                <Mail className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
                  Email Inquiries
                </span>
                <span className="font-mono font-bold text-sm text-foreground group-hover:text-azure transition-colors block mt-1">
                  hello@zahau.school
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light">
              For admissions, support, and billing. Average response time: under 4 hours.
            </p>
          </a>

          <a
            href="https://wa.me/916360777933"
            target="_blank"
            rel="noopener noreferrer"
            className="block glass-panel border border-border/60 p-6 rounded-2xl hover-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block font-bold">
                  Instant Support
                </span>
                <span className="font-sans font-bold text-sm text-foreground group-hover:text-azure transition-colors block mt-1">
                  WhatsApp Chat
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground font-light">
              Chat instantly with our admissions team to book a trial class or discuss schedules.
            </p>
          </a>
        </aside>
      </section>
    </>
  );
}
