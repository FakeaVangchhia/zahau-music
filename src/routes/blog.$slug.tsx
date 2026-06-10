import { createFileRoute, Link, notFound } from "@tanstack/react-router";

const POSTS: Record<string, { title: string; date: string; author: string; body: string[] }> = {
  "how-to-practice": {
    title: "How to practice (without quitting)",
    date: "2026-05-12",
    author: "Henry Jahau",
    body: [
      "Most students don't quit because they lack talent. They quit because they practice in a way that punishes them every time they sit down.",
      "Start with twenty minutes. Open your case, tune, and play one phrase — slowly — until it sounds the way you want. Then stop. That's a practice session. Tomorrow, you'll want to do it again.",
      "When you're ready for more, the structure is: five minutes of fundamentals, ten minutes of your current piece (one section, not the whole thing), and five minutes of just playing for fun. That's it.",
      "Two hours of guilt-ridden, unfocused practice will set you back further than skipping a day entirely. Be honest with your attention. Music will repay you for it.",
    ],
  },
  "choosing-first-instrument": {
    title: "Choosing your first instrument",
    date: "2026-04-28",
    author: "Faculty Desk",
    body: [
      "Parents usually ask us which instrument is easiest. We never answer that. We ask: how loud is your home, how patient is your child, and what music makes them sit very still?",
      "An eight-year-old who lights up at film scores wants piano or violin. The same age who taps their foot through every song is a drummer. Don't fight the signal.",
      "Practical notes: piano needs the most floor space; drums need the most ear-protection from siblings; violin needs the most patience in the first year. None of those are reasons to avoid them — just things to plan for.",
    ],
  },
  "stage-fright": {
    title: "Stage fright is a craft, not a curse",
    date: "2026-03-15",
    author: "Henry Jahau",
    body: [
      "The myth: confident performers don't get nervous. The truth: every concert violinist I've ever shared a green room with has shaking hands ten minutes before the downbeat.",
      "What separates them is not absence of fear. It's a routine. They know what they're going to eat, when they're going to warm up, what scale they'll play last, and what they'll think about as they walk on.",
      "Build your routine in lessons, not on the day. Make stage fright a craft you rehearse, and it stops being a curse.",
    ],
  },
  "abrsm-prep": {
    title: "The honest guide to ABRSM prep",
    date: "2026-02-02",
    author: "Faculty Desk",
    body: [
      "ABRSM examiners are not trying to catch you out. They're listening for musicality, control, and accuracy — in that order. Most students prepare in the opposite order.",
      "Spend the first half of your prep on the easiest piece in your list, until it sings. Then move to scales. Then sight-reading. Save the technically hardest piece for last — by then, your hands will be ready for it.",
      "Aural is the smallest section by marks but the easiest to gain points in. Don't skip it.",
    ],
  },
};

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS[params.slug];
    if (!post) throw notFound();
    return { post, slug: params.slug };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.post.title} — Zahau Journal` : "Post" },
      { name: "description", content: loaderData?.post.body[0] ?? "" },
      { property: "og:title", content: loaderData?.post.title ?? "" },
      { property: "og:description", content: loaderData?.post.body[0] ?? "" },
      { property: "og:type", content: "article" },
    ],
    links: loaderData ? [{ rel: "canonical", href: `/blog/${loaderData.slug}` }] : [],
  }),
  component: Post,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <h1 className="font-display text-4xl uppercase">Post not found</h1>
      <Link to="/blog" className="mt-6 inline-block underline">
        Back to all posts
      </Link>
    </div>
  ),
});

function Post() {
  const { post } = Route.useLoaderData();
  return (
    <article className="py-24 px-6 max-w-3xl mx-auto">
      <Link to="/blog" className="font-mono text-[10px] uppercase tracking-widest text-azure">
        ← Journal
      </Link>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {new Date(post.date).toLocaleDateString(undefined, { dateStyle: "long" })} · {post.author}
      </p>
      <h1 className="mt-4 font-display text-5xl md:text-6xl uppercase leading-none">
        {post.title}
      </h1>
      <div className="mt-12 space-y-6 text-lg text-foreground/90 leading-relaxed">
        {post.body.map((p: string, i: number) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}
