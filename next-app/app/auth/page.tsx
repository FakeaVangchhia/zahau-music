import type { Metadata } from "next";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Admin Login — Zahau Music School",
  description: "Sign in to the Zahau Music School admin console.",
  robots: { index: false },
  alternates: { canonical: "/auth" },
};

export default function AuthPage() {
  return <AuthForm />;
}
