import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getEvents } from "@/lib/site.functions";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Zahau Music School" },
      { name: "description", content: "Concerts, student recitals, masterclasses and workshops at Zahau Music School." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

function Events() {
  const fn = useServerFn(getEvents);
  const { data } = useQuery({ queryKey: ["events"], queryFn: () => fn() });
  const events = data ?? [];

  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Calendar</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">Stage<br />time.</h1>
          <p className="mt-8 max-w-2xl text-white/70 text-lg">Public recitals, concerts, workshops and masterclasses. Everyone welcome.</p>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {events.length === 0 && <p className="text-muted-foreground">No upcoming events. Check back soon.</p>}
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          {events.map((e) => (
            <article key={e.id} className="bg-background p-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-azure">{e.event_type}</span>
              <h3 className="mt-4 font-display text-3xl uppercase">{e.title}</h3>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{e.description}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Calendar className="size-3.5" /> {new Date(e.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                {e.location && <span className="inline-flex items-center gap-2"><MapPin className="size-3.5" /> {e.location}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
