import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, BookOpen, Calendar, ClipboardList, LogOut, Video, Clock } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useServerFn } from "@tanstack/react-start";
import { getUserDemoBookings, ensureAdminRole } from "@/lib/site.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Zahau Music School" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

const COURSES = [
  { name: "Piano", level: "Intermediate", progress: 62, next: "Sat · 4:30 PM · Studio A" },
  { name: "Music Theory", level: "Grade 4", progress: 41, next: "Wed · 6:00 PM · Online" },
];
const ASSIGNMENTS = [
  { c: "Piano", t: "Bach Invention No. 4 — RH only", due: "in 3 days" },
  { c: "Music Theory", t: "Cadence identification worksheet", due: "in 5 days" },
];
const EVENTS = [
  { t: "Spring Showcase 2026", w: "Kamani Auditorium · 21 days" },
  { t: "Junior Recital Night", w: "Campus · 40 days" },
];
const CERTS = [{ t: "ABRSM Theory Grade 3", d: "Issued Nov 2025" }];

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [demoBookings, setDemoBookings] = useState<any[]>([]);

  const fetchDemoBookings = useServerFn(getUserDemoBookings);
  const ensureAdmin = useServerFn(ensureAdminRole);

  useEffect(() => {
    // Clean up trailing hash (#) from URL if present (common after Google OAuth/Supabase redirects)
    if (typeof window !== "undefined" && (window.location.hash || window.location.href.endsWith("#"))) {
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
      window.history.replaceState(null, "", cleanUrl);
    }

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

        // Securely ensure admin role on database side if email matches
        const adminEmails = ["henrysui7@gmail.com", "fakeavangchhia@gmail.com"];
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
        }
      }
      setLoading(false);
    });
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
  if (role === "admin" || email.toLowerCase() === "henrysui7@gmail.com" || email.toLowerCase() === "fakeavangchhia@gmail.com") {
    return <AdminDashboard email={email} signOut={signOut} />;
  }

  const SCHEDULE = [
    { day: "Monday", time: "2:00 PM - 4:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
    { day: "Tuesday", time: "2:00 PM - 4:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
    { day: "Wednesday", time: "2:00 PM - 4:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
    { day: "Thursday", time: "2:00 PM - 4:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
    { day: "Friday", time: "2:00 PM - 4:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
    { day: "Saturday", time: "12:00 PM - 3:00 PM", mode: "Online", room: "Zoom Classroom", instructor: "Dr. Henery" },
  ];

  function parseDemoMessage(message: string | null) {
    if (!message) return null;
    const match = message.match(/Day:\s*([^,]+),\s*Time:\s*(.+)/i);
    if (match) {
      return {
        day: match[1].trim(),
        time: match[2].trim()
      };
    }
    return null;
  }

  // Otherwise, render the cleaned, high-contrast, LMS-style student portal
  return (
    <section className="bg-background min-h-[90vh] py-16 px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="glowing-blob top-1/4 left-1/4 w-[400px] h-[400px] opacity-10 pointer-events-none" />
      <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[350px] h-[350px] opacity-5 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 animate-page-transition">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/80 pb-8 mb-12">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-azure font-bold block mb-2">
              LMS Student Portal
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase font-extrabold text-foreground tracking-tight">
              Welcome back, <span className="text-azure font-serif normal-case italic font-light">{username}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 font-light">
              Registered student email: <span className="font-mono text-foreground/80 font-medium">{email}</span>
            </p>
          </div>
          
          <button
            onClick={signOut}
            className="self-start sm:self-center flex items-center gap-2 border border-border bg-card hover:bg-muted text-foreground px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm cursor-pointer"
          >
            <LogOut className="size-4 text-destructive" /> Sign out
          </button>
        </div>

        {/* LMS Grid Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Timetable/Schedule Panel */}
          <div className="md:col-span-2 space-y-6">
            {/* User's Booked Demo Session */}
            {demoBookings.length > 0 && (
              <div className="glass-panel border-2 border-azure/40 bg-azure/5 rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex items-center justify-between border-b border-azure/20 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-azure" />
                    <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                      Your Booked Demo Sessions
                    </h2>
                  </div>
                  <span className="bg-azure/20 text-azure border border-azure/30 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-4">
                  {demoBookings.map((booking) => {
                    const parsed = parseDemoMessage(booking.message);
                    return (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-azure/20 bg-azure/10"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-lg font-bold uppercase text-foreground">
                              {parsed ? parsed.day : "Scheduled Demo"}
                            </span>
                            {booking.course_interest && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-azure/25 text-azure px-2 py-0.5 rounded border border-azure/30">
                                {booking.course_interest}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                            <Clock className="size-4 text-azure" />
                            <span>{parsed ? parsed.time : "Pending Time"}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end text-right gap-1">
                          <span className="text-xs text-muted-foreground">
                            Instructor: <strong className="text-foreground font-medium">Dr. Henery</strong>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Booked: {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-panel border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-azure" />
                  <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                    Weekly Class Schedule
                  </h2>
                </div>
                <span className="bg-azure/10 text-azure border border-azure/20 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  Dr. Henery
                </span>
              </div>

              <div className="space-y-4">
                {SCHEDULE.map((item) => (
                  <div
                    key={item.day}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 shrink-0">
                        <span className="font-display text-base font-bold uppercase text-foreground">
                          {item.day}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                          <Clock className="size-3.5 text-azure" />
                          <span>{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-light">
                          Instructor: <strong className="text-foreground/80 font-medium">{item.instructor}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                        item.mode === "Online"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-azure/10 text-azure border-azure/20"
                      }`}>
                        {item.mode}
                      </span>
                      <span className="text-xs text-muted-foreground/80 font-light font-mono">
                        {item.room}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Profile Info Panel */}
          <div className="space-y-6">
            <div className="glass-panel border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
                <BookOpen className="size-5 text-azure" />
                <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                  Academic Status
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">
                    Student ID
                  </span>
                  <p className="text-sm font-mono text-foreground font-bold tracking-wider">
                    ZMS-2026-STU
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">
                    Enrolled Program
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    Without Base Certificate Course
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground block">
                    Delivery Format
                  </span>
                  <p className="text-sm text-foreground font-light font-semibold">
                    100% Online / Virtual
                  </p>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Attendance Rate</span>
                    <span className="font-mono font-bold text-azure">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Class Status</span>
                    <span className="font-mono font-bold text-emerald-500 uppercase">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-azure border-b border-border/40 pb-3 mb-4 font-bold">
        {icon} {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
