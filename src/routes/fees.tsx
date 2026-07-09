import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, BookOpen, Check, Award, Calculator, HelpCircle, ArrowRight, Sparkles, Music, Mic2, Users } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFees } from "@/lib/site.functions";


export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Courses & Fees — Zahau Music School" },
      {
        name: "description",
        content: "Transparent course fees for monthly, 3-month, 6-month, 1-year certificate and 2-year diploma programs at Zahau Music School.",
      },
      { property: "og:url", content: "/fees" },
    ],
    links: [{ rel: "canonical", href: "/fees" }],
  }),
  component: FeesPage,
});

const PACKAGES = [
  {
    title: "Monthly Enrolment",
    fees: "Rs. 5,000",
    rawFees: 5000,
    duration: "1 Month",
    mode: "In-Person & Online",
    tagline: "Flexible pay-as-you-go learning",
    features: [
      "1 class per week (4 classes / month)",
      "1 hour per class at convenient timings",
      "Choice of instrument or vocal stream",
      "Introduction to music theory",
      "Access to practice materials",
      "No lock-in — renew month to month"
    ],
    popular: false,
    badge: "Flexible"
  },
  {
    title: "3 Months Course",
    fees: "Rs. 25,000",
    rawFees: 25000,
    duration: "3 Months",
    mode: "In-Person & Online",
    tagline: "Structured foundation program (until finish)",
    features: [
      "2 classes per week (24 classes total)",
      "1 hour per class at convenient timings",
      "Structured beginner syllabus",
      "Choose Piano, Keyboard, Guitar, Drums, Voice or Theory",
      "Regular progress assessments",
      "Zahau Foundation Certificate on completion"
    ],
    popular: false,
    badge: "Starter"
  },
  {
    title: "6 Months Certificate",
    fees: "Rs. 50,000",
    rawFees: 50000,
    duration: "6 Months",
    mode: "In-Person & Online",
    tagline: "Comprehensive certificate program (until finish)",
    features: [
      "2 classes per week (48 classes total)",
      "1 hour per class at convenient timings",
      "Intermediate to advanced repertoire",
      "Deep dive into harmony, theory & ear training",
      "Personalized faculty reviews & feedback",
      "Performance Grade preparation & recitals",
      "Zahau Certificate on completion"
    ],
    popular: true,
    badge: "Best Value"
  },
  {
    title: "1 Year Certificate Course",
    fees: "Rs. 70,000",
    rawFees: 70000,
    duration: "12 Months",
    mode: "In-Person & Online",
    tagline: "Full-year professional certification",
    features: [
      "2 classes per week (96 classes total)",
      "1 hour per class at convenient timings",
      "Comprehensive technique & repertoire",
      "Advanced music theory & composition",
      "Stage performance & recital opportunities",
      "Exam board preparation (ABRSM / Trinity)",
      "Zahau Annual Certificate of Achievement"
    ],
    popular: false,
    badge: "Certificate"
  },
  {
    title: "Diploma in Music",
    fees: "Rs. 1,40,000",
    rawFees: 140000,
    duration: "24 Months",
    mode: "In-Person & Online",
    tagline: "Professional 2-year music diploma",
    features: [
      "3 classes per week (288 classes total)",
      "1 hour per class at convenient timings",
      "Full performance & composition curriculum",
      "Advanced ensembles & band sessions",
      "Industry mentorship & masterclasses",
      "International exam board certifications",
      "Zahau Diploma in Music — graduate credential",
      "Career guidance & performance portfolio"
    ],
    popular: false,
    badge: "Diploma"
  }
];

const HIRE_PACKAGES = [
  {
    title: "Single Performance",
    price: "Rs. 10,000",
    rawPrice: 10000,
    note: "Additional charge based on song selection",
    icon: "mic",
    description: "Solo artist or instrumentalist performance for your event. Ideal for private gatherings, corporate events, weddings, and special occasions.",
    includes: [
      "Solo performer of your choice",
      "Up to 45-minute performance set",
      "Standard sound setup included",
      "Pre-event rehearsal & coordination",
      "Additional charge for specific song requests",
      "Professional stage presence & attire"
    ]
  },
  {
    title: "Band Performance",
    price: "Rs. 30,000",
    rawPrice: 30000,
    note: "Full band package",
    icon: "band",
    description: "Full live band experience for larger events, corporate functions, concerts, and celebrations. Guaranteed to electrify your audience.",
    includes: [
      "Full band (4–6 members)",
      "Up to 90-minute live performance",
      "Complete PA & sound system",
      "Lighting coordination",
      "Song list discussion & setlist planning",
      "Professional attire & stage setup"
    ]
  }
];

