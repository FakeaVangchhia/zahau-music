import type { Metadata } from "next";
import BookDemoClient from "./book-demo-client";

export const metadata: Metadata = {
  title: "Book a Demo — Zahau Music School",
  description:
    "Book a demo session at Zahau Music School. Choose your preferred day and time with Dr. Henry.",
  openGraph: {
    title: "Book a Demo — Zahau Music School",
    description:
      "Book a demo session at Zahau Music School. Choose your preferred day and time with Dr. Henry.",
  },
  alternates: { canonical: "/book-demo" },
};

export default function BookDemoPage() {
  return <BookDemoClient />;
}
