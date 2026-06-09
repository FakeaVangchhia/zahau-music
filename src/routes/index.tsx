import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourses } from "@/lib/site.functions";
import heroPiano from "@/assets/hero-piano.jpg";
import { ArrowRight, Star } from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zahau Music School — Master the Art of Sound | Delhi" },
      { name: "description", content: "Delhi's premier music academy. Piano, guitar, drums, violin, voice, and music production for all ages — beginner to performance." },
      { property: "og:title", content: "Zahau Music School — Master the Art of Sound" },
      { property: "og:description", content: "Premier music education in Delhi. Online and offline. Founded by Henry Jahau." },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroPiano },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Do you teach beginners?", acceptedAnswer: { "@type": "Answer", text: "Yes. We welcome students of every age and start from absolute basics." } },
          { "@type": "Question", name: "Do you offer online classes?", acceptedAnswer: { "@type": "Answer", text: "Yes. One-on-one live classes are available globally." } },
          { "@type": "Question", name: "Are certificates recognised internationally?", acceptedAnswer: { "@type": "Answer", text: "Yes — we prepare students for ABRSM and Trinity College London exams." } },
        ],
      }),
    }],
  }),
  component: Home,
});

const STATS = [
  { k: "1.2K", l: "Active Students" },
  { k: "15+", l: "Years of Excellence" },
  { k: "42", l: "Unique Courses" },
  { k: "03", l: "Delhi Branches" },
];

const WHY = [
  { t: "World-class faculty", d: "Performing musicians trained at Berklee, ABRSM, and top conservatories." },
  { t: "Performance-first", d: "Quarterly recitals build stage confidence from day one." },
  { t: "Hybrid learning", d: "In-person studios plus live one-on-one online classes." },
  { t: "Recognised certification", d: "ABRSM, Trinity, and Zahau performance certificates." },
];

const JOURNEY = [
  ["Discover", "Audition and placement to find your perfect fit."],
  ["Learn", "Weekly one-on-one sessions with faculty masters."],
  ["Practice", "Access to state-of-the-art practice studios."],
  ["Perform", "Quarterly stage showcases and recital nights."],
  ["Record", "Studio sessions to archive your progress."],
  ["Graduate", "Certification recognised by international boards."],
];

const TESTIMONIALS = [
  { quote: "My daughter went from never having touched a piano to performing Chopin in 18 months. The faculty here is extraordinary.", who: "Priya Sharma", role: "Parent · Saket" },
  { quote: "Zahau is not just a school — it's a creative sanctuary. Henry's approach to music transformed how I hear sound.", who: "Arjun Mehta", role: "Producer · Alumni" },
  { quote: "The recital programme gave me real stage experience. I joined my first band six months in.", who: "Kabir Singh", role: "Drums · Age 16" },
];

const FAQS = [
  ["What ages do you teach?", "From 5 years old to adult learners. Every class is paced for the individual."],
  ["Do I need to bring my own instrument?", "No — practice instruments are available at every branch. We help you choose your first instrument when you're ready."],
  ["How long are classes?", "45 minutes for foundation, 60 minutes for intermediate and above. Weekly cadence."],
  ["Can I switch courses?", "Yes — many students explore multiple instruments. Talk to admissions about combined tracks."],
  ["Are there scholarships?", "Yes. We run a merit-based scholarship audition each spring."],
];

