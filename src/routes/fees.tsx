import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Clock, BookOpen, Check, Award, Calculator, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
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
        content: "Transparent course fees for monthly, 3-month, 4-month and 6-month certificate programs at Delhi's premier music academy.",
      },
      { property: "og:url", content: "/fees" },
    ],
    links: [{ rel: "canonical", href: "/fees" }],
  }),
  component: FeesPage,
});

const PACKAGES = [
  {
    title: "Level 3: Monthly Method",
    fees: "Rs. 4,000",
    rawFees: 4000,
    duration: "1 Month",
    mode: "Hybrid / Offline",
    tagline: "Pay-as-you-go basic foundation track",
    features: [
      "1 class in a week (4 classes in a month)",
      "1 hour per class at convenient timings",
      "Introduction to basic music theory",
      "Pitches, scales, intervals & basic harmony",
      "Guitar, keyboard, piano or voice fundamentals",
      "Access to practice studios"
    ],
    popular: false,
    badge: "Flexible"
  },
  {
    title: "Level 1: Basic Three Months",
    fees: "Rs. 12,000",
    rawFees: 12000,
    duration: "3 Months",
    mode: "Hybrid / Offline",
    tagline: "Structured entry-level skill booster",
    features: [
      "1 class in a week (12 classes total)",
      "1 hour per class at convenient timings",
      "Classical Piano Beginner syllabus",
      "Guitar Foundation & Rhythm Guitar modules",
      "Drums basic grooves, fills & counting",
      "Musicianship, ear training & theory basics",
      "1 recital band showcase & studio recording"
    ],
    popular: false,
    badge: "Recommended"
  },
  {
    title: "Standard Certificate Course",
    fees: "Rs. 20,000",
    rawFees: 20000,
    duration: "4 Months",
    mode: "Online Only",
    tagline: "Comprehensive remote certificate program",
    features: [
      "2 classes in a week (32 classes total)",
      "1 hour per class at convenient timings",
      "Select Keyboard, Piano, Guitar, Bass, Drums, Violin, Voice or Theory",
      "Includes premium Video Learning Resources",
      "Regular assignments & weekly expert feedback",
      "Zahau Foundation Certificate on completion",
      "Online student portal access"
    ],
    popular: false,
    badge: "Online Standard"
  },
  {
    title: "Level 2: Intermediate Six Months",
    fees: "Rs. 24,000",
    rawFees: 24000,
    duration: "6 Months",
    mode: "Hybrid / Offline",
    tagline: "Serious technical and artistic development",
    features: [
      "1 class in a week (24 classes total)",
      "1 hour per class at convenient timings",
      "Classical Piano Early Intermediate works",
      "Exploring Beethoven, Mozart, Schumann, Bartok",
      "Intermediate music theory & complex rhythms",
      "Solo performance & chamber ensemble playing",
      "Professional studio recording session",
      "Preparation for ABRSM/Trinity exams"
    ],
    popular: true,
    badge: "Best Value"
  },
  {
    title: "Performance Based Certificate",
    fees: "Rs. 25,000",
    rawFees: 25000,
    duration: "6 Months",
    mode: "Online Only",
    tagline: "Elite remote conservatory-grade pathway",
    features: [
      "2 classes in a week (48 classes total)",
      "1 hour per class at convenient timings",
      "Advanced repertoire in your choice instrument",
      "Deep dive into harmony, composition & ear training",
      "Includes curated Video Resources & assignments",
      "Personalized faculty reviews & expert feedback",
      "Performance Grade preparation & recitals",
      "Zahau Graduate Recital Certificate"
    ],
    popular: false,
    badge: "Online Premium"
  }
];

const FAQS = [
  {
    q: "Are there any hidden charges or admission fees?",
    a: "We charge a one-time registration fee of Rs. 1,000 for new students. This covers your enrollment, student dashboard access, ID card, and a starter pack containing music theory worksheets and notebook resources."
  },
  {
    q: "Do you offer monthly payment options for long-term plans?",
    a: "Yes! For our 6-month plans (Level 2 and Performance Based), you can split the payment into two convenient installments due at the start of Month 1 and Month 4."
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
    features: Array.isArray(p.features) ? p.features : [],
    popular: !!p.popular,
    badge: p.badge
  }));

  const [showMonthlyRate, setShowMonthlyRate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(normalizedPackages[3] || normalizedPackages[0]);
  const [selectedInstrument, setSelectedInstrument] = useState("Piano");
  const [learningMode, setLearningMode] = useState<"offline" | "online">("offline");
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
      setSelectedPlan(dbPackages[3] || dbPackages[0]);
    }
  }, [data]);

  const estimatedMonthly = Math.round(selectedPlan.rawFees / parseInt(selectedPlan.duration));

  return (
    <>
      {/* Header */}
      <section className="bg-navy text-navy-foreground py-32 px-6 relative overflow-hidden">
        {/* Glowing background blobs */}
        <div className="glowing-blob top-1/4 left-1/4 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2" />
        <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-azure font-bold block mb-4">Pricing & Plans</span>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase leading-none font-extrabold tracking-tight">
            Courses
            <br />
            <span className="font-serif italic text-azure normal-case font-light lowercase">& tuition.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed font-light">
            Transparent fee structures. No contracts, no hidden costs. Select a program built around your level, scheduling needs, and musical aspirations.
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
            Explore our curriculum paths. Rates apply for online or offline (Delhi branches) study.
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
          {normalizedPackages.map((pkg) => {
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
                  {pkg.features.map((feat) => (
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

      {/* Tuition Estimator Widget */}
      <section className="bg-secondary/20 py-28 px-6 border-y border-border/40 relative overflow-hidden">
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
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
                    2. Choose Instrument
                  </label>
                  <select
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="w-full bg-muted/60 dark:bg-card/30 border border-border/80 px-4 py-3.5 rounded-xl text-sm outline-none focus:border-azure focus:ring-4 focus:ring-azure/10 transition-all duration-200 text-foreground"
                  >
                    {["Piano", "Keyboard", "Guitar", "Bass", "Drums", "Violin", "Voice", "Music Theory"].map((inst) => (
                      <option key={inst} value={inst} className="bg-background text-foreground">
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
                    3. Choose Mode
                  </label>
                  <div className="flex bg-muted/60 dark:bg-card/20 p-1 rounded-xl border border-border/80">
                    <button
                      onClick={() => setLearningMode("offline")}
                      className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                        learningMode === "offline" ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Offline
                    </button>
                    <button
                      onClick={() => setLearningMode("online")}
                      className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-lg cursor-pointer transition-all duration-300 ${
                        learningMode === "online" ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Online
                    </button>
                  </div>
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
                  {learningMode === "offline" && (
                    <div className="flex gap-3 text-xs">
                      <Sparkles className="size-4 text-azure shrink-0" />
                      <div>
                        <strong className="text-foreground">Studio Branch:</strong>
                        <p className="text-muted-foreground font-light">Classes hosted at South Extension II/Hauz Khas practice rooms.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  search={{ course: `${selectedPlan.title} (${selectedInstrument}) - ${learningMode.toUpperCase()}` }}
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

        <div className="divide-y divide-border border-y border-border relative z-10">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none focus:outline-none">
                <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight group-hover:text-azure transition-colors pr-8">{faq.q}</span>
                <span className="font-mono text-2xl text-azure group-open:rotate-45 transition-transform duration-300 select-none">+</span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm font-light max-w-3xl">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
