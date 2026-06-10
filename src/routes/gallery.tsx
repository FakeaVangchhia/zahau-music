import { createFileRoute } from "@tanstack/react-router";
import campusImg from "@/assets/about-campus.jpg";
import heroPiano from "@/assets/hero-piano.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Zahau Music School" },
      {
        name: "description",
        content: "Photos and videos from concerts, recitals, studio sessions and our Delhi campus.",
      },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const ITEMS = [
  { src: heroPiano, label: "Spring Concert, Kamani Auditorium", cat: "Concert" },
  { src: campusImg, label: "Junior ensemble · Studio A", cat: "Class" },
  { src: heroPiano, label: "Piano recital · Term 4", cat: "Recital" },
  { src: campusImg, label: "Production weekend", cat: "Studio" },
  { src: heroPiano, label: "Faculty showcase", cat: "Concert" },
  { src: campusImg, label: "Open mic night", cat: "Performance" },
];

function Gallery() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Gallery</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            Moments
            <br />
            on stage.
          </h1>
        </div>
      </section>
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {ITEMS.map((i, idx) => (
            <figure key={idx} className="group relative overflow-hidden bg-secondary aspect-[4/3]">
              <img
                src={i.src}
                alt={i.label}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-0 bg-navy/70 text-navy-foreground opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <span className="font-mono text-[10px] uppercase tracking-widest text-azure">
                  {i.cat}
                </span>
                <span className="mt-2 font-display text-xl uppercase">{i.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
