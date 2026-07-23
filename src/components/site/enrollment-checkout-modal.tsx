import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ShieldCheck, AlertTriangle, Upload, Loader2 } from "lucide-react";
import { getPaymentSettings, submitPaymentProof, submitLead } from "@/lib/site.functions";
import { buildUpiUri, instrumentToSlug, INSTRUMENTS, isValidUtr } from "@/lib/payments";
import { uploadPaymentProof } from "@/lib/upload";
import type { FeePackage } from "@/lib/fee-packages";
import { getAccountDefaults, rememberPhoneOnAccount } from "@/lib/account";

type EnrollmentCheckoutModalProps = {
  plan: FeePackage;
  session: Session;
  defaultInstrument: string;
  onClose: () => void;
  /** Called after a submitted payment — e.g. to refresh a local enrollments list. */
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
  const loadSettings = useServerFn(getPaymentSettings);
  const submitProof = useServerFn(submitPaymentProof);
  const submitLeadFn = useServerFn(submitLead);

  // Prefilled from the account's saved phone (if any prior purchase saved
  // one) so a returning student doesn't have to retype it every time.
  const [phone, setPhone] = useState(() => getAccountDefaults(session).phone);
  const [enrollInstrument, setEnrollInstrument] = useState(defaultInstrument);
  const [upiRef, setUpiRef] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [successKind, setSuccessKind] = useState<"submitted" | "reserved" | null>(null);
  const [instantVerified, setInstantVerified] = useState(false);

  const [settings, setSettings] = useState<{ upi_vpa: string; payee_name: string } | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((s) => setSettings({ upi_vpa: s.upi_vpa, payee_name: s.payee_name }))
      .catch((err) => console.error("Failed to load payment settings:", err))
      .finally(() => setSettingsLoaded(true));
  }, [loadSettings]);

  const upiConfigured = !!settings?.upi_vpa;

  const upiUri = useMemo(() => {
    if (!settings?.upi_vpa) return "";
    return buildUpiUri({
      vpa: settings.upi_vpa,
      payee: settings.payee_name || "Zahau Music School",
      amount: plan.rawFees,
      note: `${plan.title} — ${enrollInstrument}`,
    });
  }, [settings, plan.rawFees, plan.title, enrollInstrument]);

  async function handleSubmitProof() {
    if (upiRef.trim() && !isValidUtr(upiRef)) {
      toast.error(
        "That UTR doesn't look right — it's the 12-digit number on your payment receipt. Fix it or leave it blank.",
      );
      return;
    }
    setSubmitting(true);
    try {
      let screenshotPath = "";
      if (screenshot) {
        screenshotPath = await uploadPaymentProof(screenshot, session.user.id);
      }
      const result = await submitProof({
        data: {
          kind: "enrollment",
          course_slug: instrumentToSlug[enrollInstrument] || "piano",
          package_title: plan.title,
          instrument: enrollInstrument,
          name:
            session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Student",
          phone,
          upi_reference: upiRef.trim(),
          screenshot_url: screenshotPath,
        },
      });
      if (result.ok) {
        rememberPhoneOnAccount(phone);
        await onEnrolled?.();
        setInstantVerified(!!result.autoApproved);
        setSuccessKind("submitted");
        toast.success(
          result.autoApproved
            ? "Payment verified — you're enrolled!"
            : "Payment submitted for verification!",
        );
      } else {
        toast.error("Could not submit your payment. Please try again.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
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
          message: `Enrollment reservation (payment pending). Package: ${plan.title}. Instrument: ${enrollInstrument}. Amount due: ${plan.fees}. Please contact to complete payment and enrollment.`,
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

  const busy = submitting || reserving;

  // Portal to document.body: the routed page's <main> carries a page-transition
  // animation that leaves a residual CSS transform, which makes `fixed`
  // descendants position relative to it instead of the real viewport — without
  // this, the modal renders off the current scroll position.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
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
                {successKind === "submitted"
                  ? instantVerified
                    ? "Enrollment Active!"
                    : "Payment Submitted!"
                  : "Reservation Received!"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 font-light">
                {successKind === "submitted" ? (
                  instantVerified ? (
                    <>
                      Your payment was verified automatically and you're now enrolled in the{" "}
                      <strong className="text-foreground">{plan.title}</strong> program (
                      <strong className="text-foreground">{enrollInstrument}</strong>). It's live in
                      your dashboard right now.
                    </>
                  ) : (
                    <>
                      We've received your payment details for the{" "}
                      <strong className="text-foreground">{plan.title}</strong> program (
                      <strong className="text-foreground">{enrollInstrument}</strong>). Our team
                      will verify the transaction and activate your enrollment shortly — you'll see
                      it go live in your dashboard.
                    </>
                  )
                ) : (
                  <>
                    We've reserved your spot in the{" "}
                    <strong className="text-foreground">{plan.title}</strong> program for{" "}
                    <strong className="text-foreground">{enrollInstrument}</strong>. Our admissions
                    team will contact you at{" "}
                    <strong className="text-foreground">{session.user.email}</strong> to complete
                    payment and confirm enrollment.
                  </>
                )}
              </p>
            </div>
            {successKind === "submitted" && (
              <div className="w-full bg-muted/40 p-4 rounded-xl border border-border/40 text-left font-mono text-[10px] space-y-2 text-muted-foreground">
                <p>
                  <strong>Package:</strong> {plan.title}
                </p>
                <p>
                  <strong>Instrument:</strong> {enrollInstrument}
                </p>
                <p>
                  <strong>Amount:</strong> {plan.fees}
                </p>
                <p className="truncate">
                  <strong>UTR:</strong> {upiRef}
                </p>
                {instantVerified ? (
                  <p className="text-emerald-600 dark:text-emerald-400">
                    Status: Verified & active
                  </p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400">
                    Status: Awaiting verification
                  </p>
                )}
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
                UPI Payment
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

            {!settingsLoaded ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading payment details…
              </div>
            ) : upiConfigured ? (
              <>
                {/* Scan-to-pay */}
                <div className="flex flex-col items-center gap-3 bg-muted/30 border border-border/50 rounded-2xl p-5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                    Scan to pay {plan.fees}
                  </span>
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG value={upiUri} size={180} includeMargin={false} />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xs text-foreground">{settings?.upi_vpa}</p>
                    <p className="text-[10px] text-muted-foreground font-light">
                      {settings?.payee_name}
                    </p>
                  </div>
                  <a
                    href={upiUri}
                    className="text-[10px] font-mono uppercase tracking-widest text-azure hover:underline sm:hidden"
                  >
                    Open in a UPI app →
                  </a>
                  <p className="text-[10px] text-muted-foreground/70 font-light text-center leading-relaxed">
                    Pay the exact amount using any UPI app (GPay, PhonePe, Paytm, BHIM), enter the
                    transaction ID from your receipt below, then tap “I’ve Paid”.
                  </p>
                </div>

                {/* Transaction ID — optional, but always visible */}
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                    UPI Transaction ID (UTR){" "}
                    <span className="text-muted-foreground/50 normal-case font-normal">
                      — optional, approves you instantly
                    </span>
                  </label>
                  <input
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    inputMode="numeric"
                    placeholder="12-digit number from your payment receipt"
                    className={`w-full border bg-card/20 focus:bg-card/40 px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground ${
                      upiRef.trim() && !isValidUtr(upiRef)
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10"
                        : "border-border focus:border-azure focus:ring-azure/10"
                    }`}
                  />
                  {upiRef.trim() && !isValidUtr(upiRef) && (
                    <p className="mt-1.5 text-[10px] text-red-500 font-mono">
                      A UTR is exactly 12 digits — check your payment receipt.
                    </p>
                  )}
                </div>

                {/* One tap to submit */}
                <button
                  onClick={handleSubmitProof}
                  disabled={busy}
                  className="w-full bg-azure text-white hover:bg-azure/90 py-4 font-mono font-bold uppercase tracking-widest text-xs rounded-xl transition-all duration-300 hover:shadow-[0_4px_25px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ShieldCheck className="size-4 shrink-0" />
                  {submitting ? "Submitting…" : "I've Paid"}
                </button>

                {/* Optional extras — speed up / prove the payment, but not required */}
                <details className="group">
                  <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1.5">
                    <span className="group-open:rotate-90 transition-transform">›</span>
                    Add screenshot or phone (optional)
                  </summary>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                        Payment Screenshot
                      </label>
                      <label className="flex items-center gap-2 w-full border border-dashed border-border hover:border-azure/50 bg-card/20 px-4 py-3 text-sm rounded-xl cursor-pointer transition-all text-muted-foreground">
                        <Upload className="size-4 shrink-0" />
                        <span className="truncate">
                          {screenshot ? screenshot.name : "Attach a screenshot of the payment"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                      />
                    </div>
                  </div>
                </details>
              </>
            ) : (
              <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 space-y-3">
                <div className="flex gap-2.5 items-start text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    Online payment isn't set up right now. You can reserve your spot — our
                    admissions team will follow up to complete payment and enrollment.
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full border border-border bg-card/20 focus:bg-card/40 px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-300 placeholder:text-muted-foreground/40 text-foreground"
                />
                <button
                  onClick={handleReserve}
                  disabled={busy}
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
