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
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Voices</span>
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.9] font-extrabold tracking-tight">
            Words
            <br />
            from our
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">students.</span>
          </h1>
        </div>
      </section>
      
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2" />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {REVIEWS.map((r) => (
            <figure key={r.who} className="glass-panel border border-border/60 hover-glow p-8 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="flex gap-1 text-amber-500 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="text-base sm:text-lg leading-relaxed font-serif italic text-foreground/90">
                  "{r.q}"
                </blockquote>
              </div>
              <figcaption className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border/40 pt-4">
                <div className="text-foreground font-bold text-xs">{r.who}</div>
                <div className="mt-1 opacity-70">{r.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
