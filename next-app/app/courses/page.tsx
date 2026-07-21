import type { Metadata } from "next";
import CoursesClient from "./courses-client";

export const metadata: Metadata = {
  title: "Courses — Zahau Music School",
  description:
    "Piano, Keyboard, Guitar (Ukulele, Classical & Electric), Drum, Vocal Performance (Hindustani, Carnatic, Western) and Music Theory. Beginner to diploma.",
  openGraph: {
    title: "Courses at Zahau Music School",
    description: "Six disciplines, every level — including ABRSM and Trinity certifications.",
  },
  alternates: { canonical: "/courses" },
};

export default function CoursesPage() {
  return <CoursesClient />;
}
