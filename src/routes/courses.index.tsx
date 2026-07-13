import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourses } from "@/lib/site.functions";
import { useState } from "react";
import { Search, Music, Guitar, Drum, Mic, BookOpen } from "lucide-react";

function getCourseIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("guitar") || s.includes("bass")) return <Guitar className="size-5" />;
  if (s.includes("drum")) return <Drum className="size-5" />;
  if (s.includes("voice") || s.includes("sing")) return <Mic className="size-5" />;
  if (s.includes("theory") || s.includes("composition")) return <BookOpen className="size-5" />;
  return <Music className="size-5" />;
}

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Zahau Music School" },
      {
        name: "description",
        content:
          "Piano, Keyboard, Guitar (Ukulele, Classical & Electric), Drum, Vocal Performance (Hindustani, Carnatic, Western) and Music Theory. Beginner to diploma.",
      },
      { property: "og:title", content: "Courses at Zahau Music School" },
      {
        property: "og:description",
        content: "Six disciplines, every level — including ABRSM and Trinity certifications.",
      },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesIndex,
});

function CoursesIndex() {
  const fetchCourses = useServerFn(getCourses);
  const { data, isLoading } = useQuery({
    queryKey: ["courses-all"],
    queryFn: () => fetchCourses(),
  });
  const [q, setQ] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const courses = (data ?? []).filter((c) => {
    const matchesQ =
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.tagline?.toLowerCase().includes(q.toLowerCase());
    const matchesLvl =
      selectedLevel === "All" ||
      (c.levels ?? []).some((l: string) => l.toLowerCase() === selectedLevel.toLowerCase());
    return matchesQ && matchesLvl;
  });

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
            Courses
          </span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Find your
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              instrument.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-navy-foreground/80 leading-relaxed font-light">
            Six disciplines, every level, one philosophy. Piano, Keyboard, Guitar, Drums, Vocal and
            Music Theory — from your very first lesson to professional diploma level.
          </p>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-6 justify-between relative z-10">
        <div className="flex items-center gap-3 border border-border/80 bg-card/50 px-4 py-3 rounded-xl max-w-md w-full focus-within:border-azure focus-within:ring-4 focus-within:ring-azure/10 transition-all duration-300">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search disciplines..."
            aria-label="Search courses"
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Beginner", "Intermediate", "Advanced", "Performance"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest border transition-all duration-300 rounded-xl cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-azure text-azure-foreground border-azure shadow-md shadow-azure/10"
                  : "border-border/80 hover:border-azure/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </section>

      {/* Grid of Courses */}
      <section className="px-6 max-w-7xl mx-auto pb-28 relative z-10">
        {isLoading && <p className="text-muted-foreground font-mono text-sm">Loading courses...</p>}
        {courses.length === 0 && !isLoading && (
          <p className="text-muted-foreground py-12 font-light text-center">
            No courses found matching criteria.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c, i) => (
            <Link
              key={c.id}
              to="/courses/$slug"
              params={{ slug: c.slug }}
              className="group bg-card/45 dark:bg-card/20 border border-border/60 hover-glow p-8 rounded-3xl min-h-[280px] flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-muted-foreground group-hover:text-azure transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="p-3 rounded-xl bg-azure/10 text-azure group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-300">
                  {getCourseIcon(c.slug)}
                </div>
              </div>
              <div>
                <h3 className="mt-10 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">
                  {c.name}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-light line-clamp-2">
                  {c.tagline}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {(c.levels ?? []).slice(0, 3).map((l: string) => (
                  <span
                    key={l}
                    className="text-[10px] font-mono uppercase tracking-widest border border-border text-muted-foreground px-2.5 py-1.5 rounded-md"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
