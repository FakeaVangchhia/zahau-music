import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Award,
  BookOpen,
  Calendar,
  LogOut,
  Video,
  Clock,
  LayoutDashboard,
  Search,
  Play,
  ExternalLink,
  Home,
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useServerFn } from "@tanstack/react-start";
import { getUserDemoBookings, ensureAdminRole } from "@/lib/site.functions";
import { getVideoDetails } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Zahau Music School" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [demoBookings, setDemoBookings] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "videos">("overview");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const fetchDemoBookings = useServerFn(getUserDemoBookings);
  const ensureAdmin = useServerFn(ensureAdminRole);

  useEffect(() => {
    // Clean up trailing hash (#) from URL if present (common after Google OAuth/Supabase redirects)
    const cleanHash = () => {
      if (typeof window !== "undefined") {
        const hasHash = window.location.href.includes("#");
        const hasOAuthHash =
          window.location.hash.includes("access_token") || window.location.hash.includes("error");
        if (hasHash && !hasOAuthHash) {
          const cleanUrl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname +
            window.location.search;
          window.history.replaceState(window.history.state, "", cleanUrl);
        }
      }
    };

    cleanHash();
    const hashTimer = setTimeout(cleanHash, 1000);

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const emailStr = data.user.email ?? "";
        setEmail(emailStr);

        // Extract full name from user_metadata or fallback to email prefix
        const fullName = data.user.user_metadata?.full_name;
        if (fullName) {
          setUsername(fullName);
        } else {
          // Capitalize email prefix
          const prefix = emailStr.split("@")[0];
          setUsername(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }

        const adminEmails = ["henrysui7@gmail.com"];
        let userRole = "";

        if (adminEmails.includes(emailStr.toLowerCase())) {
          try {
            await ensureAdmin({ data: { userId: data.user.id, email: emailStr } });
            userRole = "admin";
            setRole("admin");
          } catch (e) {
            console.error("Failed to automatically promote admin email:", e);
          }
        }

        if (!userRole) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();
          if (roleData) {
            setRole(roleData.role);
          }
        }

        // Fetch user's booked demos if student
        if (userRole !== "admin") {
          try {
            const bookings = await fetchDemoBookings({ data: emailStr });
            setDemoBookings(bookings || []);
          } catch (e) {
            console.error("Failed to load user demo bookings:", e);
          }

          // Fetch recorded class lessons/videos
          try {
            const { data: lessonsData } = await supabase
              .from("lessons")
              .select("*")
              .order("display_order", { ascending: true });
            setLessons(lessonsData || []);
          } catch (e) {
            console.error("Failed to load recorded lessons:", e);
          }

          // Fetch student enrollments
          try {
            const { data: enrollData } = await supabase
              .from("enrollments")
              .select("*, courses(name)")
              .eq("user_id", data.user.id);
            setEnrollments(enrollData || []);
          } catch (e) {
            console.error("Failed to load user enrollments:", e);
          }
        }
      }
      setLoading(false);
    });

    return () => clearTimeout(hashTimer);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure border-t-transparent" />
      </div>
    );
  }

  // If user is admin, render the professional admin console dashboard
  if (role === "admin" || email.toLowerCase() === "henrysui7@gmail.com") {
    return <AdminDashboard email={email} signOut={signOut} />;
  }

  function parseDemoMessage(message: string | null) {
    if (!message) return null;
    let day = "Scheduled Demo";
    let time = "Pending confirmation";
    let paymentId: string | null = null;

    // Extract Day
    const dayMatch = message.match(/Day:\s*([^,]+)/i);
    if (dayMatch) {
      day = dayMatch[1].trim();
    }

    // Extract Time
    const timeMatch = message.match(/Time:\s*([^.]+)/i);
    if (timeMatch) {
      time = timeMatch[1].trim();
    } else {
      const timeFallback = message.match(/Time:\s*([^|]+)/i);
      if (timeFallback) {
        time = timeFallback[1].trim();
      }
    }

    // Extract Payment ID
    const payMatch = message.match(/Payment ID:\s*([^\s]+)/i);
    if (payMatch) {
      paymentId = payMatch[1].trim();
      if (time.includes("Payment ID:")) {
        time = time.split("Payment ID:")[0].replace(/\.$/, "").trim();
      }
    }

    return { day, time, paymentId };
  }

  const studentNavTabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    {
      id: "schedule",
      label: "My Schedule",
      icon: <Calendar className="size-4" />,
      badge: demoBookings.length,
    },
    { id: "videos", label: "Course Videos", icon: <Video className="size-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col pt-0">
      {/* ===== STICKY TOP NAVBAR ===== */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        {/* Top row: brand + user actions */}
        <div className="flex items-center justify-between px-6 py-3 gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="font-display text-xl uppercase tracking-wider text-azure">
              Zahau Student
            </div>
            <span className="bg-azure/10 text-azure border border-azure/20 text-[9px] font-mono uppercase px-2 py-0.5 tracking-wider rounded">
              Portal
            </span>
          </div>

          {/* User info + Sign out */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-muted-foreground font-mono">Logged in as</p>
              <p className="text-xs text-foreground font-medium truncate max-w-[180px]">{email}</p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 border border-border/80 bg-muted/30 hover:bg-muted px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/85 rounded transition-all"
            >
              <Home className="size-3.5 text-azure" /> Website
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 border border-border/80 bg-muted/50 hover:bg-muted px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-foreground/85 rounded transition-all"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>

        {/* Tab Navigation Row — Centered on larger screens, scrollable on smaller screens */}
        <div className="border-t border-border/40 bg-card/40">
          <nav className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto scrollbar-none justify-start md:justify-center">
            {studentNavTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchTerm("");
                }}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap rounded-md group ${
                  activeTab === tab.id
                    ? "text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {"badge" in tab && (tab as any).badge > 0 && (
                  <span className="ml-1 bg-azure/10 text-azure text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {(tab as any).badge}
                  </span>
                )}
                {/* Active indicator underline */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all ${
                    activeTab === tab.id ? "bg-azure" : "bg-transparent group-hover:bg-muted/65"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 sm:px-10 py-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Welcome Header */}
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-azure font-bold block mb-2">
                    LMS Student Portal
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl uppercase font-extrabold text-foreground tracking-tight">
                    Welcome back,{" "}
                    <span className="text-azure font-serif normal-case italic font-light">
                      {username}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5 font-light">
                    Registered student email:{" "}
                    <span className="font-mono text-foreground/80 font-medium">{email}</span>
                  </p>
                </div>

                {/* Academic Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-card border border-border/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.01] transition-all shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Student ID
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-foreground">
                      ZMS-2026-STU
                    </span>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.01] transition-all shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Enrolled Program
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug truncate">
                      {enrollments.length > 0
                        ? enrollments.map((e) => e.courses?.name).join(", ")
                        : "Without Base Certificate Course"}
                    </span>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.01] transition-all shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Attendance Rate
                    </span>
                    <span className="font-display text-3xl sm:text-4xl text-azure font-bold">
                      100%
                    </span>
                  </div>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-32 hover:scale-[1.01] transition-all shadow-sm">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Class Status
                    </span>
                    <div>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booked Demo Session */}
                {demoBookings.length > 0 && (
                  <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                      <Calendar className="size-5 text-azure" />
                      <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                        Your Booked Demo Sessions
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {demoBookings.map((booking) => {
                        const parsed = parseDemoMessage(booking.message);
                        return (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-5 rounded-xl border border-azure/20 bg-azure/5"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-display text-base font-bold uppercase text-foreground">
                                  {parsed ? parsed.day : "Scheduled Demo"}
                                </span>
                                {booking.course_interest && (
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-azure/20 text-azure px-2.5 py-0.5 rounded border border-azure/25">
                                    {booking.course_interest}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                <Clock className="size-3.5 text-azure" />
                                <span>{parsed ? parsed.time : "Pending Time"}</span>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-[10px] text-muted-foreground block">
                                Instructor: Dr. Henry
                              </span>
                              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                                Confirmed
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MY SCHEDULE */}
            {activeTab === "schedule" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-display text-3xl uppercase text-foreground">My Schedule</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Review your personalized scheduled demo sessions and timeslots.
                    </p>
                  </div>
                  <Link
                    to="/book-demo"
                    className="bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-azure/20 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  >
                    Book More
                  </Link>
                </div>

                {demoBookings.length === 0 ? (
                  <div className="bg-card border border-border/60 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
                    <div className="size-16 rounded-full bg-azure/10 flex items-center justify-center mx-auto border border-azure/20">
                      <Calendar className="size-8 text-azure" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        No Scheduled Sessions
                      </h3>
                      <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
                        You do not have any scheduled classes or demo sessions at the moment. Book a
                        demo session to get started with your musical journey!
                      </p>
                    </div>
                    <Link
                      to="/book-demo"
                      className="inline-flex bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-azure/20 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Book a Demo Session
                    </Link>
                  </div>
                ) : (
                  <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                            <th className="p-4 font-semibold">Scheduled Day</th>
                            <th className="p-4 font-semibold">Time Slot</th>
                            <th className="p-4 font-semibold">Subject / Interest</th>
                            <th className="p-4 font-semibold">Instructor</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Payment ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {demoBookings.map((booking) => {
                            const parsed = parseDemoMessage(booking.message);
                            return (
                              <tr key={booking.id} className="hover:bg-muted/10 text-foreground/85">
                                <td className="p-4 font-semibold text-foreground font-display text-sm">
                                  {parsed ? parsed.day : "Scheduled Demo"}
                                </td>
                                <td className="p-4 font-mono text-foreground font-medium">
                                  {parsed ? parsed.time : "Pending confirmation"}
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-azure/10 text-azure border-azure/20">
                                    {booking.course_interest || "Music Demo"}
                                  </span>
                                </td>
                                <td className="p-4 text-muted-foreground">Dr. Henry</td>
                                <td className="p-4">
                                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse">
                                    Confirmed
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-xs text-muted-foreground/80">
                                  {parsed?.paymentId ? (
                                    <span className="bg-muted/60 dark:bg-card/40 px-2.5 py-1 rounded border border-border/40 text-foreground/80 text-[11px] font-mono select-all">
                                      {parsed.paymentId}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/40 italic">N/A</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: COURSE VIDEOS */}
            {activeTab === "videos" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="font-display text-3xl uppercase text-foreground">
                      Course Videos
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Access uploaded recorded lessons, practice guides, and video content.
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                    <input
                      type="text"
                      placeholder="Search tutorials by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-card border border-border/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                    />
                  </div>
                </div>

                {lessons.length === 0 ? (
                  <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center text-muted-foreground text-sm">
                    No course videos have been uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons
                      .filter(
                        (lesson) =>
                          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lesson.description || "")
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-azure/30 hover:scale-[1.01] transition-all duration-300"
                        >
                          <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-azure/10 flex items-center justify-center border border-azure/20 shrink-0">
                                <Play className="size-4 text-azure fill-azure" />
                              </div>
                              <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-light line-clamp-3">
                              {lesson.description || "No description provided."}
                            </p>
                          </div>

                          <div className="px-6 py-4 bg-muted/30 border-t border-border/40 flex items-center justify-between gap-4">
                            <span className="text-[10px] font-mono text-muted-foreground font-medium">
                              Order: #{lesson.display_order}
                            </span>
                            <div className="flex gap-2">
                              {lesson.link_url && (
                                <a
                                  href={lesson.link_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 border border-border bg-card hover:bg-muted text-foreground/80 hover:text-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Resources <ExternalLink className="size-3" />
                                </a>
                              )}
                              {lesson.video_url && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveVideo({
                                      url: lesson.video_url || "",
                                      title: lesson.title,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-azure hover:bg-azure/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-azure/10 cursor-pointer"
                                >
                                  Watch Video
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== OVERLAY VIDEO PLAYER MODAL ===== */}
      {activeVideo && activeVideo.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col relative">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/50 hover:bg-black/85 text-white flex items-center justify-center font-mono text-sm transition-all focus:outline-none cursor-pointer"
              aria-label="Close video player"
            >
              ✕
            </button>

            {/* Video Title */}
            <div className="bg-muted/40 px-6 py-4 border-b border-border/60">
              <h3 className="font-display text-lg font-bold text-foreground truncate pr-8">
                {activeVideo.title || "Watch Lesson Video"}
              </h3>
            </div>

            {/* Aspect Ratio Video Container */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const details = getVideoDetails(activeVideo.url);
                if (details.type === "youtube" && details.embedUrl) {
                  return (
                    <iframe
                      src={`${details.embedUrl}?autoplay=1`}
                      title={activeVideo.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else if (details.type === "vimeo" && details.embedUrl) {
                  return (
                    <iframe
                      src={`${details.embedUrl}&autoplay=1`}
                      title={activeVideo.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <video
                      src={activeVideo.url}
                      controls
                      autoPlay
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
