import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessons } from "@/lib/site.functions";
import { Video, ExternalLink, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Recorded Courses & Lessons — Zahau Music School" },
      {
        name: "description",
        content: "Access video lessons, learning resources, and sheet music uploaded by Zahau Music School faculty.",
      },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: Courses,
});

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

function Courses() {
  const fetchLessons = useServerFn(getLessons);
  const { data, isLoading } = useQuery({ 
    queryKey: ["lessons-all"], 
    queryFn: () => fetchLessons() 
  });
  const lessons = data ?? [];

  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Video Portal</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Recorded
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">lessons.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-white/70 text-lg font-light leading-relaxed">
            Explore video materials, practice assignments, and supplementary downloads uploaded directly by your teachers.
          </p>
        </div>
      </section>
      
      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 right-10 w-[350px] h-[350px]" />
        
        {isLoading && (
          <p className="text-muted-foreground font-mono text-sm">Loading course lessons...</p>
        )}
        
        {!isLoading && lessons.length === 0 && (
          <p className="text-muted-foreground font-mono text-sm">No course uploads available at this time. Check back soon.</p>
        )}
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {lessons.map((l) => {
            const embedUrl = getYouTubeEmbedUrl(l.video_url);
            
            return (
              <article key={l.id} className="glass-panel border border-border/60 hover-glow p-8 rounded-3xl flex flex-col justify-between group">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold flex items-center gap-1.5">
                    <Video className="size-3" /> Video Lesson
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">{l.title}</h3>
                  {l.description && (
                    <p className="mt-4 text-muted-foreground text-sm leading-relaxed font-light">{l.description}</p>
                  )}
                  
                  {embedUrl && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border/40 bg-slate-950 aspect-video shadow-lg relative group/video">
                      <iframe
                        src={embedUrl}
                        title={l.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0 relative z-10"
                      />
                    </div>
                  )}
                </div>
                
                {l.link_url && (
                  <div className="mt-8 pt-6 border-t border-border/40 flex justify-between items-center">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <FileText className="size-4 text-azure" />
                      <span>Supplementary Materials</span>
                    </span>
                    <a
                      href={l.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-azure/10 hover:bg-azure text-azure hover:text-azure-foreground px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
