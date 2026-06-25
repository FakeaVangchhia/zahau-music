import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourses } from "@/lib/site.functions";
import heroPiano from "@/assets/hero-piano.jpg";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zahau Music School — Master the Art of Sound | Delhi" },
      {
        name: "description",
        content:
          "Delhi's premier music academy. Piano, guitar, drums, violin, voice, and music production for all ages — beginner to performance.",
      },
      { property: "og:title", content: "Zahau Music School — Master the Art of Sound" },
      {
        property: "og:description",
        content: "Premier music education in Delhi. Online and offline. Founded by Henry Jahau.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroPiano },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Do you teach beginners?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. We welcome students of every age and start from absolute basics.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer online classes?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. One-on-one live classes are available globally.",
              },
            },
            {
              "@type": "Question",
              name: "Are certificates recognised internationally?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — we prepare students for ABRSM and Trinity College London exams.",
              },
            },
          ],
        }),
      },
    ],
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
  {
    t: "World-class faculty",
    d: "Performing musicians trained at Berklee, ABRSM, and top conservatories.",
  },
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
  {
    quote:
      "My daughter went from never having touched a piano to performing Chopin in 18 months. The faculty here is extraordinary.",
    who: "Priya Sharma",
    role: "Parent · Saket",
  },
  {
    quote:
      "Zahau is not just a school — it's a creative sanctuary. Henry's approach to music transformed how I hear sound.",
    who: "Arjun Mehta",
    role: "Producer · Alumni",
  },
  {
    quote:
      "The recital programme gave me real stage experience. I joined my first band six months in.",
    who: "Kabir Singh",
    role: "Drums · Age 16",
  },
];

const FAQS = [
  [
    "What ages do you teach?",
    "From 5 years old to adult learners. Every class is paced for the individual.",
  ],
  [
    "Do I need to bring my own instrument?",
    "No — practice instruments are available at every branch. We help you choose your first instrument when you're ready.",
  ],
  [
    "How long are classes?",
    "45 minutes for foundation, 60 minutes for intermediate and above. Weekly cadence.",
  ],
  [
    "Can I switch courses?",
    "Yes — many students explore multiple instruments. Talk to admissions about combined tracks.",
  ],
  ["Are there scholarships?", "Yes. We run a merit-based scholarship audition each spring."],
];

