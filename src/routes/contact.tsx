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
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Contact</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            Let's
            <br />
            begin.
          </h1>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-[1.3fr_1fr] gap-16">
        <div>
          <h2 className="font-display text-3xl uppercase">Free consultation</h2>
          <p className="mt-3 text-muted-foreground">
            We'll respond within one business day with a recommended faculty and trial class slot.
          </p>
          <div className="mt-8">
            <LeadForm source="contact-page" />
          </div>
        </div>
        <aside className="space-y-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">
              Main Campus
            </p>
            <h3 className="mt-2 font-display text-2xl uppercase">South Extension II</h3>
            <p className="mt-2 text-muted-foreground text-sm">New Delhi, 110049, India</p>
          </div>
          <div className="space-y-3 text-sm">
            <a
              href="tel:+911140506070"
              className="flex items-center gap-3 text-foreground hover:text-azure"
            >
              <Phone className="size-4" /> +91 11 4050 6070
            </a>
            <a
              href="mailto:hello@zahau.school"
              className="flex items-center gap-3 text-foreground hover:text-azure"
            >
              <Mail className="size-4" /> hello@zahau.school
            </a>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground hover:text-azure"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
            <a
              href="https://maps.google.com/?q=South+Extension+II+New+Delhi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground hover:text-azure"
            >
              <MapPin className="size-4" /> Get directions
            </a>
          </div>
          <div className="aspect-video w-full border border-border overflow-hidden">
            <iframe
              title="Zahau Music School location"
              src="https://www.google.com/maps?q=South+Extension+II+New+Delhi&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </aside>
      </section>
    </>
  );
}
