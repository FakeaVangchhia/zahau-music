import { createFileRoute } from "@tanstack/react-router";
import acousticConcert from "@/assets/gallery/acoustic-concert.jpg";
import guitarShowcase from "@/assets/gallery/guitar-showcase.jpg";
import pianoRecital from "@/assets/gallery/piano-recital.jpg";
import studioSession from "@/assets/gallery/studio-session.jpg";
import electricGuitars from "@/assets/gallery/electric-guitars.png";
import guitarPractice from "@/assets/gallery/guitar-practice.jpg";
import pianoDuet from "@/assets/gallery/piano-duet.jpg";
import onlineClass from "@/assets/gallery/online-class.png";
import republicDayPoster from "@/assets/gallery/republic-day-poster.jpg";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  { src: acousticConcert, label: "Live Acoustic Concert", cat: "Concert" },
  { src: guitarShowcase, label: "Guitar Workshop & Training", cat: "Class" },
  { src: pianoRecital, label: "Classical Piano Recital", cat: "Recital" },
  { src: studioSession, label: "Music Production & Drum Practice", cat: "Studio" },
  { src: electricGuitars, label: "Faculty Guitar Showcase", cat: "Performance" },
  { src: guitarPractice, label: "Classical Guitar Studio Practice", cat: "Studio" },
  { src: pianoDuet, label: "One-on-One Piano Instruction", cat: "Class" },
  { src: onlineClass, label: "Interactive Online Keyboard Class", cat: "Class" },
  { src: republicDayPoster, label: "Republic Day Live Event", cat: "Concert" },
];

function Gallery() {
  const [filter, setFilter] = useState("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories = ["All", "Concert", "Class", "Recital", "Studio", "Performance"];
  const filteredItems = filter === "All" ? ITEMS : ITEMS.filter((item) => item.cat === filter);

  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Gallery</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            Moments
            <br />
            on stage.
          </h1>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 px-6 max-w-7xl mx-auto flex flex-wrap gap-2 justify-center border-b border-border/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilter(cat);
              setActiveIndex(null);
            }}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 rounded-xl cursor-pointer ${
              filter === cat
                ? "bg-azure text-azure-foreground border-azure"
                : "border-border hover:border-azure/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "All" ? "All" : cat === "Class" ? "Classes" : `${cat}s`}
          </button>
        ))}
      </section>

      {/* Grid of Images */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, idx) => (
            <figure
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="group relative overflow-hidden bg-secondary aspect-[4/3] rounded-xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 animate-slide-up"
            >
              <img
                src={item.src}
                alt={item.label}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-0 bg-navy/80 text-navy-foreground opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <span className="font-mono text-[10px] uppercase tracking-widest text-azure">
                  {item.cat}
                </span>
                <span className="mt-2 font-display text-xl uppercase leading-tight">{item.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Image Lightbox Dialog */}
      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-0 flex flex-col justify-center items-center h-[75vh] sm:h-[80vh] rounded-2xl shadow-2xl">
          {activeIndex !== null && filteredItems[activeIndex] && (
            <div className="relative size-full flex items-center justify-center p-4">
              <img
                src={filteredItems[activeIndex].src}
                alt={filteredItems[activeIndex].label}
                className="max-h-[85%] max-w-full object-contain rounded-lg animate-fade-in"
              />

              {/* Title & Caption */}
              <div className="absolute bottom-6 left-6 text-white text-left z-10 bg-black/60 p-4 rounded-xl backdrop-blur-md max-w-sm border border-white/10 hidden sm:block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-azure">
                  {filteredItems[activeIndex].cat}
                </span>
                <h4 className="font-display text-xl uppercase mt-1 leading-tight">
                  {filteredItems[activeIndex].label}
                </h4>
              </div>

              {/* Chevron Navigation */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-all duration-200"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

