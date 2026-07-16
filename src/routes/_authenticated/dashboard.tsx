import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
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
  Check,
  CheckCircle2,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getUserDemoBookings, ensureAdminRole, getFees } from "@/lib/site.functions";
import { getVideoDetails } from "@/lib/utils";
import { normalizeFeePackages, FALLBACK_PACKAGES, type FeePackage } from "@/lib/fee-packages";
import { EnrollmentCheckoutModal } from "@/components/site/enrollment-checkout-modal";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  link_url: string | null;
  display_order: number | null;
  created_at: string;
};

type Enrollment = {
  id: string;
  progress: number | null;
  status: string | null;
  package_title: string | null;
  instrument: string | null;
  amount_paid: number | null;
  payment_id: string | null;
  enrolled_at: string | null;
  courses: { name: string | null; duration: string | null } | null;
};

type DemoBooking = {
  id: string;
  message: string | null;
  course_interest: string | null;
};

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
  const [loading, setLoading] = useState(true);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "purchase" | "courses" | "lessons">(
    "overview",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const fetchDemoBookings = useServerFn(getUserDemoBookings);
  const ensureAdmin = useServerFn(ensureAdminRole);
  const fetchFees = useServerFn(getFees);

  const { data: feesData } = useQuery({ queryKey: ["fees-all"], queryFn: () => fetchFees() });

  const [activeEnroll, setActiveEnroll] = useState<{
    plan: FeePackage;
    instrument: string;
    session: Session;
  } | null>(null);

  const normalizedPackages =
    feesData && feesData.length > 0 ? normalizeFeePackages(feesData) : FALLBACK_PACKAGES;

  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) / enrollments.length)
      : 0;

  const filteredLessons = lessons.filter((lesson) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(term) ||
      (lesson.description ?? "").toLowerCase().includes(term)
    );
  });

  const handleEnrollClick = async (pkg: FeePackage) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to complete your enrollment.");
      return;
    }
    setActiveEnroll({ plan: pkg, instrument: "Piano", session });
  };

  async function refreshEnrollments(userId: string) {
    const { data: enrollData } = await supabase
      .from("enrollments")
      .select("*, courses(name, duration)")
      .eq("user_id", userId);
    if (enrollData) setEnrollments(enrollData as Enrollment[]);
  }

  useEffect(() => {
    // Clean up trailing hash (#) and OAuth access tokens from URL safely after transition completes
    const cleanHash = () => {
      if (typeof window !== "undefined" && window.location.href.includes("#")) {
        const cleanUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname +
          window.location.search;
        window.history.replaceState(window.history.state, "", cleanUrl);
      }
    };

    const hashTimer = setTimeout(cleanHash, 500);

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

        // Admins get their own console at /admin — this page is student-only.
        let userRole = "";
        try {
          if ((await ensureAdmin()).isAdmin) userRole = "admin";
        } catch (e) {
          console.error("Admin check failed:", e);
        }
        if (!userRole) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();
          if (roleData) userRole = roleData.role;
        }
        if (userRole === "admin") {
          navigate({ to: "/admin", replace: true });
          return;
        }

        {
          try {
            const bookings = await fetchDemoBookings();
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
            setLessons((lessonsData as Lesson[]) || []);
          } catch (e) {
            console.error("Failed to load recorded lessons:", e);
          }

          // Fetch student enrollments
          try {
            const { data: enrollData } = await supabase
              .from("enrollments")
              .select("*, courses(name, duration)")
              .eq("user_id", data.user.id);
            setEnrollments((enrollData as Enrollment[]) || []);
          } catch (e) {
            console.error("Failed to load user enrollments:", e);
          }
        }
      }
      setLoading(false);
    });

    return () => clearTimeout(hashTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-azure border-t-transparent" />
          <p className="text-sm font-mono text-muted-foreground">Loading your portal…</p>
        </div>
      </div>
    );
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
    const payMatch = message.match(/Payment ID:\s*(\S+)/i);
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
      id: "purchase",
      label: "Purchase",
      icon: <Calendar className="size-4" />,
      badge: demoBookings.length + enrollments.length,
    },
    { id: "courses", label: "Courses", icon: <BookOpen className="size-4" /> },
    { id: "lessons", label: "Recorded Lessons", icon: <Video className="size-4" /> },
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
                  setActiveTab(tab.id);
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
                {"badge" in tab && tab.badge > 0 && (
                  <span className="ml-1 bg-azure/10 text-azure text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {tab.badge}
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
                    Student Portal
                  </span>
                  <h1 className="font-display text-4xl sm:text-5xl uppercase font-extrabold text-foreground tracking-tight">
                    Welcome back,{" "}
                    <span className="text-azure font-serif normal-case italic font-light">
                      {username}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5 font-light">
                    Here is what is happening with your musical journey.
                  </p>
                </div>

                {/* At-a-glance stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <button
                    onClick={() => setActiveTab("purchase")}
                    className="text-left bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between h-32 hover:border-azure/50 hover:scale-[1.01] transition-all shadow-sm cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <BookOpen className="size-3.5 text-azure" /> My Courses
                    </span>
                    <span>
                      <span className="font-display text-3xl font-extrabold text-foreground group-hover:text-azure transition-colors">
                        {enrollments.length}
                      </span>
                      <span className="block text-[11px] text-muted-foreground font-light mt-0.5">
                        {enrollments.length === 1 ? "active enrollment" : "active enrollments"}
                      </span>
                    </span>
                  </button>

                  <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between h-32 shadow-sm">
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-azure" /> Overall Progress
                    </span>
                    <span>
                      <span className="font-display text-3xl font-extrabold text-foreground">
                        {avgProgress}%
                      </span>
                      <span className="block w-full bg-muted/65 h-1.5 rounded-full overflow-hidden mt-2">
                        <span
                          className="block bg-azure h-full transition-all duration-700"
                          style={{ width: `${avgProgress}%` }}
                        />
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab("lessons")}
                    className="text-left bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between h-32 hover:border-azure/50 hover:scale-[1.01] transition-all shadow-sm cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <Video className="size-3.5 text-azure" /> Video Lessons
                    </span>
                    <span>
                      <span className="font-display text-3xl font-extrabold text-foreground group-hover:text-azure transition-colors">
                        {lessons.length}
                      </span>
                      <span className="block text-[11px] text-muted-foreground font-light mt-0.5">
                        recordings to watch
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("purchase")}
                    className="text-left bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between h-32 hover:border-azure/50 hover:scale-[1.01] transition-all shadow-sm cursor-pointer group"
                  >
                    <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <Calendar className="size-3.5 text-azure" /> Demo Sessions
                    </span>
                    <span>
                      <span className="font-display text-3xl font-extrabold text-foreground group-hover:text-azure transition-colors">
                        {demoBookings.length}
                      </span>
                      <span className="block text-[11px] text-muted-foreground font-light mt-0.5">
                        {demoBookings.length === 1 ? "session booked" : "sessions booked"}
                      </span>
                    </span>
                  </button>
                </div>

                {/* Getting started — shown until the student enrolls */}
                {enrollments.length === 0 && (
                  <div className="bg-gradient-to-br from-azure/8 to-blue-600/5 border border-azure/25 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex-1">
                      <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                        Start your musical journey
                      </h2>
                      <p className="text-sm text-muted-foreground font-light mt-1.5 max-w-lg">
                        Pick an instrument and a tuition plan, or try a one-on-one demo class with
                        Dr. Henry first — no commitment needed.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <button
                        onClick={() => setActiveTab("courses")}
                        className="bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-azure/20 hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Browse Courses
                      </button>
                      <Link
                        to="/book-demo"
                        className="text-center border border-border/80 hover:border-azure hover:text-azure font-mono font-bold uppercase tracking-widest text-[10px] px-6 py-3.5 rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        Book a Demo Class
                      </Link>
                    </div>
                  </div>
                )}

                {/* Current program summary */}
                {enrollments.length > 0 && (
                  <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                      <BookOpen className="size-5 text-azure" />
                      <h2 className="font-display text-xl uppercase font-bold text-foreground tracking-tight">
                        Your Program
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {enrollments.map((enroll) => (
                        <div
                          key={enroll.id}
                          className="flex items-center justify-between gap-4 p-5 rounded-xl border border-border/60 bg-muted/20"
                        >
                          <div className="min-w-0">
                            <p className="font-display text-base font-bold uppercase text-foreground truncate">
                              {enroll.package_title || enroll.courses?.name || "Music Course"}
                            </p>
                            <p className="text-xs text-muted-foreground font-light mt-0.5">
                              {enroll.instrument || enroll.courses?.name || ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-sm font-bold text-azure">
                              {enroll.progress ?? 0}%
                            </span>
                            <span className="block text-[10px] text-muted-foreground font-light">
                              complete
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

            {/* TAB CONTENT: PURCHASE */}
            {activeTab === "purchase" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-display text-3xl uppercase text-foreground">Purchase</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Manage your active course enrollments and booked trial/demo sessions.
                    </p>
                  </div>
                  <Link
                    to="/book-demo"
                    className="bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-azure/20 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  >
                    Book Demo Class
                  </Link>
                </div>

                {enrollments.length === 0 && demoBookings.length === 0 ? (
                  <div className="bg-card border border-border/60 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-5 shadow-sm">
                    <div className="size-16 rounded-full bg-azure/10 flex items-center justify-center mx-auto border border-azure/20">
                      <Calendar className="size-8 text-azure" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        No Purchases Found
                      </h3>
                      <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
                        You haven't enrolled in any courses or booked any demo sessions yet. Check
                        out our available courses to get started!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="inline-flex bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-xs px-6 py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-azure/20 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Browse Courses & Fees
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Purchased Courses Table */}
                    {enrollments.length > 0 && (
                      <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                          <BookOpen className="size-5 text-azure" />
                          <h3 className="font-display text-lg uppercase font-bold text-foreground tracking-tight">
                            Purchased Courses & Enrollments
                          </h3>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-border/40">
                          <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                              <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-mono uppercase tracking-wider">
                                <th className="p-4 font-semibold">Course</th>
                                <th className="p-4 font-semibold">Instrument</th>
                                <th className="p-4 font-semibold">Package Purchased</th>
                                <th className="p-4 font-semibold">Amount Paid</th>
                                <th className="p-4 font-semibold">Progress</th>
                                <th className="p-4 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {enrollments.map((enroll) => (
                                <tr
                                  key={enroll.id}
                                  className="hover:bg-muted/10 text-foreground/85"
                                >
                                  <td className="p-4 font-semibold text-foreground font-display text-sm">
                                    {enroll.courses?.name || "Music Course"}
                                  </td>
                                  <td className="p-4">
                                    <span className="inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-azure/10 text-azure border-azure/20">
                                      {enroll.instrument || "—"}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-foreground font-medium">
                                    {enroll.package_title || enroll.courses?.duration || "N/A"}
                                  </td>
                                  <td className="p-4 font-mono text-foreground/80">
                                    {typeof enroll.amount_paid === "number"
                                      ? `Rs. ${enroll.amount_paid.toLocaleString("en-IN")}`
                                      : "—"}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-24 bg-muted/65 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-azure h-full transition-all duration-500"
                                          style={{ width: `${enroll.progress || 0}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-xs text-foreground/80">
                                        {enroll.progress || 0}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                      {enroll.status || "active"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Booked Demos Table */}
                    {demoBookings.length > 0 && (
                      <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                          <Calendar className="size-5 text-azure" />
                          <h3 className="font-display text-lg uppercase font-bold text-foreground tracking-tight">
                            Trial & Demo Sessions
                          </h3>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-border/40">
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
                                  <tr
                                    key={booking.id}
                                    className="hover:bg-muted/10 text-foreground/85"
                                  >
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
              </div>
            )}

            {/* TAB CONTENT: COURSES & FEES */}
            {activeTab === "courses" && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-3xl uppercase text-foreground">
                    Courses & Fees
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Select a tuition plan below to register and pay for your courses directly from
                    your student portal.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                  {normalizedPackages.map((pkg) => (
                    <div
                      key={pkg.title}
                      className={`glass-panel border rounded-3xl p-8 flex flex-col justify-between hover-glow transition-all duration-300 relative ${
                        pkg.popular
                          ? "border-azure/60 shadow-[0_8px_30px_rgba(59,130,246,0.1)] bg-card/65"
                          : "border-border/60 bg-card/25"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-8 bg-azure text-azure-foreground font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-azure/20 shadow-md">
                          {pkg.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground/95">
                            {pkg.title}
                          </h3>
                          {!pkg.popular && pkg.badge && (
                            <span className="bg-muted border border-border/80 text-muted-foreground font-mono text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground font-light leading-relaxed">
                          {pkg.tagline}
                        </p>

                        <div className="my-6">
                          <span className="font-display text-4xl font-extrabold uppercase tracking-tight text-gradient-azure">
                            {pkg.fees}
                          </span>
                          <span className="text-xs text-muted-foreground/80 font-light ml-1 font-mono">
                            / {pkg.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-5">
                          <Clock className="size-3.5 text-azure" />
                          <span>{pkg.mode}</span>
                        </div>

                        <div className="border-t border-border/40 my-4" />

                        <ul className="space-y-3 my-5">
                          {pkg.features.map((feat) => (
                            <li key={feat} className="flex gap-2.5 items-start text-xs">
                              <Check className="size-3.5 text-azure shrink-0 mt-0.5" />
                              <span className="text-muted-foreground/90 font-light">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleEnrollClick(pkg)}
                        className={`w-full py-3.5 font-mono font-bold uppercase tracking-wider text-[10px] text-center rounded-xl transition-all duration-300 hover:scale-102 active:scale-98 cursor-pointer ${
                          pkg.popular
                            ? "bg-azure text-azure-foreground hover:bg-azure/90 shadow-md"
                            : "border border-border/85 hover:border-azure hover:text-azure"
                        }`}
                      >
                        Buy Course & Enroll
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RECORDED LESSONS */}
            {activeTab === "lessons" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h2 className="font-display text-3xl uppercase text-foreground">
                      Recorded Lessons
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Watch class recordings and step-by-step video lessons at your own pace.
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search lessons by title or description..."
                    className="w-full bg-card border border-border/60 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-azure transition-all"
                  />
                </div>

                {filteredLessons.length === 0 ? (
                  <div className="bg-card border border-border/60 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                    <div className="size-16 rounded-full bg-azure/10 flex items-center justify-center mx-auto border border-azure/20">
                      <Video className="size-8 text-azure" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {searchTerm ? "No lessons match your search" : "No recorded lessons yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
                      {searchTerm
                        ? "Try a different search term."
                        : "New class recordings will appear here as soon as they are published."}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover-glow transition-all duration-300"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="size-9 rounded-xl bg-azure/10 border border-azure/20 flex items-center justify-center shrink-0">
                              <Video className="size-4 text-azure" />
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground leading-snug">
                              {lesson.title}
                            </h3>
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-3 mb-4">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {lesson.video_url && (
                            <button
                              onClick={() =>
                                setActiveVideo({ url: lesson.video_url!, title: lesson.title })
                              }
                              className="flex-1 flex items-center justify-center gap-2 bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-[10px] px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
                            >
                              <Play className="size-3.5" /> Watch
                            </button>
                          )}
                          {lesson.link_url && (
                            <a
                              href={lesson.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 border border-border/80 hover:border-azure hover:text-azure font-mono font-bold uppercase tracking-widest text-[10px] px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
                            >
                              <ExternalLink className="size-3.5" /> Resources
                            </a>
                          )}
                          {!lesson.video_url && !lesson.link_url && (
                            <span className="text-[10px] font-mono uppercase text-muted-foreground/50 py-2.5">
                              Content coming soon
                            </span>
                          )}
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
                      src={`${details.embedUrl}${details.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
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

      {/* ===== ENROLLMENT CHECKOUT MODAL ===== */}
      {activeEnroll && (
        <EnrollmentCheckoutModal
          plan={activeEnroll.plan}
          session={activeEnroll.session}
          defaultInstrument={activeEnroll.instrument}
          onClose={() => setActiveEnroll(null)}
          onEnrolled={() => refreshEnrollments(activeEnroll.session.user.id)}
          onGoToPurchases={() => {
            setActiveEnroll(null);
            setActiveTab("purchase");
          }}
        />
      )}
    </div>
  );
}
