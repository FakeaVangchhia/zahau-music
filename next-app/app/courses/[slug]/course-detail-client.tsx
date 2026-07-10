"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function CourseDetailClient({
  courseName,
  courseSlug,
}: {
  courseName: string;
  courseSlug: string;
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

  return (
    <div className="bg-gradient-to-br from-azure to-blue-600 text-azure-foreground p-8 rounded-2xl border border-border shadow-2xl relative overflow-hidden">
      <div className="glowing-blob top-0 right-0 w-[200px] h-[200px]" />
      <div className="relative z-10">
        <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Enroll
        </h3>
        <p className="mt-3 text-sm text-white/80 font-light leading-relaxed">
          Submit a quick interest form and we&apos;ll schedule a free trial class within 48 hours.
        </p>
        <Link
          href="/contact"
          className="mt-8 w-full text-center inline-block bg-white text-azure hover:bg-white/95 py-3.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          Book trial class
        </Link>
      </div>
    </div>
  );
}
