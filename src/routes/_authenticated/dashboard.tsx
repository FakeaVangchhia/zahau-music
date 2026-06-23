import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, BookOpen, Calendar, ClipboardList, LogOut } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Zahau Music School" }, { name: "robots", content: "noindex" }],
  }),
  component: Dashboard,
});

const COURSES = [
  { name: "Concert Piano", level: "Intermediate", progress: 62, next: "Sat · 4:30 PM · Studio A" },
  { name: "Music Theory", level: "Grade 4", progress: 41, next: "Wed · 6:00 PM · Online" },
];
const ASSIGNMENTS = [
  { c: "Concert Piano", t: "Bach Invention No. 4 — RH only", due: "in 3 days" },
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
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? "");
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (roleData) {
          setRole(roleData.role);
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
  if (role === "admin") {
    return <AdminDashboard email={email} signOut={signOut} />;
  }

  // Otherwise, render the student portal dashboard
  return (
    <section className="bg-secondary/40 min-h-[80vh] py-12 px-6">
      <div className="max-w-7xl mx-auto animate-page-transition">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">
              Student portal
            </p>
            <h1 className="mt-2 font-display text-5xl uppercase text-white">Welcome back.</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 border border-border px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-background text-foreground transition-all rounded-lg cursor-pointer"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Current courses" icon={<BookOpen className="size-4" />}>
              <div className="divide-y divide-border/60">
                {COURSES.map((c) => (
                  <div key={c.name} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-end flex-wrap gap-2">
                      <div>
                        <div className="font-display text-xl uppercase text-white">{c.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                          {c.level}
                        </div>
                      </div>
                      <div className="font-mono text-xs text-azure/90">{c.next}</div>
                    </div>
                    <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-azure rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500" 
                        style={{ width: `${c.progress}%` }} 
                      />
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] text-muted-foreground flex justify-between">
                      <span>{c.progress}% complete</span>
                      <span>Target Grade: Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Assignments" icon={<ClipboardList className="size-4" />}>
              <ul className="divide-y divide-border/60">
                {ASSIGNMENTS.map((a, i) => (
                  <li key={i} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-azure">
                        {a.c}
                      </div>
                      <div className="font-display text-lg uppercase text-white mt-0.5">{a.t}</div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest border border-destructive/20 px-2.5 py-1 text-destructive bg-destructive/10 rounded-full font-bold">
                      {a.due}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Upcoming events" icon={<Calendar className="size-4" />}>
              <ul className="divide-y divide-border/60">
                {EVENTS.map((e) => (
                  <li key={e.t} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="font-display text-base uppercase text-white">{e.t}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {e.w}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Certificates" icon={<Award className="size-4" />}>
              {CERTS.length === 0 ? (
                <p className="text-sm text-muted-foreground">No certificates yet.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {CERTS.map((c) => (
                    <li key={c.t} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <div className="font-display text-base uppercase text-white">{c.t}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                          {c.d}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold">
                        Gold Grade
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
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
