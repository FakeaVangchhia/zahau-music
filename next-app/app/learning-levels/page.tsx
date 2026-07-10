import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Levels — Zahau Music School",
  description:
    "Beginner, Intermediate, Advanced and Performance Certification — a progression visible from day one.",
  alternates: { canonical: "/learning-levels" },
};

const LEVELS = [
  {
    l: "Beginner",
    d: "First six to twelve months. Build a healthy foundation: posture, breath, basic theory, and one piece you love to play.",
    durations: "6–12 months",
    focus: ["Healthy technique", "Reading basics", "First repertoire"],
  },
  {
    l: "Intermediate",
    d: "Years two through three. Real repertoire, ensemble playing, and your first studio recording.",
    durations: "12–24 months",
    focus: ["Scales & arpeggios", "Ensemble work", "Studio session"],
  },
  {
    l: "Advanced",
    d: "Conservatory-level work. Original pieces, advanced harmony, and weekly performance.",
    durations: "24–36 months",
    focus: ["Advanced harmony", "Improvisation", "Performance"],
  },
  {
    l: "Performance Certification",
    d: "A two-year capstone where you graduate as a working musician with a portfolio and recital tape.",
    durations: "24 months",
    focus: ["Portfolio", "Public recital", "International certification"],
  },
];

export default function LevelsPage() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Progression</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            From first
            <br />
            note to stage.
          </h1>
        </div>
      </section>

      <section className="py-24 px-6 max-w-4xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-10 w-[300px] h-[300px]" />

        <div className="relative border-l border-border/80 ml-4 md:ml-10 pl-8 md:pl-12 space-y-12 z-10">
          {LEVELS.map((lv, i) => (
            <div key={lv.l} className="relative group">
              <div className="absolute -left-[49px] md:-left-[65px] top-4 size-8 rounded-full bg-background border-2 border-azure flex items-center justify-center shadow-lg shadow-azure/10 group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-500 z-10">
                <span className="font-mono text-xs text-azure group-hover:text-azure-foreground font-bold transition-all duration-500">
                  {i + 1}
                </span>
              </div>

              <div className="glass-panel border border-border/60 hover-glow rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.12)]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold border border-azure/20 bg-azure/5 px-2.5 py-1 rounded-full">
                      Duration: {lv.durations}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-foreground group-hover:text-azure transition-colors duration-300">
                    {lv.l}
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                    {lv.d}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 border-t border-border/40 pt-6">
                    {lv.focus.map((f) => (
                      <span
                        key={f}
                        className="text-[9px] font-mono uppercase tracking-widest border border-border bg-card/45 text-muted-foreground/90 px-3 py-1.5 rounded-lg"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
