import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment, submitLead } from "@/lib/site.functions";
import {
  loadRazorpayScript,
  getRazorpayConstructor,
  getRazorpayKeyId,
  instrumentToSlug,
  INSTRUMENTS,
  type RazorpayResponse,
} from "@/lib/razorpay";
import type { FeePackage } from "@/lib/fee-packages";
import { getAccountDefaults, rememberPhoneOnAccount } from "@/lib/account";

type EnrollmentCheckoutModalProps = {
  plan: FeePackage;
  session: Session;
  defaultInstrument: string;
  onClose: () => void;
  /** Called after a completed (paid) enrollment — e.g. to refresh a local enrollments list. */
  onEnrolled?: () => void | Promise<void>;
  /** Renders the "go look at what I just did" CTA on the success screen. Defaults to a link to /dashboard. */
  onGoToPurchases?: () => void;
};

export function EnrollmentCheckoutModal({
  plan,
  session,
  defaultInstrument,
  onClose,
  onEnrolled,
  onGoToPurchases,
}: EnrollmentCheckoutModalProps) {
  const createOrder = useServerFn(createRazorpayOrder);
  const verifyPayment = useServerFn(verifyRazorpayPayment);
  const submitLeadFn = useServerFn(submitLead);

  // Prefilled from the account's saved phone (if any prior purchase saved
  // one) so a returning student doesn't have to retype it every time.
  const [phone, setPhone] = useState(() => getAccountDefaults(session).phone);
  const [enrollInstrument, setEnrollInstrument] = useState(defaultInstrument);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentUnavailable, setPaymentUnavailable] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [successKind, setSuccessKind] = useState<"paid" | "reserved" | null>(null);
  const [paymentId, setPaymentId] = useState("");

  async function handlePayment() {
    setLoadingPayment(true);
    setPaymentUnavailable(false);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay payment gateway. Please check your internet connection.",
        );
      }

      const amountPaise = plan.rawFees * 100;
      const order = await createOrder({
        data: { amount: amountPaise, currency: "INR", receipt: `enroll_${Date.now()}` },
      });

      const options = {
        key: getRazorpayKeyId(),
        amount: order.amount,
        currency: order.currency,
        name: "Zahau Music School",
        description: `Enrollment - ${plan.title} (${enrollInstrument})`,
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          setLoadingPayment(true);
          try {
            const verifyResult = await verifyPayment({
              data: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                enrollment_details: {
                  email: session.user.email ?? "",
                  course_slug: instrumentToSlug[enrollInstrument] || "piano",
                  package_title: plan.title,
                  amount_paid: plan.rawFees,
                  instrument: enrollInstrument,
                },
              },
            });

            if (verifyResult.ok) {
              setPaymentId(response.razorpay_payment_id);
              rememberPhoneOnAccount(phone);
              await onEnrolled?.();
              setSuccessKind("paid");
              toast.success(`Enrolled successfully in ${plan.title}!`);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed.");
          } finally {
            setLoadingPayment(false);
          }
        },
        prefill: {
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
          email: session.user.email || "",
          contact: phone,
        },
        theme: { color: "#0070f3" },
        modal: {
          ondismiss: function () {
            setLoadingPayment(false);
            toast.info("Payment cancelled.");
            // The checkout widget can also close itself after an internal
            // failure (e.g. Razorpay's own gateway erroring) with no way for
            // us to distinguish that from a manual cancel — always leave the
            // no-payment reservation option available once it closes.
            setPaymentUnavailable(true);
          },
        },
      };

      const Razorpay = getRazorpayConstructor();
      if (!Razorpay) throw new Error("Razorpay failed to initialize.");
      new Razorpay(options).open();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Payment initialization failed. Please try again.",
      );
      // Payment gateway isn't usable right now (not configured, account not
      // yet activated, etc.) — offer a no-payment reservation instead of a dead end.
      setPaymentUnavailable(true);
      setLoadingPayment(false);
    }
  }

  async function handleReserve() {
    setReserving(true);
    try {
      await submitLeadFn({
        data: {
          name:
            session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Student",
          email: session.user.email ?? "",
          phone,
          course_interest: `${plan.title} — ${enrollInstrument}`,
          message: `Enrollment reservation (payment pending online). Package: ${plan.title}. Instrument: ${enrollInstrument}. Amount due: ${plan.fees}. Please contact to complete payment and enrollment.`,
          source: "enrollment-reservation",
        },
      });
      rememberPhoneOnAccount(phone);
      setSuccessKind("reserved");
      toast.success("Reservation received! We'll be in touch to complete enrollment.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reservation failed. Please try again.");
    } finally {
      setReserving(false);
    }
  }

  const busy = loadingPayment || reserving;

  // Portal to document.body: the routed page's <main> carries a page-transition
  // animation that leaves a residual CSS transform, which makes `fixed`
  // descendants position relative to it instead of the real viewport — without
  // this, the modal renders off the current scroll position.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative p-6 sm:p-8 space-y-6">
        {!busy && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 size-8 rounded-full bg-black/10 hover:bg-black/20 text-foreground flex items-center justify-center font-mono text-sm transition-all focus:outline-none cursor-pointer"
          >
            ✕
          </button>
        )}

        {successKind ? (
          <div className="flex flex-col items-center text-center gap-5 py-4 animate-fadeIn">
            <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                {successKind === "paid" ? "Enrollment Complete!" : "Reservation Received!"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 font-light">
                {successKind === "paid" ? (
                  <>
                    You have successfully enrolled in the{" "}
                    <strong className="text-foreground">{plan.title}</strong> program for{" "}
                    <strong className="text-foreground">{enrollInstrument}</strong>.
                  </>
                ) : (
                  <>
                    We've reserved your spot in the{" "}
                    <strong className="text-foreground">{plan.title}</strong> program for{" "}
                    <strong className="text-foreground">{enrollInstrument}</strong>. Online payments
                    aren't available just yet — our admissions team will contact you at{" "}
                    <strong className="text-foreground">{session.user.email}</strong> to complete
                    payment and confirm enrollment.
                  </>
                )}
              </p>
            </div>
            {successKind === "paid" && (
              <div className="w-full bg-muted/40 p-4 rounded-xl border border-border/40 text-left font-mono text-[10px] space-y-2 text-muted-foreground">
                <p>
                  <strong>Package:</strong> {plan.title}
                </p>
                <p>
                  <strong>Instrument:</strong> {enrollInstrument}
                </p>
                <p>
                  <strong>Paid Amount:</strong> {plan.fees}
                </p>
                <p className="truncate">
                  <strong>Payment ID:</strong> {paymentId}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              {onGoToPurchases ? (
                <button
                  onClick={onGoToPurchases}
                  className="flex-1 text-center bg-azure text-white py-3.5 text-xs font-mono font-bold uppercase tracking-widest rounded-xl hover:scale-102 active:scale-98 transition-all shadow-md shadow-azure/10 cursor-pointer"
                >
                  Go to Purchase Section
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex-1 text-center bg-azure text-white py-3.5 text-xs font-mono font-bold uppercase tracking-widest rounded-xl hover:scale-102 active:scale-98 transition-all shadow-md shadow-azure/10 cursor-pointer"
                >
                  Go to Portal Dashboard
                </Link>
              )}
              <button
                onClick={onClose}
                className="flex-1 text-center border border-border hover:bg-muted py-3.5 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="border-b border-border/40 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure font-bold block mb-1">
                Secure Checkout
              </span>
              <h3 className="font-display text-2xl font-extrabold uppercase text-foreground">
                Confirm Enrollment
              </h3>
            </div>

            <div className="bg-azure/5 border border-azure/20 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-azure uppercase font-bold tracking-wider">
                Selected Package
              </span>
              <div className="flex justify-between items-center">
                <p className="font-display font-bold uppercase text-foreground">{plan.title}</p>
                <p className="font-display font-bold text-azure text-lg">{plan.fees}</p>
              </div>
              <p className="text-xs text-muted-foreground font-light">{plan.tagline}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                  Choose Instrument / Stream
                </label>
                <select
                  value={enrollInstrument}
                  onChange={(e) => setEnrollInstrument(e.target.value)}
                  className="w-full bg-muted/60 dark:bg-card/25 border border-border/80 px-4 py-3 rounded-xl text-sm outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 text-foreground"
                >
                  {INSTRUMENTS.map((inst) => (
                    <option key={inst} value={inst} className="bg-background text-foreground">
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                />
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={busy || !phone}
              className="w-full bg-azure text-white hover:bg-azure/90 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_4px_25px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ShieldCheck className="size-4 shrink-0" />
              {loadingPayment ? "Processing Secure Gateway…" : `Pay ${plan.fees} & Enroll`}
            </button>

            {paymentUnavailable && (
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex gap-2.5 items-start text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    Online payment isn't available right now. You can reserve your spot without
                    paying — our admissions team will follow up to complete payment and enrollment.
                  </span>
                </div>
                <button
                  onClick={handleReserve}
                  disabled={busy || !phone}
                  className="w-full border border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 py-3 font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {reserving ? "Reserving…" : "Reserve My Spot (No Payment)"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
