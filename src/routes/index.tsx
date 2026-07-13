import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourses } from "@/lib/site.functions";
import heroPiano from "@/assets/hero-piano.jpg";
import {
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Music,
  Guitar,
  Drum,
  Mic,
  BookOpen,
  MapPin,
  Phone,
  Clock,
  Users,
  Award,
  Volume2,
  Shield,
} from "lucide-react";
import { LeadForm } from "@/components/site/lead-form";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";

const INSTRUMENTS = [
  "Piano",
  "Keyboard",
  "Guitar",
  "Ukulele",
  "Classical Guitar",
  "Electric Guitar",
  "Drum",
  "Vocal (Hindustani)",
  "Vocal (Carnatic)",
  "Vocal (Western)",
  "Music Theory",
];

const COURSE_IMAGES: Record<string, string> = {
  piano:
    "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&q=80&w=800",
  keyboard:
    "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&q=80&w=800",
  guitar:
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800",
  drums:
    "https://images.unsplash.com/photo-1524412513790-b57ceb2c6114?auto=format&fit=crop&q=80&w=800",
  voice:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800",
  "music-theory":
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=800",
};

function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
      { threshold: 0.05 },
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

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = value.match(/([\d.]+)/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const isFloat = value.includes(".");

    let observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 1500;
          const startTime = performance.now();

          const updateCount = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress * (2 - progress);
            const currentCount = easeProgress * target;

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const hasLeadingZero = value.startsWith("0") && parseFloat(value) < 10;
  let displayValue = value.includes(".") ? count.toFixed(1) : Math.round(count).toString();
  if (hasLeadingZero && displayValue.length < 2) {
    displayValue = "0" + displayValue;
  }
  const suffix = value.replace(/[\d.]+/, "");

  return (
    <span ref={ref} className="font-serif italic font-light tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`glass-panel border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
        open
          ? "border-azure/40 bg-card/60 shadow-lg shadow-azure/5"
          : "border-border/50 hover:border-azure/20"
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center select-none">
        <span
          className={`font-display text-lg font-bold uppercase tracking-tight transition-colors duration-300 ${
            open ? "text-azure" : "text-foreground"
          }`}
        >
          {q}
        </span>
        <span
          className={`font-mono text-xl text-azure transition-transform duration-350 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>
      <div
        className={`grid transition-all duration-350 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground leading-relaxed text-sm font-light max-w-3xl">{a}</p>
        </div>
      </div>
    </div>
  );
}

function getCourseIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("guitar") || s.includes("bass")) return <Guitar className="size-5" />;
  if (s.includes("drum")) return <Drum className="size-5" />;
  if (s.includes("voice") || s.includes("sing")) return <Mic className="size-5" />;
  if (s.includes("theory") || s.includes("composition")) return <BookOpen className="size-5" />;
  return <Music className="size-5" />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zahau Music School — Master the Art of Sound" },
      {
        name: "description",
        content:
          "Piano, Keyboard, Guitar, Drums, Vocal (Hindustani, Carnatic, Western) and Music Theory — from beginner to diploma level at Zahau Music School.",
      },
      { property: "og:title", content: "Zahau Music School — Master the Art of Sound" },
      {
        property: "og:description",
        content: "Premier online music education. Founded by Henry Jahau.",
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
  { t: "Performance-first", d: "Quarterly virtual recitals build stage confidence from day one." },
  { t: "Online-first learning", d: "Interactive live sessions plus structured digital resources." },
  { t: "Recognised certification", d: "ABRSM, Trinity, and Zahau performance certificates." },
];

