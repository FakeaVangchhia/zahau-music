import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCourse } from "@/lib/site.functions";
import { LeadForm } from "@/components/site/lead-form";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getVideoDetails } from "@/lib/utils";

export const Route = createFileRoute("/curriculum/$slug")({
  loader: async ({ params }) => {
    const course = await getCourse({ data: { slug: params.slug } });
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.course;
    return {
      meta: [
        { title: c ? `${c.name} — Zahau Music School` : "Course" },
        { name: "description", content: c?.summary ?? "" },
        { property: "og:title", content: c?.name ?? "" },
        { property: "og:description", content: c?.summary ?? "" },
        { property: "og:type", content: "article" },
      ],
      links: c ? [{ rel: "canonical", href: `/curriculum/${c.slug}` }] : [],
      scripts: c
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Course",
                name: c.name,
                description: c.summary,
                provider: { "@type": "EducationalOrganization", name: "Zahau Music School" },
              }),
            },
          ]
        : [],
    };
  },
  component: CoursePage,
  errorComponent: ({ error }) => <div className="p-16 text-center">{error.message}</div>,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <h1 className="font-display text-4xl uppercase">Course not found</h1>
      <Link to="/curriculum" className="mt-6 inline-block underline">
        Back to curriculum
      </Link>
    </div>
  ),
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  const c = course!;
  const videoDetails = getVideoDetails(c.video_url);
  const curriculum = (Array.isArray(c.curriculum) ? c.curriculum : []) as {
    term: string;
    topics: string[];
  }[];
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(err => console.error("Supabase auth session fetch failed:", err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            to="/curriculum"
            className="font-mono text-[11px] uppercase tracking-widest text-[#d4af37] hover:text-white transition-colors"
          >
            ← Back to curriculum
          </Link>
          <h1 className="mt-6 font-display text-6xl md:text-8xl uppercase leading-none font-extrabold tracking-tight">
            {c.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70 font-light leading-relaxed">{c.tagline}</p>
          <div className="mt-10 flex flex-wrap gap-2">
            {(c.levels ?? []).map((l: string) => (
              <span
                key={l}
                className="text-[9px] font-mono uppercase tracking-widest border border-white/20 px-3 py-1.5 rounded-lg"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-[2fr_1fr] gap-16 relative">
        <div className="glowing-blob top-1/2 right-10 w-[300px] h-[300px]" />
        
        <div className="relative z-10">
          <span className="font-mono text-[11px] uppercase tracking-widest text-azure font-bold">Overview</span>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">About this course</h2>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed font-light">{c.summary}</p>

          {c.video_url && (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl aspect-video max-w-2xl hover:border-azure/60 transition-all duration-300">
              {videoDetails.type === "youtube" || videoDetails.type === "vimeo" ? (
                <iframe
                  src={videoDetails.embedUrl || ""}
                  title={`${c.name} course introduction`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={c.video_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
          )}

          <h3 className="mt-20 font-display text-3xl font-extrabold uppercase tracking-tight">Curriculum</h3>
          <div className="mt-12 relative border-l border-border/80 ml-3 pl-8 space-y-12">
            {curriculum.length === 0 && (
              <p className="text-muted-foreground -ml-8 font-light text-sm">Curriculum details available on request.</p>
            )}
            {curriculum.map((term, i) => (
              <div key={i} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[42px] top-1.5 size-6 rounded-full bg-background border-2 border-azure flex items-center justify-center group-hover:bg-azure transition-all duration-500 shadow-sm shadow-azure/20">
                  <div className="size-2 rounded-full bg-azure group-hover:bg-background transition-all duration-500" />
                </div>
                
                <div>
                  <span className="font-mono text-[9px] text-azure uppercase tracking-widest font-bold bg-azure/10 dark:bg-azure/5 border border-azure/20 px-3 py-1.5 rounded-lg">
                    {term.term}
                  </span>
                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    {term.topics.map((t) => (
                      <div
                        key={t}
                        className="bg-card/40 dark:bg-card/25 border border-border/80 px-4 py-3.5 rounded-xl text-sm text-foreground/80 hover:border-azure/60 hover:bg-muted/10 transition-all duration-300 font-light flex items-center gap-2.5"
                      >
                        <span className="size-1.5 rounded-full bg-azure shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {c.outcomes && c.outcomes.length > 0 && (
            <>
              <h3 className="mt-20 font-display text-3xl font-extrabold uppercase tracking-tight">You'll be able to</h3>
              <ul className="mt-8 grid sm:grid-cols-2 gap-4">
                {c.outcomes.map((o: string) => (
                  <li key={o} className="border border-border/80 bg-card/40 dark:bg-card/25 px-5 py-4 rounded-xl text-sm font-light flex items-start gap-3">
                    <span className="text-azure font-bold shrink-0">✓</span>
                    <span className="text-muted-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="space-y-8 relative z-10">
          <div className="glass-panel border border-border/60 p-8 rounded-2xl hover-glow">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              Duration
            </span>
            <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-gradient-azure">{c.duration}</p>
          </div>
          
          {c.certification && (
            <div className="glass-panel border border-border/60 p-8 rounded-2xl hover-glow">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                Certification
              </span>
              <p className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-gradient-azure">{c.certification}</p>
            </div>
          )}
          
          {isAdmin ? (
            <div className="glass-panel border border-azure/40 bg-card p-8 rounded-2xl shadow-xl">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">Console</h3>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed font-light">
                You are viewing this course details page as an administrator.
              </p>
              <Link
                to="/dashboard"
                className="mt-6 w-full text-center inline-block bg-azure text-azure-foreground py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-azure/80 shadow-md shadow-azure/10 transition-all rounded-xl cursor-pointer"
              >
                Go to Console
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-navy to-slate-900 text-white p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="glowing-blob top-0 right-0 w-[200px] h-[200px]" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight">Enroll</h3>
                <p className="mt-3 text-sm text-white/70 font-light leading-relaxed">
                  Submit a quick interest form and we'll schedule a free trial class within 48 hours.
                </p>
                <Link
                  to="/contact"
                  className="mt-8 w-full text-center inline-block bg-azure text-azure-foreground py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-azure/20 cursor-pointer"
                >
                  Book trial class
                </Link>
              </div>
            </div>
          )}
        </aside>
      </section>

      {!isAdmin && (
        <section className="bg-secondary/20 py-24 px-6 border-t border-border/40 relative overflow-hidden">
          <div className="glowing-blob-gold top-1/4 left-1/4 w-[400px] h-[400px]" />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <h3 className="font-display text-4xl font-extrabold uppercase tracking-tight text-center">Have questions about {c.name}?</h3>
            <p className="mt-4 text-muted-foreground font-light text-center">
              Tell us your goals and we'll reply within one business day.
            </p>
            <div className="mt-10 glass-panel border border-border/60 p-8 rounded-2xl shadow-xl bg-background/50">
              <LeadForm source={`course-${c.slug}`} courseInterest={c.name} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
