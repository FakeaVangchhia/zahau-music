import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCourse } from "@/lib/site.functions";
import { LeadForm } from "@/components/site/lead-form";

export const Route = createFileRoute("/courses/$slug")({
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
      links: c ? [{ rel: "canonical", href: `/courses/${c.slug}` }] : [],
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
      <Link to="/courses" className="mt-6 inline-block underline">
        Back to all courses
      </Link>
    </div>
  ),
});

function CoursePage() {
  const { course } = Route.useLoaderData();
  const c = course!;
  const curriculum = (Array.isArray(c.curriculum) ? c.curriculum : []) as {
    term: string;
    topics: string[];
  }[];

  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/courses"
            className="font-mono text-[10px] uppercase tracking-widest text-azure hover:text-white"
          >
            ← All courses
          </Link>
          <h1 className="mt-6 font-display text-6xl md:text-8xl uppercase leading-none">
            {c.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">{c.tagline}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {(c.levels ?? []).map((l: string) => (
              <span
                key={l}
                className="text-xs font-mono uppercase tracking-widest border border-white/30 px-3 py-2"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-[2fr_1fr] gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-azure">Overview</p>
          <h2 className="mt-3 font-display text-4xl uppercase">About this course</h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{c.summary}</p>

          <h3 className="mt-16 font-display text-3xl uppercase">Curriculum</h3>
          <div className="mt-8 space-y-6">
            {curriculum.length === 0 && (
              <p className="text-muted-foreground">Curriculum details available on request.</p>
            )}
            {curriculum.map((term, i) => (
              <div key={i} className="border-l-2 border-azure pl-6">
                <span className="font-mono text-azure text-sm">{term.term}</span>
                <ul className="mt-3 space-y-1.5">
                  {term.topics.map((t) => (
                    <li key={t} className="text-sm text-muted-foreground">
                      — {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {c.outcomes && c.outcomes.length > 0 && (
            <>
              <h3 className="mt-16 font-display text-3xl uppercase">You'll be able to</h3>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {c.outcomes.map((o: string) => (
                  <li key={o} className="border border-border bg-card px-4 py-3 text-sm">
                    ✓ {o}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="space-y-8">
          <div className="bg-secondary p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Duration
            </p>
            <p className="mt-2 font-display text-2xl uppercase">{c.duration}</p>
          </div>
          {c.certification && (
            <div className="bg-secondary p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Certification
              </p>
              <p className="mt-2 font-display text-2xl uppercase">{c.certification}</p>
            </div>
          )}
          <div className="bg-navy text-navy-foreground p-6">
            <h3 className="font-display text-2xl uppercase">Enroll</h3>
            <p className="mt-2 text-sm text-white/70">
              Submit a quick interest form and we'll schedule a free trial class within 48 hours.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-block bg-azure text-azure-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest"
            >
              Book trial class
            </Link>
          </div>
        </aside>
      </section>

      <section className="bg-secondary py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-display text-4xl uppercase">Have questions about {c.name}?</h3>
          <p className="mt-3 text-muted-foreground">
            Tell us your goals and we'll reply within one business day.
          </p>
          <div className="mt-8 bg-background p-8">
            <LeadForm source={`course-${c.slug}`} courseInterest={c.name} />
          </div>
        </div>
      </section>
    </>
  );
}
