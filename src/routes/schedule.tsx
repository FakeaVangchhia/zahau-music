import { createFileRoute } from "@tanstack/react-router";
import { Clock, User, Calendar, ShieldAlert, MonitorPlay, Sparkles } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Weekly Schedule — Zahau Music School" },
      {
        name: "description",
        content: "Weekly lecture and class schedule at Zahau Music School with Dr. Henery.",
      },
      { property: "og:url", content: "/schedule" },
    ],
    links: [{ rel: "canonical", href: "/schedule" }],
  }),
  component: WeeklySchedule,
});

const SCHEDULE_ITEMS = [
  {
    day: "Monday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate",
    instructor: "Dr. Henery",
    online: false,
    color: "from-blue-600/20 to-blue-800/5",
    border: "border-blue-500/20 hover:border-blue-500/40"
  },
  {
    day: "Tuesday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate",
    instructor: "Dr. Henery",
    online: false,
    color: "from-emerald-600/20 to-emerald-800/5",
    border: "border-emerald-500/20 hover:border-emerald-500/40"
  },
  {
    day: "Wednesday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate",
    instructor: "Dr. Henery",
    online: false,
    color: "from-purple-600/20 to-purple-800/5",
    border: "border-purple-500/20 hover:border-purple-500/40"
  },
  {
    day: "Thursday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate",
    instructor: "Dr. Henery",
    online: false,
    color: "from-indigo-600/20 to-indigo-800/5",
    border: "border-indigo-500/20 hover:border-indigo-500/40"
  },
  {
    day: "Friday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate - Online",
    instructor: "Dr. Henery",
    online: true,
    color: "from-amber-600/20 to-amber-800/5",
    border: "border-amber-500/20 hover:border-amber-500/40"
  },
  {
    day: "Saturday",
    time: "4:00 PM - 5:00 PM",
    certificate: "Without Base Certificate",
    instructor: "Dr. Henery",
    online: false,
    color: "from-pink-600/20 to-pink-800/5",
    border: "border-pink-500/20 hover:border-pink-500/40"
  }
];

function WeeklySchedule() {
  return (
    <>
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Timetable</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Weekly
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">schedule.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-white/70 text-lg font-light leading-relaxed">
            Lecture timetable and session scheduling under Dr. Henery. Plan your week and secure your class timings.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {SCHEDULE_ITEMS.map((item) => (
            <div
              key={item.day}
              className={`bg-[#0A1124]/40 border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${item.border} hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)]`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs uppercase tracking-widest text-azure font-bold flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> {item.day}
                  </span>
                  {item.online && (
                    <span className="bg-azure/10 text-azure border border-azure/20 text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Online Only
                    </span>
                  )}
                </div>

                <h3 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight text-white">
                  {item.day} Class
                </h3>
                
                <div className="mt-6 space-y-4">
                  {/* Time */}
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock className="size-4 text-azure shrink-0" />
                    <span className="font-mono text-sm font-semibold">{item.time}</span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3 text-slate-300">
                    <User className="size-4 text-azure shrink-0" />
                    <span className="text-sm font-light">Instructor: <strong className="text-white font-medium">{item.instructor}</strong></span>
                  </div>

                  {/* Certificate */}
                  <div className="flex items-center gap-3 text-slate-300">
                    <ShieldAlert className="size-4 text-azure shrink-0" />
                    <span className="text-sm font-light italic">{item.certificate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40 flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {item.online ? "Zoom Link Provided" : "Studio A / Campus"}
                </span>
                <span className="size-2 rounded-full bg-azure animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
