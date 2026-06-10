import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Award, BookOpen, Calendar, ClipboardList, LogOut } from "lucide-react";

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <section className="bg-secondary min-h-[80vh] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-azure">
              Student portal
            </p>
            <h1 className="mt-2 font-display text-5xl uppercase">Welcome back.</h1>
            <p className="text-sm text-muted-foreground mt-2">{email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-background"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Current courses" icon={<BookOpen className="size-4" />}>
              <div className="divide-y divide-border">
                {COURSES.map((c) => (
                  <div key={c.name} className="py-5">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="font-display text-xl uppercase">{c.name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {c.level}
                        </div>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">{c.next}</div>
                    </div>
                    <div className="mt-3 h-1.5 bg-secondary">
                      <div className="h-full bg-azure" style={{ width: `${c.progress}%` }} />
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {c.progress}% complete
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Assignments" icon={<ClipboardList className="size-4" />}>
              <ul className="divide-y divide-border">
                {ASSIGNMENTS.map((a, i) => (
                  <li key={i} className="py-4 flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-azure">
                        {a.c}
                      </div>
                      <div className="font-display text-lg uppercase">{a.t}</div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{a.due}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Upcoming events" icon={<Calendar className="size-4" />}>
              <ul className="divide-y divide-border">
                {EVENTS.map((e) => (
                  <li key={e.t} className="py-3">
                    <div className="font-display text-base uppercase">{e.t}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
                <ul className="divide-y divide-border">
                  {CERTS.map((c) => (
                    <li key={c.t} className="py-3">
                      <div className="font-display text-base uppercase">{c.t}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {c.d}
                      </div>
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
    <div className="bg-background border border-border p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-azure">
        {icon} {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