function Home() {
  const fetchCourses = useServerFn(getCourses);
  const { data: courses } = useQuery({ queryKey: ["courses-home"], queryFn: () => fetchCourses() });
  const featured = (courses ?? []).slice(0, 6);
  const [isAdmin, setIsAdmin] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[680px] bg-navy text-navy-foreground overflow-hidden flex flex-col justify-center">
        <img
          src={heroPiano}
          alt="Grand piano under a single spotlight"
          width={1920}
          height={1280}
          className="absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        
        {/* Subtle grid line backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 shadow-sm animate-reveal mb-6">
            <span className="size-2 rounded-full bg-azure animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/90">
              Delhi · Online · Global
            </span>
          </div>
          <h1 className="mt-4 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.85] font-extrabold animate-reveal text-balance tracking-tight">
            Master the
            <br />
            <span className="font-serif italic text-azure font-light normal-case tracking-normal lowercase">art of sound</span>
          </h1>
          <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/70 animate-reveal font-light">
            Rigorous conservatory-level training meets contemporary performance. Join the next generation
            of world-class musicians.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-reveal">
            {isAdmin ? (
              <Link
                to="/dashboard"
                className="bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-wider text-xs hover:bg-azure/85 transition-all duration-300 rounded-xl shadow-lg shadow-azure/20 hover:scale-105 active:scale-95"
              >
                Go to Admin Console
              </Link>
            ) : (
              <>
                <Link
                  to="/contact"
                  className="bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-wider text-xs hover:bg-azure/85 transition-all duration-300 rounded-xl shadow-lg shadow-azure/20 hover:scale-105 active:scale-95"
                >
                  Book Free Consultation
                </Link>
                <Link
                  to="/auth"
                  className="border border-white/20 text-white px-8 py-4 font-mono font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-navy transition-all duration-300 rounded-xl hover:scale-105 active:scale-95"
                >
                  Enroll Now
                </Link>
                <Link
                  to="/curriculum"
                  className="text-white/60 px-6 py-4 font-mono font-bold uppercase tracking-wider text-xs hover:text-white transition-all duration-200 relative after:absolute after:bottom-3 after:left-6 after:h-0.5 after:w-0 after:bg-white hover:after:w-2/3 after:transition-all after:duration-300"
                >
                  Explore Courses
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Marquee with fading edge mask */}
        <div className="absolute bottom-0 w-full border-t border-white/5 bg-navy/60 py-4 overflow-hidden marquee-mask backdrop-blur-sm z-10">
          <div className="animate-marquee whitespace-nowrap gap-16">
            {[
              "Piano", "Keyboard", "Guitar", "Bass", "Drums", "Violin", "Voice", "Production", "Theory", "Composition",
              "Piano", "Keyboard", "Guitar", "Bass", "Drums", "Violin", "Voice", "Production", "Theory", "Composition"
            ].map((w, i) => (
              <span key={i} className="font-display font-black text-3xl text-white/5 uppercase mx-8 tracking-wider">
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-navy to-slate-900 text-white py-16 px-6 relative border-y border-white/5 overflow-hidden">
        {/* Subtle glow sphere */}
        <div className="glowing-blob-gold top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map((s) => (
            <div key={s.l} className="animate-fade-in text-center md:text-left">
              <div className="font-display text-5xl md:text-6xl font-black text-gradient-azure">{s.k}</div>
              <div className="font-mono opacity-60 text-[9px] uppercase tracking-widest mt-2">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <ScrollReveal className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/3 right-10 w-[300px] h-[300px]" />
        
        <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20 relative z-10">
          <div>
            <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">The Philosophy</span>
            <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
              Why
              <br />
              <span className="font-serif italic text-azure normal-case font-light">Zahau</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed self-end font-light">
            We've spent fifteen years refining a single thing: how to bring out the musician already
            inside every student. The result is a curriculum that's structured, joyful, and
            uncompromising on craft.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {WHY.map((w, i) => (
            <div key={w.t} className="glass-panel border border-border/60 hover-glow p-8 rounded-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="font-mono text-xs text-azure font-bold">0{i + 1}</span>
                <h3 className="mt-8 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">{w.t}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">{w.d}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Featured courses */}
      <ScrollReveal className="py-28 px-6 bg-secondary/30 border-y border-border/40 relative">
        <div className="glowing-blob-gold bottom-10 left-10 w-[350px] h-[350px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-end mb-16 flex-wrap gap-4">
            <div>
              <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">Our Catalog</span>
              <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
                Featured
                <br />
                <span className="font-serif italic text-azure normal-case font-light">disciplines</span>
              </h2>
            </div>
            <Link
              to="/curriculum"
              className="font-mono text-xs uppercase tracking-widest text-azure hover:text-foreground inline-flex items-center gap-2 border-b border-azure/40 pb-1 hover:border-foreground transition-all duration-200"
            >
              View all courses <ArrowRight className="size-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => (
              <Link
                key={c.id}
                to="/curriculum/$slug"
                params={{ slug: c.slug }}
                className="group bg-card/40 dark:bg-card/25 border border-border/50 p-8 hover-glow rounded-2xl min-h-[240px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-azure transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="size-8 rounded-full border border-border flex items-center justify-center group-hover:border-azure group-hover:bg-azure/5 transition-all duration-300">
                    <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-azure group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </div>
                <div>
                  <h3 className="mt-12 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">{c.name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2 font-light">{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Journey */}
      <ScrollReveal className="bg-gradient-to-b from-navy to-slate-950 text-navy-foreground py-28 px-6 relative border-y border-white/5">
        <div className="glowing-blob top-1/4 left-1/3 w-[500px] h-[500px]" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 relative z-10">
          <div className="md:w-1/3">
            <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">The Pathway</span>
            <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight text-white">
              The Zahau
              <br />
              <span className="font-serif italic text-azure normal-case font-light">journey</span>
            </h2>
            <p className="mt-6 text-white/50 text-sm leading-relaxed font-light">
              Our pedagogical framework takes you from initial curiosity to professional mastery —
              six deliberate steps.
            </p>
          </div>
          <div className="md:w-2/3 grid sm:grid-cols-2 gap-x-8 gap-y-12">
            {JOURNEY.map(([title, desc], i) => (
              <div key={title} className="border-l-2 border-white/10 hover:border-azure pl-6 transition-all duration-300 group">
                <span className="font-mono text-xs font-bold text-azure group-hover:text-gradient-azure transition-all duration-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="font-display font-bold text-lg text-white mt-2 uppercase tracking-wide group-hover:text-azure transition-colors">{title}</h4>
                <p className="text-sm text-white/50 mt-2 leading-relaxed font-light">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal className="py-28 px-6 max-w-7xl mx-auto overflow-hidden relative">
        <div className="glowing-blob-gold top-10 right-10 w-[300px] h-[300px]" />
        
        <div className="flex justify-between items-end mb-16 flex-wrap gap-4 relative z-10">
          <div>
            <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">Success Stories</span>
            <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
              Student
              <br />
              <span className="font-serif italic text-azure normal-case font-light">voices</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="size-12 border border-border/80 rounded-xl flex items-center justify-center hover:bg-azure hover:text-azure-foreground hover:border-azure transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={scrollNext}
              className="size-12 border border-border/80 rounded-xl flex items-center justify-center hover:bg-azure hover:text-azure-foreground hover:border-azure transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden relative z-10" ref={emblaRef}>
          <div className="flex gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.who}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 glass-panel border border-border/60 p-8 rounded-2xl flex flex-col justify-between hover-glow hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-base sm:text-lg leading-relaxed font-serif italic text-foreground/90">
                    "{t.quote}"
                  </blockquote>
                </div>
                <figcaption className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border/40 pt-4">
                  <div className="text-foreground font-bold text-xs">{t.who}</div>
                  <div className="mt-1 opacity-70">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Branches */}
      <ScrollReveal className="border-y border-border/80 grid md:grid-cols-3 relative overflow-hidden bg-secondary/10">
        <div className="glowing-blob bottom-0 left-1/3 w-[300px] h-[300px]" />
        {[
          { c: "South Extension II", a: "Main Campus · Concert Hall", p: "+91 11 4050 6070" },
          { c: "Hauz Khas", a: "Production Studios", p: "+91 11 4050 6071" },
          { c: "Vasant Kunj", a: "Junior Wing", p: "+91 11 4050 6072" },
        ].map((b, i) => (
          <div
            key={b.c}
            className={`p-12 relative z-10 ${i < 2 ? "md:border-r border-border/60" : ""} ${i < 2 ? "border-b md:border-b-0 border-border/60" : ""} hover:bg-background/40 dark:hover:bg-card/20 transition-all duration-300 group`}
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold">
              Branch {String(i + 1).padStart(2, "0")}
            </p>
            <h5 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">{b.c}</h5>
            <p className="mt-2 text-sm text-muted-foreground font-light">{b.a}</p>
            <p className="mt-4 text-xs text-muted-foreground font-mono font-medium">{b.p}</p>
          </div>
        ))}
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal className="py-28 px-6 max-w-4xl mx-auto relative">
        <div className="glowing-blob-gold bottom-10 left-1/4 w-[250px] h-[250px]" />
        <div className="relative z-10">
          <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold block text-center mb-4">FAQ</span>
          <h2 className="font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight text-center mb-16">
            Common
            <br />
            <span className="font-serif italic text-azure normal-case font-light">questions</span>
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none focus:outline-none">
                  <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors pr-8">{q}</span>
                  <span className="font-mono text-2xl text-azure group-open:rotate-45 transition-transform duration-300 select-none">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm font-light max-w-3xl">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Contact CTA */}
      {!isAdmin && (
        <ScrollReveal className="py-20 px-4 sm:px-6 max-w-7xl mx-auto mb-20">
          <div className="bg-gradient-to-br from-navy via-slate-900 to-navy text-white rounded-3xl border border-white/5 p-8 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="glowing-blob top-0 left-0 w-[450px] h-[450px] -translate-x-1/3 -translate-y-1/3" />
            <div className="glowing-blob-gold bottom-0 right-0 w-[350px] h-[350px] translate-x-1/4 translate-y-1/4" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">Get Started</span>
                <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
                  Ready to
                  <br />
                  <span className="font-serif italic text-azure normal-case font-light lowercase">play?</span>
                </h2>
                <p className="mt-6 text-white/70 leading-relaxed font-light text-sm sm:text-base max-w-md">
                  Tell us what you'd like to learn. We'll match you with a faculty mentor and design a
                  trial class around your goals — free of charge.
                </p>
              </div>
              <div className="bg-background text-foreground p-8 rounded-2xl border border-border/40 shadow-2xl">
                <LeadForm source="home-cta" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}
    </>
  );
}
