"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Music,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

const DAYS = [
  { label: "Monday", short: "MON", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  { label: "Tuesday", short: "TUE", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  { label: "Wednesday", short: "WED", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  { label: "Thursday", short: "THU", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  { label: "Friday", short: "FRI", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"] },
  {
    label: "Saturday",
    short: "SAT",
    slots: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"],
  },
];

export default function BookDemoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const currentDay = DAYS.find((d) => d.label === selectedDay);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDay || !selectedSlot) {
      toast.error("Please select a day and time slot.");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          course_interest: String(fd.get("course_interest") ?? ""),
          day: selectedDay,
          slot: selectedSlot,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Booking failed");
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="glowing-blob top-1/4 left-0 w-[500px] h-[500px] -translate-x-1/2 pointer-events-none" />
      <div className="glowing-blob-gold bottom-0 right-0 w-[400px] h-[400px] translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.008)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      {/* ── Left panel ── */}
      <aside className="relative z-10 flex flex-col justify-between lg:w-80 xl:w-96 shrink-0 bg-navy/80 border-r border-border/60 px-8 pt-28 pb-8 lg:min-h-screen">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-azure font-mono text-[9px] uppercase tracking-widest transition-colors duration-200 mb-10 group"
          >
            <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure font-bold block mb-3">
            Free Session
          </span>
          <h1 className="font-display text-4xl xl:text-5xl uppercase leading-none font-extrabold tracking-tight text-foreground">
            Book a
            <br />
            <span className="font-serif italic text-azure normal-case font-light">demo.</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-sm font-light leading-relaxed">
            A free 30-minute session with Dr. Henery. We&apos;ll confirm your slot within one
            business day.
          </p>

          {/* Schedule info */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-2.5">
              <Clock className="size-3.5 text-azure mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                  Mon – Fri
                </p>
                <p className="text-sm text-foreground/80 font-light">2:00 PM – 4:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="size-3.5 text-azure mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                  Saturday
                </p>
                <p className="text-sm text-foreground/80 font-light">12:00 PM – 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <User className="size-3.5 text-azure mt-0.5 shrink-0" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                  Instructor
                </p>
                <p className="text-sm text-foreground/80 font-light">Dr. Henery</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/45 font-mono mt-10">
          &copy; Zahau Music School
        </p>
      </aside>

      {/* ── Right panel ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10 pt-24 lg:pt-10">
        {success ? (
          /* ── Success ── */
          <div className="w-full max-w-lg flex flex-col items-center text-center gap-6">
            <div className="size-20 rounded-full bg-azure/10 border border-azure/20 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-azure" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                Demo confirmed for{" "}
                <strong className="text-foreground">
                  {selectedDay} at {selectedSlot}
                </strong>
                .
                <br />
                We&apos;ll be in touch within one business day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link
                href="/"
                className="bg-azure text-azure-foreground px-7 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-azure/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Back to Home
              </Link>
              <Link
                href="/dashboard"
                className="border border-border text-foreground/60 hover:text-foreground px-7 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl hover:border-azure/40 transition-all duration-300"
              >
                View Dashboard Schedule
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={onSubmit} className="w-full max-w-xl grid gap-5">
            {/* Personal details */}
            <div className="grid gap-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure/80 font-bold flex items-center gap-1.5">
                <User className="size-3" /> Personal Details
              </span>

              {/* Name */}
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                <input
                  id="bd-name"
                  name="name"
                  required
                  maxLength={120}
                  placeholder="Full Name *"
                  className="w-full border border-border bg-card/25 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                  <input
                    id="bd-email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    placeholder="Email *"
                    className="w-full border border-border bg-card/25 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                  <input
                    id="bd-phone"
                    name="phone"
                    type="tel"
                    maxLength={40}
                    placeholder="Phone"
                    className="w-full border border-border bg-card/25 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </div>

              {/* Course */}
              <div className="relative">
                <Music className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                <input
                  id="bd-course"
                  name="course_interest"
                  maxLength={80}
                  placeholder="Course Interest (Piano, Guitar, Voice…)"
                  className="w-full border border-border bg-card/25 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
            </div>

            {/* Schedule picker */}
            <div className="grid gap-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure/80 font-bold flex items-center gap-1.5">
                <Calendar className="size-3" /> Choose Your Session
              </span>

              {/* Day buttons */}
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day.label}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.label);
                      setSelectedSlot(null);
                    }}
                    className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 cursor-pointer ${
                      selectedDay === day.label
                        ? "bg-azure text-azure-foreground border-azure shadow-md shadow-azure/20 scale-105"
                        : "border-border text-muted-foreground hover:border-azure/40 hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>

              {/* Time slots */}
              {currentDay && (
                <div className="flex flex-wrap gap-2">
                  {currentDay.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        selectedSlot === slot
                          ? "bg-azure text-azure-foreground border-azure shadow-md shadow-azure/20 scale-105"
                          : "border-border text-muted-foreground hover:border-azure/40 hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Clock className="size-3" />
                      {slot}
                    </button>
                  ))}
                </div>
              )}

              {/* Summary pill */}
              {selectedDay && selectedSlot && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-azure/10 border border-azure/20">
                  <CheckCircle2 className="size-3.5 text-azure shrink-0" />
                  <span className="text-xs text-foreground/80 font-light">
                    <strong className="text-azure font-semibold">{selectedDay}</strong> at{" "}
                    <strong className="text-azure font-semibold">{selectedSlot}</strong> · Dr.
                    Henery
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="book-demo-submit"
              type="submit"
              disabled={loading || !selectedDay || !selectedSlot}
              className="w-full bg-azure text-azure-foreground hover:bg-azure/90 px-8 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="size-4" />
              {loading ? "Booking your demo…" : "Confirm Demo Booking"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
