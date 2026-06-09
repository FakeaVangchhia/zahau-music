import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourses } from "@/lib/site.functions";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Zahau Music School" },
      { name: "description", content: "Piano, keyboard, guitar, bass, drums, violin, voice, and music theory. Beginner to performance certification." },
      { property: "og:title", content: "Courses at Zahau Music School" },
      { property: "og:description", content: "Eight disciplines, every level, ABRSM and Trinity certifications." },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesIndex,
});

function CoursesIndex() {
  const fetchCourses = useServerFn(getCourses);
  const { data, isLoading } = useQuery({ queryKey: ["courses-all"], queryFn: () => fetchCourses() });
  const [q, setQ] = useState("");
  const courses = (data ?? []).filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.tagline?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Curriculum</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">Find your<br />instrument.</h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
            Eight disciplines, four levels, one philosophy. Whether you're picking up your first instrument or preparing for international certification, there's a path designed for you.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 border border-border bg-card px-4 py-3 max-w-md">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            aria-label="Search courses"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </section>

      <section className="px-6 max-w-7xl mx-auto pb-24">
        {isLoading && <p className="text-muted-foreground">Loading courses…</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {courses.map((c, i) => (
            <Link
              key={c.id}
              to="/courses/$slug"
              params={{ slug: c.slug }}
              className="group bg-background p-8 hover:bg-navy hover:text-navy-foreground transition-colors min-h-[260px] flex flex-col"
            >
              <div className="flex justify-between">
                <span className="font-mono text-xs text-muted-foreground group-hover:text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <div className="w-8 h-px bg-border group-hover:bg-azure mt-2" />
              </div>
              <h3 className="mt-10 font-display text-3xl uppercase">{c.name}</h3>
              <p className="mt-3 text-sm opacity-70 flex-1">{c.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(c.levels ?? []).slice(0, 3).map((l: string) => (
                  <span key={l} className="text-[10px] font-mono uppercase tracking-widest border border-current/30 px-2 py-1">{l}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
