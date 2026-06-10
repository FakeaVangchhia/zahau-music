import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Zahau Music School" },
      {
        name: "description",
        content:
          "Student success stories, written reviews, and video testimonials from Zahau Music School families.",
      },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: T,
});

const REVIEWS = [
  {
    q: "My daughter went from never having touched a piano to performing Chopin in 18 months. The faculty here is extraordinary.",
    who: "Priya Sharma",
    role: "Parent · Saket",
  },
  {
    q: "Zahau is not just a school — it's a creative sanctuary. Henry's approach to music transformed how I hear sound.",
    who: "Arjun Mehta",
    role: "Producer · Alumni",
  },
  {
    q: "The recital programme gave me real stage experience. I joined my first band six months in.",
    who: "Kabir Singh",
    role: "Drums · Age 16",
  },
  {
    q: "After ten years away from music, I'm playing again. Adults are welcomed here without condescension.",
    who: "Anita Verma",
    role: "Adult learner · Voice",
  },
  {
    q: "We moved to Delhi specifically so our son could study here. No regrets.",
    who: "The D'Souza family",
    role: "Parents · Piano + Violin",
  },
  {
    q: "Online classes that actually feel personal. My teacher knows where I struggle and where I shine.",
    who: "Rahul Patel",
    role: "Guitar · Bangalore (online)",
  },
];

function T() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Voices</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            Words
            <br />
            from our
            <br />
            students.
          </h1>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {REVIEWS.map((r) => (
            <figure key={r.who} className="bg-background p-8">
              <div className="flex gap-1 text-azure">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed">"{r.q}"</blockquote>
              <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <div className="text-foreground font-bold">{r.who}</div>
                {r.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
