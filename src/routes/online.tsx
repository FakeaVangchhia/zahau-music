import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/online")({
  head: () => ({
    meta: [
      { title: "Online Learning — Zahau Music School" },
      { name: "description", content: "Live one-on-one classes, interactive assignments, and a dedicated progress dashboard — anywhere in the world." },
      { property: "og:url", content: "/online" },
    ],
    links: [{ rel: "canonical", href: "/online" }],
  }),
  component: Online,
});

function Online() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Online</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">Learn from<br />anywhere.</h1>
          <p className="mt-8 max-w-2xl text-white/70 text-lg">
            The same Zahau curriculum, delivered live one-on-one — with a student dashboard that keeps you on track.
          </p>
          <Link to="/auth" className="mt-10 inline-block bg-azure text-azure-foreground px-7 py-4 font-bold uppercase tracking-wider text-sm">Start free trial</Link>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {[
            ["Live classes","Real-time video with screen-share and split-camera."],
            ["1-on-1 mentorship","A single faculty member stays with you across terms."],
            ["Flexible scheduling","Reschedule up to two classes per term, no questions asked."],
            ["Interactive assignments","Weekly play-along tasks and recording uploads."],
            ["Progress dashboard","Track time, repertoire, theory milestones, and recordings."],
            ["Studio sessions","Visit Delhi twice a year for a recording weekend (optional)."],
            ["Global recitals","Quarterly online recitals streamed to family and friends."],
            ["International certification","Sit ABRSM and Trinity exams from your home city."],
          ].map(([t, d], i) => (
            <div key={t} className="bg-background p-6">
              <span className="font-mono text-xs text-azure">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-xl uppercase">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
