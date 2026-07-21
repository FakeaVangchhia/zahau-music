import type { Metadata } from "next";
import FeesClient from "./fees-client";

export const metadata: Metadata = {
  title: "Courses & Fees — Zahau Music School",
  description:
    "Transparent course fees for monthly, 3-month, 6-month, 1-year certificate and 2-year diploma programs at Zahau Music School.",
  openGraph: {
    title: "Courses & Fees — Zahau Music School",
    description:
      "Transparent course fees for monthly, 3-month, 6-month, 1-year certificate and 2-year diploma programs at Zahau Music School.",
  },
  alternates: { canonical: "/fees" },
};

export default function FeesPage() {
  return <FeesClient />;
}
