// Shared Razorpay checkout helpers used by /fees, /book-demo and the student dashboard.

// Demo/trial session booking fee (Rs. 500), in paise. The server verifies paid
// amounts against this — keep client and server importing the same constant.
export const DEMO_BOOKING_FEE_PAISE = 50000;

export type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayInstance = { open: () => void };
export type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (getRazorpayConstructor()) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function getRazorpayConstructor(): RazorpayConstructor | undefined {
  return (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
}

// Public (VITE_-prefixed) key id — safe to expose to the browser. The key
// SECRET must only ever live in server env (RAZORPAY_KEY_SECRET).
export function getRazorpayKeyId(): string {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error(
      "Payment gateway is not configured. Missing VITE_RAZORPAY_KEY_ID environment variable.",
    );
  }
  return keyId;
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
