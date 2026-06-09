import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Zahau Music School" },
      { name: "description", content: "Sign in or create your Zahau student account." },
      { property: "og:url", content: "/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if verification is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) toast.error(r.error.message);
    else if (!r.redirected) navigate({ to: "/dashboard", replace: true });
  }

  return (
    <section className="min-h-[80vh] grid md:grid-cols-2">
      <div className="hidden md:flex bg-navy text-navy-foreground p-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Student Portal</p>
          <h1 className="mt-4 font-display text-6xl uppercase leading-none">Welcome<br />back.</h1>
          <p className="mt-8 max-w-md text-white/70">Track lessons, submit assignments, see your progress, and download your certificates.</p>
        </div>
      </div>
      <div className="p-8 md:p-16 max-w-md mx-auto w-full">
        <div className="flex gap-2 mb-8">
          <button onClick={() => setMode("signin")} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${mode==="signin"?"bg-navy text-navy-foreground":"text-muted-foreground"}`}>Sign in</button>
          <button onClick={() => setMode("signup")} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${mode==="signup"?"bg-navy text-navy-foreground":"text-muted-foreground"}`}>Create account</button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4">
          {mode === "signup" && (
            <div className="grid gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Full name</label>
              <input name="full_name" required className="border border-border bg-card px-4 py-3 text-sm focus:border-azure outline-none" />
            </div>
          )}
          <div className="grid gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
            <input name="email" type="email" required className="border border-border bg-card px-4 py-3 text-sm focus:border-azure outline-none" />
          </div>
          <div className="grid gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Password</label>
            <input name="password" type="password" required minLength={6} className="border border-border bg-card px-4 py-3 text-sm focus:border-azure outline-none" />
          </div>
          <button disabled={loading} type="submit" className="bg-azure text-azure-foreground py-3.5 font-bold uppercase tracking-wider text-sm disabled:opacity-50">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="flex-1 h-px bg-border" /> or <span className="flex-1 h-px bg-border" />
        </div>
        <button onClick={google} className="w-full border border-border py-3.5 font-bold uppercase tracking-wider text-sm hover:bg-muted">
          Continue with Google
        </button>
      </div>
    </section>
  );
}
