// Shared manual-UPI payment helpers used by /fees, /book-demo and the student
// dashboard. Students scan a dynamically generated UPI QR (amount embedded),
// pay in their own UPI app, then submit the transaction reference for admin
// approval. See src/lib/site.functions.ts for the server side.

// Demo/trial session booking fee (Rs. 500), in paise. The server validates the
// demo amount against this — keep client and server importing the same constant.
export const DEMO_BOOKING_FEE_PAISE = 50000;

// Build a UPI deep-link / QR payload (upi://pay?...). Rendering this string as a
// QR lets any UPI app (GPay, PhonePe, Paytm, BHIM) open a payment with the payee
// and the exact amount pre-filled, which removes the main source of wrong
// payments and makes admin reconciliation trivial.
export function buildUpiUri({
  vpa,
  payee,
  amount,
  note,
}: {
  vpa: string;
  payee: string;
  amount: number; // in rupees
  note?: string;
}): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payee,
    am: amount.toFixed(2),
    cu: "INR",
  });
  if (note) params.set("tn", note);
  return `upi://pay?${params.toString()}`;
}

// A UPI transaction reference (UTR / RRN) is always a 12-digit number — that's
// what banks print in their credit SMS and what students see in GPay/PhonePe/
// Paytm receipts. Normalize a pasted value to that canonical form; anything
// that doesn't contain a 12-digit run is not a real UTR.
export function normalizeUtr(input: string | null | undefined): string {
  if (!input) return "";
  const twelve = input.match(/\d{12}/);
  if (twelve) return twelve[0];
  return input.replace(/\D/g, "");
}

// Valid iff the input reduces to exactly 12 digits (ignoring spaces/dashes and
// labels like "UPI Ref:"). Empty input is handled by callers — the UTR field is
// optional; this only judges a value the student actually typed.
export function isValidUtr(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length === 12 && normalizeUtr(input).length === 12;
}

// Instrument / stream choices offered at checkout, mapped to course slugs
// seeded in the courses table (see setup_supabase_db.sql).
export const INSTRUMENTS = [
  "Piano",
  "Keyboard",
  "Guitar",
  "Ukulele",
  "Classical Guitar",
  "Electric Guitar",
  "Drums",
  "Vocal (Hindustani)",
  "Vocal (Carnatic)",
  "Vocal (Western)",
  "Music Theory",
] as const;

export const instrumentToSlug: Record<string, string> = {
  Piano: "piano",
  Keyboard: "keyboard",
  Guitar: "guitar",
  Ukulele: "guitar",
  "Classical Guitar": "guitar",
  "Electric Guitar": "guitar",
  Drums: "drums",
  "Vocal (Hindustani)": "voice",
  "Vocal (Carnatic)": "voice",
  "Vocal (Western)": "voice",
  "Music Theory": "music-theory",
};
