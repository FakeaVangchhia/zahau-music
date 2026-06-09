import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Zahau Music School" },
      { name: "description", content: "Insights on music education, practice, and performance from Zahau's faculty." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

const POSTS = [
  { slug: "how-to-practice", title: "How to practice (without quitting)", excerpt: "Twenty minutes a day, the right way, beats two hours of frustration. Here's how faculty structure their own practice.", date: "2026-05-12", author: "Henry Jahau" },
  { slug: "choosing-first-instrument", title: "Choosing your first instrument", excerpt: "Posture, attention span, room acoustics — the practical questions parents never think to ask.", date: "2026-04-28", author: "Faculty Desk" },
  { slug: "stage-fright", title: "Stage fright is a craft, not a curse", excerpt: "Why the best performers are the ones who plan their nervousness, not the ones who avoid it.", date: "2026-03-15", author: "Henry Jahau" },
  { slug: "abrsm-prep", title: "The honest guide to ABRSM prep", excerpt: "What graders actually look for — and what students waste hours preparing.", date: "2026-02-02", author: "Faculty Desk" },
];

function BlogIndex() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Journal</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">Notes from<br />the faculty.</h1>
        </div>
      </section>
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="divide-y divide-border border-y border-border">
          {POSTS.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="block py-8 group">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(p.date).toLocaleDateString(undefined, { dateStyle: "long" })} · {p.author}</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl uppercase group-hover:text-azure transition-colors">{p.title}</h2>
              <p className="mt-3 text-muted-foreground">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
