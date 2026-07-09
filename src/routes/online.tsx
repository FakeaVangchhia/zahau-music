import { createFileRoute, Link } from "@tanstack/react-router";
import { Video, UserCheck, CalendarClock, ClipboardList, MonitorPlay, Music, Globe, Award } from "lucide-react";

const CARDS = [
  { t: "Live classes", d: "Real-time video with screen-share and split-camera.", icon: Video },
  { t: "1-on-1 mentorship", d: "A single faculty member stays with you across terms.", icon: UserCheck },
  { t: "Flexible scheduling", d: "Reschedule up to two classes per term, no questions asked.", icon: CalendarClock },
  { t: "Interactive assignments", d: "Weekly play-along tasks and recording uploads.", icon: ClipboardList },
  { t: "Progress dashboard", d: "Track time, repertoire, theory milestones, and recordings.", icon: MonitorPlay },
  { t: "Studio sessions", d: "Visit Delhi twice a year for a recording weekend (optional).", icon: Music },
  { t: "Global recitals", d: "Quarterly online recitals streamed to family and friends.", icon: Globe },
  { t: "International certification", d: "Sit ABRSM and Trinity exams from your home city.", icon: Award },
];

export const Route = createFileRoute("/online")({
  head: () => ({
    meta: [
      { title: "Online Learning — Zahau Music School" },
      {
        name: "description",
        content:
          "Live one-on-one classes, interactive assignments, and a dedicated progress dashboard — anywhere in the world.",
      },
      { property: "og:url", content: "/online" },
    ],
    links: [{ rel: "canonical", href: "/online" }],
  }),
  component: Online,
});

function Online() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Online Learning</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Learn from
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">anywhere.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-navy-foreground/80 text-lg font-light leading-relaxed">
            The same Zahau curriculum, delivered live one-on-one — with a student dashboard that
            keeps you on track.
          </p>
          <Link
            to="/auth"
            className="mt-10 inline-block bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-azure/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            Start free trial
          </Link>
        </div>
      </section>
      
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2" />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={card.t} className="glass-panel border border-border/60 hover-glow p-8 rounded-2xl flex flex-col justify-between group min-h-[250px] transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-azure font-bold">0{i + 1}</span>
                    <div className="size-8 rounded-lg bg-azure/10 text-azure flex items-center justify-center border border-azure/20 group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-350 shrink-0">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors duration-300 mt-6">{card.t}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light">{card.d}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
