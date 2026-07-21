import type { Metadata } from "next";
import GalleryClient from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery — Zahau Music School",
  description: "Photos and videos from concerts, recitals, studio sessions and our Delhi campus.",
  openGraph: {
    title: "Gallery — Zahau Music School",
    description: "Photos and videos from concerts, recitals, studio sessions and our Delhi campus.",
  },
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