const FAQS = [
  {
    q: "Are there any hidden charges or admission fees?",
    a: "We charge a one-time registration fee of Rs. 1,000 for new students. This covers your enrollment, student dashboard access, ID card, and a starter pack containing music theory worksheets and notebook resources."
  },
  {
    q: "Do you offer installment options for long-term plans?",
    a: "Yes! For our 6-month, 1-year and 2-year programs, you can split the payment into convenient installments. Please contact us to discuss a schedule that works for you."
  },
  {
    q: "What does 'until finish' mean for the 3 and 6 month courses?",
    a: "Our 3-month and 6-month courses are structured programs with a defined syllabus. 'Until finish' means you pay once for the complete course duration — there's no recurring monthly fee during those months."
  },
  {
    q: "What are the additional charges for the Single Performance hire?",
    a: "The base fee of Rs. 10,000 covers a standard performance. Song-specific requests — particularly licensed compositions, complex arrangements, or custom compositions — may incur an additional fee which will be discussed and agreed upon during booking."
  },
  {
    q: "Are board examination fees included in the tuition?",
    a: "No. Registration fees for international exam boards (ABRSM, Trinity College London, Rockschool) are paid directly to the respective boards when applying for graded certifications."
  },
  {
    q: "What is your rescheduling and cancellation policy?",
    a: "We require 24 hours' notice to reschedule a class. Students on regular plans are allowed up to two reschedules per term without charge, subject to faculty availability."
  }
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div 
      className={`glass-panel border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
        open ? "border-azure/40 bg-card/60 shadow-lg shadow-azure/5" : "border-border/50 hover:border-azure/20"
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center select-none">
        <span className={`font-display text-lg font-bold uppercase tracking-tight transition-colors duration-305 ${
          open ? "text-azure" : "text-foreground"
        }`}>
          {q}
        </span>
        <span className={`font-mono text-xl text-azure transition-transform duration-350 ${
          open ? "rotate-45" : ""
        }`}>
          +
        </span>
      </div>
      <div className={`grid transition-all duration-350 ease-in-out ${
        open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
      }`}>
        <div className="overflow-hidden">
          <p className="text-muted-foreground leading-relaxed text-sm font-light max-w-3xl">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeesPage() {
  const fetchFees = useServerFn(getFees);
  const { data } = useQuery({ queryKey: ["fees-all"], queryFn: () => fetchFees() });
  
  const packagesList = data && data.length > 0 ? data : PACKAGES;
  const normalizedPackages = packagesList.map((p: any) => ({
    title: p.title,
    fees: p.fees,
    rawFees: p.raw_fees !== undefined ? p.raw_fees : p.rawFees,
    duration: p.duration,
    mode: p.mode,
    tagline: p.tagline,
    features: (Array.isArray(p.features) ? p.features : []) as string[],
    popular: !!p.popular,
    badge: p.badge
  }));

  const [showMonthlyRate, setShowMonthlyRate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(normalizedPackages[2] || normalizedPackages[0]);
  const [selectedInstrument, setSelectedInstrument] = useState("Piano");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      const dbPackages = data.map((p: any) => ({
        title: p.title,
        fees: p.fees,
        rawFees: p.raw_fees,
        duration: p.duration,
        mode: p.mode,
        tagline: p.tagline,
        features: Array.isArray(p.features) ? p.features : [],
        popular: !!p.popular,
        badge: p.badge
      }));
      setSelectedPlan(dbPackages[2] || dbPackages[0]);
    }
  }, [data]);

  const durationMonths = parseInt(selectedPlan.duration) || 1;
  const estimatedMonthly = Math.round(selectedPlan.rawFees / durationMonths);

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
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Pricing & Plans</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Courses
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">& tuition.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-navy-foreground/80 leading-relaxed font-light">
            Transparent fee structures. No hidden costs. Select a program built around your level, scheduling needs, and musical aspirations.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-28 px-6 max-w-7xl mx-auto relative">
        <div className="glowing-blob top-1/3 right-10 w-[300px] h-[300px]" />
        
        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">Tuition Options</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight">Our Fee Packages</h2>
          <p className="mt-4 text-muted-foreground font-light text-sm sm:text-base mb-10">
            Choose a plan that suits your schedule and goals. All courses available in-person and online.
          </p>
          
          <div className="flex justify-center">
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/80">
              <button
                onClick={() => setShowMonthlyRate(false)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                  !showMonthlyRate ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Total Course Fee
              </button>
              <button
                onClick={() => setShowMonthlyRate(true)}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                  showMonthlyRate ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Estimated Monthly Cost
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {normalizedPackages.map((pkg: any) => {
            const totalMonths = parseInt(pkg.duration) || 1;
            const pkgEstimatedMonthly = Math.round(pkg.rawFees / totalMonths);
            const displayedFee = showMonthlyRate ? `Rs. ${pkgEstimatedMonthly.toLocaleString()}` : pkg.fees;
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
                  <span className={`absolute top-4 right-4 font-mono text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                    pkg.popular ? "bg-azure text-azure-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {pkg.badge}
                  </span>
                )}
                
                <div className="mb-6">
                  <span className="font-mono text-xs text-azure font-bold">{pkg.duration} Track</span>
                  <h3 className="font-display text-2xl font-bold uppercase mt-2 leading-tight group-hover:text-azure transition-colors">{pkg.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-light">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-foreground font-display text-gradient-azure">{displayedFee}</span>
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
                      <span className="text-muted-foreground/90 font-light text-xs sm:text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  search={{ course: pkg.title }}
                  className={`w-full py-4 font-mono font-bold uppercase tracking-wider text-[10px] text-center rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer block ${
                    pkg.popular
                      ? "bg-azure text-azure-foreground hover:bg-azure/90 shadow-lg shadow-azure/20"
                      : "border border-border/80 hover:border-azure hover:text-azure"
                  }`}
                >
                  Inquire & Enroll
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hire for Events Section */}
      <section className="py-28 px-6 bg-secondary/20 border-y border-border/40 relative overflow-hidden">
        <div className="glowing-blob-gold top-1/4 right-10 w-[400px] h-[400px]" />
        <div className="glowing-blob bottom-1/4 left-10 w-[300px] h-[300px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-mono text-xs text-azure uppercase tracking-widest font-bold">Live Performances</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight">Hire for Events</h2>
            <p className="mt-4 text-muted-foreground font-light text-sm sm:text-base">
              Bring world-class live music to your event. Our performers are available for weddings, corporate events, private parties, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {HIRE_PACKAGES.map((pkg) => (
              <div
                key={pkg.title}
                className="relative flex flex-col p-10 rounded-3xl border border-border/70 bg-card/40 hover-glow transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex p-4 rounded-2xl bg-azure/10 text-azure group-hover:bg-azure group-hover:text-azure-foreground transition-all duration-300 mb-4">
                    {pkg.icon === "mic" ? (
                      <Mic2 className="size-8" />
                    ) : (
                      <Users className="size-8" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-azure uppercase tracking-widest font-bold block mb-2">
                    {pkg.icon === "mic" ? "Solo" : "Full Band"}
                  </span>
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight">{pkg.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">{pkg.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold font-display text-gradient-azure">{pkg.price}</span>
                  <span className="text-xs text-muted-foreground">base</span>
                </div>
                <p className="text-xs text-amber-500/80 font-mono font-bold uppercase tracking-wider mb-8">
                  ⚡ {pkg.note}
                </p>

                <div className="border-t border-border/60 mb-6" />

                {/* Includes */}
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex gap-3 items-start text-sm">
                      <Check className="size-4 text-azure shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/90 font-light text-xs sm:text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  search={{ course: `Event Hire: ${pkg.title}` }}
                  className="w-full bg-gradient-to-r from-azure to-blue-600 hover:from-azure/90 hover:to-blue-600/90 text-azure-foreground py-4 font-mono font-bold uppercase tracking-wider text-[10px] text-center rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  Book Now <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Note */}
          <p className="text-center text-xs text-muted-foreground font-mono mt-12 max-w-2xl mx-auto">
            All event hire bookings require a non-refundable 30% advance deposit at time of booking. Final pricing confirmed after event brief discussion.
          </p>
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
              <h3 className="font-display text-3xl font-extrabold uppercase mt-2 tracking-tight">Tuition Estimator</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm font-light leading-relaxed">
              Select your options below to calculate the estimated monthly rate and view plan inclusions.
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
                  {normalizedPackages.map((pkg: any) => (
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
                    {["Piano", "Keyboard", "Guitar", "Ukulele", "Classical Guitar", "Electric Guitar", "Drums", "Vocal (Hindustani)", "Vocal (Carnatic)", "Vocal (Western)", "Music Theory"].map((inst) => (
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
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Estimated Breakdown</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold font-display text-azure text-gradient-azure">Rs. {estimatedMonthly.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 font-light">
                  Total Course Fee: <strong>{selectedPlan.fees}</strong> (over {selectedPlan.duration})
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
                        <div key={d.name} className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="truncate">{d.name} ({d.value}%)</span>
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
                      <p className="text-muted-foreground font-light">{selectedPlan.title} ({selectedInstrument})</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Award className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Inclusions & Recitals:</strong>
                      <p className="text-muted-foreground font-light">Weekly materials, recital eligibility, certification support.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Sparkles className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Flexible Format:</strong>
                      <p className="text-muted-foreground font-light">In-person at our studio or live online sessions with recordings.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  search={{ course: `${selectedPlan.title} (${selectedInstrument})` }}
                  className="w-full bg-gradient-to-r from-azure to-blue-600 hover:from-azure/95 hover:to-blue-600/95 text-azure-foreground py-4 font-mono font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                >
                  Book Free Trial class <ArrowRight className="size-4" />
                </Link>
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
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight">Tuition Questions</h2>
          <p className="text-muted-foreground mt-2 font-light text-sm sm:text-base">Answers to common billing and registration questions.</p>
        </div>

        <div className="grid gap-4 relative z-10">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>
    </>
  );
}
