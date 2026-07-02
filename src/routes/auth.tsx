import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName },
          },
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) toast.error(error.message);
  }

  return (
    <section className="min-h-[85vh] grid md:grid-cols-2 relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="glowing-blob top-1/4 left-1/4 w-[300px] h-[300px] opacity-10" />
      <div className="glowing-blob-gold bottom-1/4 right-1/4 w-[300px] h-[300px] opacity-5" />

      {/* Left panel info */}
      <div className="hidden md:flex bg-navy text-navy-foreground p-12 lg:p-20 items-center relative z-10 border-r border-border/20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-azure">Zahau Music School</p>
          <h1 className="mt-4 font-display text-5xl lg:text-7xl uppercase leading-none font-extrabold tracking-tight">
            Welcome
            <br />
            back.
          </h1>
          <p className="mt-8 max-w-md text-white/70 font-light leading-relaxed">
            Access your courses, track lesson videos, submit assignments, view weekly schedules, and download grades.
          </p>
        </div>
      </div>

      {/* Right panel centered form container */}
      <div className="flex items-center justify-center p-6 md:p-12 lg:p-20 relative z-10 w-full">
        <div className="max-w-md w-full glass-card p-8 sm:p-10 rounded-2xl shadow-xl hover-glow animate-page-transition">
          <div className="flex gap-2 mb-8 border-b border-border/40 pb-2">
            <button
              onClick={() => setMode("signin")}
              className={`pb-3 px-2 text-xs font-bold uppercase tracking-widest relative transition-all cursor-pointer ${
                mode === "signin" 
                  ? "text-azure font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-azure" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`pb-3 px-2 text-xs font-bold uppercase tracking-widest relative transition-all cursor-pointer ${
                mode === "signup" 
                  ? "text-azure font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-azure" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5">
            {mode === "signup" && (
              <div className="grid gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Full name
                </label>
                <input
                  name="full_name"
                  type="text"
                  required
                  className="border border-border bg-card px-4 py-3 rounded-lg text-sm text-foreground focus:border-azure outline-none transition-all duration-300"
                  placeholder="Henry Jahau"
                />
              </div>
            )}
            <div className="grid gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="border border-border bg-card px-4 py-3 rounded-lg text-sm text-foreground focus:border-azure outline-none transition-all duration-300"
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full border border-border bg-card pl-4 pr-10 py-3 rounded-lg text-sm text-foreground focus:border-azure outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <button
              disabled={loading}
              type="submit"
              className="bg-azure hover:bg-azure/90 text-azure-foreground py-3 rounded-lg font-bold uppercase tracking-wider text-xs disabled:opacity-50 transition-all duration-300 cursor-pointer shadow-md shadow-azure/20"
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="flex-1 h-px bg-border/40" /> or <span className="flex-1 h-px bg-border/40" />
          </div>

          <button
            onClick={google}
            className="w-full border border-border bg-card/50 hover:bg-card py-3 rounded-lg font-bold uppercase tracking-wider text-xs hover:text-azure transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </section>
  );
}
