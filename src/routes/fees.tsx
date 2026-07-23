import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  Check,
  Award,
  Calculator,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Music,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFees } from "@/lib/site.functions";
import { supabase } from "@/integrations/supabase/client";
import { INSTRUMENTS } from "@/lib/payments";
import { normalizeFeePackages, FALLBACK_PACKAGES, type FeePackage } from "@/lib/fee-packages";
import { EnrollmentCheckoutModal } from "@/components/site/enrollment-checkout-modal";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

type FeesSearch = {
  plan?: string;
  instrument?: string;
  enroll?: string;
};

export const Route = createFileRoute("/fees")({
  validateSearch: (search: Record<string, unknown>): FeesSearch => {
    return {
      plan: search.plan as string | undefined,
      instrument: search.instrument as string | undefined,
      enroll: search.enroll as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Courses & Fees — Zahau Music School" },
      {
        name: "description",
        content:
          "Transparent course fees for monthly, 3-month, 6-month, 1-year certificate and 2-year diploma programs at Zahau Music School.",
      },
      { property: "og:url", content: "/fees" },
    ],
    links: [{ rel: "canonical", href: "/fees" }],
  }),
  component: FeesPage,
});

const FAQS = [
  {
    q: "Are there any hidden charges?",
    a: "None. All indicated prices cover classes, standard school textbooks, sheet music, assessment fees, and recital fees. Key exam registry fees (e.g. ABRSM, Trinity) are directly charged by the boards and are not included.",
  },
  {
    q: "How does the refund policy work?",
    a: "Enrolments under the Monthly Track can be cancelled at any point before your billing period starts. Semester courses (3/6 Months) and annual tracks can be refunded (pro-rata for unused months) within the first 14 days of registration. Advance deposits for events are non-refundable.",
  },
  {
    q: "Can I switch my study mode later?",
    a: "Absolutely. You can change from live online classes to in-person sessions (or vice versa) at the end of any month by notifying support. Our hybrid system ensures your curriculum progress remains completely continuous.",
  },
  {
    q: "Do I need to own an instrument?",
    a: "We highly recommend having a practice instrument at home. However, enrolled students receive free scheduling access to our school practice labs and instruments (pianos, keyboards, drum kits, acoustic guitars) Monday through Saturday.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/80 bg-card/25 rounded-2xl p-6 transition-all duration-300">
      <div
        className="flex justify-between items-center cursor-pointer select-none font-display font-bold uppercase text-foreground/90 hover:text-azure"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span
          className={`text-xl text-azure font-mono font-bold transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>
      <div
        className={`grid transition-all duration-350 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-muted-foreground leading-relaxed text-sm font-light max-w-3xl">{a}</p>
        </div>
      </div>
    </div>
  );
}

function FeesPage() {
  const navigate = useNavigate();
  const fetchFees = useServerFn(getFees);

  const { plan, instrument, enroll } = Route.useSearch();
  const { data } = useQuery({ queryKey: ["fees-all"], queryFn: () => fetchFees() });

  const normalizedPackages =
    data && data.length > 0 ? normalizeFeePackages(data) : FALLBACK_PACKAGES;

  const [showMonthlyRate, setShowMonthlyRate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<FeePackage>(
    normalizedPackages[2] || normalizedPackages[0],
  );
  const [selectedInstrument, setSelectedInstrument] = useState("Piano");
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Enrollment checkout modal state
  const [activeEnroll, setActiveEnroll] = useState<{
    plan: FeePackage;
    instrument: string;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((err) => console.error("Session fetch failed:", err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Preselect the study track from the ?plan= search param (set by course pages),
  // and switch from the static fallback to DB packages once they load.
  useEffect(() => {
    const packagesToUse = data && data.length > 0 ? normalizeFeePackages(data) : FALLBACK_PACKAGES;

    if (plan) {
      const matched = packagesToUse.find(
        (p) =>
          p.title.toLowerCase().includes(plan.toLowerCase()) ||
          p.duration.toLowerCase().includes(plan.toLowerCase()),
      );
      if (matched) {
        setSelectedPlan(matched);
        return;
      }
    }
    if (data && data.length > 0) {
      setSelectedPlan(packagesToUse[2] || packagesToUse[0]);
    }
  }, [data, plan]);

  // Preselect the instrument from the ?instrument= search param
  useEffect(() => {
    if (instrument) {
      const matchedInstrument = INSTRUMENTS.find(
        (i) => i.toLowerCase() === instrument.toLowerCase(),
      );
      if (matchedInstrument) {
        setSelectedInstrument(matchedInstrument);
      }
    }
  }, [instrument]);

  const durationMonths = parseInt(selectedPlan.duration) || 1;
  const estimatedMonthly = Math.round(selectedPlan.rawFees / durationMonths);

  const handleEnrollClick = (pkg: FeePackage) => {
    if (!session) {
      toast.info("Please sign in or create an account to enroll and purchase this course.");
      navigate({
        to: "/auth",
        search: {
          redirect: "/fees",
          plan: pkg.title,
          instrument: selectedInstrument,
          // "yes" not "true"/"1" — the router's search parser auto-coerces those
          // to a real boolean/number, which fails our typeof-string checks below.
          enroll: "yes",
        },
      });
      return;
    }
    setActiveEnroll({ plan: pkg, instrument: selectedInstrument });
  };

  // After a sign-in redirect back from /auth (?enroll=yes), resume checkout for
  // the package the user picked before being sent to log in, instead of
  // dropping them back on a blank fees page.
  useEffect(() => {
    if (enroll !== "yes" || !session) return;
    const packagesToUse = data && data.length > 0 ? normalizeFeePackages(data) : FALLBACK_PACKAGES;
    const matched = plan
      ? packagesToUse.find((p) => p.title.toLowerCase() === plan.toLowerCase())
      : undefined;
    const matchedInstrument = instrument
      ? INSTRUMENTS.find((i) => i.toLowerCase() === instrument.toLowerCase())
      : undefined;

    setActiveEnroll({
      plan: matched ?? selectedPlan,
      instrument: matchedInstrument ?? selectedInstrument,
    });

    navigate({
      to: "/fees",
      search: { plan: plan ?? undefined, instrument: instrument ?? undefined },
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enroll, session, data]);

  return (
    <>
      {/* Header */}
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />

        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">
            Pricing & Plans
          </span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Courses
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">
              & tuition.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-navy-foreground/80 leading-relaxed font-light">
            Transparent fee structures. No hidden costs. Select a program built around your level,
            scheduling needs, and musical aspirations.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/3 right-10 w-[300px] h-[300px]" />

        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">
            Tuition Options
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
            Our Fee Packages
          </h2>
          <p className="mt-4 text-muted-foreground font-light text-sm sm:text-base mb-10">
            Choose a plan that suits your schedule and goals. All courses available in-person and
            online.
          </p>

          <div className="flex justify-center">
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/80">
              <button
                onClick={() => setShowMonthlyRate(false)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                  !showMonthlyRate
                    ? "bg-background text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Program
              </button>
              <button
                onClick={() => setShowMonthlyRate(true)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                  showMonthlyRate
                    ? "bg-background text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Rate
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {normalizedPackages.map((pkg) => {
            const totalMonths = parseInt(pkg.duration) || 1;
            const pkgEstimatedMonthly = Math.round(pkg.rawFees / totalMonths);
            const displayedFee = showMonthlyRate
              ? `Rs. ${pkgEstimatedMonthly.toLocaleString()}`
              : pkg.fees;
            const displayedPeriod = showMonthlyRate ? "/ month" : "/ total";

            return (
              <div
                key={pkg.title}
                className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
                  pkg.popular
                    ? "border-azure bg-card/75 dark:bg-card/30 shadow-[0_20px_50px_-10px_rgba(59,130,246,0.2)] hover-glow"
                    : "border-border/85 bg-card/35 dark:bg-card/15 hover-glow"
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`absolute top-4 right-4 font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      pkg.popular
                        ? "bg-azure text-azure-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                )}

                <div className="mb-6">
                  <span className="font-mono text-xs text-azure font-bold">
                    {pkg.duration} Track
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase mt-2 leading-tight group-hover:text-azure transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 font-light">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-foreground font-display text-gradient-azure">
                    {displayedFee}
                  </span>
                  <span className="text-xs text-muted-foreground">{displayedPeriod}</span>
                </div>

                <div className="flex items-center gap-2 mb-6 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
                  <Clock className="size-3.5 text-azure" />
                  <span>{pkg.mode}</span>
                </div>

                <div className="border-t border-border/60 my-2" />

                <ul className="space-y-4 my-6 flex-1">
                  {pkg.features.map((feat: string) => (
                    <li key={feat} className="flex gap-3 items-start text-sm">
                      <Check className="size-4 text-azure shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/90 font-light text-xs sm:text-sm">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleEnrollClick(pkg)}
                  className="w-full py-4 font-mono font-bold uppercase tracking-wider text-[10px] text-center rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-azure text-azure-foreground hover:bg-azure/90 shadow-lg shadow-azure/20"
                >
                  Buy Course & Enroll
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tuition Estimator Widget */}
      <section className="bg-secondary/10 py-28 px-6 border-b border-border/40 relative overflow-hidden">
        <div className="glowing-blob top-1/4 left-1/4 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-4xl mx-auto glass-panel rounded-3xl border border-border/60 shadow-2xl p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-azure uppercase tracking-widest font-bold">
                <Calculator className="size-4 animate-bounce" /> Tool
              </div>
              <h3 className="font-display text-3xl font-extrabold uppercase mt-2 tracking-tight">
                Tuition Estimator
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm font-light leading-relaxed">
              Select your options below to calculate the estimated monthly rate and view plan
              inclusions.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold mb-3">
                  1. Select Study Track
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {normalizedPackages.map((pkg) => (
                    <button
                      key={pkg.title}
                      onClick={() => setSelectedPlan(pkg)}
                      className={`text-left p-4 border rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                        selectedPlan.title === pkg.title
                          ? "border-azure bg-azure/10 dark:bg-azure/5 text-foreground shadow-sm shadow-azure/5"
                          : "border-border/80 hover:border-azure/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-sm uppercase tracking-wide">
                        <span>{pkg.title}</span>
                        <span className="text-azure">{pkg.fees}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 font-light">
                        Duration: {pkg.duration} · Mode: {pkg.mode}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-foreground/80 font-bold mb-3">
                    2. Choose Instrument / Stream
                  </label>
                  <select
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="w-full bg-muted/60 dark:bg-card/30 border border-border/80 px-4 py-3.5 rounded-xl text-sm outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 text-foreground"
                  >
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst} className="bg-background text-foreground">
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="flex flex-col bg-muted/30 dark:bg-card/10 p-8 rounded-3xl border border-border/60 justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                  Estimated Breakdown
                </span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold font-display text-azure text-gradient-azure">
                    Rs. {estimatedMonthly.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 font-light">
                  Total Course Fee: <strong>{selectedPlan.fees}</strong> (over{" "}
                  {selectedPlan.duration})
                </div>

                {isMounted ? (
                  <>
                    <div className="h-44 w-full mt-6 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Private Mentorship", value: 50, color: "var(--azure)" },
                              { name: "Practice Access", value: 20, color: "#10b981" },
                              { name: "Recitals & Stage", value: 15, color: "#f59e0b" },
                              { name: "Exams & Materials", value: 15, color: "#a855f7" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {[
                              { name: "Private Mentorship", value: 50, color: "var(--azure)" },
                              { name: "Practice Access", value: 20, color: "#10b981" },
                              { name: "Recitals & Stage", value: 15, color: "#f59e0b" },
                              { name: "Exams & Materials", value: 15, color: "#a855f7" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "oklch(var(--card))",
                              borderColor: "var(--color-border)",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontFamily: "var(--font-mono)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[9px] font-mono border-b border-border/60 pb-6">
                      {[
                        { name: "Private Mentorship", value: 50, color: "var(--azure)" },
                        { name: "Practice Access", value: 20, color: "#10b981" },
                        { name: "Recitals & Stage", value: 15, color: "#f59e0b" },
                        { name: "Exams & Materials", value: 15, color: "#a855f7" },
                      ].map((d) => (
                        <div
                          key={d.name}
                          className="flex items-center gap-1.5 text-muted-foreground"
                        >
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="truncate">
                            {d.name} ({d.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-44 w-full mt-6 border-b border-border/60 pb-6 flex items-center justify-center text-xs text-muted-foreground font-mono">
                    Loading breakdown...
                  </div>
                )}

                <div className="space-y-4 mt-6">
                  <div className="flex gap-3 text-xs">
                    <BookOpen className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Selected Track:</strong>
                      <p className="text-muted-foreground font-light">
                        {selectedPlan.title} ({selectedInstrument})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Award className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Inclusions & Recitals:</strong>
                      <p className="text-muted-foreground font-light">
                        Weekly materials, recital eligibility, certification support.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Sparkles className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Flexible Format:</strong>
                      <p className="text-muted-foreground font-light">
                        In-person at our studio or live online sessions with recordings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleEnrollClick(selectedPlan)}
                  className="w-full bg-azure hover:bg-azure/90 text-azure-foreground py-4 font-mono font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                >
                  Buy Course & Enroll <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-28 px-6 max-w-4xl mx-auto relative">
        <div className="glowing-blob-gold bottom-10 left-1/4 w-[250px] h-[250px]" />

        <div className="text-center mb-16 relative z-10">
          <HelpCircle className="size-8 text-azure mx-auto animate-pulse" />
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight">
            Tuition Questions
          </h2>
          <p className="text-muted-foreground mt-2 font-light text-sm sm:text-base">
            Answers to common billing and registration questions.
          </p>
        </div>

        <div className="grid gap-4 relative z-10">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ===== ENROLLMENT CHECKOUT MODAL ===== */}
      {activeEnroll && session && (
        <EnrollmentCheckoutModal
          plan={activeEnroll.plan}
          session={session}
          defaultInstrument={activeEnroll.instrument}
          onClose={() => setActiveEnroll(null)}
        />
      )}
    </>
  );
}
