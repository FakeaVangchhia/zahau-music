import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, BookOpen, Check, Award, Calculator, HelpCircle, ArrowRight, Sparkles } from "lucide-react";

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
  const [selectedPlan, setSelectedPlan] = useState(PACKAGES[3]);
  const [selectedInstrument, setSelectedInstrument] = useState("Piano");
  const [learningMode, setLearningMode] = useState<"offline" | "online">("offline");

  const estimatedMonthly = Math.round(selectedPlan.rawFees / parseInt(selectedPlan.duration));

  return (
    <>
      {/* Header */}
      <section className="bg-navy text-navy-foreground py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-azure/10 via-transparent to-transparent opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Pricing & Plans</p>
          <h1 className="mt-4 font-display text-6xl md:text-8xl uppercase leading-none">
            Courses
            <br />
            & Tuition.
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
            Transparent fee structures. No contracts, no hidden costs. Select a program built around your level, scheduling needs, and musical aspirations.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-azure">Tuition Options</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl uppercase">Our Fee Packages</h2>
          <p className="mt-4 text-muted-foreground">
            Explore our curriculum paths. Rates apply for online or offline (Delhi branches) study.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.title}
              className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                pkg.popular
                  ? "border-azure bg-card/60 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.15)] dark:bg-card/40"
                  : "border-border bg-card/30 dark:bg-card/20 hover:border-border/80"
              }`}
            >
              {pkg.badge && (
                <span className={`absolute top-4 right-4 font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  pkg.popular ? "bg-azure text-azure-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {pkg.badge}
                </span>
              )}
              
              <div className="mb-6">
                <span className="font-mono text-xs text-muted-foreground">{pkg.duration} Track</span>
                <h3 className="font-display text-2xl uppercase mt-1 leading-tight">{pkg.title}</h3>
                <p className="text-xs text-muted-foreground mt-2">{pkg.tagline}</p>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-foreground font-display">{pkg.fees}</span>
                <span className="text-xs text-muted-foreground">/ total</span>
              </div>

              <div className="flex items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                <Clock className="size-3.5 text-azure" />
                <span>{pkg.mode}</span>
              </div>

              <div className="border-t border-border/60 my-2" />

              <ul className="space-y-3 my-6 flex-1">
                {pkg.features.map((feat) => (
                  <li key={feat} className="flex gap-2.5 items-start text-sm">
                    <Check className="size-4 text-azure shrink-0 mt-0.5" />
                    <span className="text-muted-foreground/90">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                search={{ course: pkg.title }}
                className={`w-full py-3.5 font-bold uppercase tracking-wider text-xs text-center rounded-lg transition-all duration-200 cursor-pointer block ${
                  pkg.popular
                    ? "bg-azure text-azure-foreground hover:bg-azure/90 hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
                    : "border border-border hover:border-azure hover:text-azure"
                }`}
              >
                Inquire & Enroll
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Tuition Estimator Widget */}
      <section className="bg-secondary/40 py-24 px-6 border-y border-border">
        <div className="max-w-4xl mx-auto bg-background rounded-3xl border border-border/60 shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-azure uppercase tracking-widest font-semibold">
                <Calculator className="size-4" /> Tool
              </div>
              <h3 className="font-display text-3xl uppercase mt-2">Tuition Estimator</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select your options below to calculate the estimated monthly rate and view plan inclusions.
            </p>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
                  1. Select Study Track
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.title}
                      onClick={() => setSelectedPlan(pkg)}
                      className={`text-left p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                        selectedPlan.title === pkg.title
                          ? "border-azure bg-azure/5 text-foreground"
                          : "border-border hover:border-border/80 text-muted-foreground"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-sm uppercase">
                        <span>{pkg.title}</span>
                        <span className="text-azure">{pkg.fees}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Duration: {pkg.duration} · Mode: {pkg.mode}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
                    2. Choose Instrument
                  </label>
                  <select
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="w-full bg-muted/40 border border-border/80 px-4 py-3 rounded-lg text-sm outline-none focus:border-azure focus:ring-1 focus:ring-azure/30"
                  >
                    {["Piano", "Keyboard", "Guitar", "Bass", "Drums", "Violin", "Voice", "Music Theory"].map((inst) => (
                      <option key={inst} value={inst} className="bg-background">
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold mb-3">
                    3. Choose Mode
                  </label>
                  <div className="flex bg-muted/40 p-1 rounded-lg border border-border/80">
                    <button
                      onClick={() => setLearningMode("offline")}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-md cursor-pointer ${
                        learningMode === "offline" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Offline
                    </button>
                    <button
                      onClick={() => setLearningMode("online")}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded-md cursor-pointer ${
                        learningMode === "online" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Online
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="flex flex-col bg-muted/30 p-8 rounded-2xl border border-border/60 justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Estimated Breakdown</span>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold font-display text-azure">Rs. {estimatedMonthly.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Total Course Fee: <strong>{selectedPlan.fees}</strong> (over {selectedPlan.duration})
                </div>

                <div className="border-t border-border/60 my-6" />

                <div className="space-y-4">
                  <div className="flex gap-3 text-xs">
                    <BookOpen className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Selected Track:</strong>
                      <p className="text-muted-foreground">{selectedPlan.title} ({selectedInstrument})</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <Award className="size-4 text-azure shrink-0" />
                    <div>
                      <strong className="text-foreground">Inclusions & Recitals:</strong>
                      <p className="text-muted-foreground">Weekly materials, recital eligibility, certification support.</p>
                    </div>
                  </div>
                  {learningMode === "offline" && (
                    <div className="flex gap-3 text-xs">
                      <Sparkles className="size-4 text-azure shrink-0" />
                      <div>
                        <strong className="text-foreground">Studio Branch:</strong>
                        <p className="text-muted-foreground">Classes hosted at South Extension II/Hauz Khas practice rooms.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/contact"
                  search={{ course: `${selectedPlan.title} (${selectedInstrument}) - ${learningMode.toUpperCase()}` }}
                  className="w-full bg-gradient-to-r from-azure to-blue-600 hover:from-azure/95 hover:to-blue-600/95 text-azure-foreground py-3.5 font-bold uppercase tracking-wider text-xs rounded-lg transition-all duration-200 hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Book Free Trial class <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <HelpCircle className="size-8 text-azure mx-auto" />
          <h2 className="mt-3 font-display text-4xl uppercase">Tuition Questions</h2>
          <p className="text-muted-foreground mt-2">Answers to common billing and registration questions.</p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="font-display text-xl uppercase pr-8">{faq.q}</span>
                <span className="font-mono text-2xl text-azure group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
