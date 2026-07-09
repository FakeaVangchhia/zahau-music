import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitDemoBooking } from "@/lib/site.functions";
import { toast } from "sonner";
import { User, Mail, Phone, Music, Calendar, Clock, X, Send, CheckCircle2 } from "lucide-react";

// Schedule aligned with /schedule page
const DAYS = [
  { label: "Monday", short: "MON", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], type: "weekday" },
  { label: "Tuesday", short: "TUE", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], type: "weekday" },
  { label: "Wednesday", short: "WED", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], type: "weekday" },
  { label: "Thursday", short: "THU", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], type: "weekday" },
  { label: "Friday", short: "FRI", slots: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"], type: "weekday" },
  { label: "Saturday", short: "SAT", slots: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"], type: "weekend" },
];

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
}

export function BookDemoModal({ open, onClose }: BookDemoModalProps) {
  const submit = useServerFn(submitDemoBooking);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setSelectedDay(null);
      setSelectedSlot(null);
      setLoading(false);
    }
  }, [open]);

  // Trap scroll behind modal
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const currentDay = DAYS.find(d => d.label === selectedDay);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDay || !selectedSlot) {
      toast.error("Please select a day and time slot.");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await submit({
        data: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          course_interest: String(fd.get("course_interest") ?? ""),
          day: selectedDay,
          slot: selectedSlot,
        },
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Book a Demo"
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border/80 rounded-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] animate-in animate-page-transition"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 pt-8 pb-6 bg-card/95 backdrop-blur-sm border-b border-border/40">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure font-bold block mb-1">
              Free Session
            </span>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight">
              Book a <span className="font-serif italic text-azure normal-case font-light">Demo</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="size-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/15 transition-all duration-200 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center gap-6 py-20 px-8 text-center">
            <div className="size-20 rounded-full bg-azure/10 border border-azure/20 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-azure" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">
                You're all set!
              </h3>
              <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-sm">
                We've received your demo request for{" "}
                <strong className="text-foreground">{selectedDay} at {selectedSlot}</strong>.
                Our team will confirm your slot within one business day.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 bg-azure text-azure-foreground px-8 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-azure/90 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="px-8 py-8 grid gap-8">

            {/* Personal Details */}
            <div className="grid gap-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure/80 font-bold flex items-center gap-2">
                <User className="size-3" /> Personal Details
              </span>

              {/* Name */}
              <div className="grid gap-2">
                <label htmlFor="demo-name" className="font-mono text-[11px] uppercase tracking-widest text-foreground/70 font-bold">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                  <input
                    id="demo-name"
                    name="name"
                    required
                    maxLength={120}
                    placeholder="John Doe"
                    className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 grid gap-2">
                  <label htmlFor="demo-email" className="font-mono text-[11px] uppercase tracking-widest text-foreground/70 font-bold">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <input
                      id="demo-email"
                      name="email"
                      type="email"
                      required
                      maxLength={255}
                      placeholder="john@example.com"
                      className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                    />
                  </div>
                </div>
                <div className="flex-1 grid gap-2">
                  <label htmlFor="demo-phone" className="font-mono text-[11px] uppercase tracking-widest text-foreground/70 font-bold">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <input
                      id="demo-phone"
                      name="phone"
                      type="tel"
                      maxLength={40}
                      placeholder="+91 99999 99999"
                      className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Course interest */}
              <div className="grid gap-2">
                <label htmlFor="demo-course" className="font-mono text-[11px] uppercase tracking-widest text-foreground/70 font-bold">
                  Course Interest
                </label>
                <div className="relative">
                  <Music className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                  <input
                    id="demo-course"
                    name="course_interest"
                    maxLength={80}
                    placeholder="Piano, Guitar, Voice…"
                    className="w-full border border-border bg-transparent focus:bg-card/25 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Picker */}
            <div className="grid gap-5">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure/80 font-bold flex items-center gap-2 mb-1">
                  <Calendar className="size-3" /> Choose Your Session
                </span>
                <p className="text-xs text-muted-foreground font-light">
                  Mon – Fri: 2:00 PM – 4:00 PM &nbsp;·&nbsp; Saturday: 12:00 PM – 3:00 PM
                </p>
              </div>

              {/* Day selector */}
              <div className="grid gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 font-bold">
                  Select Day
                </span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day.label}
                      type="button"
                      onClick={() => { setSelectedDay(day.label); setSelectedSlot(null); }}
                      className={`px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 cursor-pointer ${
                        selectedDay === day.label
                          ? "bg-azure text-azure-foreground border-azure shadow-lg shadow-azure/20 scale-105"
                          : "border-border text-muted-foreground hover:border-azure/40 hover:text-foreground hover:bg-muted/15"
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot selector */}
              {currentDay && (
                <div className="grid gap-2 animate-in" style={{ animation: "slideUp 0.2s ease-out" }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 font-bold flex items-center gap-1.5">
                    <Clock className="size-3" /> Select Time Slot
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentDay.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 cursor-pointer ${
                          selectedSlot === slot
                            ? "bg-azure text-azure-foreground border-azure shadow-lg shadow-azure/20 scale-105"
                            : "border-border text-muted-foreground hover:border-azure/40 hover:text-foreground hover:bg-muted/15"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected summary */}
              {selectedDay && selectedSlot && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-azure/10 border border-azure/20"
                  style={{ animation: "slideUp 0.2s ease-out" }}
                >
                  <CheckCircle2 className="size-4 text-azure shrink-0" />
                  <span className="text-sm text-foreground/90 font-light">
                    Session booked for{" "}
                    <strong className="text-azure font-semibold">{selectedDay} at {selectedSlot}</strong>
                    {" "}with Dr. Henery
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="book-demo-submit"
              type="submit"
              disabled={loading || !selectedDay || !selectedSlot}
              className="w-full bg-azure text-azure-foreground hover:bg-azure/90 px-8 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="size-4" />
              {loading ? "Booking your demo…" : "Confirm Demo Booking"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-in {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