const JOURNEY = [
  ["Discover", "Audition and placement to find your perfect fit."],
  ["Learn", "Weekly one-on-one sessions with faculty masters."],
  ["Practice", "Access to interactive digital workbooks & guides."],
  ["Perform", "Quarterly stage showcases and virtual recital nights."],
  ["Record", "Virtual performance reviews to archive your progress."],
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
  const [session, setSession] = useState<any>(null);
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({});

  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = hero.clientWidth);
    let height = (canvas.height = hero.clientHeight);

    const handleResize = () => {
      width = canvas.width = hero.clientWidth;
      height = canvas.height = hero.clientHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      symbol: string;
      rotation: number;
      rotationSpeed: number;
    }
    const particles: Particle[] = [];
    const symbols = ["♩", "♪", "♫", "♬", "♭", "♮", "♯"];

    let mouse = { x: 0, y: 0, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Restrict spawning to 20% of mouse moves for professional yet clear density
      if (Math.random() < 0.2) {
        particles.push({
          x: mouse.x,
          y: mouse.y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -Math.random() * 1.4 - 0.5, // Drift upwards
          alpha: 1.0, // Start fully clear and visible
          size: Math.floor(Math.random() * 8) + 12, // Cleaner, smaller size range (12px to 20px)
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.04,
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    hero.addEventListener("mousemove", handleMouseMove, { passive: true });
    hero.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.013; // Slower fade out (~75 frames)
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Calculate proximity ratio (0 = far away/gold, 1 = close/electric azure)
        let ratio = 0;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ratio = 1 - dist / 100;
          }
        }

        // Interpolate between gold (212, 175, 55) and electric azure (0, 102, 204)
        const r = Math.round(212 - (212 - 0) * ratio);
        const g = Math.round(175 - (175 - 102) * ratio);
        const b = Math.round(55 + (204 - 55) * ratio);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((err) => console.error("Supabase auth session fetch failed:", err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (session?.user) {
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setIsAdmin(data?.role === "admin");
        } catch (err) {
          console.error("Failed to fetch user roles:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [session]);

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[90vh] min-h-[680px] bg-navy text-navy-foreground overflow-hidden flex flex-col justify-center"
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full pointer-events-none z-[2]" />
        {/* Soft light radial gradients and spotlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(248,249,250,0.6)_60%,rgba(244,244,245,0.95)_100%)] z-1" />

        {/* Subtle staff-line style backdrop grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        {/* Ambient stage glows */}
        <div className="glowing-blob top-1/4 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-border/10 shadow-sm mb-8 animate-reveal"
            style={{ animationDelay: "100ms" }}
          >
            <span className="size-2 rounded-full bg-azure animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/95">
              Delhi · Online · India
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-[0.85] font-extrabold tracking-tight animate-reveal">
            Master the
            <br />
            <span className="font-serif italic text-azure font-light normal-case tracking-normal lowercase">
              art of sound
            </span>
          </h1>

          <p
            className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-foreground/80 font-light animate-reveal"
            style={{ animationDelay: "200ms" }}
          >
            Rigorous conservatory-level training meets contemporary performance. Join a sanctuary of
            musical craft and find your distinct voice.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-5 animate-reveal"
            style={{ animationDelay: "300ms" }}
          >
            {isAdmin ? (
              <Link
                to="/dashboard"
                className="bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-azure/90 transition-all duration-300 rounded-xl shadow-lg shadow-azure/20 hover:scale-105 active:scale-95"
              >
                Go to Admin Console
              </Link>
            ) : (
              <>
                <Link
                  id="hero-book-demo-btn"
                  to="/book-demo"
                  className="bg-azure text-azure-foreground px-8 py-4 font-mono font-bold uppercase tracking-widest text-[10px] hover:bg-azure/90 transition-all duration-300 rounded-xl shadow-lg shadow-azure/25 hover:scale-105 active:scale-95 cursor-pointer text-center flex items-center justify-center"
                >
                  Book Demo
                </Link>
                <Link
                  to="/courses"
                  className="text-foreground/70 hover:text-azure px-5 py-4 font-mono font-bold uppercase tracking-widest text-[10px] transition-all duration-200 flex items-center gap-1.5 group/btn"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="size-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Infinite marquee of disciplines */}
      <div className="w-full border-y border-border/60 bg-card py-6 overflow-hidden marquee-mask relative z-10 shadow-sm">
        <div className="animate-marquee whitespace-nowrap gap-16 flex">
          {[...INSTRUMENTS, ...INSTRUMENTS].map((w, i) => (
            <span
              key={i}
              className="font-display font-bold text-lg text-foreground/80 uppercase tracking-[0.2em] mx-6 flex items-center gap-4"
            >
              <span>{w}</span>
              <span className="text-azure/80 select-none">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Featured Videos / Showcases */}
      <ScrollReveal className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-10 w-[300px] h-[300px]" />

        <div className="flex justify-between items-end mb-16 flex-wrap gap-6 relative z-10">
          <div>
            <span className="font-mono text-[10px] text-azure uppercase tracking-[0.25em] font-bold">
              Featured Video Showcase
            </span>
            <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
              Performances
              <br />
              <span className="font-serif italic text-azure normal-case font-light">in action</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed font-light">
            Watch our talented students and world-class faculty bring music to life in recitals,
            spotlights, and studio sessions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              id: "xOGsqmNYMX0",
              title: "Independence Day Recital",
              category: "Recital Night",
              duration: "3:45",
              desc: "A special ensemble performance by our faculty and students celebrating musical heritage.",
              tags: ["Ensemble", "Independence Day", "Faculty & Students"],
            },
            {
              id: "aLJVYF-dcCk",
              title: '"Tum Jo Aaye" Showcase',
              category: "Student Spotlight",
              duration: "4:12",
              desc: "A beautiful acoustic live cover performed by our students at the Zahau studios.",
              tags: ["Vocal", "Acoustic Guitar", "Student Spotlight"],
            },
            {
              id: "nHCc4MmmNiQ",
              title: "Faculty Jam & Improvisation",
              category: "Faculty Session",
              duration: "5:20",
              desc: "Zahau faculty members demonstrating advanced improvisation and live-performance skills.",
              tags: ["Improvisation", "Faculty Jam", "Jazz & Blues"],
            },
          ].map((v) => (
            <article
              key={v.id}
              className="glass-panel border border-border/50 hover-glow p-6 rounded-3xl flex flex-col justify-between group h-full transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-azure border border-azure/20 px-2.5 py-0.5 rounded-full bg-azure/5 font-bold">
                    {v.category}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/80 font-medium">
                    {v.duration}
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/40 bg-slate-950 aspect-video shadow-lg relative group/video mb-6 cursor-pointer">
                  {playingVideos[v.id] ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.id}?autoplay=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0 relative z-10"
                    />
                  ) : (
                    <button
                      onClick={() => setPlayingVideos((prev) => ({ ...prev, [v.id]: true }))}
                      className="absolute inset-0 size-full block border-none p-0 bg-transparent text-left focus:outline-none z-10 cursor-pointer"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover opacity-80 transition-all duration-700 scale-100 group-hover/video:scale-105 group-hover/video:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-14 rounded-full backdrop-blur-md bg-white/10 group-hover/video:bg-white/20 border border-white/25 group-hover/video:border-white/40 shadow-xl flex items-center justify-center transition-all duration-300 transform group-hover/video:scale-110">
                          <Play className="size-5 fill-white text-white translate-x-0.5" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                <h3 className="font-display text-xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors duration-300">
                  {v.title}
                </h3>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed font-light">
                  {v.desc}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-border/20">
                {v.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/80 border border-border/40 bg-card/40 px-2.5 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ScrollReveal>

      {/* Why */}
      <ScrollReveal className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/3 right-10 w-[300px] h-[300px]" />

        <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-20 relative z-10">
          <div>
            <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
              The Philosophy
            </span>
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

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
          {WHY.map((w, i) => (
            <div
              key={w.t}
              className={`glass-panel border border-border/50 p-8 rounded-3xl relative overflow-hidden group hover:border-azure/30 transition-all duration-500 min-h-[220px] flex flex-col justify-between ${
                i % 2 === 1 ? "md:translate-y-8" : ""
              }`}
            >
              <span className="font-serif italic text-8xl text-azure/5 absolute right-6 top-4 select-none pointer-events-none group-hover:text-azure/10 transition-colors duration-500">
                0{i + 1}
              </span>

              <div>
                <div className="size-10 rounded-xl bg-azure/10 text-azure flex items-center justify-center mb-6 border border-azure/20">
                  {i === 0 && <Users className="size-5" />}
                  {i === 1 && <Volume2 className="size-5" />}
                  {i === 2 && <Music className="size-5" />}
                  {i === 3 && <Award className="size-5" />}
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground group-hover:text-azure transition-colors duration-300">
                  {w.t}
                </h3>
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-light">{w.d}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Featured courses / catalog */}
      <ScrollReveal className="py-28 px-6 bg-secondary/5 border-y border-border/40 relative">
        <div className="glowing-blob-gold bottom-10 left-10 w-[350px] h-[350px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-end mb-16 flex-wrap gap-6">
            <div>
              <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
                Our Catalog
              </span>
              <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
                Featured
                <br />
                <span className="font-serif italic text-azure normal-case font-light">
                  disciplines
                </span>
              </h2>
            </div>
            <Link
              to="/courses"
              className="font-mono text-[10px] uppercase tracking-widest text-azure hover:text-foreground inline-flex items-center gap-2 border-b border-azure/30 pb-1 hover:border-foreground transition-all duration-300 font-bold"
            >
              View all courses <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((c, i) => {
              const courseImage =
                COURSE_IMAGES[c.slug] ||
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800";
              return (
                <Link
                  key={c.id}
                  to="/courses/$slug"
                  params={{ slug: c.slug }}
                  className="group relative min-h-[380px] rounded-3xl overflow-hidden border border-white/10 hover:border-azure flex flex-col justify-end p-8 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] hover:-translate-y-1.5"
                >
                  <img
                    src={courseImage}
                    alt={c.name}
                    className="absolute inset-0 size-full object-cover opacity-30 mix-blend-luminosity scale-100 group-hover:scale-105 group-hover:opacity-50 group-hover:mix-blend-normal transition-all duration-700 ease-out z-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12100f] via-[#12100f]/80 to-transparent z-1" />

                  <div className="relative z-10 flex flex-col h-full justify-between w-full">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] uppercase tracking-widest border border-azure/30 bg-azure/10 text-azure px-2.5 py-1 rounded-full font-bold">
                        {c.duration}
                      </span>
                      <div className="size-9 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:border-azure group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-300">
                        <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-all duration-300" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white group-hover:text-azure transition-colors duration-300">
                        {c.name}
                      </h3>
                      <p className="mt-2 text-xs text-white/70 leading-relaxed font-light line-clamp-2">
                        {c.tagline}
                      </p>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-azure mt-4 font-bold border-b border-azure/30 pb-0.5 group-hover:border-azure transition-all duration-300">
                        Explore Course <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Journey */}
      <section className="bg-navy border-y border-border/40 py-28 px-6 relative overflow-hidden">
        <div className="glowing-blob top-1/4 left-1/3 w-[500px] h-[500px]" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative z-10">
          <div className="lg:w-1/4">
            <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
              The Pathway
            </span>
            <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight text-foreground">
              The Zahau
              <br />
              <span className="font-serif italic text-azure normal-case font-light">journey</span>
            </h2>
            <p className="mt-6 text-muted-foreground text-sm leading-relaxed font-light">
              Our pedagogical framework takes you from initial curiosity to professional mastery —
              six deliberate steps.
            </p>
          </div>

          <div className="lg:w-3/4 flex flex-col justify-center">
            {/* Desktop Horizontal Timeline */}
            <div className="hidden md:block relative w-full pt-4">
              <div className="absolute top-[28px] left-[32px] right-[32px] h-[1px] bg-border/80 z-0 pointer-events-none" />

              <div className="grid grid-cols-6 gap-4 relative z-10">
                {JOURNEY.map(([title, desc], i) => (
                  <div key={title} className="flex flex-col items-center text-center group">
                    <div className="size-8 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-mono font-bold text-azure group-hover:border-azure group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-300 shadow-md">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h4 className="font-display font-bold text-sm text-foreground mt-5 uppercase tracking-wider group-hover:text-azure transition-colors duration-300">
                      {title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed font-light px-1">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="md:hidden relative pl-6 border-l border-border/80 space-y-10">
              {JOURNEY.map(([title, desc], i) => (
                <div key={title} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 size-4 rounded-full bg-card border border-azure/40 flex items-center justify-center text-[8px] font-mono font-bold text-azure group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h4 className="font-display font-bold text-base text-foreground uppercase tracking-wide group-hover:text-azure transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-light">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <ScrollReveal className="py-28 px-6 max-w-7xl mx-auto overflow-hidden relative">
        <div className="glowing-blob-gold top-10 right-10 w-[300px] h-[300px]" />

        <div className="flex justify-between items-end mb-16 flex-wrap gap-6 relative z-10">
          <div>
            <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
              Success Stories
            </span>
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
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 glass-panel border border-border/60 p-8 rounded-2xl flex flex-col justify-between hover-glow hover:-translate-y-1.5 transition-all duration-500"
              >
                <div>
                  <span className="font-serif text-6xl text-azure/15 select-none leading-none block h-5 mb-2 -mt-4">
                    “
                  </span>
                  <blockquote className="text-lg sm:text-xl leading-relaxed font-serif italic text-foreground/90 font-light relative z-10 pl-6 border-l-2 border-azure/30">
                    "{t.quote}"
                  </blockquote>
                </div>
                <figcaption className="mt-8 border-t border-border/40 pt-6 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-azure/10 text-azure border border-azure/20 flex items-center justify-center font-mono text-[11px] font-bold">
                    {t.who
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-foreground font-bold text-xs font-display uppercase tracking-wider">
                      {t.who}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground/80 font-mono mt-0.5">
                      {t.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Branches */}
      <div className="border-y border-border/60 grid md:grid-cols-3 relative overflow-hidden bg-secondary/5">
        <div className="glowing-blob bottom-0 left-1/3 w-[300px] h-[300px]" />
        {[
          {
            c: "South Extension II",
            a: "Main Campus · Concert Hall",
            p: "+91 11 4050 6070",
            h: "10:00 AM – 8:00 PM",
          },
          {
            c: "Hauz Khas",
            a: "Production Studios",
            p: "+91 11 4050 6071",
            h: "11:00 AM – 8:00 PM",
          },
          { c: "Vasant Kunj", a: "Junior Wing", p: "+91 11 4050 6072", h: "10:00 AM – 7:00 PM" },
        ].map((b, i) => (
          <div
            key={b.c}
            className={`p-12 relative z-10 ${i < 2 ? "md:border-r border-border/60" : ""} ${i < 2 ? "border-b md:border-b-0 border-border/60" : ""} hover:bg-background/40 dark:hover:bg-card/25 transition-all duration-300 group`}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-azure font-bold">
              Branch {String(i + 1).padStart(2, "0")}
            </p>
            <h5 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors duration-300">
              {b.c}
            </h5>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-light">
                <MapPin className="size-3.5 text-azure shrink-0" />
                <span>{b.a}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono font-medium">
                <Phone className="size-3.5 text-azure shrink-0" />
                <span>{b.p}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-light">
                <Clock className="size-3.5 text-azure shrink-0" />
                <span>{b.h}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <ScrollReveal className="py-28 px-6 max-w-4xl mx-auto relative">
        <div className="glowing-blob-gold bottom-10 left-1/4 w-[250px] h-[250px]" />
        <div className="relative z-10">
          <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold block text-center mb-4">
            FAQ
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight text-center mb-16">
            Common
            <br />
            <span className="font-serif italic text-azure normal-case font-light">questions</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map(([q, a]) => (
              <FaqItem q={q} a={a} key={q} />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Contact CTA */}
      {!isAdmin && (
        <ScrollReveal className="py-20 px-4 sm:px-6 max-w-7xl mx-auto mb-20">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="glowing-blob top-0 left-0 w-[450px] h-[450px] -translate-x-1/3 -translate-y-1/3" />
            <div className="glowing-blob-gold bottom-0 right-0 w-[350px] h-[350px] translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="font-mono text-xs text-azure uppercase tracking-[0.2em] font-bold">
                  Get Started
                </span>
                <h2 className="mt-4 font-display text-5xl md:text-6xl font-extrabold uppercase leading-none tracking-tight">
                  Ready to
                  <br />
                  <span className="font-serif italic text-azure normal-case font-light lowercase">
                    play?
                  </span>
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed font-light text-sm sm:text-base max-w-md">
                  Tell us what you'd like to learn. We'll match you with a faculty mentor and design
                  a trial class around your goals — free of charge.
                </p>
              </div>
              <div className="bg-background/80 backdrop-blur-md text-foreground p-8 rounded-2xl border border-border/60 shadow-2xl">
                <LeadForm source="home-cta" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}
    </>
  );
}
