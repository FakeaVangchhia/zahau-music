"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function CourseDetailClient({
  courseName,
  courseSlug,
  courseDuration,
}: {
  courseName: string;
  courseSlug: string;
  courseDuration?: string;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setIsAdmin(data?.role === "admin");
      }
      setLoaded(true);
    });
  }, [supabase]);

  if (!loaded) return null;

  if (isAdmin) {
    return (
      <div className="glass-panel border border-azure/40 bg-card p-8 rounded-2xl shadow-xl">
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Console
        </h3>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed font-light">
          You are viewing this course details page as an administrator.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 w-full text-center inline-block bg-azure text-azure-foreground py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-azure/80 shadow-md shadow-azure/10 transition-all rounded-xl cursor-pointer"
        >
          Go to Console
        </Link>
      </div>
    );
  }

  let matchedInstrument = "Piano";
  const nameLower = courseName.toLowerCase();
  const slugLower = courseSlug.toLowerCase();
  if (nameLower.includes("piano") || slugLower.includes("piano")) {
    matchedInstrument = "Piano";
  } else if (nameLower.includes("keyboard") || slugLower.includes("keyboard")) {
    matchedInstrument = "Keyboard";
  } else if (nameLower.includes("guitar") || slugLower.includes("guitar")) {
    matchedInstrument = "Guitar";
  } else if (nameLower.includes("drum") || slugLower.includes("drum")) {
    matchedInstrument = "Drums";
  } else if (
    nameLower.includes("vocal") ||
    slugLower.includes("vocal") ||
    nameLower.includes("voice") ||
    slugLower.includes("voice")
  ) {
    matchedInstrument = "Vocal (Western)";
  } else if (nameLower.includes("theory") || slugLower.includes("theory")) {
    matchedInstrument = "Music Theory";
  }

  const feesUrl = `/fees?plan=${encodeURIComponent(courseDuration || "")}&instrument=${encodeURIComponent(matchedInstrument)}`;

  return (
    <div className="bg-gradient-to-br from-azure to-blue-600 text-azure-foreground p-8 rounded-2xl border border-border shadow-2xl relative overflow-hidden">
      <div className="glowing-blob top-0 right-0 w-[200px] h-[200px]" />
      <div className="relative z-10">
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Enroll
        </h3>
        <p className="mt-3 text-sm text-white/80 font-light leading-relaxed">
          Select a tuition plan and complete your registration to start your musical journey.
        </p>
        <Link
          href={feesUrl}
          className="mt-8 w-full text-center inline-block bg-white text-azure hover:bg-white/95 py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          Buy Course & Enroll
        </Link>
      </div>
    </div>
  );
}
