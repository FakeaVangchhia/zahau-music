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
          "Founded by Henry Jahau, Zahau Music School offers premier online conservatory-grade training.",
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
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">
            Our Story
          </span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.85] font-extrabold tracking-tight">
            The art
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              of mastery.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-navy-foreground/80 leading-relaxed font-light">
            Founded by Henry Jahau, Zahau Music School offers a dedicated online music platform
            where serious craft and genuine joy meet.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 relative">
        <div className="glowing-blob top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2" />
        <div className="glass-panel border border-border/60 hover-glow p-10 rounded-3xl relative z-10">
          <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">
            Mission
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            Train the next generation of world-class musicians.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
            We exist to help students of every age discover their voice, develop genuine technical
            mastery, and perform with conviction. Music education should be rigorous, joyful, and a
            path to a life filled with sound.
          </p>
        </div>
        <div className="glass-panel border border-border/60 hover-glow p-10 rounded-3xl relative z-10 md:mt-8">
          <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">
            Vision
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            A culture of musicians, not just hobbyists.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed font-light text-sm sm:text-base">
            India deserves world-class music education without leaving the country. Zahau is
            building that — one student, one recital, one recording at a time.
          </p>
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/40 py-24 px-6 relative overflow-hidden">
        <div className="glowing-blob-gold bottom-0 left-0 w-[400px] h-[400px] -translate-x-1/4" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1.2fr_2fr] gap-12 lg:gap-20 items-center relative z-10">
          <div className="relative">
            <div className="absolute inset-0 border border-azure/20 translate-x-4 translate-y-4 rounded-2xl -z-10" />
            <img
              src={founderImg}
              alt="Henry Jahau, founder of Zahau Music School"
              width={1024}
              height={1280}
              loading="lazy"
              className="w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
          <div>
            <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">
              Founder
            </span>
            <h2 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tight">
              Henry Jahau
            </h2>
            <p className="mt-2 text-muted-foreground font-mono text-xs uppercase tracking-widest font-semibold border-b border-border/60 pb-4">
              Violinist · Conductor · Educator
            </p>

            <blockquote className="mt-8 border-l-4 border-azure pl-6 font-serif italic text-lg sm:text-xl text-foreground/90">
              "We must treat every note as an act of pure attention, where serious craft and genuine
              joy meet."
            </blockquote>

            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed text-sm sm:text-base font-light">
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

      <section className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/4 right-1/4 w-[350px] h-[350px]" />

        <div className="relative z-10">
          <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold block text-center mb-4">
            Methodology
          </span>
          <h2 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight text-center mb-16">
            Teaching
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              philosophy
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div
                key={m.t}
                className="glass-panel border border-border/60 hover-glow p-8 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs text-azure font-bold">0{i + 1}</span>
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">
                    {m.t}
                  </h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
                  {m.d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/contact"
              className="bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-wider text-xs hover:bg-azure/85 transition-all duration-300 rounded-xl shadow-lg shadow-azure/20 hover:scale-105 active:scale-95 inline-block"
            >
              Get Started Online
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
