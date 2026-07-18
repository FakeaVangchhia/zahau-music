import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getBookedSlots,
  submitDemoBooking,
} from "@/lib/site.functions";
import {
  loadRazorpayScript,
  getRazorpayConstructor,
  getRazorpayKeyId,
  DEMO_BOOKING_FEE_PAISE,
  type RazorpayResponse,
} from "@/lib/razorpay";
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { getAccountDefaults, rememberPhoneOnAccount } from "@/lib/account";

export const Route = createFileRoute("/book-demo")({
  head: () => ({
    meta: [
      { title: "Book a Demo — Zahau Music School" },
      {
        name: "description",
        content:
          "Book a demo session at Zahau Music School. Choose your preferred day and time with Dr. Henry.",
      },
      { property: "og:url", content: "/book-demo" },
    ],
    links: [{ rel: "canonical", href: "/book-demo" }],
  }),
  component: BookDemoPage,
});

function toLocalDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function isTooFarFuture(date: Date) {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return date > maxDate;
}

function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

function getSlotsForDay(date: Date) {
  if (date.getDay() === 6) {
    // Saturday
    return ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];
  }
  return ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];
}

function formatDateForDisplay(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BookDemoPage() {
  const createOrder = useServerFn(createRazorpayOrder);
  const verifyPayment = useServerFn(verifyRazorpayPayment);
  const getBooked = useServerFn(getBookedSlots);
  const bookWithoutDeposit = useServerFn(submitDemoBooking);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedFree, setBookedFree] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  const [reserving, setReserving] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseInterest, setCourseInterest] = useState("");

  useEffect(() => {
    getBooked()
      .then((data) => {
        setBookedSlots(data || {});
      })
      .catch((err) => console.error("Failed to load booked slots:", err));
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch((err) => console.error("Session fetch failed:", err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

    return () => subscription.unsubscribe();
  }, []);

  // Prefill from the account once signed in, so a returning student doesn't
  // have to retype details we already know. Only fills fields still empty,
  // so it never clobbers something the student has already typed.
  useEffect(() => {
    if (!session) return;
    const defaults = getAccountDefaults(session);
    setName((prev) => prev || defaults.name);
    setEmail((prev) => prev || defaults.email);
    setPhone((prev) => prev || defaults.phone);
  }, [session]);

  const isAccountEmail = !!session && email === session.user.email;

  // Calendar setup
  const daysInMonthList = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    if (
      prev.getMonth() >= today.getMonth() ||
      prev.getFullYear() > today.getFullYear() ||
      (prev.getFullYear() === today.getFullYear() && prev.getMonth() >= today.getMonth())
    ) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a day and time slot.");
      return;
    }
    setLoading(true);
    setPaymentUnavailable(false);

    const selectedDayStr = toLocalDateString(selectedDate);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay payment gateway. Check your internet connection.");
      }

      // 2. Create the Razorpay Order (Rs. 500 booking deposit)
      const order = await createOrder({
        data: {
          amount: DEMO_BOOKING_FEE_PAISE,
          currency: "INR",
          receipt: `demo_${Date.now()}`,
        },
      });

      // 3. Open Razorpay Checkout modal
      const options = {
        key: getRazorpayKeyId(),
        amount: order.amount,
        currency: order.currency,
        name: "Zahau Music School",
        description: "Trial / Demo Session Booking Fee",
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          setLoading(true);
          try {
            // Verify payment and insert booking details
            const verifyResult = await verifyPayment({
              data: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                booking_details: {
                  name,
                  email,
                  phone,
                  course_interest: courseInterest,
                  day: selectedDayStr,
                  slot: selectedSlot,
                },
              },
            });

            if (verifyResult.ok) {
              if (session) rememberPhoneOnAccount(phone);
              toast.success("Payment verified! Demo booking confirmed.");
              setSuccess(true);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#0070f3",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Booking cancelled.");
            // The checkout widget can also close itself after an internal
            // failure (e.g. Razorpay's own gateway erroring) with no way for
            // us to distinguish that from a manual cancel — always leave the
            // no-deposit reservation option available once it closes.
            setPaymentUnavailable(true);
          },
        },
      };

      const Razorpay = getRazorpayConstructor();
      if (!Razorpay) throw new Error("Razorpay failed to initialize.");
      new Razorpay(options).open();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Booking initialization failed. Please try again.",
      );
      // Deposit payment isn't usable right now (not configured, account not yet
      // activated, etc.) — offer a no-deposit reservation instead of a dead end.
      setPaymentUnavailable(true);
      setLoading(false);
    }
  }

  async function handleReserveWithoutDeposit() {
    if (!selectedDate || !selectedSlot) return;
    setReserving(true);
    try {
      await bookWithoutDeposit({
        data: {
          name,
          email,
          phone,
          course_interest: courseInterest,
          day: toLocalDateString(selectedDate),
          slot: selectedSlot,
        },
      });
      if (session) rememberPhoneOnAccount(phone);
      setBookedFree(true);
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setReserving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden font-sans">
      {/* Ambient glows */}
      <div className="glowing-blob top-1/4 left-0 w-[500px] h-[500px] -translate-x-1/2 pointer-events-none" />
      <div className="glowing-blob-gold bottom-0 right-0 w-[400px] h-[400px] translate-x-1/2 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.008)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      {/* ── Left panel ── */}
      <aside className="relative z-10 flex flex-col justify-between lg:w-80 xl:w-96 shrink-0 bg-navy/80 border-r border-border/60 px-8 pt-28 pb-8 lg:min-h-screen">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-azure font-mono text-[9px] uppercase tracking-widest transition-colors duration-200 mb-10 group"
          >
            <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure font-bold block mb-3">
            Book Class
          </span>
          <h1 className="font-display text-4xl xl:text-5xl uppercase leading-none font-extrabold tracking-tight text-foreground">
            Book a
            <br />
            <span className="font-serif italic text-azure normal-case font-light">demo.</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-sm font-light leading-relaxed">
            Choose your preferred date and time slot with Dr. Henry. A booking deposit of{" "}
            <strong>Rs. 500</strong> is required to secure your appointment.
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
                <p className="text-sm text-foreground/80 font-light">Dr. Henry</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/45 font-mono mt-10">© Zahau Music School</p>
      </aside>

      {/* ── Right panel ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10 pt-24 lg:pt-10">
        {success ? (
          /* ── Success ── */
          <div className="w-full max-w-lg flex flex-col items-center text-center gap-6 animate-fadeIn">
            <div className="size-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight mb-2 text-foreground">
                {bookedFree ? "Demo Booked!" : "Payment Successful!"}
              </h2>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                Demo confirmed for{" "}
                <strong className="text-foreground">
                  {selectedDate ? formatDateForDisplay(selectedDate) : ""} at {selectedSlot}
                </strong>
                .
                <br />
                {bookedFree
                  ? "Online deposit payment wasn't available — we'll follow up by email to collect the Rs. 500 deposit and confirm your slot."
                  : "We have received your deposit and will send a confirmation email shortly."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link
                to="/"
                className="bg-azure text-azure-foreground px-7 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-azure/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Back to Home
              </Link>
              <Link
                to="/dashboard"
                className="border border-border text-foreground/60 hover:text-foreground px-7 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl hover:border-azure/40 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={onSubmit} className="w-full max-w-xl grid gap-5">
            {/* Personal details */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure/80 font-bold flex items-center gap-1.5">
                  <User className="size-3" /> Personal Details
                </span>
                {session && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3" /> Signed in as {session.user.email}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                <input
                  id="bd-name"
                  name="name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name *"
                  className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
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
                    // Only lock once the field's value actually is the
                    // account's email — if the session resolves after the
                    // user already typed something else, leave it editable
                    // rather than "locking" a value that isn't their account.
                    readOnly={isAccountEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email *"
                    className={`w-full border border-border px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground ${isAccountEmail ? "bg-muted/30 cursor-not-allowed" : "bg-card/20 focus:bg-card/40"}`}
                  />
                  {isAccountEmail && (
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                  <input
                    id="bd-phone"
                    name="phone"
                    type="tel"
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
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
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                  placeholder="Course Interest (Piano, Guitar, Drums…)"
                  className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
            </div>

            {/* Schedule picker */}
            <div className="grid gap-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure/80 font-bold flex items-center gap-1.5">
                <Calendar className="size-3" /> Select Date on Calendar
              </span>

              {/* Calendar Grid wrapper */}
              <div className="border border-border/80 bg-card/10 rounded-2xl p-4 sm:p-5">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/10 transition cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="font-display font-bold uppercase text-xs sm:text-sm text-foreground tracking-wider">
                    {monthName}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/10 transition cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonthList.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} />;
                    }

                    const formattedDateStr = toLocalDateString(day);
                    const isPast = isPastDate(day);
                    const isSun = isSunday(day);
                    const isFar = isTooFarFuture(day);
                    const isDisabled = isPast || isSun || isFar;

                    const isSelected =
                      selectedDate && toLocalDateString(selectedDate) === formattedDateStr;
                    const isToday = toLocalDateString(new Date()) === formattedDateStr;

                    return (
                      <button
                        key={formattedDateStr}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedSlot(null);
                        }}
                        className={`aspect-square rounded-full font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                          isDisabled
                            ? "text-muted-foreground/20 cursor-not-allowed bg-muted/5 border-transparent"
                            : isSelected
                              ? "bg-azure text-azure-foreground border-2 border-azure shadow-md shadow-azure/20 scale-105 font-bold cursor-pointer"
                              : isToday
                                ? "border border-azure/40 text-azure font-bold hover:bg-azure/10 cursor-pointer"
                                : "border border-border/60 text-foreground/80 hover:border-azure/40 hover:text-foreground hover:bg-muted/10 cursor-pointer"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="space-y-3 animate-slideUp">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure/80 font-bold flex items-center gap-1.5">
                    <Clock className="size-3" /> Select Time Slot for{" "}
                    {formatDateForDisplay(selectedDate)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getSlotsForDay(selectedDate).map((slot) => {
                      const dateStr = toLocalDateString(selectedDate);
                      const isBooked = bookedSlots[dateStr]?.includes(slot);

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 flex items-center gap-1.5 disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed disabled:bg-red-500/5 disabled:border-red-500/10 disabled:text-red-500/40 relative ${
                            selectedSlot === slot
                              ? "bg-azure text-azure-foreground border-azure shadow-md shadow-azure/20 scale-105 cursor-pointer"
                              : "border-border text-muted-foreground hover:border-azure/40 hover:text-foreground hover:bg-white/5 cursor-pointer"
                          }`}
                        >
                          <Clock className="size-3" />
                          {slot}
                          {isBooked && (
                            <span className="absolute -top-1.5 -right-1 text-[7px] bg-red-500/25 text-red-500 px-1 rounded border border-red-500/35">
                              Taken
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary pill */}
              {selectedDate && selectedSlot && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-azure/10 border border-azure/20 animate-slideUp">
                  <CheckCircle2 className="size-3.5 text-azure shrink-0" />
                  <span className="text-xs text-foreground/80 font-light">
                    Selected:{" "}
                    <strong className="text-azure font-semibold">
                      {formatDateForDisplay(selectedDate)}
                    </strong>{" "}
                    at <strong className="text-azure font-semibold">{selectedSlot}</strong> with Dr.
                    Henry
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="book-demo-submit"
              type="submit"
              disabled={loading || reserving || !selectedDate || !selectedSlot}
              className="w-full bg-azure text-azure-foreground hover:bg-azure/90 px-8 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="size-4" />
              {loading ? "Initializing Secure Portal…" : "Pay Rs. 500 & Confirm Booking"}
            </button>

            {paymentUnavailable && (
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 space-y-3 animate-slideUp">
                <div className="flex gap-2.5 items-start text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    Online deposit payment isn't available right now. You can reserve this slot
                    without paying the deposit — we'll follow up to collect it and confirm.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReserveWithoutDeposit}
                  disabled={loading || reserving}
                  className="w-full border border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {reserving ? "Reserving…" : "Reserve Slot (No Deposit)"}
                </button>
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
