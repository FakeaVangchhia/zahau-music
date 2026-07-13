import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Music,
  Mic,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Shield,
} from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Hire for Events — Zahau Music School" },
      {
        name: "description",
        content:
          "Hire professional musicians, soloists, and bands from Zahau Music School for your private, corporate, or festival events.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const EVENT_PACKAGES = [
  {
    title: "Single Performance",
    price: "Rs. 10,000",
    badge: "Soloist / Duo",
    description:
      "Intimate and sophisticated solo or duo performances tailored for weddings, private dinners, art exhibitions, or smaller gatherings.",
    features: [
      "Choice of Instrument (Piano, Guitar, or Vocal Soloist)",
      "60-90 minutes of performance time",
      "Tailored setlist selection from our repertoire",
      "Additional charge applies based on custom song requests",
      "Bypasses complex audio setup requirements",
      "Pre-event consultation with the artist",
    ],
    icon: <Mic className="size-6 text-azure" />,
    color: "from-blue-600/5 to-blue-800/[0.02]",
  },
  {
    title: "Band Performance",
    price: "Rs. 30,000",
    badge: "Full Ensemble",
    popular: true,
    description:
      "High-energy, full-band musical experience (4–6 band members) covering pop, jazz, classical, or rock genres to elevate large celebrations and festivals.",
    features: [
      "Full band ensemble with live percussion, keys, guitars, and vocals",
      "Up to 120 minutes of live performance (split into sets)",
      "Customized setlist arrangement including signature request songs",
      "Basic acoustic instruments sound check coordination",
      "Professional stage presence & energetic entertainment",
      "Dedicated event manager liaison",
    ],
    icon: <Users className="size-6 text-azure" />,
    color: "from-indigo-600/5 to-indigo-800/[0.02]",
  },
];

function EventsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Soft light radial gradients and spotlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(248,249,250,0.6)_60%,rgba(244,244,245,0.95)_100%)] z-1" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        {/* Ambient stage glows */}
        <div className="glowing-blob top-1/4 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">
            Live Booking
          </span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Hire for
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              events.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-navy-foreground/85 text-lg font-light leading-relaxed">
            Elevate your special moments with elite musical craft. Secure outstanding solo
            performers or high-energy live bands from Zahau Music School for your next event.
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          {EVENT_PACKAGES.map((pkg) => (
            <div
              key={pkg.title}
              className={`glass-panel border relative rounded-3xl p-8 md:p-12 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between ${
                pkg.popular
                  ? "border-azure shadow-[0_15px_45px_-10px_rgba(0,102,204,0.12)] bg-gradient-to-b from-azure/[0.02] to-transparent"
                  : "border-border/60 hover:border-azure/30"
              }`}
            >
              {pkg.popular && (
                <span className="absolute top-6 right-6 bg-azure text-azure-foreground font-mono text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
                  Popular Choice
                </span>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-azure/10 flex items-center justify-center border border-azure/20 shadow-sm">
                    {pkg.icon}
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold block">
                      {pkg.badge}
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-foreground mt-0.5">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground font-light leading-relaxed">
                  {pkg.description}
                </p>

                <div className="mt-8 pt-8 border-t border-border/40">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                    Base Booking Rate
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
                      {pkg.price}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-8 space-y-3.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/80 font-bold block mb-4">
                    What's Included:
                  </span>
                  {pkg.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-start gap-3 text-sm text-foreground/85 font-light"
                    >
                      <CheckCircle2 className="size-4.5 text-azure shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-border/40">
                <a
                  href="#inquire-events"
                  className={`w-full py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-100 ${
                    pkg.popular
                      ? "bg-azure text-azure-foreground hover:bg-azure/90 shadow-md shadow-azure/20"
                      : "bg-navy text-navy-foreground hover:bg-azure hover:text-azure-foreground border border-transparent hover:border-azure"
                  }`}
                >
                  Select Package <ArrowRight className="size-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquire-events" className="py-20 px-6 max-w-7xl mx-auto mb-20 relative">
        <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="glowing-blob top-0 left-0 w-[450px] h-[450px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="glowing-blob-gold bottom-0 right-0 w-[350px] h-[350px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
                Get a Quote
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-extrabold uppercase leading-none tracking-tight">
                Plan Your
                <br />
                <span className="font-serif italic text-azure normal-case font-light lowercase">
                  event.
                </span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed font-light text-sm sm:text-base max-w-md">
                Tell us about your event schedule, duration, and desired performance style. We'll
                match you with the perfect musicians and send a complete, customized quote within 24
                hours.
              </p>

              {/* T&C Info */}
              <div className="mt-10 space-y-4 border-t border-border/40 pt-8 max-w-md">
                <div className="flex gap-3 items-start text-xs text-muted-foreground leading-relaxed">
                  <Volume2 className="size-4 text-azure shrink-0 mt-0.5" />
                  <span>
                    All bookings require a 30% advance deposit to secure the date. Sound system and
                    audio engineer cost is quoted separately based on venue requirements.
                  </span>
                </div>
                <div className="flex gap-3 items-start text-xs text-muted-foreground leading-relaxed">
                  <Shield className="size-4 text-azure shrink-0 mt-0.5" />
                  <span>
                    Public liability and artist transport arrangements are fully covered by school
                    travel guidelines.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-background/85 backdrop-blur-md text-foreground p-8 rounded-2xl border border-border/60 shadow-2xl">
              <LeadForm source="events-inquiry" courseInterest="Events Performance" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
