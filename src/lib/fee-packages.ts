// Shared tuition package shape + static fallback used by /fees and the
// student dashboard when the fees table hasn't loaded (or is empty).

export type FeePackage = {
  title: string;
  fees: string;
  rawFees: number;
  duration: string;
  mode: string;
  tagline: string;
  features: string[];
  popular: boolean;
  badge: string | null;
};

// Raw row shape — DB rows use raw_fees (snake_case), the static fallback uses rawFees.
type FeePackageSource = {
  title: string;
  fees: string;
  raw_fees?: number;
  rawFees?: number;
  duration: string;
  mode: string;
  tagline?: string | null;
  features?: unknown;
  popular?: boolean | null;
  badge?: string | null;
};

export function normalizeFeePackages(rows: FeePackageSource[]): FeePackage[] {
  return rows.map((p) => ({
    title: p.title,
    fees: p.fees,
    rawFees: p.raw_fees !== undefined ? p.raw_fees : (p.rawFees ?? 0),
    duration: p.duration,
    mode: p.mode,
    tagline: p.tagline ?? "",
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    popular: !!p.popular,
    badge: p.badge ?? null,
  }));
}

export const FALLBACK_PACKAGES: FeePackage[] = [
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
      "No lock-in — renew month to month",
    ],
    popular: false,
    badge: "Flexible",
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
      "Zahau Foundation Certificate on completion",
    ],
    popular: false,
    badge: "Starter",
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
      "Zahau Certificate on completion",
    ],
    popular: true,
    badge: "Best Value",
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
      "Zahau Annual Certificate of Achievement",
    ],
    popular: false,
    badge: "Certificate",
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
      "Career guidance & performance portfolio",
    ],
    popular: false,
    badge: "Diploma",
  },
];
