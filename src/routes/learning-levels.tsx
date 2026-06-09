import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learning-levels")({
  head: () => ({
    meta: [
      { title: "Learning Levels — Zahau Music School" },
      { name: "description", content: "Beginner, Intermediate, Advanced and Performance Certification — a progression visible from day one." },
      { property: "og:url", content: "/learning-levels" },
    ],
    links: [{ rel: "canonical", href: "/learning-levels" }],
  }),
  component: Levels,
});

const LEVELS = [
  { l: "Beginner", d: "First six to twelve months. Build a healthy foundation: posture, breath, basic theory, and one piece you love to play.", durations: "6–12 months", focus: ["Healthy technique","Reading basics","First repertoire"] },
  { l: "Intermediate", d: "Years two through three. Real repertoire, ensemble playing, and your first studio recording.", durations: "12–24 months", focus: ["Scales & arpeggios","Ensemble work","Studio session"] },
  { l: "Advanced", d: "Conservatory-level work. Original pieces, advanced harmony, and weekly performance.", durations: "24–36 months", focus: ["Advanced harmony","Improvisation","Performance"] },
  { l: "Performance Certification", d: "A two-year capstone where you graduate as a working musician with a portfolio and recital tape.", durations: "24 months", focus: ["Portfolio","Public recital","International certification"] },
];

function Levels() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Progression</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">From first<br />note to stage.</h1>
        </div>
      </section>
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="space-y-16">
          {LEVELS.map((lv, i) => (
            <div key={lv.l} className="grid md:grid-cols-[140px_1fr] gap-8 border-t border-border pt-8">
              <div>
                <span className="font-mono text-xs text-azure">LEVEL {i + 1}</span>
                <div className="font-mono text-sm text-muted-foreground mt-2">{lv.durations}</div>
              </div>
              <div>
                <h2 className="font-display text-4xl uppercase">{lv.l}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{lv.d}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {lv.focus.map((f) => <span key={f} className="text-[10px] font-mono uppercase tracking-widest border border-border px-2 py-1">{f}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
