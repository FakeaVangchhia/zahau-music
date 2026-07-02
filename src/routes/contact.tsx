import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/site/lead-form";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Zahau Music School" },
      {
        name: "description",
        content: "Visit our Delhi campus, book a free trial class, or reach our admissions team.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Contact</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Let's
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">begin.</span>
          </h1>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-[1.3fr_1fr] gap-16 relative">
        <div className="glowing-blob top-1/2 right-10 w-[300px] h-[300px]" />
        
        <div className="glass-panel border border-border/60 p-8 rounded-3xl shadow-xl bg-card/30 dark:bg-card/10 relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">Consultation</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight">Free consultation</h2>
          <p className="mt-3 text-muted-foreground font-light text-sm sm:text-base mb-8">
            We'll respond within one business day with a recommended faculty and trial class slot.
          </p>
          <div>
            <LeadForm source="contact-page" />
          </div>
        </div>
        
        <aside className="space-y-8 relative z-10">
          <div className="glass-panel border border-border/60 p-8 rounded-2xl hover-glow">
            <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">
              Main Campus
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight">South Extension II</h3>
            <p className="mt-2 text-muted-foreground text-sm font-light">New Delhi, 110049, India</p>
          </div>
          
          <div className="glass-panel border border-border/60 p-8 rounded-2xl space-y-4 text-sm hover-glow">
            <a
              href="tel:+916360777933"
              className="flex items-center gap-3 text-foreground/80 hover:text-azure transition-colors"
            >
              <Phone className="size-4 text-azure" /> <span className="font-mono font-medium">+91 63607 77933</span>
            </a>
            <a
              href="mailto:hello@zahau.school"
              className="flex items-center gap-3 text-foreground/80 hover:text-azure transition-colors"
            >
              <Mail className="size-4 text-azure" /> <span className="font-mono font-medium">hello@zahau.school</span>
            </a>
            <a
              href="https://wa.me/916360777933"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground/80 hover:text-azure transition-colors"
            >
              <MessageCircle className="size-4 text-azure" /> <span>WhatsApp (+91 63607 77933)</span>
            </a>
            <a
              href="https://maps.google.com/?q=South+Extension+II+New+Delhi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground/80 hover:text-azure transition-colors"
            >
              <MapPin className="size-4 text-azure" /> <span>Get directions</span>
            </a>
          </div>
          
          <div className="aspect-video w-full border border-border/80 overflow-hidden rounded-2xl shadow-xl hover:border-azure/60 transition-all duration-300">
            <iframe
              title="Zahau Music School location"
              src="https://www.google.com/maps?q=South+Extension+II+New+Delhi&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
        </aside>
      </section>
    </>
  );
}