function Home() {
  const fetchCourses = useServerFn(getCourses);
  const { data: courses } = useQuery({ queryKey: ["courses-home"], queryFn: () => fetchCourses() });
  const featured = (courses ?? []).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] bg-navy text-navy-foreground overflow-hidden flex flex-col justify-center">
        <img
          src={heroPiano}
          alt="Grand piano under a single spotlight"
          width={1920}
          height={1280}
          className="absolute inset-0 size-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <span className="font-mono text-azure text-xs uppercase tracking-[0.3em] animate-reveal block">Delhi · Online · Global</span>
          <h1 className="mt-4 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.85] animate-reveal text-balance">
            Master the<br />Art of Sound
          </h1>
          <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/80 animate-reveal">
            Rigorous conservatory training meets contemporary performance. Join the next generation of world-class musicians.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-reveal">
            <Link to="/contact" className="bg-azure text-azure-foreground px-7 py-4 font-bold uppercase tracking-wider text-sm hover:invert transition-all min-h-11">Book Free Consultation</Link>
            <Link to="/auth" className="border border-white/30 text-white px-7 py-4 font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-navy transition-all min-h-11">Enroll Now</Link>
            <Link to="/courses" className="text-white/70 px-7 py-4 font-bold uppercase tracking-wider text-sm hover:text-white underline underline-offset-8 min-h-11">Explore Courses</Link>
          </div>
        </div>
        {/* Marquee */}
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-navy/80 py-4 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap gap-16">
            {["Piano","Keyboard","Guitar","Bass","Drums","Violin","Voice","Production","Theory","Composition","Piano","Keyboard","Guitar","Bass","Drums","Violin","Voice","Production","Theory","Composition"].map((w, i) => (
              <span key={i} className="font-display text-4xl text-white/10 uppercase mx-8">{w}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-azure text-azure-foreground py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.l}>
              <div className="font-display text-5xl">{s.k}</div>
              <div className="font-mono text-white/80 text-[10px] uppercase tracking-tighter mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">Why<br />Zahau</h2>
          <p className="text-lg text-muted-foreground leading-relaxed self-end">
            We've spent fifteen years refining a single thing: how to bring out the musician already inside every student.
            The result is a curriculum that's structured, joyful, and uncompromising on craft.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {WHY.map((w, i) => (
            <div key={w.t} className="bg-background p-8">
              <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
              <h3 className="mt-8 font-display text-2xl uppercase">{w.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      <section className="py-24 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">Featured<br />Disciplines</h2>
            <Link to="/courses" className="font-mono text-xs uppercase tracking-widest text-azure hover:text-foreground inline-flex items-center gap-2">
              View all courses <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
            {featured.map((c, i) => (
              <Link
                key={c.id}
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="group bg-background p-8 hover:bg-navy hover:text-navy-foreground transition-colors min-h-[220px] flex flex-col"
              >
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-8 h-px bg-border group-hover:bg-azure mt-2" />
                </div>
                <h3 className="mt-12 font-display text-3xl uppercase">{c.name}</h3>
                <p className="mt-3 text-sm opacity-70">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="md:w-1/3">
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-none text-azure">The Zahau<br />Journey</h2>
            <p className="mt-6 text-white/60 text-sm leading-relaxed">
              Our pedagogical framework takes you from initial curiosity to professional mastery — six deliberate steps.
            </p>
          </div>
          <div className="md:w-2/3 grid sm:grid-cols-2 gap-10">
            {JOURNEY.map(([title, desc], i) => (
              <div key={title} className="border-l border-white/20 pl-6">
                <span className="font-mono text-azure">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="font-bold mt-2 uppercase">{title}</h4>
                <p className="text-sm text-white/50 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="font-display text-5xl md:text-6xl uppercase leading-none mb-16">Student Voices</h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {TESTIMONIALS.map((t) => (
            <figure key={t.who} className="bg-background p-8">
              <div className="flex gap-1 text-azure">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
              <blockquote className="mt-6 text-lg leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <div className="text-foreground font-bold">{t.who}</div>
                {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Branches */}
      <section className="border-y border-border grid md:grid-cols-3">
        {[
          { c: "South Extension II", a: "Main Campus · Concert Hall", p: "+91 11 4050 6070" },
          { c: "Hauz Khas", a: "Production Studios", p: "+91 11 4050 6071" },
          { c: "Vasant Kunj", a: "Junior Wing", p: "+91 11 4050 6072" },
        ].map((b, i) => (
          <div key={b.c} className={`p-12 ${i < 2 ? "md:border-r border-border" : ""} ${i < 2 ? "border-b md:border-b-0 border-border" : ""}`}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Branch {String(i + 1).padStart(2, "0")}</p>
            <h5 className="mt-3 font-display text-3xl uppercase">{b.c}</h5>
            <p className="mt-2 text-sm text-muted-foreground">{b.a}</p>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{b.p}</p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="font-display text-5xl md:text-6xl uppercase leading-none mb-12">Common Questions</h2>
        <div className="divide-y divide-border border-y border-border">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="font-display text-xl md:text-2xl uppercase pr-8">{q}</span>
                <span className="font-mono text-2xl text-azure group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Begin</p>
            <h2 className="mt-4 font-display text-5xl md:text-6xl uppercase leading-none">Ready to play?</h2>
            <p className="mt-6 text-white/70 leading-relaxed">
              Tell us what you'd like to learn. We'll match you with a faculty mentor and design a trial class around your goals — free of charge.
            </p>
          </div>
          <div className="bg-background text-foreground p-8 -mx-6 md:mx-0">
            <LeadForm source="home-cta" />
          </div>
        </div>
      </section>
    </>
  );
}
