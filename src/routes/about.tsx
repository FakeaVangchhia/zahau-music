import { createFileRoute, Link } from "@tanstack/react-router";
import founderImg from "@/assets/founder.jpg";
import campusImg from "@/assets/about-campus.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Zahau Music School" },
      {
        name: "description",
        content:
          "Founded by Henry Jahau, Zahau Music School is Delhi's premier music academy with fifteen years of conservatory-grade training.",
      },
      { property: "og:title", content: "About Zahau Music School" },
      {
        property: "og:description",
        content: "Mission, vision, founder story and our teaching methodology.",
      },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: campusImg },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Our Story</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            The art
            <br />
            of mastery.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
            Founded in Delhi by Henry Jahau, Zahau Music School has spent fifteen years building a
            culture where serious craft and genuine joy live in the same room.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Mission</p>
          <h2 className="mt-3 font-display text-4xl uppercase">
            Train the next generation of world-class musicians.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            We exist to help students of every age discover their voice, develop genuine technical
            mastery, and perform with conviction. Music education should be rigorous, joyful, and a
            path to a life filled with sound.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Vision</p>
          <h2 className="mt-3 font-display text-4xl uppercase">
            A culture of musicians, not just hobbyists.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            India deserves world-class music education without leaving the country. Zahau is
            building that — one student, one recital, one recording at a time.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12 items-start">
          <img
            src={founderImg}
            alt="Henry Jahau, founder of Zahau Music School"
            width={1024}
            height={1280}
            loading="lazy"
            className="w-full"
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Founder</p>
            <h2 className="mt-3 font-display text-5xl uppercase">Henry Jahau</h2>
            <p className="mt-2 text-muted-foreground font-mono text-sm">
              Violinist · Conductor · Educator
            </p>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Henry's journey began at age six with a borrowed violin in a small Delhi flat. Two
                decades later, he was performing with chamber ensembles in Berlin and Vienna,
                working under conductors who treated every note as an act of attention.
              </p>
              <p>
                In 2010, he returned to India with a simple question: why do gifted young musicians
                here have to travel abroad for conservatory-grade training? Zahau Music School is
                the answer he built.
              </p>
              <p>
                Today, Henry leads a faculty of twenty-four performing musicians and personally
                mentors every Performance-track student through their final year.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="font-display text-5xl uppercase leading-none mb-12">Teaching methodology</h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {[
            {
              t: "Listen first",
              d: "Every lesson opens with focused listening. You can't play what you can't hear.",
            },
            {
              t: "Small wins, often",
              d: "Weekly performance moments — even five minutes for the room — compound into stage confidence.",
            },
            {
              t: "Theory in context",
              d: "We teach theory through the music you're playing, not from a separate textbook.",
            },
            {
              t: "Studio time",
              d: "Recording is part of the curriculum. Hearing yourself back is the fastest teacher.",
            },
            {
              t: "Mentorship not instruction",
              d: "Faculty stay with students across years. The relationship is the curriculum.",
            },
            {
              t: "Performance is the test",
              d: "Quarterly recitals replace passive grading. You learn by getting up and playing.",
            },
          ].map((m, i) => (
            <div key={m.t} className="bg-background p-8">
              <span className="font-mono text-xs text-azure">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-2xl uppercase">{m.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link
            to="/contact"
            className="bg-azure text-azure-foreground px-7 py-4 font-bold uppercase tracking-wider text-sm hover:bg-navy hover:text-navy-foreground transition-colors inline-block"
          >
            Visit the academy
          </Link>
        </div>
      </section>
    </>
  );
}
