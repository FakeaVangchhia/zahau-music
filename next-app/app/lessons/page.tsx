import type { Metadata } from "next";
import LessonsClient from "./lessons-client";

export const metadata: Metadata = {
  title: "Recorded Lessons — Zahau Music School",
  description:
    "Access video lessons, learning resources, and sheet music uploaded by Zahau Music School faculty.",
  openGraph: {
    title: "Recorded Lessons — Zahau Music School",
    description:
      "Access video lessons, learning resources, and sheet music uploaded by Zahau Music School faculty.",
  },
  alternates: { canonical: "/lessons" },
};

export default function LessonsPage() {
  return <LessonsClient />;
}
