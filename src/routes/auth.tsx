import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Music } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Login — Zahau Music School" },
      { name: "description", content: "Sign in to the Zahau Music School admin console." },
      { property: "og:url", content: "/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
    // On success the browser navigates away — no need to reset loading
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-azure/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-azure/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] border-r border-border bg-navy/80 p-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-azure/10 border border-azure/20 flex items-center justify-center">
            <Music className="size-4 text-azure" />
          </div>
          <span className="font-display text-xl uppercase tracking-tight text-foreground font-extrabold">
            Zahau <span className="font-serif italic font-light text-azure normal-case">music</span>
          </span>
        </div>

        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure/70 font-bold block mb-4">
            Admin Console
          </span>
          <h1 className="font-display text-5xl xl:text-6xl uppercase leading-none font-extrabold tracking-tight text-foreground">
            Welcome
            <br />
            <span className="font-serif italic text-azure normal-case font-light">back.</span>
          </h1>
          <p className="mt-6 text-muted-foreground font-light leading-relaxed text-sm max-w-xs">
            Manage courses, lessons, fees, student appointments, leads and more from your
            centralised admin dashboard.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Course & Lesson Management",
              "Student Appointments",
              "Lead & Inquiry Tracking",
              "Newsletter Subscribers",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-azure shrink-0" />
                <span className="text-sm text-foreground/80 font-light">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground/60">
          © 2026 Zahau Music School · Delhi
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="size-9 rounded-full bg-azure/10 border border-azure/20 flex items-center justify-center">
              <Music className="size-4 text-azure" />
            </div>
            <span className="font-display text-xl uppercase tracking-tight text-foreground font-extrabold">
              Zahau{" "}
              <span className="font-serif italic font-light text-azure normal-case">music</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="mb-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-azure/70 font-bold block mb-2">
                Restricted Access
              </span>
              <h2 className="font-display text-3xl uppercase font-extrabold tracking-tight text-foreground">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-muted-foreground font-light">
                Admin credentials required to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground/80 font-bold block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@zahaumusic.com"
                    className="w-full bg-muted/40 border border-border focus:border-azure focus:ring-4 focus:ring-azure/10 px-4 py-3.5 pl-10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="font-mono text-[10px] uppercase tracking-widest text-foreground/80 font-bold block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-muted/40 border border-border focus:border-azure focus:ring-4 focus:ring-azure/10 px-4 py-3.5 pl-10 pr-11 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-azure hover:bg-azure/90 text-white font-mono font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  "Sign In to Console"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="flex-1 h-px bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                or
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>

            {/* Google OAuth */}
            <button
              id="google-signin-btn"
              type="button"
              onClick={signInWithGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm py-3.5 px-5 rounded-xl border border-border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {googleLoading ? (
                <span className="size-4 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />
              ) : (
                <svg
                  className="size-4 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="mt-6 pt-6 border-t border-border flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-azure animate-pulse shrink-0" />
              <p className="text-[11px] text-muted-foreground font-mono">
                Secured · Zahau Music School Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
