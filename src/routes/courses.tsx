import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessons } from "@/lib/site.functions";
import { Video, ExternalLink, Download, FileText, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getVideoDetails } from "@/lib/utils";

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

function Courses() {
  const fetchLessons = useServerFn(getLessons);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ 
    queryKey: ["lessons-all"], 
    queryFn: () => fetchLessons(),
    retry: 1, // Only retry once to fail fast if there's a network issue
  });
  const lessons = data ?? [];

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [creating, setCreating] = useState(false);

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

  async function handleVideoUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const maxBytes = 100 * 1024 * 1024; // 100MB
      if (file.size > maxBytes) {
        throw new Error("File size exceeds 100MB limit.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `lesson-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from("videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress: any) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        } as any);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      setVideoUrl(publicUrl);
      toast.success("Video uploaded to server storage successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload video file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleCreateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("lessons").insert([
        {
          title,
          description: description || null,
          video_url: videoUrl || null,
          link_url: linkUrl || null,
          display_order: Number(displayOrder || 1),
        },
      ]);

      if (error) throw error;

      toast.success("Lesson published successfully!");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setLinkUrl("");
      setDisplayOrder(lessons.length + 2);
      setShowUploadForm(false);

      // Invalidate React Query cache to fetch updated lessons feed
      queryClient.invalidateQueries({ queryKey: ["lessons-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create lesson");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm("Are you sure you want to delete this recorded lesson?")) return;
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Recorded lesson deleted.");
      queryClient.invalidateQueries({ queryKey: ["lessons-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lesson");
    }
  }

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

        {/* Admin Inline Creation Console */}
        {isAdmin && (
          <div className="mb-12 glass-card p-6 sm:p-8 rounded-3xl border border-azure/20 relative z-20 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-azure bg-azure/10 px-2 py-0.5 rounded font-bold">Admin Privileges</span>
                <h2 className="font-display text-2xl uppercase tracking-tight text-white font-extrabold mt-1.5">Faculty Video Panel</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Directly upload MP4/MOV files to Supabase Storage or paste external YouTube links.</p>
              </div>
              <button
                onClick={() => {
                  setShowUploadForm(!showUploadForm);
                  setDisplayOrder(lessons.length + 1);
                }}
                className="bg-azure hover:bg-azure/90 text-azure-foreground px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-azure/20"
              >
                {showUploadForm ? "Close Panel" : "Add Recorded Video"}
                <Plus className="size-4" />
              </button>
            </div>

            {showUploadForm && (
              <form onSubmit={handleCreateLesson} className="grid md:grid-cols-2 gap-6 animate-slide-up">
                {/* Title */}
                <div className="grid gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-[#060B18] border border-border/80 focus:border-azure rounded-xl p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. Introduction to Minor Keys"
                  />
                </div>

                {/* Display Order */}
                <div className="grid gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="bg-[#060B18] border border-border/80 focus:border-azure rounded-xl p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. 1"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-1.5 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Description / Details</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#060B18] border border-border/80 focus:border-azure rounded-xl p-3 text-sm text-white focus:outline-none"
                    placeholder="Provide short details or instructions for students..."
                  />
                </div>

                {/* Video URL Selection */}
                <div className="grid gap-4 md:col-span-2 border border-border/40 bg-card/20 p-5 rounded-2xl">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-azure flex items-center gap-1.5 font-bold">
                    <Video className="size-4" /> Lesson Video Link or File Upload
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Paste YouTube URL */}
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] text-slate-400 block">OPTION A: PASTE VIDEO URL</span>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-[#060B18] border border-border/80 focus:border-azure rounded-xl p-3 text-sm text-white focus:outline-none"
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-[9px] text-slate-500 font-mono">YouTube/Vimeo embed or direct video file url.</p>
                    </div>
                    {/* Upload File */}
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] text-slate-400 block">OPTION B: UPLOAD VIDEO FILE (MAX 100MB)</span>
                      <div className="relative border border-dashed border-border hover:border-azure/40 rounded-xl p-3 flex flex-col items-center justify-center bg-[#060B18]/50 hover:bg-[#060B18] transition-all min-h-[75px]">
                        {uploading ? (
                          <div className="flex flex-col items-center py-2 space-y-2 w-full">
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-azure h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-azure">Uploading: {uploadProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await handleVideoUpload(file);
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Plus className="size-4 text-slate-400 mb-1" />
                            <span className="text-[11px] font-semibold text-slate-300">Select MP4/MOV Video</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {videoUrl && (
                    <div className="text-xs bg-navy p-2.5 rounded-lg border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[9px] text-azure font-bold border border-azure/20 bg-azure/5 px-1.5 py-0.5 rounded">Active URL</span>
                        <span className="truncate font-mono text-slate-300 text-[11px]">{videoUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVideoUrl("")}
                        className="text-red-400 hover:text-red-300 font-mono font-bold text-xs px-2 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Supplementary Material Link */}
                <div className="grid gap-1.5 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Supplementary Material Link (e.g. Sheet Music PDF)</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="bg-[#060B18] border border-border/80 focus:border-azure rounded-xl p-3 text-sm text-white focus:outline-none"
                    placeholder="e.g. Google Drive Link or PDF URL"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-border/40">
                  <button
                    type="submit"
                    disabled={creating || uploading}
                    className="bg-azure hover:bg-azure/90 text-azure-foreground px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md shadow-azure/20"
                  >
                    {creating ? "Publishing..." : "Publish Lesson"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {isLoading && (
          <p className="text-muted-foreground font-mono text-sm animate-pulse">Loading course lessons...</p>
        )}

        {isError && (
          <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl text-center max-w-md mx-auto my-8 relative z-20">
            <p className="text-red-400 font-mono text-sm font-semibold">Failed to load recorded lessons.</p>
            <p className="text-xs text-slate-500 mt-2">The server took too long to connect to the database. Please verify your internet connection or refresh the page.</p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["lessons-all"] })}
              className="mt-4 bg-azure hover:bg-azure/90 text-white font-mono text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}
        
        {!isLoading && lessons.length === 0 && (
          <p className="text-muted-foreground font-mono text-sm">No course uploads available at this time. Check back soon.</p>
        )}
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          {lessons.map((l) => {
            const videoDetails = getVideoDetails(l.video_url);
            
            return (
              <article key={l.id} className="glass-panel border border-border/60 hover-glow p-8 rounded-3xl flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-azure font-bold flex items-center gap-1.5">
                      <Video className="size-3" /> Video Lesson
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">Order: {l.display_order ?? 0}</span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors">{l.title}</h3>
                  {l.description && (
                    <p className="mt-4 text-muted-foreground text-sm leading-relaxed font-light">{l.description}</p>
                  )}
                  
                  {l.video_url && (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border/40 bg-slate-950 aspect-video shadow-lg relative group/video">
                      {videoDetails.type === "youtube" || videoDetails.type === "vimeo" ? (
                        <iframe
                          src={videoDetails.embedUrl || ""}
                          title={l.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0 relative z-10"
                        />
                      ) : (
                        <video
                          src={l.video_url}
                          controls
                          className="w-full h-full relative z-10"
                        />
                      )}
                    </div>
                  )}
                </div>
                
                {(l.link_url || isAdmin) && (
                  <div className="mt-8 pt-6 border-t border-border/40 flex justify-between items-center flex-wrap gap-2">
                    {l.link_url ? (
                      <span className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <FileText className="size-4 text-azure" />
                        <span>Supplementary Materials</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-2">
                      {l.link_url && (
                        <a
                          href={l.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-azure/10 hover:bg-azure text-azure hover:text-azure-foreground px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteLesson(l.id)}
                          className="bg-red-950/20 hover:bg-red-900 border border-red-900/30 text-red-400 hover:text-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Delete</span>
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
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
